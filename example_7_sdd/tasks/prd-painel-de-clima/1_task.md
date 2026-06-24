# Tarefa 1.0: Backend — origem única de dados (API de clima)

## Visão geral

Implementa toda a camada de backend que faz do servidor a **única origem de dados** do painel (RF21/RF22). Entrega os dois endpoints próprios — `GET /api/weather/search` (geocoding/autocomplete) e `GET /api/weather` (payload agregado: clima atual + 24h + 7 dias + extras + qualidade do ar) — orquestrando as três APIs públicas da Open-Meteo (Geocoding, Forecast, Air Quality), normalizando tudo em um contrato estável "pronto para exibição" e traduzindo códigos WMO e categorias UV/EAQI para rótulos em PT-BR. Inclui a infraestrutura de testes do backend (Vitest + supertest), hoje inexistente.

Segue estritamente as camadas `routes → services → data` com `types` transversal (ver `AGENTS.md`): funções ≤30 linhas, ≤3 parâmetros, sem `switch/case` (mapas de lookup), nomes iniciando por verbo, um tipo por arquivo.

<skills>
### Conformidade com skills

- **`code-standards`** — inglês no código, ≤30 linhas/função, ≤3 parâmetros, sem `switch/case`, nomes com verbo, um tipo por arquivo em `types/`, camadas `routes → services → data`.
- **`tests`** — Vitest (unit + integração) com estrutura AAA, testes independentes e determinísticos, stub de dependências externas (`fetch`, `Date`); `supertest` para as rotas; arquivos `*.test.ts` ao lado do código.
- **`context7`** — validar contratos das APIs Open-Meteo (Forecast/Geocoding/Air Quality) usados no client.
</skills>

<requirements>
- **RF4** — busca sem correspondência retorna lista vazia (tratada como `200 { results: [] }`, não como erro).
- **RF5–RF7** — `current` expõe temperatura, sensação térmica, condição (com rótulo PT-BR), vento e umidade.
- **RF8** — `location` identifica a cidade ativa (enriquecida pela query quando o upstream não ecoa).
- **RF9–RF13** — `hourly` (24h a partir de `current.time`) e `daily` (7 dias com mín/máx/condição/UV/sol).
- **RF14–RF16** — `extras` expõe qualidade do ar (EAQI + categoria PT-BR), índice UV (categoria PT-BR) e nascer/pôr do sol.
- **RF17** — quando Air Quality falha, `extras.air = null` e o restante do payload permanece intacto (degradação graciosa, mantém `200`).
- **RF21/RF22** — backend orquestra a Open-Meteo e expõe endpoint(s) próprios; nenhum acesso externo fora da camada `data`.
- **RF24** — contrato de erro tipado distinguindo `invalid_request` (400) e `upstream_unavailable` (502).
</requirements>

## Subtarefas

- [ ] 1.1 Adicionar infra de testes ao backend: `vitest` + `supertest` (+ tipos) em `package.json`, script `test`, config mínima de Vitest. URLs base da Open-Meteo parametrizáveis por env var com defaults (para stub em testes).
- [ ] 1.2 Criar os tipos em `backend/src/types/` (um tipo por arquivo): `geo-result.ts`, `weather-payload.ts`, `current-weather.ts`, `hourly-forecast.ts`, `daily-forecast.ts`, `air-quality.ts`, `weather-error.ts`, `weather-query.ts` — espelhando o contrato da techspec.
- [ ] 1.3 Implementar `data/open-meteo-client.ts` (fronteira HTTP única): `searchCities`, `fetchForecast`, `fetchAirQuality`; monta URLs/parâmetros fixos, aplica timeout via `AbortController` (~8 s), parseia JSON e converte falhas de upstream em erros tipados (`upstream_unavailable`). **+ testes unitários #1–10.**
- [ ] 1.4 Implementar `services/weather-codes.ts` (domínio puro, sem I/O): `toCondition` (WMO → rótulo PT-BR + grupo), `toUvCategory`, `toAirQualityCategory` — via mapas de lookup. **+ testes unitários #11–16.**
- [ ] 1.5 Implementar `services/weather-service.ts`: `searchCities` (normaliza geocoding) e `getWeather` (dispara Forecast + Air Quality em paralelo, agrega em `WeatherPayload`, seleciona janela de 24h, calcula `wind_cardinal`, aplica rótulos via `weather-codes`, trata Air Quality como opcional). **+ testes unitários #17–26.**
- [ ] 1.6 Implementar `routes/weather-routes.ts` (parse/validação de query, delega ao service, formata resposta/erros HTTP — sem regra de negócio) e registrar o router em `index.ts` antes do middleware de erro, mantendo `/health`. **+ testes de integração #1–8.**

