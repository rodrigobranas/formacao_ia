# Relatório de QA - Painel de Clima

## Resumo
- **Data:** 2026-06-25 (reavaliado após bugfix de BUG-01)
- **Status:** ✅ **APROVADO** (BUG-01 corrigido e validado)
- **Total de Requisitos (RF):** 26
- **Requisitos Atendidos:** 26 (funcionais + responsividade)
- **Bugs Encontrados:** 1 (severidade Média) — **Corrigido**
- **Testes automatizados:** Backend 34/34 ✓ · Frontend 49/49 ✓ · E2E Playwright 11/11 ✓

> Histórico: na primeira passada o QA reprovou por BUG-01 (scroll horizontal global — violação do requisito de layout responsivo do PRD). Após o bugfix (`min-width: 0` em `.wx-card` + região horária focável por teclado), a responsividade foi revalidada via Playwright MCP (`scrollWidth == clientWidth` em 375px e 1280px) e cobertura de regressão foi adicionada. Todos os requisitos passam — feature **aprovada**. Ver [`bugfixes.md`](./bugfixes.md).

---

## Testes Automatizados

| Suíte | Comando | Resultado |
|-------|---------|-----------|
| Backend (unit + integração) | `npm test` (vitest) | ✅ 34/34 (4 arquivos) |
| Frontend (unit + integração) | `npm test` (vitest) | ✅ 49/49 (18 arquivos) |
| E2E (Playwright, Open-Meteo mockada) | `npm run test:e2e` | ✅ 11/11 specs |

