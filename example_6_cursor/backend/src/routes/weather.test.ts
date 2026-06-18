import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import weatherRoutes from './weather';

vi.mock('../services/weatherService', () => ({
  buildWeatherReport: vi.fn(),
}));

import { buildWeatherReport } from '../services/weatherService';

const mockReport = {
  location: {
    name: 'Lisbon',
    country: 'Portugal',
    region: 'Lisbon',
    latitude: 38.72,
    longitude: -9.14,
    timezone: 'Europe/Lisbon',
  },
  current: {
    time: '2026-06-18T12:00',
    temperature: 25,
    apparentTemperature: 26,
    relativeHumidity: 50,
    precipitation: 0,
    weatherCode: 0,
    windSpeed: 12,
    windDirection: 90,
    isDay: true,
  },
  units: {
    temperature: '°C',
    apparentTemperature: '°C',
    relativeHumidity: '%',
    precipitation: 'mm',
    windSpeed: 'km/h',
    windDirection: '°',
  },
};

describe('GET /weather', () => {
  beforeEach(() => {
    vi.mocked(buildWeatherReport).mockResolvedValue(mockReport);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with weather report JSON', async () => {
    // Arrange
    const app = express();
    app.use('/weather', weatherRoutes);

    // Act
    const response = await request(app).get('/weather').query({ city: 'Lisbon' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReport);
    expect(buildWeatherReport).toHaveBeenCalledWith({ city: 'Lisbon' });
  });
});
