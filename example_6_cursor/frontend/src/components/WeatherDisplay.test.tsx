import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WeatherDisplay } from './WeatherDisplay';

const mockWeather = {
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

describe('WeatherDisplay', () => {
  it('renders placeholder when there is no weather data', () => {
    // Arrange & Act
    render(<WeatherDisplay weather={null} metrics={[]} status="idle" />);

    // Assert
    expect(screen.getByText('Selecione uma cidade')).toBeInTheDocument();
  });

  it('renders weather location when data is available', () => {
    // Arrange & Act
    render(<WeatherDisplay weather={mockWeather} metrics={[]} status="success" />);

    // Assert
    expect(screen.getByText('Lisbon, Lisbon, Portugal')).toBeInTheDocument();
  });
});
