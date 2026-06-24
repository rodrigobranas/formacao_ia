# Especificação técnica

## Resumo executivo

O Painel de Clima é construído sobre o esqueleto full-stack existente (backend Express + TypeScript em `backend/src`, frontend React 19 + Vite + Tailwind em `frontend/src`), adicionando as camadas de domínio que hoje não existem. A estratégia central é o **backend como única origem de dados** (RF21/RF22): o frontend nunca chama a Open-Meteo diretamente — ele consome dois endpoints próprios, `GET /api/weather/search` (geocoding/autocomplete) e `GET /api/weather` (payload agregado de clima atual + 24h + 7 dias + métricas extras + qualidade do ar). O backend orquestra três APIs públicas e gratuitas da Open-Meteo (Geocoding, Forecast e Air Quality), normaliza as respostas em um contrato estável e "pronto para exibição", e traduz códigos meteorológicos WMO e categorias de AQI/UV para rótulos em PT-BR.

As decisões de arquitetura priorizam clareza didática e testabilidade: separação estrita de camadas conforme `AGENTS.md` (`routes → services → data`, com `types` transversal), funções pequenas (≤30 linhas) e um contrato de erro tipado que distingue as três falhas exigidas pelo PRD (cidade não encontrada, falha de rede e fonte indisponível — RF24). Por decisão do produto, **não há cache** nesta entrega (cada requisição chama a Open-Meteo diretamente; mitigamos latência com debounce de busca, uma única chamada agregada e `AbortController`), e ficam **fora de escopo** a alternância °C/°F e cidades favoritas — divergindo deliberadamente do demo visual em `docs/design/index.html`, que as contém, mas alinhando-se ao "Fora do escopo" do PRD. O layout visual segue fielmente o design de referência (hero de céu dinâmico, cartões de vidro, estados visíveis), com superfície escura WCAG 2.1 AA. A qualidade é garantida por uma suíte ampla em Vitest (unit + integração) e fluxos E2E em Playwright.

## Arquitetura do sistema

### Visão dos componentes

**Backend (`backend/src/`)** — novas camadas seguindo `routes → services → data → types`:

- **`routes/weather-routes.ts`** _(novo)_ — registra `GET /api/weather/search` e `GET /api/weather`; faz parse/validação de query, delega ao service e formata resposta/erros HTTP. Sem regra de negócio.
- **`services/weather-service.ts`** _(novo)_ — orquestração: recebe coordenadas, dispara em paralelo Forecast + Air Quality, agrega e mapeia para o contrato `WeatherPayload` pronto para a UI; trata qualidade do ar como opcional (RF17). Para busca, delega ao client e normaliza os resultados de geocoding.
- **`services/weather-codes.ts`** _(novo)_ — mapeamento de domínio puro e sem I/O: código WMO → rótulo PT-BR + grupo de condição; classificação qualitativa de UV e de EAQI (rótulo + descrição em PT-BR).
- **`data/open-meteo-client.ts`** _(novo)_ — único ponto de saída HTTP para a Open-Meteo (Geocoding, Forecast, Air Quality). Monta URLs/parâmetros, aplica timeout via `AbortController`, faz parse do JSON e converte falhas de upstream em erros tipados.
- **`types/`** _(novo, um tipo por arquivo)_ — `geo-result.ts`, `weather-payload.ts`, `current-weather.ts`, `hourly-forecast.ts`, `daily-forecast.ts`, `air-quality.ts`, `weather-error.ts`, `weather-query.ts`.
- **`index.ts`** _(modificado)_ — passa a registrar o router de clima antes do middleware de erro; o `/health` existente é mantido.

**Frontend (`frontend/src/`)** — seguindo `pages → hooks → services → (backend)`, com `components`, `lib` e `types` transversais. Componentes ≤30 linhas (skill `react`):