Cobertura dos 11 specs E2E: fluxo principal, autocomplete/desambiguação, geolocalização concedida, permissão negada, cidade não encontrada, falha de rede com retry, métrica indisponível (`air: null`), skeletons de carregamento, acessibilidade (axe + navegação por teclado, incluindo focabilidade da região rolável), e **responsividade sem overflow horizontal** (#10, 375px e 1280px — regressão de BUG-01).

---

## Requisitos Verificados (Playwright MCP — backend real Open-Meteo)

| ID | Requisito | Status | Evidência |
|----|-----------|--------|-----------|
| RF1 | Sugestões à medida que digita | PASSOU | `02-autocomplete.png` |
| RF2 | Desambiguação de homônimos (estado/país + chip) | PASSOU | `02-autocomplete.png` (São Paulo BR/PT/ST) |
| RF3 | Selecionar sugestão como cidade ativa (mouse e teclado ↑/↓/Enter) | PASSOU | `03-dashboard-full.png` |
| RF4 | "Nenhuma cidade encontrada" | PASSOU | `04-city-not-found.png` |
| RF5 | Temperatura atual + sensação térmica | PASSOU | `03-dashboard-full.png` (11° / sensação 10°) |
| RF6 | Descrição do tempo em PT-BR | PASSOU | "Nublado" / "Garoa moderada" / "Céu limpo" |
| RF7 | Vento e umidade | PASSOU | `03-dashboard-full.png` (7 km/h SE · 98%) |
| RF8 | Indica a cidade ativa | PASSOU | region "Clima atual em São Paulo" |
| RF9 | Previsão 24h em formato gráfico | PASSOU | `03-dashboard-full.png` (curva + colunas) |
| RF10 | Temperatura prevista ao longo das horas | PASSOU | colunas 11°→20° |
| RF11 | Rótulo textual por hora além da curva | PASSOU | temp + hora + % por coluna |
| RF12 | Previsão de 7 dias | PASSOU | Hoje/Sex/Sáb/Dom/Seg/Ter/Qua |
| RF13 | Mín, máx e condição por dia | PASSOU | `03-dashboard-full.png` |
| RF14 | Qualidade do ar com rótulo qualitativo | PASSOU | EAQI 23 · "Razoável" + descrição |
| RF15 | Índice UV com rótulo qualitativo | PASSOU | UV 1 · "Baixo" |
| RF16 | Nascer e pôr do sol | PASSOU | 06:48 / 17:29 |
| RF17 | Estado vazio explícito quando indicador indisponível | PASSOU | Unit `air-quality-card #52` + E2E #7 (`air: null`) |
| RF18 | Botão "usar minha localização" | PASSOU | `01-empty-state.png` |
| RF19 | Localização só com consentimento; coords arredondadas/não persistidas | PASSOU | `08-geolocation.png` (lat/lon 4 casas) |
| RF20 | Permissão negada mantém busca manual | PASSOU | E2E #4 (geolocation denied) |
| RF21 | Frontend consome só o backend (caminho relativo) | PASSOU | Network: apenas `/api/weather*` e `/health`; zero chamadas diretas à Open-Meteo |
| RF22 | Backend expõe endpoints próprios | PASSOU | `GET /api/weather/search`, `GET /api/weather` 200 OK |
| RF23 | Estado de carregamento (skeletons) | PASSOU | E2E #8 |
| RF24 | Mensagens distintas (não encontrada / rede / fonte indisponível) | PASSOU | `09-error-toast.png` ("Fonte de dados indisponível.") |
| RF25 | Erros recuperáveis com "Tentar de novo" | PASSOU | `09-error-toast.png` + recuperação validada |
| RF26 | Copy PT-BR e não depender só de cor | PASSOU | `role="alert"`/`status` + rótulos textuais |

---

## Testes E2E Executados (Playwright MCP — exploratório)

| Fluxo | Resultado | Observações |
|-------|-----------|-------------|
| Busca + autocomplete + desambiguação (US1) | PASSOU | 6 sugestões com estado/país; homônimos BR/PT/ST |
| Seleção por teclado (↓ + Enter) → painel completo (US1–US5) | PASSOU | Hero + 24h + 7d + extras renderizados de uma única chamada agregada |
| Clima atual, 24h, 7 dias, métricas, UV, sol, ar | PASSOU | Todos os cartões com dados reais |
| Cidade não encontrada (US7) | PASSOU | "Nenhuma cidade encontrada" |
| Geolocalização concedida (US6) | PASSOU | "Localização atual" carregada |
| Falha de fonte + retry (US9) | PASSOU | Backend derrubado → toast "Fonte de dados indisponível." + "Tentar de novo" → recuperação ao religar |
| Pill de status da API | PASSOU | "API conectada" ↔ "API indisponível" conforme `/health` |
| Responsividade (mobile 375px e desktop 1280px) | PASSOU | Pós-bugfix: `scrollWidth == clientWidth` (360/360 e 1265/1265); faixa de 24h rola dentro do cartão — sem scroll global. Evidências `evidences/10-overflow-fixed-desktop.png`, `evidences/11-overflow-fixed-mobile.png` |

---

## Acessibilidade

- [x] Navegação por teclado (Tab, ↑/↓, Enter) na busca e listbox — validada manualmente
- [x] Semântica de `listbox`/`option`/`combobox` no autocomplete
- [x] `aria-live="polite"` no hero de clima atual
- [x] `role="alert"` no toast de erro; `role="status"` no pill de API
- [x] `aria-busy`/`role="status"` nos skeletons de carregamento
- [x] Estados não dependem só de cor (rótulo textual sempre presente) — RF26
- [x] `prefers-reduced-motion: reduce` tratado em `index.css`
- [x] Verificação automatizada **axe** sem violações (E2E spec #9, superfície escura)

---

## Bugs Encontrados

| ID | Descrição | Severidade | Status | Screenshot |
|----|-----------|------------|--------|------------|
| BUG-01 | Cartão "Próximas 24 horas" estoura a largura da página → scroll horizontal global (desktop e mobile) | Média | ✅ Corrigido | Antes: `evidences/07-horizontal-overflow-bug.png`, `evidences/05-responsive-mobile.png` · Depois: `evidences/10-overflow-fixed-desktop.png`, `evidences/11-overflow-fixed-mobile.png` |

Detalhes da correção e testes de regressão em [`bugs.md`](./bugs.md) e [`bugfixes.md`](./bugfixes.md).

---

## Evidências (telas)

Diretório: `tasks/prd-painel-de-clima/evidences/`

| Arquivo | Conteúdo |
|---------|----------|
| `01-empty-state.png` | Estado inicial (busca + geolocalização + pill) |
| `02-autocomplete.png` | Sugestões com desambiguação de homônimos |
| `03-dashboard-full.png` | Painel completo (hero + 24h + 7d + extras) |
| `04-city-not-found.png` | "Nenhuma cidade encontrada" |
| `05-responsive-mobile.png` | Mobile 390px (evidencia BUG-01) |
| `06-responsive-viewport.png` | Mobile — cartões empilhados |
| `07-horizontal-overflow-bug.png` | Desktop — overflow horizontal (BUG-01) |
| `08-geolocation.png` | "Localização atual" via geolocalização |
| `09-error-toast.png` | Toast "Fonte de dados indisponível." + "Tentar de novo" |
| `10-overflow-fixed-desktop.png` | Desktop 1280px pós-bugfix — sem scroll horizontal global (BUG-01) |
| `11-overflow-fixed-mobile.png` | Mobile 375px pós-bugfix — sem scroll horizontal global (BUG-01) |

---

## Conclusão

A implementação do **Painel de Clima** está **funcionalmente completa e sólida**: os 26 requisitos funcionais do PRD foram verificados na aplicação real (backend integrado à Open-Meteo), os três fluxos de erro estão distintos e recuperáveis, a acessibilidade está bem coberta (semântica ARIA, teclado, axe, `prefers-reduced-motion`), e as suítes automatizadas estão 100% verdes (34 backend + 49 frontend + 9 E2E). A arquitetura de origem única de dados (RF21/RF22) foi confirmada por inspeção de rede — o frontend não acessa a Open-Meteo diretamente.

**BUG-01 (responsividade) — RESOLVIDO:** aplicado `min-width: 0` em `.wx-card` para que o `overflow-x: auto` interno contenha a faixa de 24h; como o scroll interno passou a ser efetivo, a região horária também foi tornada focável por teclado (correção complementar de acessibilidade detectada pelo axe). Revalidado via Playwright MCP (`scrollWidth == clientWidth` em 375px e 1280px) e coberto por teste de regressão (`e2e/responsive-overflow.spec.ts` #10). As suítes automatizadas seguem 100% verdes (34 backend + 49 frontend + 11 E2E).

**Parecer:** **APROVADO.** Todos os 26 requisitos funcionais e o requisito de layout responsivo do PRD estão verificados e funcionando, sem pendências bloqueantes.
