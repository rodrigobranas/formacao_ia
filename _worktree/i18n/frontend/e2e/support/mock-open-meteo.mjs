// Mock Open-Meteo upstream for E2E.
//
// The browser only ever talks to the backend (`/api/weather*`) — the backend is
// the single source of data (RF21/RF22) and calls Open-Meteo server-side. Because
// Playwright's `page.route` can only intercept browser-originated requests, it
// cannot reach those server-side calls. So instead we mock Open-Meteo at the seam
// the techspec defines for exactly this purpose: "URLs base parametrizáveis por env
// var (com defaults), facilitando stub/mocks em testes". The real backend runs
// against this server (via OPEN_METEO_*_URL), so the whole stack is exercised end
// to end while the external network is never touched.
//
// Test scenarios are selected through a small control API (`/__control`,
// `/__reset`), reusing the versioned JSON fixtures in `fixtures/open-meteo`.

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.MOCK_PORT ?? 4555)
const FIXTURES = '../../../fixtures/open-meteo/'

function loadFixture(name) {
  const url = new URL(`${FIXTURES}${name}`, import.meta.url)
  return readFileSync(fileURLToPath(url), 'utf-8')
}

const FIXTURE = {
  geocodingHomonyms: loadFixture('geocoding-homonyms.json'),
  geocodingEmpty: loadFixture('geocoding-empty.json'),
  forecastDay: loadFixture('forecast-day.json'),
  forecastNight: loadFixture('forecast-night.json'),
  airQuality: loadFixture('air-quality.json'),
  airQualityError: loadFixture('air-quality-error.json'),
}

const DEFAULT_STATE = { geocoding: 'homonyms', forecast: 'day', air: 'ok', delayMs: 0 }
let state = { ...DEFAULT_STATE }

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => resolve(raw ? JSON.parse(raw) : {}))
  })
}

function handleGeocoding(res) {
  if (state.geocoding === 'empty') {
    return sendJson(res, 200, FIXTURE.geocodingEmpty)
  }
  return sendJson(res, 200, FIXTURE.geocodingHomonyms)
}

function handleForecast(res) {
  if (state.forecast === '502') {
    return sendJson(res, 502, JSON.stringify({ error: true, reason: 'mock upstream down' }))
  }
  const body = state.forecast === 'night' ? FIXTURE.forecastNight : FIXTURE.forecastDay
  setTimeout(() => sendJson(res, 200, body), state.delayMs)
}

function handleAirQuality(res) {
  // The backend degrades to `extras.air = null` when Air Quality returns an error
  // body (RF17), so the "metric unavailable" scenario reuses the error fixture.
  if (state.air === 'null') {
    return sendJson(res, 200, FIXTURE.airQualityError)
  }
  return sendJson(res, 200, FIXTURE.airQuality)
}

const ROUTES = {
  '/v1/search': handleGeocoding,
  '/v1/forecast': handleForecast,
  '/v1/air-quality': handleAirQuality,
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`)

  if (pathname === '/__health') {
    return sendJson(res, 200, JSON.stringify({ status: 'ok' }))
  }
  if (pathname === '/__reset' && req.method === 'POST') {
    state = { ...DEFAULT_STATE }
    return sendJson(res, 200, JSON.stringify(state))
  }
  if (pathname === '/__control' && req.method === 'POST') {
    state = { ...state, ...(await readBody(req)) }
    return sendJson(res, 200, JSON.stringify(state))
  }

  const handler = ROUTES[pathname]
  if (handler) {
    return handler(res)
  }
  sendJson(res, 404, JSON.stringify({ error: true, reason: 'unknown route' }))
})

server.listen(PORT, () => {
  console.log(`[mock-open-meteo] listening on http://localhost:${PORT}`)
})
