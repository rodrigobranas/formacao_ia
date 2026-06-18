import { describe, it, expect } from 'vitest';
import { parseCoordinate } from './coordinateParser';
import { HttpError } from '../types/http-error';

describe('parseCoordinate', () => {
  it('returns a parsed number for valid coordinate strings', () => {
    // Act
    const result = parseCoordinate('-23.55', 'latitude');

    // Assert
    expect(result).toBe(-23.55);
  });

  it('throws when coordinate value is missing', () => {
    // Act & Assert
    expect(() => parseCoordinate(undefined, 'latitude')).toThrow(HttpError);
  });

  it('throws when coordinate value is not numeric', () => {
    // Act & Assert
    expect(() => parseCoordinate('invalid', 'longitude')).toThrow(HttpError);
  });
});
