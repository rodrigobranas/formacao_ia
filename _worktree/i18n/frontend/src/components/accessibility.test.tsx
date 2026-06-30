import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { ApiStatusPill } from './api-status-pill'
import { DetailedMetricsCard } from './detailed-metrics-card'
import { AirQualityCard } from './air-quality-card'
import { ErrorToast } from './error-toast'
import { buildCurrent, buildAirQuality } from '@/test/fixtures'
import { renderWithI18n } from '@/i18n/test-utils'

describe('#55 state is conveyed by text, not color alone', () => {
  it('api status pill pairs its dot with a textual label', () => {
    // Arrange / Act
    renderWithI18n(<ApiStatusPill status="offline" />)

    // Assert — RF26
    expect(screen.getByText('API indisponível')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('UV severity carries a qualitative text label', () => {
    // Arrange / Act
    renderWithI18n(<DetailedMetricsCard current={buildCurrent()} uv={{ value: 9, label: 'Muito alto' }} windUnit="km/h" />)

    // Assert
    expect(screen.getByText('Muito alto')).toBeInTheDocument()
  })

  it('air quality severity carries a text label', () => {
    // Arrange / Act
    renderWithI18n(<AirQualityCard air={buildAirQuality({ category: { label: 'Ruim', description: 'Limite atividades intensas.' } })} />)

    // Assert
    expect(screen.getByText('Ruim')).toBeInTheDocument()
  })

  it('error state announces a message via role=alert', () => {
    // Arrange / Act
    renderWithI18n(<ErrorToast message="Fonte de dados indisponível." recoverable onRetry={vi.fn()} />)

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Fonte de dados indisponível.')
  })
})
