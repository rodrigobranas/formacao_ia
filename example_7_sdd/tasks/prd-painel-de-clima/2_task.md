# Tarefa 2.0: Frontend — painel de clima completo

## Visão geral

Implementa toda a interface do Painel de Clima sobre o contrato já estável do backend (Tarefa 1.0), consumindo **exclusivamente** os endpoints próprios `/api/weather/search` e `/api/weather` por caminho relativo (RF21). Entrega: o cliente HTTP do frontend, os hooks de UI (busca com debounce, máquina de estados do clima, geolocalização sob consentimento), a camada presentacional pura (`lib`) com os tokens de design, todos os componentes (hero, busca/sugestões, cartões de 24h/7d/métricas/UV/sol/ar, toast de erro, skeletons, status da API) e a página que compõe tudo. Inclui a infraestrutura de testes do frontend (Vitest + Testing Library + jsdom) e o proxy `/api` no Vite.

O layout segue **fielmente** o design de referência obrigatório `docs/design/index.html` + `DESIGN.md`/`PRODUCT.md` (hero de céu dinâmico, cartões de vidro, superfície escura WCAG 2.1 AA), **omitindo** apenas os controles fora de escopo do PRD (toggle °C/°F e favoritos). Componentes funcionais ≤30 linhas, props explícitas (sem spread), hooks com prefixo `use`, `useMemo` para valores derivados, separação de camadas `pages → hooks → services` (ver `AGENTS.md`).

<skills>
### Conformidade com skills

- **`react`** — componentes funcionais ≤30 linhas, props explícitas, hooks `use*`, `useMemo` para derivados, separação de camadas.
- **`code-standards`** — inglês no código, ≤30 linhas, ≤3 parâmetros, sem `switch/case`, um tipo por arquivo, `fetch` somente em `services/`.
- **`tests`** — Vitest + `@testing-library/react` + `jsdom`, AAA, stub de `fetch`/`navigator.geolocation`/`Date`, testes independentes.
- **`impeccable`** — craft de UI (vidro/atmosfera, hierarquia, acessibilidade) conforme `DESIGN.md`/`PRODUCT.md`.
</skills>

<requirements>
- **RF1–RF4** — busca com autocomplete, sugestões com desambiguação (estado/país), seleção da cidade ativa e estado "cidade não encontrada".
- **RF5–RF8** — clima atual: temperatura, sensação térmica, condição (rótulo PT-BR), vento, umidade e cidade ativa.
- **RF9–RF11** — previsão das próximas 24h em gráfico, com temperatura e rótulos textuais legíveis.
- **RF12–RF13** — previsão de 7 dias com mín/máx e condição por dia.
- **RF14–RF17** — métricas extras: qualidade do ar, índice UV (rótulos qualitativos), arco solar e estado vazio explícito quando indisponível.
- **RF18–RF20** — botão "usar minha localização" sob consentimento explícito; permissão negada/indisponível mantém a busca manual funcional.
- **RF21** — frontend consome somente o backend (caminho relativo via proxy `/api`).
- **RF23–RF26** — estados de carregamento/erro/vazio visíveis, mensagens distintas (cidade não encontrada / falha de rede / fonte indisponível), opção de tentar novamente e copy em PT-BR sem depender apenas de cor.
</requirements>

## Subtarefas

- [ ] 2.1 Adicionar infra de testes ao frontend (`vitest`, `@testing-library/react`, `jsdom`) + script `test`; configurar proxy `/api` → `http://localhost:3000` em `vite.config.ts`; criar `frontend/src/types/*` espelhando o contrato do backend.
- [ ] 2.2 Implementar `services/weather-api.ts` (único lugar com `fetch`): `searchCities` e `fetchWeather` por caminho relativo; mapeia respostas e lança erros tipados (cidade não encontrada / fonte indisponível / falha de rede). **+ testes unitários #27–29.**
- [ ] 2.3 Implementar hooks: `use-city-search` (debounce 240 ms, mínimo 2 caracteres, cancelamento de obsoletas), `use-weather` (máquina `idle|loading|success|error`, `loadPlace`, `retry`, cidade ativa), `use-geolocation` (estados `idle|requesting|granted|denied|unsupported`). **+ testes unitários #30–39.**
- [ ] 2.4 Implementar a camada presentacional pura em `lib/`: `sky.ts` (gradiente por grupo + dia/noite), `weather-icon.tsx` (ícones monoline por código/grupo, sem emoji), `format.ts` (°C, `HH:mm`, ponto cardeal, percentuais, placeholder para `null`); aplicar tokens de vidro/atmosfera do `DESIGN.md` em `index.css`. **+ testes unitários #40–42.**
- [ ] 2.5 Implementar os componentes: `top-bar`, `city-search` + `suggestion-list`, `geolocation-button`, `weather-hero`, `hourly-forecast-card`, `daily-forecast-card`, `detailed-metrics-card`, `sun-arc-card`, `air-quality-card`, `error-toast`, `loading-skeletons`, `api-status-pill`. **+ testes unitários #43–55.**
- [ ] 2.6 Implementar `pages/weather-dashboard-page.tsx` (compõe hooks + componentes, orquestra loading/sucesso/erro/vazio) e ligar em `App.tsx`. **+ testes de integração #9–13.**

