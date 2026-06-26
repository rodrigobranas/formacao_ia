import { test as base, expect, type APIRequestContext } from '@playwright/test'

const MOCK_URL = 'http://localhost:4555'

export type MockState = {
  geocoding?: 'homonyms' | 'empty'
  forecast?: 'day' | 'night' | '502'
  air?: 'ok' | 'null'
  delayMs?: number
}

/** Drives the mock Open-Meteo upstream that the real backend runs against. */
export async function setMock(request: APIRequestContext, state: MockState): Promise<void> {
  await request.post(`${MOCK_URL}/__control`, { data: state })
}

export async function resetMock(request: APIRequestContext): Promise<void> {
  await request.post(`${MOCK_URL}/__reset`)
}

// Reset upstream state before every test so specs stay independent (serial run).
export const test = base.extend({
  page: async ({ page, request }, use) => {
    await resetMock(request)
    // `use` is the Playwright fixture callback, not a React hook.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page)
  },
})

export { expect }
