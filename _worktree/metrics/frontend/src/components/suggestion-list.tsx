import { MapPin } from 'lucide-react'
import type { GeoResult } from '@/types/geo-result'

type SuggestionListProps = {
  results: GeoResult[]
  activeIndex: number
  onSelect: (result: GeoResult) => void
}

function describeRegion(result: GeoResult): string {
  return [result.admin1, result.country].filter(Boolean).join(', ')
}

export function SuggestionList({ results, activeIndex, onSelect }: SuggestionListProps) {
  if (results.length === 0) {
    return (
      <div className="wx-suggest" role="listbox" aria-label="Sugestões de cidade">
        <div className="wx-suggest-empty">Nenhuma cidade encontrada</div>
      </div>
    )
  }
  return (
    <div className="wx-suggest" role="listbox" aria-label="Sugestões de cidade">
      {results.map((result, index) => (
        <button
          key={`${result.latitude},${result.longitude}`}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          className={index === activeIndex ? 'wx-suggest-item active' : 'wx-suggest-item'}
          onMouseDown={(event) => {
            event.preventDefault()
            onSelect(result)
          }}
        >
          <MapPin className="pin" aria-hidden="true" />
          <span>
            <span className="s-name">{result.name}</span>
            <span className="s-sub">{describeRegion(result)}</span>
          </span>
          {result.country_code && <span className="cc">{result.country_code}</span>}
        </button>
      ))}
    </div>
  )
}