## Detalhes de implementação

Ver [`techspec.md`](./techspec.md): "Arquitetura do sistema → Visão dos componentes (Backend)", "Design de implementação → Principais interfaces / Modelos de dados / Mapeamento Open-Meteo → contrato / Parâmetros fixados no upstream", "Endpoints da API", "Pontos de integração" e "Considerações técnicas → Principais decisões". Contratos `GeoResult`, `WeatherPayload`, `WeatherError` e tabela de status estão integralmente definidos lá — **não duplicar aqui**.

Pontos-chave a respeitar:
- Forecast: `temperature_unit=celsius`, `wind_speed_unit=kmh`, `timezone=auto`, `forecast_days=7`, blocos `current/hourly/daily`.
- Air Quality: `current=european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide`, `timezone=auto`.
- Geocoding: `language=pt`, `format=json`, `count=N`.
- Janela de 24h: primeiro `hourly.time >= current.time`.
- Erros: timeout/4xx/5xx/parse no Forecast → `upstream_unavailable` (502); falha no Air Quality → `air: null` (não propaga); Geocoding sem resultados → `200 { results: [] }`.

## Critérios de sucesso

- `GET /api/weather/search?q=` retorna `200 { results: GeoResult[] }` (lista possivelmente vazia) e `400 invalid_request` para `q` ausente ou < 2 caracteres.
- `GET /api/weather?lat&lon` retorna `200` com `WeatherPayload` completo; `502 upstream_unavailable` quando Forecast falha; `200` com `extras.air = null` quando só o Air Quality falha; `400 invalid_request` para `lat/lon` ausentes/inválidos.
- Todo corpo de erro segue `{ error: { code, message } }`.
- Frontend não é necessário para validar a tarefa: todos os contratos verificáveis via supertest.
- Camadas respeitadas (nenhum `fetch` fora de `data/`, nenhuma regra de negócio em `routes/`), funções ≤30 linhas, sem `switch/case`. Cobertura > 80% nas camadas novas.

## Testes da tarefa

### Testes unitários

**`data/open-meteo-client.ts` (stub de `fetch`):**
- [ ] #1 `searchCities` monta URL com `name`, `count`, `language=pt`, `format=json`.
- [ ] #2 `searchCities` parseia `results[]` e normaliza `admin1/country/country_code` ausentes para `null`.
- [ ] #3 `searchCities` retorna `[]` quando a Open-Meteo responde sem `results`.
- [ ] #4 `fetchForecast` monta URL com `current/hourly/daily`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `timezone=auto`, `forecast_days=7`.
- [ ] #5 `fetchForecast` parseia `current/hourly/daily` e respectivos `_units`.
- [ ] #6 `fetchForecast` lança `upstream_unavailable` em HTTP 500.
- [ ] #7 `fetchForecast` lança `upstream_unavailable` quando o corpo é `{ error: true, reason }`.
- [ ] #8 `fetchForecast` lança `upstream_unavailable` em timeout/abort.
- [ ] #9 `fetchAirQuality` monta URL com `european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide` + `timezone=auto`.
- [ ] #10 `fetchAirQuality` retorna `null` (sem propagar erro) quando o upstream falha.