- **`pages/weather-dashboard-page.tsx`** _(novo)_ — compõe hooks + componentes; orquestra estados de carregamento/sucesso/erro/vazio.
- **`hooks/use-weather.ts`** _(novo)_ — estado da cidade ativa e do payload; máquina de estados `idle | loading | success | error`; expõe `loadPlace` e `retry`.
- **`hooks/use-city-search.ts`** _(novo)_ — busca com debounce (240 ms), mínimo de 2 caracteres, cancelamento de requisições obsoletas, estados de loading/empty/error.
- **`hooks/use-geolocation.ts`** _(novo)_ — geolocalização do navegador sob consentimento explícito (RF18–RF20); estados `idle | requesting | granted | denied | unsupported`.
- **`services/weather-api.ts`** _(novo)_ — cliente HTTP do frontend para o backend (`/api/weather/search`, `/api/weather`); mapeia respostas e lança erros tipados. Único lugar com `fetch`.
- **`components/`** _(novos)_ — `top-bar.tsx`, `city-search.tsx` + `suggestion-list.tsx`, `geolocation-button.tsx`, `weather-hero.tsx`, `hourly-forecast-card.tsx`, `daily-forecast-card.tsx`, `detailed-metrics-card.tsx`, `sun-arc-card.tsx`, `air-quality-card.tsx`, `error-toast.tsx`, `loading-skeletons.tsx`, `api-status-pill.tsx` (evolução do indicador atual de `App.tsx`).
- **`lib/`** _(novos, presentacional puro)_ — `sky.ts` (gradiente dinâmico por grupo + dia/noite), `weather-icon.tsx` (ícones monoline por código), `format.ts` (temperatura em °C, hora `HH:mm`, ponto cardeal, percentuais).
- **`types/`** _(novo)_ — espelham o contrato do backend (`weather-payload.ts`, `geo-result.ts`, etc.) para tipar serviços/hooks.
- **`App.tsx` / `main.tsx`** _(modificados)_ — `App` renderiza a página do painel; `index.css` ganha os tokens de vidro/atmosfera do `DESIGN.md`.

**Fluxo de dados (alto nível):**

1. **Busca:** usuário digita → `use-city-search` (debounce) → `weather-api.searchCities` → `GET /api/weather/search?q=` → `weather-service` → `open-meteo-client` → Geocoding API → `GeoResult[]` → sugestões (listbox acessível).
2. **Consulta de clima:** seleção da sugestão **ou** geolocalização → `use-weather.loadPlace(coords)` → `weather-api.fetchWeather` → `GET /api/weather?lat&lon` → `weather-service` agrega Forecast + Air Quality → `WeatherPayload` → render do hero/cartões.
3. **Estados:** cada passo emite loading/sucesso/erro/vazio com copy PT-BR (RF23–RF26).

## Design de implementação

### Principais interfaces

Contratos de serviço no nível de especificação (TypeScript, projeto TS). Detalhes de implementação ficam fora desta seção.

```typescript
// data/open-meteo-client.ts — única fronteira HTTP com a Open-Meteo
interface OpenMeteoClient {
  searchCities(term: string, limit: number): Promise<GeoResult[]>;
  fetchForecast(coords: Coordinates): Promise<RawForecast>; // current+hourly+daily
  fetchAirQuality(coords: Coordinates): Promise<RawAirQuality | null>; // opcional
}

// services/weather-service.ts — orquestração + agregação + mapeamento
interface WeatherService {
  searchCities(term: string): Promise<GeoResult[]>; // [] => "cidade não encontrada"
  getWeather(query: WeatherQuery): Promise<WeatherPayload>; // lança WeatherError tipado
}

// services/weather-codes.ts — mapeamento de domínio puro (sem I/O)
interface WeatherCodeMapper {
  toCondition(code: number): {
    code: number;
    label: string;
    group: WeatherGroup;
  };
  toUvCategory(uvIndex: number | null): { label: string } | null;
  toAirQualityCategory(
    europeanAqi: number | null,
  ): { label: string; description: string } | null;
}
```

### Modelos de dados

Contratos JSON do backend — prontos para exibição na UI. Campos ausentes no upstream são normalizados para `null`.

#### `GeoResult` — resultado de geocoding

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `name` | `string` | sim | Nome da localidade |
| `admin1` | `string \| null` | sim | Estado/província |
| `country` | `string \| null` | sim | País |
| `country_code` | `string \| null` | sim | Código ISO do país (ex.: `BR`) |
| `latitude` | `number` | sim | Latitude |
| `longitude` | `number` | sim | Longitude |
| `timezone` | `string \| null` | sim | Fuso IANA (ex.: `America/Sao_Paulo`) |

```json
{
  "name": "São Paulo",
  "admin1": "São Paulo",
  "country": "Brasil",
  "country_code": "BR",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "timezone": "America/Sao_Paulo"
}
```

#### `WeatherPayload` — contrato agregado de clima

Objeto único retornado por `GET /api/weather`. Celsius fixo (sem alternância °C/°F).

| Seção | Descrição |
| --- | --- |
| `location` | Metadados da localidade consultada |
| `current` | Condições atuais + rótulo PT-BR da condição |
| `hourly` | Próximas **24 horas** a partir de `current.time` |
| `daily` | Previsão dos **7 dias** |
| `extras` | UV, nascer/pôr do sol e qualidade do ar |
| `units` | Unidades fixas (`°C`, `km/h`) |
| `fetched_at` | Timestamp ISO da agregação |

