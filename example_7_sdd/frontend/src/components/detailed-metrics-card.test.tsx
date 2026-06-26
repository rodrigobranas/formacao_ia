import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DetailedMetricsCard } from './detailed-metrics-card'
import { buildCurrent } from '@/test/fixtures'

describe('DetailedMetricsCard', () => {
  it('#49 shows UV with a qualitative label and the other metrics', () => {
    // Arrange
    const current = buildCurrent()

    // Act
    render(<DetailedMetricsCard current={current} uv={{ value: 6, label: 'Alto' }} windUnit="km/h" />)

    // Assert — RF7/RF15
    expect(screen.getByText('Índice UV')).toBeInTheDocument()
    expect(screen.getByText('Alto')).toBeInTheDocument()
    expect(screen.getByText('Sensação')).toBeInTheDocument()
    expect(screen.getByText('Umidade')).toBeInTheDocument()
    expect(screen.getByText('Pressão')).toBeInTheDocument()
  })

  it('#49 falls back to a placeholder when UV is unavailable', () => {
    // Arrange / Act
    render(<DetailedMetricsCard current={buildCurrent()} uv={null} windUnit="km/h" />)

    // Assert
    expect(screen.getByText('Índice UV')).toBeInTheDocument()
  })
})
