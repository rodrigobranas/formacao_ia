import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { SunArcCard } from './sun-arc-card'
import { renderWithI18n } from '@/i18n/test-utils'

describe('SunArcCard', () => {
  it('#50 shows sunrise and sunset times', () => {
    // Arrange / Act
    renderWithI18n(<SunArcCard sunrise="2026-06-25T05:45" sunset="2026-06-25T20:30" currentTime="2026-06-25T14:00" />)

    // Assert — RF16
    expect(screen.getByText('Nascer do sol')).toBeInTheDocument()
    expect(screen.getByText('05:45')).toBeInTheDocument()
    expect(screen.getByText('Pôr do sol')).toBeInTheDocument()
    expect(screen.getByText('20:30')).toBeInTheDocument()
  })
})
