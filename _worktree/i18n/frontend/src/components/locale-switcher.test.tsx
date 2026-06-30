import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { LocaleSwitcher } from './locale-switcher'
import { renderWithI18n } from '@/i18n/test-utils'

describe('LocaleSwitcher', () => {
  it('marks the Brazilian Portuguese option as pressed when locale is pt-BR', () => {
    renderWithI18n(<LocaleSwitcher />, { locale: 'pt-BR' })

    expect(screen.getByRole('button', { name: 'Português (Brasil)' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches to English when the English option is clicked', async () => {
    const user = userEvent.setup()
    const { i18n } = renderWithI18n(<LocaleSwitcher />, { locale: 'pt-BR' })

    await user.click(screen.getByRole('button', { name: 'English' }))

    await waitFor(() => expect(i18n.language).toBe('en'))
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Português (Brasil)' })).toHaveAttribute('aria-pressed', 'false')
  })

  it.each<[string, string]>([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])('switches locale from the inactive option via %s', async (_name, key) => {
    const user = userEvent.setup()
    const { i18n } = renderWithI18n(<LocaleSwitcher />, { locale: 'pt-BR' })
    const englishButton = screen.getByRole('button', { name: 'English' })

    englishButton.focus()
    await user.keyboard(key)

    await waitFor(() => expect(i18n.language).toBe('en'))
    expect(englishButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders English labels through renderWithI18n when locale is en', () => {
    renderWithI18n(<LocaleSwitcher />, { locale: 'en' })

    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Current language: English')).toBeInTheDocument()
  })
})
