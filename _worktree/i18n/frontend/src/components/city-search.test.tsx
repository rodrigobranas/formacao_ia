import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { CitySearch } from './city-search'
import type { GeoResult } from '@/types/geo-result'
import { renderWithI18n } from '@/i18n/test-utils'

const RESULTS: GeoResult[] = [
  { name: 'London', admin1: 'England', country: 'United Kingdom', country_code: 'GB', latitude: 51.5, longitude: -0.12, timezone: null },
  { name: 'Londrina', admin1: 'Paraná', country: 'Brasil', country_code: 'BR', latitude: -23.3, longitude: -51.1, timezone: null },
]

function renderSearch(props: Partial<Parameters<typeof CitySearch>[0]> = {}) {
  const onSelect = vi.fn()
  const onTermChange = vi.fn()
  renderWithI18n(
    <CitySearch
      term={props.term ?? 'Lon'}
      status={props.status ?? 'success'}
      results={props.results ?? RESULTS}
      onTermChange={onTermChange}
      onSelect={onSelect}
    />,
  )
  return { onSelect, onTermChange }
}

describe('CitySearch + SuggestionList', () => {
  it('#44 renders suggestions with disambiguation and a country chip', () => {
    // Arrange / Act
    renderSearch()

    // Assert — RF1/RF2
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(screen.getByText('England, United Kingdom')).toBeInTheDocument()
    expect(screen.getByText('Paraná, Brasil')).toBeInTheDocument()
    expect(screen.getByText('GB')).toBeInTheDocument()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('#45 supports keyboard navigation and selection', () => {
    // Arrange
    const { onSelect } = renderSearch()
    const input = screen.getByRole('combobox')

    // Act — move down twice then Enter selects the second result
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Assert — RF3
    expect(onSelect).toHaveBeenCalledWith(RESULTS[1])
  })

  it('#45 closes the listbox on Escape', () => {
    // Arrange
    renderSearch()
    const input = screen.getByRole('combobox')

    // Act
    fireEvent.keyDown(input, { key: 'Escape' })

    // Assert
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('#46 shows the empty state when there are no matches', () => {
    // Arrange / Act
    renderSearch({ status: 'empty', results: [] })

    // Assert — RF4
    expect(screen.getByText('Nenhuma cidade encontrada')).toBeInTheDocument()
  })

  it('renders search chrome in English', () => {
    renderWithI18n(
      <CitySearch term="" status="idle" results={[]} onTermChange={vi.fn()} onSelect={vi.fn()} />,
      { locale: 'en' },
    )

    expect(screen.getByRole('combobox', { name: 'Search city' })).toHaveAttribute('placeholder', 'Search city…')
  })
})
