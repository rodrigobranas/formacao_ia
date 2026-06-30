import { beforeEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DetailedMetricsCard } from './detailed-metrics-card'
import { UnitPreferenceWrapper } from '@/hooks/use-unit-preference'
import { buildCurrent } from '@/test/fixtures'

function setStoredUnits(temp: 'c' | 'f') {
  localStorage.setItem('wx:units', JSON.stringify({ temp }))
}

function renderCard(current = buildCurrent(), uv: { value: number; label: string } | null = { value: 6, label: 'Alto' }) {
  return render(
    <UnitPreferenceWrapper>
      <DetailedMetricsCard current={current} uv={uv} />
    </UnitPreferenceWrapper>,
  )
}

function metricCell(container: HTMLElement, label: string) {
  const cells = Array.from(container.querySelectorAll('.wx-metric'))
  const cell = cells.find((item) => item.querySelector('.ml')?.textContent?.includes(label))
  if (!cell) {
    throw new Error(`Metric cell not found: ${label}`)
  }
  return cell
}

describe('DetailedMetricsCard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('#49 shows UV with a qualitative label and the other metrics', () => {
    // Arrange
    setStoredUnits('c')
    const current = buildCurrent()

    // Act
    renderCard(current)

    // Assert — RF7/RF15
    expect(screen.getByText('Índice UV')).toBeInTheDocument()
    expect(screen.getByText('Alto')).toBeInTheDocument()
    expect(screen.getByText('Sensação')).toBeInTheDocument()
    expect(screen.getByText('Umidade')).toBeInTheDocument()
    expect(screen.getByText('Pressão')).toBeInTheDocument()
  })

  it('#49 falls back to a placeholder when UV is unavailable', () => {
    // Arrange / Act
    renderCard(buildCurrent(), null)

    // Assert
    expect(screen.getByText('Índice UV')).toBeInTheDocument()
  })

  it('shows imperial temperature, wind, gust, precipitation and pressure metrics', () => {
    // Arrange
    setStoredUnits('f')
    const current = buildCurrent({ pressure: 1013, precipitation: 1 })

    // Act
    const { container } = renderCard(current)

    // Assert
    expect(metricCell(container, 'Sensação').querySelector('.mv')?.textContent).toBe('68°')
    expect(metricCell(container, 'Sensação').querySelector('.mx')?.textContent).toBe('Real 70°')
    expect(metricCell(container, 'Vento').querySelector('.mv')?.textContent).toBe('7 mph')
    expect(metricCell(container, 'Vento').querySelector('.mx')?.textContent).toBe('NO')
    expect(metricCell(container, 'Rajadas').querySelector('.mv')?.textContent).toBe('15 mph')
    expect(metricCell(container, 'Precipitação').querySelector('.mv')?.textContent).toBe('0.04 in')
    expect(metricCell(container, 'Pressão').querySelector('.mv')?.textContent).toBe('29.9 inHg')
    expect(metricCell(container, 'Umidade').querySelector('.mv')?.textContent).toBe('58%')
    expect(metricCell(container, 'Nuvens').querySelector('.mv')?.textContent).toBe('40%')
  })

  it('keeps placeholders for missing values in both unit systems', () => {
    // Arrange
    const current = buildCurrent({
      apparent_temperature: Number.NaN,
      temperature: Number.NaN,
      wind_speed: Number.NaN,
      wind_gusts: Number.NaN,
      precipitation: Number.NaN,
      pressure: Number.NaN,
    })
    setStoredUnits('c')
    const metric = renderCard(current, null)

    // Assert — metric placeholders
    expect(metricCell(metric.container, 'Sensação').querySelector('.mv')?.textContent).toBe('—')
    expect(metricCell(metric.container, 'Vento').querySelector('.mv')?.textContent).toBe('—')
    expect(metricCell(metric.container, 'Pressão').querySelector('.mv')?.textContent).toBe('—')
    metric.unmount()

    // Act — imperial placeholders
    setStoredUnits('f')
    const imperial = renderCard(current, null)

    // Assert
    expect(metricCell(imperial.container, 'Sensação').querySelector('.mv')?.textContent).toBe('—')
    expect(metricCell(imperial.container, 'Rajadas').querySelector('.mv')?.textContent).toBe('—')
    expect(metricCell(imperial.container, 'Precipitação').querySelector('.mv')?.textContent).toBe('—')
  })
})