```json
{
  "location": {
    "name": "São Paulo",
    "admin1": "São Paulo",
    "country": "Brasil",
    "country_code": "BR",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "timezone": "America/Sao_Paulo"
  },
  "current": {
    "time": "2026-06-23T14:00",
    "temperature": 24,
    "apparent_temperature": 26,
    "condition": {
      "code": 2,
      "label": "Parcialmente nublado",
      "group": "cloudy"
    },
    "is_day": 1,
    "humidity": 65,
    "wind_speed": 12,
    "wind_direction": 180,
    "wind_cardinal": "S",
    "wind_gusts": 18,
    "pressure": 1013,
    "cloud_cover": 45,
    "precipitation": 0
  },
  "hourly": [
    {
      "time": "2026-06-23T14:00",
      "temperature": 24,
      "weather_code": 2,
      "precipitation_probability": 10,
      "is_day": 1
    }
  ],
  "daily": [
    {
      "date": "2026-06-23",
      "weather_code": 2,
      "temp_min": 18,
      "temp_max": 28,
      "precipitation_probability_max": 30,
      "sunrise": "2026-06-23T06:45",
      "sunset": "2026-06-23T17:30",
      "uv_index_max": 6.2
    }
  ],
  "extras": {
    "uv": {
      "value": 6.2,
      "label": "Moderado"
    },
    "sun": {
      "sunrise": "2026-06-23T06:45",
      "sunset": "2026-06-23T17:30"
    },
    "air": {
      "european_aqi": 35,
      "category": {
        "label": "Razoável",
        "description": "Qualidade do ar aceitável para a maioria das pessoas."
      },
      "pollutants": {
        "pm2_5": 12.5,
        "pm10": 22.0,
        "ozone": 45.0,
        "nitrogen_dioxide": 18.0
      },
      "units": {
        "pm2_5": "μg/m³",
        "pm10": "μg/m³",
        "ozone": "μg/m³",
        "nitrogen_dioxide": "μg/m³"
      }
    }
  },
  "units": {
    "temperature": "°C",
    "wind_speed": "km/h"
  },
  "fetched_at": "2026-06-23T14:00:05.123Z"
}
```

> **Degradação (RF17):** quando o upstream de Air Quality falha, `extras.air` é `null` — o restante do payload permanece intacto.

```json
{
  "extras": {
    "uv": { "value": 6.2, "label": "Moderado" },
    "sun": { "sunrise": "2026-06-23T06:45", "sunset": "2026-06-23T17:30" },
    "air": null
  }
}
```

#### `WeatherError` — envelope de erro tipado

| Código | HTTP | Significado |
| --- | --- | --- |
| `invalid_request` | `400` | Query inválida ou ausente |
| `city_not_found` | — | Não usado como erro HTTP; busca vazia retorna `200` com `results: []` |
| `upstream_unavailable` | `502` | Forecast indisponível (timeout, 4xx/5xx ou parse) |

```json
{
  "error": {
    "code": "upstream_unavailable",
    "message": "Weather data source is temporarily unavailable."
  }
}
```

O frontend mapeia cada `code` para copy PT-BR (RF24).

#### Mapeamento Open-Meteo → contrato

| Origem (Open-Meteo) | Destino (contrato) |
| --- | --- |
| `current.weather_code` + `is_day` | `current.condition` + ícone/céu no frontend |
| Primeiro `hourly.time >= current.time` | Início da janela de 24h |
| `daily[0]` | Máx/mín do dia e UV |
| `european_aqi` | `extras.air.category` (rótulo + descrição PT-BR) |
| `wind_direction` (graus) | `current.wind_cardinal` (N, NE, E…) |

#### Parâmetros fixados no upstream (backend)

| API | Parâmetros principais |
| --- | --- |
| **Forecast** | `temperature_unit=celsius`, `wind_speed_unit=kmh`, `timezone=auto`, `forecast_days=7`, blocos `current/hourly/daily` |
| **Air Quality** | `current=european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide`, `timezone=auto` |
| **Geocoding** | `language=pt`, `format=json`, `count=N` |

---

### Endpoints da API

#### Visão geral

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/weather/search` | Autocomplete de cidades (geocoding) |
| `GET` | `/api/weather` | Payload agregado de clima |
| `GET` | `/health` | Health check _(existente, inalterado)_ |

---

#### `GET /api/weather/search`

Busca de cidades via Geocoding API. Retorna sugestões para autocomplete.

**Query params**

| Param | Tipo | Default | Regras |
| --- | --- | --- | --- |
| `q` | `string` | — | Obrigatório, mínimo 2 caracteres |
| `limit` | `number` | `6` | Máximo de resultados |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `{ "results": GeoResult[] }` | Sucesso (pode ser lista vazia) |
| `400` | `WeatherError` (`invalid_request`) | `q` ausente ou com < 2 caracteres |

**Exemplo — sucesso**

```http
GET /api/weather/search?q=São&limit=6
```

```json
{
  "results": [
    {
      "name": "São Paulo",
      "admin1": "São Paulo",
      "country": "Brasil",
      "country_code": "BR",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "timezone": "America/Sao_Paulo"
    },
    {
      "name": "São José dos Campos",
      "admin1": "São Paulo",
      "country": "Brasil",
      "country_code": "BR",
      "latitude": -23.1896,
      "longitude": -45.8841,
      "timezone": "America/Sao_Paulo"
    }
  ]
}
```

**Exemplo — nenhuma correspondência (RF4)**

```http
GET /api/weather/search?q=xyzxyz
```

```json
{
  "results": []
}
```

> O frontend exibe "cidade não encontrada" — não é erro HTTP.

**Exemplo — requisição inválida**

```http
GET /api/weather/search?q=a
```

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Search term must be at least 2 characters."
  }
}
```