**`services/weather-codes.ts` (puro):**
- [ ] #11 `toCondition` retorna rótulo PT-BR e grupo corretos por faixa WMO (0/1/2/3, 45–48, 51–57, 61–67, 71–77, 80–82, 85–86, 95–99).
- [ ] #12 `toCondition` usa fallback ("Tempo"/grupo `cloudy`) para código desconhecido.
- [ ] #13 `toUvCategory` aplica fronteiras: <3 Baixo, <6 Moderado, <8 Alto, <11 Muito alto, ≥11 Extremo.
- [ ] #14 `toUvCategory` retorna `null` quando UV é `null`.
- [ ] #15 `toAirQualityCategory` aplica fronteiras EAQI (≤20 Boa, ≤40 Razoável, ≤60 Moderada, ≤80 Ruim, ≤100 Muito ruim, >100 Péssima) com descrição correspondente.
- [ ] #16 `toAirQualityCategory` retorna `null` quando EAQI é `null`.

**`services/weather-service.ts` (stub do client):**
- [ ] #17 `searchCities` repassa termo e devolve resultados normalizados.
- [ ] #18 `searchCities` retorna `[]` para termo sem correspondência (RF4).
- [ ] #19 `getWeather` agrega Forecast + Air Quality em `WeatherPayload` com `units` em °C/km/h.
- [ ] #20 `getWeather` seleciona as próximas 24 horas a partir de `current.time`.
- [ ] #21 `getWeather` preenche `daily` com 7 dias (máx/mín/condição/UV/sol).
- [ ] #22 `getWeather` enriquece `location` com `name/admin1/country` da query quando o upstream não os ecoa.
- [ ] #23 `getWeather` define `extras.air = null` e mantém `200` quando Air Quality indisponível (RF17).
- [ ] #24 `getWeather` propaga `upstream_unavailable` quando Forecast falha.
- [ ] #25 `getWeather` calcula `wind_cardinal` a partir de `wind_direction`.
- [ ] #26 `getWeather` aplica rótulos PT-BR de condição/UV/AQI via `weather-codes`.

### Testes de integração

**Rotas com `supertest` (stub da camada `data`):**
- [ ] #1 `GET /api/weather/search?q=Lon` → `200` com `{ results: [...] }`.
- [ ] #2 `GET /api/weather/search` sem `q` (ou < 2) → `400 invalid_request`.
- [ ] #3 `GET /api/weather/search` sem correspondência → `200 { results: [] }`.
- [ ] #4 `GET /api/weather?lat&lon` → `200` com `WeatherPayload` completo.
- [ ] #5 `GET /api/weather` sem/inválido `lat/lon` → `400 invalid_request`.
- [ ] #6 `GET /api/weather` com Forecast indisponível → `502 upstream_unavailable`.
- [ ] #7 `GET /api/weather` com Air Quality indisponível → `200` e `air: null`.
- [ ] #8 Corpo de erro segue `{ error: { code, message } }` em todos os casos.

### Testes E2E (se aplicável)

- N/A nesta tarefa (cobertos pela Tarefa 3.0). Fixtures de respostas reais da Open-Meteo (geocoding/forecast/air quality) devem ser versionadas como JSON, incluindo variações dia/noite, múltiplos grupos WMO, `air` ausente, geocoding vazio e homônimos — reutilizáveis pelas demais tarefas.

## Arquivos relevantes

**Novos:** `backend/src/data/open-meteo-client.ts`; `backend/src/services/weather-service.ts`; `backend/src/services/weather-codes.ts`; `backend/src/routes/weather-routes.ts`; `backend/src/types/{geo-result,weather-payload,current-weather,hourly-forecast,daily-forecast,air-quality,weather-error,weather-query}.ts`; respectivos `*.test.ts`; fixtures JSON da Open-Meteo.
**Modificados:** `backend/src/index.ts` (registro do router); `backend/package.json` (deps/scripts: `vitest`, `supertest`).
