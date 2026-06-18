import { HttpError } from '../types/http-error';

export function parseCoordinate(value: unknown, label: string): number {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `${label} is required`);
  }

  const coordinate = Number(value);

  if (!Number.isFinite(coordinate)) {
    throw new HttpError(400, `${label} must be a valid number`);
  }

  return coordinate;
}