---

#### `GET /api/weather`

Retorna `WeatherPayload` agregado: clima atual + 24h + 7 dias + métricas extras + qualidade do ar.

**Query params**

| Param | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `lat` | `number` | sim | Latitude (-90 a 90) |
| `lon` | `number` | sim | Longitude (-180 a 180) |
| `name` | `string` | não | Enriquece `location.name` quando o upstream não ecoa |
| `admin1` | `string` | não | Enriquece `location.admin1` |
| `country` | `string` | não | Enriquece `location.country` |
| `country_code` | `string` | não | Enriquece `location.country_code` |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `WeatherPayload` | Sucesso (com ou sem `extras.air`) |
| `400` | `WeatherError` (`invalid_request`) | `lat`/`lon` ausentes ou inválidos |
| `502` | `WeatherError` (`upstream_unavailable`) | Forecast indisponível (timeout ou falha upstream) |

**Exemplo — sucesso**

```http
GET /api/weather?lat=-23.5505&lon=-46.6333&name=São%20Paulo&admin1=São%20Paulo&country=Brasil&country_code=BR
```

Retorna o `WeatherPayload` completo — ver [exemplo JSON acima](#weatherpayload--contrato-agregado-de-clima).

**Exemplo — Air Quality indisponível (RF17)**

```http
GET /api/weather?lat=-23.5505&lon=-46.6333
```

Resposta `200` com payload completo; apenas `extras.air` vem `null`:

```json
{
  "extras": {
    "uv": { "value": 6.2, "label": "Moderado" },
    "sun": {
      "sunrise": "2026-06-23T06:45",
      "sunset": "2026-06-23T17:30"
    },
    "air": null
  }
}
```

> Demais seções (`location`, `current`, `hourly`, `daily`, `units`, `fetched_at`) permanecem inalteradas.

**Exemplo — Forecast indisponível**

```http
GET /api/weather?lat=-23.5505&lon=-46.6333
```

```json
{
  "error": {
    "code": "upstream_unavailable",
    "message": "Weather data source is temporarily unavailable."
  }
}
```

## Pontos de integração

Integração externa obrigatória com a família Open-Meteo (HTTP GET, JSON, gratuita, **sem API key**), consumida exclusivamente pelo backend:

- **Geocoding API** — `https://geocoding-api.open-meteo.com/v1/search` (`name`, `count`, `language=pt`, `format=json`).
- **Forecast API** — `https://api.open-meteo.com/v1/forecast` (`current`, `hourly`, `daily`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `timezone=auto`, `forecast_days=7`).
- **Air Quality API** — `https://air-quality-api.open-meteo.com/v1/air-quality` (`current=european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide`, `timezone=auto`).

**Autenticação:** nenhuma (uso não comercial). **Configuração:** URLs base parametrizáveis por env var (com defaults), facilitando stub/mocks em testes.

**Tratamento de erros (upstream):**

- Timeout por chamada via `AbortController` (~8 s) → `upstream_unavailable`.
- HTTP `4xx/5xx` da Open-Meteo ou corpo `{ error: true, reason }` → `upstream_unavailable` (Forecast) ou degradação para `air: null` (Air Quality).
- Geocoding sem resultados → **não** é erro: retorna lista vazia.
- Falhas de rede/parse → `upstream_unavailable`; o `reason` da Open-Meteo é registrado em log (não exposto cru ao cliente).

**Conexão frontend → backend:** proxy do Vite (`/api` → `http://localhost:3000`) para o frontend usar caminhos relativos (`/api/weather`), reforçando RF21 e eliminando URL absoluta acoplada. CORS permanece habilitado no backend.

## Abordagem de testes

Cobertura-alvo **> 80%** com Vitest (unit + integração) e Playwright (E2E). Estrutura AAA (Arrange/Act/Assert), testes independentes e determinísticos, com stub de dependências externas (Open-Meteo, `Date`, `fetch`, `navigator.geolocation`). Arquivos `*.test.ts(x)` ao lado do código.

### Testes unitários

**Backend — `data/open-meteo-client.ts` (stub de `fetch`):**

1. `searchCities` monta URL com `name`, `count`, `language=pt`, `format=json`.
2. `searchCities` parseia `results[]` e normaliza campos ausentes (`admin1/country/country_code`) para `null`.
3. `searchCities` retorna `[]` quando a Open-Meteo responde sem `results`.
4. `fetchForecast` monta URL com `current/hourly/daily`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `timezone=auto`, `forecast_days=7`.
5. `fetchForecast` parseia `current/hourly/daily` e respectivos `_units`.
6. `fetchForecast` lança `upstream_unavailable` em HTTP 500.
7. `fetchForecast` lança `upstream_unavailable` quando o corpo é `{ error: true, reason }` (400 da Open-Meteo).
8. `fetchForecast` lança `upstream_unavailable` em timeout/abort.
9. `fetchAirQuality` monta URL com `european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide` + `timezone=auto`.
10. `fetchAirQuality` retorna `null` (sem propagar erro) quando o upstream falha.

**Backend — `services/weather-codes.ts` (puro):** 11. `toCondition` retorna rótulo PT-BR e grupo corretos para cada faixa WMO (0/1/2/3, 45–48, 51–57, 61–67, 71–77, 80–82, 85–86, 95–99). 12. `toCondition` usa fallback ("Tempo"/grupo `cloudy`) para código desconhecido. 13. `toUvCategory` aplica fronteiras: <3 Baixo, <6 Moderado, <8 Alto, <11 Muito alto, ≥11 Extremo. 14. `toUvCategory` retorna `null` quando UV é `null`. 15. `toAirQualityCategory` aplica fronteiras EAQI (≤20 Boa, ≤40 Razoável, ≤60 Moderada, ≤80 Ruim, ≤100 Muito ruim, >100 Péssima) com descrição correspondente. 16. `toAirQualityCategory` retorna `null` quando EAQI é `null`.

**Backend — `services/weather-service.ts` (stub do client):** 17. `searchCities` repassa termo e devolve resultados normalizados. 18. `searchCities` retorna `[]` para termo sem correspondência (suporte a RF4). 19. `getWeather` agrega Forecast + Air Quality em `WeatherPayload` com `units` em °C/km/h. 20. `getWeather` seleciona as próximas 24 horas a partir de `current.time`. 21. `getWeather` preenche `daily` com 7 dias (máx/mín/condição/UV/sol). 22. `getWeather` enriquece `location` com `name/admin1/country` vindos da query quando o upstream não os ecoa. 23. `getWeather` define `extras.air = null` e mantém `200` quando Air Quality indisponível (RF17). 24. `getWeather` propaga `upstream_unavailable` quando Forecast falha. 25. `getWeather` calcula `wind_cardinal` a partir de `wind_direction`. 26. `getWeather` aplica rótulos PT-BR de condição/UV/AQI via `weather-codes`.

**Frontend — `services/weather-api.ts` (stub de `fetch`):** 27. `searchCities` chama `/api/weather/search?q=` (caminho relativo) e mapeia `results`. 28. `fetchWeather` chama `/api/weather?lat&lon` e mapeia `WeatherPayload`. 29. Mapeia `404/empty` para "cidade não encontrada", `502` para "fonte indisponível" e erro de rede para "falha de rede" (códigos tipados).

**Frontend — hooks:** 30. `use-city-search`: ignora termos com <2 caracteres. 31. `use-city-search`: aplica debounce (não dispara durante a digitação rápida). 32. `use-city-search`: cancela resposta obsoleta (última busca vence). 33. `use-city-search`: expõe estados loading → success/empty/error. 34. `use-weather`: transição `loading → success` com payload. 35. `use-weather`: transição `loading → error` e `retry` refaz a chamada (RF25). 36. `use-weather`: define cidade ativa após sucesso (RF8). 37. `use-geolocation`: sucesso retorna coordenadas arredondadas. 38. `use-geolocation`: permissão negada → estado `denied` sem quebrar a busca manual (RF20/US8). 39. `use-geolocation`: navegador sem suporte → estado `unsupported`.

**Frontend — `lib` (presentacional puro):** 40. `sky.ts`: retorna trios de gradiente distintos para dia vs. noite por grupo (clear/cloudy/rain/thunder…). 41. `weather-icon.tsx`: seleciona ícone por grupo + `is_day` (sem emoji). 42. `format.ts`: arredonda temperatura em °C; `HH:mm` a partir de ISO; ponto cardeal a partir de graus; trata valores `null` com placeholder.

**Frontend — componentes (`@testing-library/react`, props stubadas):** 43. `weather-hero`: exibe temperatura, condição PT-BR, máx/mín, sensação/vento/umidade/prob. de chuva e nome da cidade (RF5–RF8); container com `aria-live="polite"`. 44. `city-search` + `suggestion-list`: renderiza sugestões com desambiguação (admin1/país + chip de país) (RF1/RF2); `role="listbox"`/`option`. 45. `city-search`: navegação por teclado ↑/↓/Enter/Esc seleciona/fecha (acessibilidade) e dispara seleção (RF3). 46. `city-search`: estado vazio "Nenhuma cidade encontrada" (RF4). 47. `hourly-forecast-card`: renderiza 24 colunas com rótulo textual de temperatura por hora além da curva (RF9–RF11). 48. `daily-forecast-card`: 7 linhas com mín, máx e condição por dia (RF12/RF13). 49. `detailed-metrics-card`: exibe UV com rótulo qualitativo e demais métricas (RF7/RF15). 50. `sun-arc-card`: exibe horários de nascer/pôr do sol (RF16). 51. `air-quality-card`: exibe EAQI + rótulo qualitativo + poluentes (RF14). 52. `air-quality-card`: estado vazio explícito quando `air === null` (RF17). 53. `error-toast`: exibe mensagem e botão "Tentar de novo" apenas quando recuperável (RF25). 54. `loading-skeletons`: renderiza placeholders de hero/horário/diário (RF23). 55. Acessibilidade: estados (AQI/UV/status da API/erro) acompanham rótulo textual, não só cor (RF26).

### Testes de integração

**Backend (rotas com `supertest`, stub da camada `data`):**

1. `GET /api/weather/search?q=Lon` → `200` com `{ results: [...] }`.
2. `GET /api/weather/search` sem `q` (ou <2) → `400 invalid_request`.
3. `GET /api/weather/search` sem correspondência → `200 { results: [] }`.
4. `GET /api/weather?lat&lon` → `200` com `WeatherPayload` completo.
5. `GET /api/weather` sem/inválido `lat/lon` → `400 invalid_request`.
6. `GET /api/weather` com Forecast indisponível → `502 upstream_unavailable`.
7. `GET /api/weather` com Air Quality indisponível → `200` e `air: null`.
8. Formato do corpo de erro segue `{ error: { code, message } }` em todos os casos.

**Frontend (página com hooks reais + `services` stubados):** 9. `weather-dashboard-page`: busca → seleção de sugestão → render do hero/cartões (fluxo principal US1–US5). 10. `weather-dashboard-page`: geolocalização concedida define a cidade ativa (US6). 11. `weather-dashboard-page`: "cidade não encontrada" exibe orientação de correção (US7). 12. `weather-dashboard-page`: permissão negada mantém busca manual funcional (US8). 13. `weather-dashboard-page`: erro de rede/API exibe toast com "Tentar de novo" e a repetição recarrega (US9).

**Dados de teste:** fixtures de respostas reais da Open-Meteo (geocoding, forecast, air quality) versionadas como JSON, incluindo variações: dia/noite, múltiplos grupos WMO, `air` ausente, listas de geocoding vazias e homônimos (mesmo nome, `admin1`/país distintos).

### Testes E2E

E2E com **Playwright** (a skill `tests` do projeto passou a suportar Playwright), com a Open-Meteo **mockada** via interceptação de rede (route fulfill) para determinismo, sem depender da rede externa. Cobrem o frontend junto ao backend:

1. **Fluxo principal (US1–US5):** digitar cidade → selecionar sugestão → ver clima atual, 24h, 7 dias, métricas, UV, arco solar e qualidade do ar.
2. **Autocomplete/desambiguação (US1):** termo com homônimos lista variações com estado/país.
3. **Geolocalização (US6):** conceder permissão (contexto Playwright com geolocation) carrega o clima local.
4. **Permissão negada (US8):** negar geolocalização mantém a busca manual operante.
5. **Cidade não encontrada (US7):** busca inválida exibe mensagem clara em PT-BR.
6. **Falha de rede/fonte (US9):** mock de `502`/timeout exibe toast de erro; "Tentar de novo" recupera após mock voltar a `200`.
7. **Métrica indisponível (RF17):** mock com `air: null` mostra o estado vazio do cartão de qualidade do ar.
8. **Estados de carregamento (RF23/US10):** skeletons visíveis durante atraso simulado da resposta.
9. **Acessibilidade (WCAG 2.1 AA):** navegação por teclado completa (busca → listbox → seleção) e verificação automatizada (axe) na superfície escura; respeito a `prefers-reduced-motion`.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Tipos compartilhados (`backend/src/types`)** — base sem dependências; destrava as demais camadas.
2. **Camada de dados (`data/open-meteo-client.ts`) + testes unitários** — fronteira HTTP isolada e mockável; valida contratos da Open-Meteo cedo.
3. **Mapeamento de domínio (`services/weather-codes.ts`) + testes** — funções puras (WMO/UV/AQI), pré-requisito do service.
4. **Serviço (`services/weather-service.ts`) + testes** — orquestração/agregação sobre data + codes.
5. **Rotas (`routes/weather-routes.ts`) + registro em `index.ts` + testes de integração** — expõe a API; valida status/erros.
6. **Cliente HTTP do frontend (`services/weather-api.ts`) + testes** — depende do contrato já estável do backend; configurar proxy `/api` no Vite.
7. **Hooks (`use-city-search`, `use-weather`, `use-geolocation`) + testes** — lógica de UI sobre o service.
8. **Camada presentacional (`lib/sky`, `weather-icon`, `format`) + testes** — utilidades visuais puras.
9. **Componentes + tokens de design (`index.css`) + testes** — hero, cartões, busca, estados; aplica `DESIGN.md`.
10. **Página + integração em `App.tsx` + testes de integração** — compõe tudo; cobre fluxos US1–US9.
11. **E2E Playwright** — valida ponta a ponta com Open-Meteo mockada.

### Dependências técnicas

- **Infra de testes (a adicionar):** backend — `vitest` + `supertest`; frontend — `vitest` + `@testing-library/react` + `jsdom` + `@playwright/test`. Adicionar scripts `test` em ambos os `package.json` (hoje o backend tem placeholder).
- **Build/dev:** proxy `/api` no `vite.config.ts`; URLs base da Open-Meteo via env var com defaults.
- **Serviços externos:** disponibilidade das três APIs Open-Meteo (sem chave). Em testes, sempre stub/mock — nunca rede real.
- **Bloqueadores:** nenhuma migração/persistência (sem banco) e nenhuma autenticação; as coordenadas de geolocalização não são persistidas (privacidade, RF19).

## Monitoramento e observabilidade

O projeto **não possui** infraestrutura de Prometheus/Grafana instalada; portanto a abordagem inicial é **logging estruturado** no backend, deixando os contadores prontos para futura exportação Prometheus.

- **Logs (backend, por requisição):** método, rota, `q`/coordenadas (sem dados pessoais), origem do erro, latência do upstream e resultado (`success | city_not_found | upstream_unavailable | invalid_request`).
- **Níveis:** `info` (requisição/latência), `warn` (degradação — ex.: `air: null`), `error` (Forecast indisponível, com `reason` da Open-Meteo).
- **Métricas mapeadas ao PRD** (expostas como contadores/histogramas quando houver `/metrics`): taxa de sucesso de busca, tempo médio até resultado (latência da chamada agregada), taxa de erro por origem (cidade não encontrada vs. falha de API), uso do botão de geolocalização e taxa de exibição de estado de erro.
- **Frontend:** o `api-status-pill` continua refletindo a saúde do backend (`/health`); estados de erro/vazio são instrumentáveis para a métrica de "quedas".
- **Integração Grafana:** fora do escopo atual (infra inexistente); estrutura de logs/contadores definida para integração futura sem retrabalho.

## Considerações técnicas

### Principais decisões

- **Backend como única origem (RF21/RF22):** o frontend usa apenas `/api/weather*` (caminho relativo + proxy Vite). Trade-off: uma camada a mais; ganho: desacoplamento da Open-Meteo, contrato estável, ponto único de erro/observabilidade. _Alternativa descartada:_ frontend chamar a Open-Meteo direto (viola o PRD) — o fallback direto presente no demo `docs/design/index.html` é **removido** na implementação real.
- **Payload agregado em um endpoint de clima:** `GET /api/weather` devolve current+24h+7d+extras+ar prontos, reduzindo round-trips e ajudando a meta de ≤3 s. _Alternativa descartada:_ endpoints separados por recurso (mais chamadas no frontend, pior latência percebida).
- **Sem cache (decisão de produto):** cada requisição chama a Open-Meteo. Mitigações: debounce de busca (240 ms), única chamada agregada, `AbortController` e degradação graciosa. Cache em memória com TTL fica registrado como otimização futura.
- **Escopo conforme PRD, divergindo do demo visual:** **sem** alternância °C/°F (Celsius fixo) e **sem** favoritos/persistência — embora `docs/design/index.html` e `PRODUCT.md` os contenham. O layout/estética do design é seguido fielmente; apenas controles fora de escopo são omitidos (divergência justificada exigida pelo bloco `<critical>` do PRD).
- **Rótulos PT-BR no backend; visual no frontend:** o backend entrega rótulos de condição/UV/AQI em PT-BR ("dados prontos para exibição"); o frontend cuida do que é puramente visual (gradiente de céu, ícones, cores semânticas, gráficos), mantendo componentes presentacionais.
- **Contrato de erro tipado (RF24):** três códigos (`invalid_request`, `city_not_found`, `upstream_unavailable`) → status HTTP e copy PT-BR distintos, com recuperação onde aplicável (RF25). "Cidade não encontrada" é tratada como busca vazia (`200`), não como erro.
- **Aderência a padrões:** camadas de `AGENTS.md`, funções/componentes ≤30 linhas, ≤3 parâmetros, sem `switch/case` (uso de mapas de lookup para WMO/UV/AQI e estados), nomes iniciando por verbo, um tipo por arquivo.

### Riscos conhecidos

- **Latência/limite sem cache:** uso repetido pode aproximar limites de uso justo da Open-Meteo e variar a latência (meta ≤3 s depende do upstream). _Mitigação:_ debounce, chamada única agregada, timeout/abort; cache como evolução.
- **Contraste sobre vidro (WCAG):** texto `muted` sobre superfícies translúcidas pode falhar 4.5:1. _Mitigação:_ verificar contraste sobre o fundo **composto** (regra do `DESIGN.md`), promovendo para `--fg-2` quando necessário; validar com axe nos E2E.
- **Alinhamento do índice horário:** seleção das próximas 24h depende de `timezone=auto` e do casamento `hourly.time >= current.time`. _Mitigação:_ testes com fixtures de fusos distintos e dia/noite.
- **Geolocalização (privacidade/permissão):** consentimento obrigatório e coordenadas não persistidas (RF19). _Mitigação:_ estados `denied/unsupported` mantêm a busca manual (RF20) e testes cobrem os caminhos.
- **Divergência demo × produção:** risco de reintroduzir toggle/favoritos/fallback direto ao "seguir o HTML". _Mitigação:_ decisões explícitas acima e revisão na finalização.
- **E2E dependente de rede:** flakiness se a Open-Meteo for chamada de verdade. _Mitigação:_ mock por interceptação de rede no Playwright.
- **Áreas a pesquisar:** ajuste fino do mapeamento de descrição de AQI e dos limiares de UV à comunicação PT-BR ideal (validar com a copy do design).

### Conformidade com skills

Skills de `.claude/skills` aplicáveis a esta especificação:

- **`code-standards`** — backend/frontend: inglês no código, ≤30 linhas, ≤3 parâmetros, sem `switch/case`, nomes com verbo, um tipo por arquivo em `types/`.
- **`react`** — componentes funcionais ≤30 linhas, props explícitas (sem spread), hooks com prefixo `use`, `useMemo` para valores derivados, separação de camadas.
- **`tests`** — Vitest (unit/integração) com AAA, stub de dependências externas, testes independentes; **Playwright** para E2E (suporte agora incluído na skill).
- **`context7`** — consultada para validar contratos das APIs Open-Meteo (Forecast/Geocoding/Air Quality) usados nesta spec.
- **`impeccable`** — referência de craft de UI (vidro/atmosfera, hierarquia, acessibilidade) ao implementar os componentes conforme `DESIGN.md`/`PRODUCT.md`.
- **`finalize-implementation`** — encerramento: commit convencional, screenshots, checklist de qualidade e PR.

### Arquivos relevantes e dependentes

**Backend (novos):** `backend/src/routes/weather-routes.ts`, `backend/src/services/weather-service.ts`, `backend/src/services/weather-codes.ts`, `backend/src/data/open-meteo-client.ts`, `backend/src/types/{geo-result,weather-payload,current-weather,hourly-forecast,daily-forecast,air-quality,weather-error,weather-query}.ts` + respectivos `*.test.ts`.
**Backend (modificados):** `backend/src/index.ts` (registro do router), `backend/package.json` (deps/scripts de teste: `vitest`, `supertest`).

**Frontend (novos):** `frontend/src/pages/weather-dashboard-page.tsx`; `frontend/src/hooks/{use-weather,use-city-search,use-geolocation}.ts`; `frontend/src/services/weather-api.ts`; `frontend/src/components/{top-bar,city-search,suggestion-list,geolocation-button,weather-hero,hourly-forecast-card,daily-forecast-card,detailed-metrics-card,sun-arc-card,air-quality-card,error-toast,loading-skeletons,api-status-pill}.tsx`; `frontend/src/lib/{sky.ts,weather-icon.tsx,format.ts}`; `frontend/src/types/*.ts` + respectivos `*.test.ts(x)`; `frontend/e2e/*.spec.ts`.
**Frontend (modificados):** `frontend/src/App.tsx` (renderiza a página), `frontend/src/index.css` (tokens de vidro/atmosfera do `DESIGN.md`), `frontend/vite.config.ts` (proxy `/api`), `frontend/package.json` (deps/scripts: `vitest`, `@testing-library/react`, `jsdom`, `@playwright/test`).

**Referências consultadas:** `tasks/prd-painel-de-clima/prd.md` (origem dos RF), `docs/design/index.html` (layout obrigatório), `DESIGN.md` + `PRODUCT.md` (sistema de design), `AGENTS.md` (camadas/estrutura), `.claude/skills/{code-standards,react,tests}` (padrões).
