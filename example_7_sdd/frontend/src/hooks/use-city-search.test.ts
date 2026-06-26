import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCitySearch } from './use-city-search'
import { searchCities } from '@/services/weather-api'

vi.mock('@/services/weather-api', () => ({
  searchCities: vi.fn(),
}))

const searchCitiesMock = vi.mocked(searchCities)

describe('useCitySearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    searchCitiesMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('#30 ignores terms shorter than 2 characters', async () => {
    // Arrange
    const { result } = renderHook(() => useCitySearch())

    // Act
    act(() => result.current.setTerm('a'))
    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    // Assert
    expect(searchCitiesMock).not.toHaveBeenCalled()
    expect(result.current.status).toBe('idle')
  })

  it('#31 debounces and does not fire during fast typing', async () => {
    // Arrange
    searchCitiesMock.mockResolvedValue([])
    const { result } = renderHook(() => useCitySearch())

    // Act — type then change again before the debounce elapses
    act(() => result.current.setTerm('Lo'))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    act(() => result.current.setTerm('Lond'))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // Assert — still within debounce window, no call yet
    expect(searchCitiesMock).not.toHaveBeenCalled()

    // Act — let the debounce elapse
    await act(async () => {
      vi.advanceTimersByTime(240)
    })

    // Assert — only the latest term searched once
    expect(searchCitiesMock).toHaveBeenCalledTimes(1)
    expect(searchCitiesMock).toHaveBeenCalledWith('Lond')
  })

  it('#32 cancels stale responses so the last search wins', async () => {
    // Arrange — controllable promises
    const deferred: Array<(value: never[]) => void> = []
    searchCitiesMock.mockImplementation(
      () => new Promise((resolve) => deferred.push(resolve as (value: never[]) => void)),
    )
    const { result } = renderHook(() => useCitySearch())

    // Act — fire two searches
    act(() => result.current.setTerm('Lon'))
    await act(async () => {
      vi.advanceTimersByTime(240)
    })
    act(() => result.current.setTerm('Lond'))
    await act(async () => {
      vi.advanceTimersByTime(240)
    })

    // Resolve the second (latest) first, then the stale first
    await act(async () => {
      deferred[1]([{ name: 'Londrina' }] as never)
      await Promise.resolve()
    })
    await act(async () => {
      deferred[0]([{ name: 'London' }] as never)
      await Promise.resolve()
    })

    // Assert — stale response is ignored
    expect(result.current.results).toEqual([{ name: 'Londrina' }])
  })

  it('#33 exposes loading then success/empty states', async () => {
    // Arrange
    searchCitiesMock.mockResolvedValueOnce([{ name: 'Porto' }] as never)
    const { result } = renderHook(() => useCitySearch())

    // Act — typing sets loading immediately
    act(() => result.current.setTerm('Por'))
    expect(result.current.status).toBe('loading')

    await act(async () => {
      vi.advanceTimersByTime(240)
      await Promise.resolve()
    })

    // Assert — success with results
    expect(result.current.status).toBe('success')
    expect(result.current.results).toEqual([{ name: 'Porto' }])

    // Act — a term with no matches becomes empty
    searchCitiesMock.mockResolvedValueOnce([])
    act(() => result.current.setTerm('zzzzz'))
    await act(async () => {
      vi.advanceTimersByTime(240)
      await Promise.resolve()
    })

    // Assert
    expect(result.current.status).toBe('empty')
  })
})
