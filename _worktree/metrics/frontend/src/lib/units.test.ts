import { describe, it, expect } from 'vitest'
import {
  convertTemperature,
  convertWind,
  convertPrecipitation,
  convertPressure,
  temperatureUnitLabel,
  windUnitLabel,
  precipitationUnitLabel,
  pressureUnitLabel,
} from './units'

describe('units conversion', () => {
  it('converts Celsius to whole Fahrenheit in imperial', () => {
    // Arrange & Act & Assert
    expect(convertTemperature(21, 'imperial')).toBe(70)
  })

  it('returns the Celsius value unchanged in metric', () => {
    // Arrange & Act & Assert
    expect(convertTemperature(21.4, 'metric')).toBe(21.4)
  })

  it('returns null for missing temperature input', () => {
    // Arrange & Act & Assert
    expect(convertTemperature(null, 'imperial')).toBeNull()
    expect(convertTemperature(Number.NaN, 'imperial')).toBeNull()
  })

  it('converts km/h to whole mph in imperial', () => {
    // Arrange & Act & Assert
    expect(convertWind(10, 'imperial')).toBe(6)
  })

  it('converts mm to inches at two decimal places in imperial', () => {
    // Arrange & Act & Assert
    expect(convertPrecipitation(1, 'imperial')).toBe(0.04)
  })

  it('converts hPa to inHg at one decimal place in imperial', () => {
    // Arrange & Act & Assert
    expect(convertPressure(1013, 'imperial')).toBe(29.9)
  })

  it('returns null for missing measure inputs', () => {
    // Arrange & Act & Assert
    expect(convertWind(null, 'imperial')).toBeNull()
    expect(convertPrecipitation(null, 'imperial')).toBeNull()
    expect(convertPressure(null, 'imperial')).toBeNull()
    expect(convertWind(Number.NaN, 'imperial')).toBeNull()
  })

  it('passes measure values through unchanged in metric', () => {
    // Arrange & Act & Assert
    expect(convertWind(10, 'metric')).toBe(10)
    expect(convertPrecipitation(1, 'metric')).toBe(1)
    expect(convertPressure(1013, 'metric')).toBe(1013)
  })
})

describe('unit labels', () => {
  it('returns metric labels', () => {
    // Arrange & Act & Assert
    expect(temperatureUnitLabel('metric')).toBe('°')
    expect(windUnitLabel('metric')).toBe('km/h')
    expect(precipitationUnitLabel('metric')).toBe('mm')
    expect(pressureUnitLabel('metric')).toBe('hPa')
  })

  it('returns imperial labels', () => {
    // Arrange & Act & Assert
    expect(temperatureUnitLabel('imperial')).toBe('°')
    expect(windUnitLabel('imperial')).toBe('mph')
    expect(precipitationUnitLabel('imperial')).toBe('in')
    expect(pressureUnitLabel('imperial')).toBe('inHg')
  })
})
