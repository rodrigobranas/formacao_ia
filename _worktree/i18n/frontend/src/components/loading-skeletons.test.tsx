import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { LoadingSkeletons } from './loading-skeletons'
import { renderWithI18n } from '@/i18n/test-utils'

describe('LoadingSkeletons', () => {
  it('#54 renders hero, hourly and daily placeholders', () => {
    // Arrange / Act
    renderWithI18n(<LoadingSkeletons />)

    // Assert — RF23
    expect(screen.getByTestId('hero-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('hourly-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('daily-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
  })
})
