import { fetchHealth } from './health-api'

describe('fetchHealth', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when the health endpoint responds ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response)

    await expect(fetchHealth()).resolves.toBe(true)
  })

  it('returns false when the health endpoint fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))

    await expect(fetchHealth()).resolves.toBe(false)
  })
})
