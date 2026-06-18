# Memory Ledger — Painel de Clima

## Goal
Implementar um painel de clima funcional no frontend e backend existentes, consumindo a API Open-Meteo (geocoding + forecast) e permitindo busca por cidade ou geolocalização do usuário.

## Constraints/Assumptions
- Backend Node/Express + TypeScript; frontend React + Vite + Tailwind CSS.
- Frontend deve buscar dados apenas no backend.
- Open-Meteo gratuita, sem chave de API.
- Reverse geocoding para coordenadas usa Nominatim (OpenStreetMap), gratuito e sem chave.

## Key decisions
- Registro do produto: ferramenta/utilitário (`product`) — confirmado com o usuário.
- Paleta cuidada: tokens HSL ajustados para identidade céu/clara, com contraste adequado.
- Endpoint backend: `GET /api/weather?city=` ou `?lat=&lon=`.
- Componentização: `SearchInput`, `WeatherIcon`, `WeatherPanel` + helpers `lib/weather.ts`.
- Removida animação de entrada `animate-fade-in` do painel, pois quebrava screenshots/headless e não agregava usabilidade essencial.

## State
Completed.

## Done
- Criado `PRODUCT.md` e `DESIGN.md`.
- Backend implementado: rotas, serviço Open-Meteo, reverse geocoding Nominatim.
- Frontend implementado: busca por cidade, geolocalização, card de clima, ícones por condição.
- Builds e typecheck de backend e frontend passam.
- Testes de API com dados reais (São Paulo, Porto Alegre, Rio de Janeiro).
- Screenshot da interface base validado.

## Next
- Entregar ao usuário e coletar feedback.

## Open questions
- Nenhuma.

## Working set
Files: `backend/src/index.ts`, `backend/src/services/weatherService.ts`, `backend/src/routes/weather.ts`, `frontend/src/App.tsx`, `frontend/src/index.css`, `frontend/src/lib/weather.ts`, `frontend/src/components/SearchInput.tsx`, `frontend/src/components/WeatherIcon.tsx`, `frontend/src/components/WeatherPanel.tsx`, `frontend/index.html`, `frontend/.env.example`, `PRODUCT.md`, `DESIGN.md`.
Commands: `npm run build` (backend/frontend), `PORT=... npx tsx src/index.ts` (backend dev), `npx vite` (frontend dev).
