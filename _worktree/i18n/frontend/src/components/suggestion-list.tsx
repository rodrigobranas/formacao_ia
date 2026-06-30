import { MapPin } from 'lucide-react'
import type { GeoResult } from '@/types/geo-result'
import { useTranslation } from 'react-i18next'

type SuggestionListProps = {
  results: GeoResult[]
  activeIndex: number
  onSelect: (result: GeoResult) => void
}

function describeRegion(result: GeoResult): string {
  return [result.admin1, result.country].filter(Boolean).join(', ')
}

export function SuggestionList({ results, activeIndex, onSelect }: SuggestionListProps) {
  const { t } = useTranslation()

  if (results.length === 0) {
    return (
      <div className="wx-suggest" role="listbox" aria-label={t('search.suggestionsLabel')}>
        <div className="wx-suggest-empty">{t('search.empty')}</div>
      </div>
    )
  }
  return (
    <div className="wx-suggest" role="listbox" aria-label={t('search.suggestionsLabel')}>
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
