import { Search, Loader2 } from 'lucide-react'
import type { GeoResult } from '@/types/geo-result'
import type { SearchStatus } from '@/types/search-status'
import { useSuggestionNav } from '@/hooks/use-suggestion-nav'
import { SuggestionList } from './suggestion-list'

type CitySearchProps = {
  term: string
  status: SearchStatus
  results: GeoResult[]
  onTermChange: (value: string) => void
  onSelect: (result: GeoResult) => void
}

export function CitySearch({ term, status, results, onTermChange, onSelect }: CitySearchProps) {
  const { open, activeIndex, handleKeyDown, handleChange } = useSuggestionNav({
    status,
    results,
    onSelect,
    onTermChange,
  })

  return (
    <div className="wx-search">
      <div className="wx-search-box">
        {status === 'loading' ? (
          <Loader2 className="wx-spin" aria-hidden="true" />
        ) : (
          <Search aria-hidden="true" />
        )}
        <input
          type="text"
          value={term}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar cidade…"
          aria-label="Buscar cidade"
          role="combobox"
          aria-expanded={open}
          aria-controls="city-suggestions"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {open && (
        <div id="city-suggestions">
          <SuggestionList results={results} activeIndex={activeIndex} onSelect={onSelect} />
        </div>
      )}
    </div>
  )
}
