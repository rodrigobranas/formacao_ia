import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WeatherErrorAlert } from './WeatherErrorAlert';

describe('WeatherErrorAlert', () => {
  it('renders the error message', () => {
    // Arrange & Act
    render(<WeatherErrorAlert message="City not found" />);

    // Assert
    expect(screen.getByText('City not found')).toBeInTheDocument();
  });
});
