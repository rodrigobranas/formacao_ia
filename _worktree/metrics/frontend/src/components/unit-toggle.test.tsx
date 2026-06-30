import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnitToggle } from './unit-toggle'
import { useUnitPreference } from '@/hooks/use-unit-preference'
import type { UnitSystem } from '@/types/unit-system'

vi.mock('@/hooks/use-unit-preference', () => ({
  useUnitPreference: vi.fn(),
}))

const useUnitPreferenceMock = vi.mocked(useUnitPreference)

function setup(unitSystem: UnitSystem) {
  const setUnitSystem = vi.fn()
  useUnitPreferenceMock.mockReturnValue({ unitSystem, setUnitSystem })
  render(<UnitToggle />)
  return { setUnitSystem }
}

describe('UnitToggle', () => {
  beforeEach(() => {
    useUnitPreferenceMock.mockReset()
  })

  it('#56 renders °C and °F segments with °C selected when metric', () => {
    // Arrange / Act
    setup('metric')

    // Assert — F1
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('#57 calls setUnitSystem(imperial) when clicking °F', async () => {
    // Arrange
    const { setUnitSystem } = setup('metric')

    // Act
    await userEvent.click(screen.getByRole('button', { name: '°F' }))

    // Assert
    expect(setUnitSystem).toHaveBeenCalledWith('imperial')
  })

  it('#58 calls setUnitSystem(metric) when clicking °C while imperial is active', async () => {
    // Arrange
    const { setUnitSystem } = setup('imperial')

    // Act
    await userEvent.click(screen.getByRole('button', { name: '°C' }))

    // Assert
    expect(setUnitSystem).toHaveBeenCalledWith('metric')
  })

  it('#59 reflects selected state via aria-pressed when imperial is active', () => {
    // Arrange / Act
    setup('imperial')

    // Assert
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('#60 activates °F via the keyboard Enter key', async () => {
    // Arrange
    const { setUnitSystem } = setup('metric')
    const fahrenheit = screen.getByRole('button', { name: '°F' })
    fahrenheit.focus()

    // Act
    await userEvent.keyboard('{Enter}')

    // Assert
    expect(setUnitSystem).toHaveBeenCalledWith('imperial')
  })

  it('#61 exposes the segmented control as a labelled group', () => {
    // Arrange / Act
    setup('metric')

    // Assert
    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument()
  })
})