## Detalhes de implementação

Ver [`techspec.md`](./techspec.md): "Arquitetura do sistema → Visão dos componentes (Frontend)" e "Fluxo de dados", "Pontos de integração → Conexão frontend → backend", "Considerações técnicas → Principais decisões / Riscos conhecidos". Os contratos de dados consumidos (`WeatherPayload`, `GeoResult`, `WeatherError`) estão definidos na seção "Modelos de dados" — **não duplicar aqui**.

Pontos-chave a respeitar:
- `use-city-search`: debounce 240 ms, mínimo 2 caracteres, "última busca vence" (cancela respostas obsoletas via `AbortController`).
- `use-geolocation`: só obtém coordenadas após consentimento; `denied`/`unsupported` não bloqueiam a busca manual (RF20/US8); coordenadas arredondadas e **não persistidas** (RF19, privacidade).
- Mapeamento de erro → copy PT-BR (RF24): `city_not_found`/empty → "cidade não encontrada"; `502` → "fonte indisponível"; falha de rede → "falha de rede".
- Acessibilidade (WCAG 2.1 AA, superfície escura): `role="listbox"`/`option` no autocomplete, navegação ↑/↓/Enter/Esc, `aria-live="polite"` no hero, contraste verificado sobre o fundo **composto**, `prefers-reduced-motion` com alternativa estática, cor nunca como único indicador (RF26).
- Divergência justificada do demo: **sem** toggle °C/°F e **sem** favoritos (alinhado ao "Fora do escopo" do PRD).

## Critérios de sucesso

- Fluxo principal operante: digitar cidade → sugestões com desambiguação → selecionar → hero + 24h + 7 dias + métricas extras renderizados a partir de uma única chamada agregada.
- Botão de geolocalização carrega o clima local após consentimento; negar permissão mantém a busca manual funcional e informa o usuário sem bloquear.
- 100% dos estados com feedback em PT-BR: carregando (skeletons), sucesso, vazio/sem dados, cidade não encontrada, falha de rede e fonte indisponível; erros recuperáveis oferecem "Tentar de novo".
- Frontend consome apenas `/api/weather*` (nenhuma URL absoluta da Open-Meteo no bundle).
- Componentes ≤30 linhas, `fetch` somente em `services/`, sem `switch/case`. Cobertura > 80% nas camadas novas. Sem violações de a11y nos componentes testados (rótulo textual acompanha todo estado por cor).

## Testes da tarefa

### Testes unitários

**`services/weather-api.ts` (stub de `fetch`):**
- [ ] #27 `searchCities` chama `/api/weather/search?q=` (caminho relativo) e mapeia `results`.
- [ ] #28 `fetchWeather` chama `/api/weather?lat&lon` e mapeia `WeatherPayload`.
- [ ] #29 Mapeia `404/empty` → "cidade não encontrada", `502` → "fonte indisponível" e erro de rede → "falha de rede" (códigos tipados).

**Hooks:**
- [ ] #30 `use-city-search`: ignora termos com < 2 caracteres.
- [ ] #31 `use-city-search`: aplica debounce (não dispara durante digitação rápida).
- [ ] #32 `use-city-search`: cancela resposta obsoleta (última busca vence).
- [ ] #33 `use-city-search`: expõe estados loading → success/empty/error.
- [ ] #34 `use-weather`: transição `loading → success` com payload.
- [ ] #35 `use-weather`: transição `loading → error` e `retry` refaz a chamada (RF25).
- [ ] #36 `use-weather`: define cidade ativa após sucesso (RF8).
- [ ] #37 `use-geolocation`: sucesso retorna coordenadas arredondadas.
- [ ] #38 `use-geolocation`: permissão negada → estado `denied` sem quebrar a busca manual (RF20/US8).
- [ ] #39 `use-geolocation`: navegador sem suporte → estado `unsupported`.

