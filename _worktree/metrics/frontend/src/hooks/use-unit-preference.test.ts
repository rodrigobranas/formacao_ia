import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useUnitPreference, UnitPreferenceWrapper } from './use-unit-preference'

const STORAGE_KEY = 'wx:units'

describe('useUnitPreference', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to metric when localStorage is empty', () => {
    // Arrange & Act
    const { result } = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })

    // Assert
    expect(result.current.unitSystem).toBe('metric')
  })

  it('writes { temp: "f" } and updates context when switching to imperial', () => {
    // Arrange
    const { result } = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })

    // Act
    act(() => result.current.setUnitSystem('imperial'))

    // Assert
    expect(result.current.unitSystem).toBe('imperial')
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ temp: 'f' }))
  })

  it('initializes as imperial from stored { temp: "f" } on mount', () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ temp: 'f' }))

    // Act
    const { result } = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })

    // Assert
    expect(result.current.unitSystem).toBe('imperial')
  })

  it('falls back to Celsius default when stored JSON is corrupt', () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, '{ not valid json')

    // Act
    const { result } = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })

    // Assert
    expect(result.current.unitSystem).toBe('metric')
  })

  it('falls back to Celsius default when stored shape is unexpected', () => {
    // Arrange — valid JSON but an unrecognized temp value
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ temp: 'x' }))

    // Act
    const { result } = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })

    // Assert
    expect(result.current.unitSystem).toBe('metric')
  })

  it('falls back gracefully when localStorage read throws', () => {
    // Arrange
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    // Act
    const { result } = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })

    // Assert
    expect(result.current.unitSystem).toBe('metric')
  })

  it('keeps in-memory state when localStorage write throws', () => {
    // Arrange
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })
    const { result } = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })

    // Act
    act(() => result.current.setUnitSystem('imperial'))

    // Assert
    expect(result.current.unitSystem).toBe('imperial')
  })

  it('toggles metric -> imperial -> metric synchronously', () => {
    // Arrange
    const { result } = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })

    // Act & Assert
    act(() => result.current.setUnitSystem('imperial'))
    expect(result.current.unitSystem).toBe('imperial')

    act(() => result.current.setUnitSystem('metric'))
    expect(result.current.unitSystem).toBe('metric')
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ temp: 'c' }))
  })

  it('restores the stored preference across a provider remount', () => {
    // Arrange — first mount persists imperial
    const first = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })
    act(() => first.result.current.setUnitSystem('imperial'))
    first.unmount()

    // Act — fresh provider reads the persisted value
    const second = renderHook(() => useUnitPreference(), { wrapper: UnitPreferenceWrapper })

    // Assert
    expect(second.result.current.unitSystem).toBe('imperial')
  })

  it('throws when used outside the provider', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Act & Assert
    expect(() => renderHook(() => useUnitPreference())).toThrow(
      /must be used within a UnitPreferenceProvider/,
    )
  })
})
