# Open-Meteo fixtures

Versioned JSON snapshots of real Open-Meteo responses, used to stub/mock the
three upstream APIs in tests (backend Vitest and frontend/E2E Playwright). They
keep tests deterministic and offline. **Never hit the real network in tests.**

| Fixture | API | Purpose / variation |
| --- | --- | --- |
| `geocoding-homonyms.json` | Geocoding | Multiple matches with same name, different `admin1`/country (disambiguation) |
| `geocoding-empty.json` | Geocoding | No `results` key → "cidade não encontrada" (`200 { results: [] }`) |
| `forecast-day.json` | Forecast | Daytime (`is_day: 1`), `weather_code: 2` (cloudy); 168 hourly + 7 daily |
| `forecast-night.json` | Forecast | Nighttime (`is_day: 0`), `weather_code: 95` (thunder); covers another WMO group |
| `air-quality.json` | Air Quality | EAQI 35 + pollutants (`Razoável` category) |
| `air-quality-error.json` | Air Quality | Upstream error body → backend degrades to `extras.air = null` (RF17) |

The "air absent" scenario (RF17) is reproduced either by serving
`air-quality-error.json` or by failing the Air Quality request entirely; the
backend keeps the rest of the payload intact and sets `extras.air = null`.