**`lib` (presentacional puro):**
- [ ] #40 `sky.ts`: retorna trios de gradiente distintos para dia vs. noite por grupo (clear/cloudy/rain/thunder…).
- [ ] #41 `weather-icon.tsx`: seleciona ícone por grupo + `is_day` (sem emoji).
- [ ] #42 `format.ts`: arredonda temperatura em °C; `HH:mm` a partir de ISO; ponto cardeal a partir de graus; trata `null` com placeholder.

**Componentes (`@testing-library/react`, props stubadas):**
- [ ] #43 `weather-hero`: temperatura, condição PT-BR, máx/mín, sensação/vento/umidade/prob. de chuva e nome da cidade (RF5–RF8); container `aria-live="polite"`.
- [ ] #44 `city-search` + `suggestion-list`: sugestões com desambiguação (admin1/país + chip de país) (RF1/RF2); `role="listbox"`/`option`.
- [ ] #45 `city-search`: navegação por teclado ↑/↓/Enter/Esc seleciona/fecha e dispara seleção (RF3).
- [ ] #46 `city-search`: estado vazio "Nenhuma cidade encontrada" (RF4).
- [ ] #47 `hourly-forecast-card`: 24 colunas com rótulo textual de temperatura por hora além da curva (RF9–RF11).
- [ ] #48 `daily-forecast-card`: 7 linhas com mín, máx e condição por dia (RF12/RF13).
- [ ] #49 `detailed-metrics-card`: UV com rótulo qualitativo e demais métricas (RF7/RF15).
- [ ] #50 `sun-arc-card`: horários de nascer/pôr do sol (RF16).
- [ ] #51 `air-quality-card`: EAQI + rótulo qualitativo + poluentes (RF14).
- [ ] #52 `air-quality-card`: estado vazio explícito quando `air === null` (RF17).
- [ ] #53 `error-toast`: mensagem e botão "Tentar de novo" apenas quando recuperável (RF25).
- [ ] #54 `loading-skeletons`: placeholders de hero/horário/diário (RF23).
- [ ] #55 Acessibilidade: estados (AQI/UV/status da API/erro) acompanham rótulo textual, não só cor (RF26).

### Testes de integração

**Página com hooks reais + `services` stubados:**
- [ ] #9 `weather-dashboard-page`: busca → seleção de sugestão → render do hero/cartões (fluxo principal US1–US5).
- [ ] #10 `weather-dashboard-page`: geolocalização concedida define a cidade ativa (US6).
- [ ] #11 `weather-dashboard-page`: "cidade não encontrada" exibe orientação de correção (US7).
- [ ] #12 `weather-dashboard-page`: permissão negada mantém busca manual funcional (US8).
- [ ] #13 `weather-dashboard-page`: erro de rede/API exibe toast com "Tentar de novo" e a repetição recarrega (US9).

### Testes E2E (se aplicável)

- N/A nesta tarefa (cobertos pela Tarefa 3.0).

## Arquivos relevantes

**Novos:** `frontend/src/pages/weather-dashboard-page.tsx`; `frontend/src/hooks/{use-weather,use-city-search,use-geolocation}.ts`; `frontend/src/services/weather-api.ts`; `frontend/src/components/{top-bar,city-search,suggestion-list,geolocation-button,weather-hero,hourly-forecast-card,daily-forecast-card,detailed-metrics-card,sun-arc-card,air-quality-card,error-toast,loading-skeletons,api-status-pill}.tsx`; `frontend/src/lib/{sky.ts,weather-icon.tsx,format.ts}`; `frontend/src/types/*.ts`; respectivos `*.test.ts(x)`.
**Modificados:** `frontend/src/App.tsx` (renderiza a página); `frontend/src/index.css` (tokens de vidro/atmosfera do `DESIGN.md`); `frontend/vite.config.ts` (proxy `/api`); `frontend/package.json` (deps/scripts: `vitest`, `@testing-library/react`, `jsdom`).
