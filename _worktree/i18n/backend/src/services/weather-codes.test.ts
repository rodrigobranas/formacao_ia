import { describe, it, expect } from 'vitest';
import { toCondition, toUvCategory, toAirQualityCategory } from './weather-codes';

describe('toCondition', () => {
  it('returns the correct PT-BR label and group per WMO range (#11)', () => {
    // Arrange
    const expectations: Array<[number, string]> = [
      [0, 'clear'],
      [1, 'clear'],
      [2, 'cloudy'],
      [3, 'cloudy'],
      [45, 'fog'],
      [48, 'fog'],
      [51, 'drizzle'],
      [57, 'drizzle'],
      [61, 'rain'],
      [67, 'rain'],
      [71, 'snow'],
      [77, 'snow'],
      [80, 'rain'],
      [82, 'rain'],
      [85, 'snow'],
      [86, 'snow'],
      [95, 'thunder'],
      [99, 'thunder'],
    ];

    // Act & Assert
    expectations.forEach(([code, group]) => {
      const condition = toCondition(code);
      expect(condition.group).toBe(group);
      expect(condition.label.length).toBeGreaterThan(0);
      expect(condition.code).toBe(code);
    });
  });

  it('falls back to "Tempo"/cloudy for an unknown code (#12)', () => {
    // Arrange & Act
    const condition = toCondition(123);

    // Assert
    expect(condition).toEqual({ code: 123, label: 'Tempo', group: 'cloudy' });
  });
});

describe('toUvCategory', () => {
  it('applies the UV boundaries (#13)', () => {
    // Arrange & Act & Assert
    expect(toUvCategory(2)).toEqual({ label: 'Baixo' });
    expect(toUvCategory(5)).toEqual({ label: 'Moderado' });
    expect(toUvCategory(7)).toEqual({ label: 'Alto' });
    expect(toUvCategory(10)).toEqual({ label: 'Muito alto' });
    expect(toUvCategory(11)).toEqual({ label: 'Extremo' });
  });

  it('returns null when UV is null (#14)', () => {
    // Arrange & Act & Assert
    expect(toUvCategory(null)).toBeNull();
  });
});

describe('toAirQualityCategory', () => {
  it('applies the EAQI boundaries with matching description (#15)', () => {
    // Arrange & Act & Assert
    expect(toAirQualityCategory(20)?.label).toBe('Boa');
    expect(toAirQualityCategory(40)?.label).toBe('Razoável');
    expect(toAirQualityCategory(60)?.label).toBe('Moderada');
    expect(toAirQualityCategory(80)?.label).toBe('Ruim');
    expect(toAirQualityCategory(100)?.label).toBe('Muito ruim');
    expect(toAirQualityCategory(120)?.label).toBe('Péssima');
    expect(toAirQualityCategory(35)?.description.length).toBeGreaterThan(0);
  });

  it('returns null when EAQI is null (#16)', () => {
    // Arrange & Act & Assert
    expect(toAirQualityCategory(null)).toBeNull();
  });
});
