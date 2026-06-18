import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomePage } from './HomePage';

vi.mock('@/hooks/useApiStatus', () => ({
  useApiStatus: () => 'online',
}));

vi.mock('@/hooks/useWeather', () => ({
  useWeather: () => ({
    city: 'São Paulo',
    setCity: vi.fn(),
    weather: null,
    status: 'idle',
    errorMessage: '',
    searchByCity: vi.fn(),
    requestUserLocation: vi.fn(),
  }),
}));

vi.mock('@/hooks/useWeatherMetrics', () => ({
  useWeatherMetrics: () => [],
}));

describe('HomePage', () => {
  it('renders the weather panel heading', () => {
    // Arrange & Act
    render(<HomePage />);

    // Assert
    expect(screen.getByText('Painel de clima')).toBeInTheDocument();
    expect(screen.getByText('Cidade')).toBeInTheDocument();
  });
});
