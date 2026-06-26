import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SunArcCard } from './sun-arc-card'

describe('SunArcCard', () => {
  it('#50 shows sunrise and sunset times', () => {
    // Arrange / Act
    render(<SunArcCard sunrise="2026-06-25T05:45" sunset="2026-06-25T20:30" currentTime="2026-06-25T14:00" />)

    // Assert — RF16
    expect(screen.getByText('Nascer do sol')).toBeInTheDocument()
    expect(screen.getByText('05:45')).toBeInTheDocument()
    expect(screen.getByText('Pôr do sol')).toBeInTheDocument()
    expect(screen.getByText('20:30')).toBeInTheDocument()
  })
})
