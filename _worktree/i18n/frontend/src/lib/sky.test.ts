import { describe, it, expect } from 'vitest'
import { skyForCode } from './sky'

describe('sky', () => {
  it('#40 returns distinct gradients for day vs night within the same group', () => {
    // Arrange / Act
    const clearDay = skyForCode(0, true)
    const clearNight = skyForCode(0, false)

    // Assert
    expect(clearDay).not.toEqual(clearNight)
    expect(clearDay.from).not.toBe(clearNight.from)
  })

  it('#40 returns distinct gradients across weather groups', () => {
    // Arrange / Act
    const clear = skyForCode(0, true)
    const rain = skyForCode(61, true)
    const thunder = skyForCode(95, true)

    // Assert
    expect(clear.from).not.toBe(rain.from)
    expect(rain.from).not.toBe(thunder.from)
    expect(clear).toMatchObject({ from: expect.any(String), via: expect.any(String), to: expect.any(String), glow: expect.any(String) })
  })
})
