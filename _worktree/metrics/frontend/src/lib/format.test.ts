import { describe, it, expect } from 'vitest'
import {
  formatTemperature,
  roundTemperature,
  formatTime,
  formatCardinal,
  formatPercent,
  formatMeasure,
} from './format'

describe('format', () => {
  it('#42 rounds temperature in °C and handles null with a placeholder', () => {
    // Assert
    expect(formatTemperature(20.6)).toBe('21°')
    expect(roundTemperature(20.4)).toBe('20')
    expect(formatTemperature(null)).toBe('—')
  })

  it('converts temperature to whole Fahrenheit when imperial is selected', () => {
    // Assert
    expect(formatTemperature(21.4, 'imperial')).toBe('70°')
    expect(formatTemperature(20.6, 'metric')).toBe('21°')
    expect(formatTemperature(null, 'imperial')).toBe('—')
  })

  it('formats measures in metric using the provided unit', () => {
    // Assert
    expect(formatMeasure(12, 'km/h')).toBe('12 km/h')
    expect(formatMeasure(12, 'km/h', 'metric', 'wind')).toBe('12 km/h')
    expect(formatMeasure(null, 'km/h')).toBe('—')
  })

  it('converts measures to imperial based on kind', () => {
    // Assert
    expect(formatMeasure(12, 'km/h', 'imperial', 'wind')).toBe('7 mph')
    expect(formatMeasure(1, 'mm', 'imperial', 'precip')).toBe('0.04 in')
    expect(formatMeasure(1013, 'hPa', 'imperial', 'pressure')).toBe('29.9 inHg')
  })

  it('#42 extracts HH:mm from an ISO timestamp', () => {
    // Assert
    expect(formatTime('2026-06-25T14:30')).toBe('14:30')
    expect(formatTime('2026-06-25T08:05:00')).toBe('08:05')
    expect(formatTime(null)).toBe('—')
  })

  it('#42 maps wind degrees to a cardinal point', () => {
    // Assert
    expect(formatCardinal(0)).toBe('N')
    expect(formatCardinal(90)).toBe('L')
    expect(formatCardinal(180)).toBe('S')
    expect(formatCardinal(270)).toBe('O')
    expect(formatCardinal(null)).toBe('—')
  })

  it('#42 formats percentages and treats null as placeholder', () => {
    // Assert
    expect(formatPercent(48.2)).toBe('48%')
    expect(formatPercent(null)).toBe('—')
  })
})
