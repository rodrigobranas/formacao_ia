import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useGeolocation } from './use-geolocation'

function stubGeolocation(impl: Geolocation['getCurrentPosition'] | null) {
  if (impl === null) {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    })
    return
  }
  Object.defineProperty(global.navigator, 'geolocation', {
    value: { getCurrentPosition: impl },
    configurable: true,
  })
}

describe('useGeolocation', () => {
  afterEach(() => {
    stubGeolocation(null)
  })

  it('#37 returns rounded coordinates on success', () => {
    // Arrange
    stubGeolocation((onSuccess) =>
      (onSuccess as PositionCallback)({
        coords: { latitude: -23.547512, longitude: -46.636109 },
      } as GeolocationPosition),
    )
    const onGranted = vi.fn()
    const { result } = renderHook(() => useGeolocation(onGranted))

    // Act
    act(() => result.current.requestLocation())

    // Assert
    expect(result.current.status).toBe('granted')
    expect(onGranted).toHaveBeenCalledWith({ latitude: -23.5475, longitude: -46.6361 })
  })

  it('#38 sets denied without breaking manual search when permission is refused', () => {
    // Arrange
    stubGeolocation((_onSuccess, onError) =>
      (onError as PositionErrorCallback)({ code: 1 } as GeolocationPositionError),
    )
    const onGranted = vi.fn()
    const { result } = renderHook(() => useGeolocation(onGranted))

    // Act
    act(() => result.current.requestLocation())

    // Assert
    expect(result.current.status).toBe('denied')
    expect(onGranted).not.toHaveBeenCalled()
  })

  it('#39 reports unsupported when the browser lacks geolocation', () => {
    // Arrange
    stubGeolocation(null)
    const { result } = renderHook(() => useGeolocation(vi.fn()))

    // Act
    act(() => result.current.requestLocation())

    // Assert
    expect(result.current.status).toBe('unsupported')
  })
})
