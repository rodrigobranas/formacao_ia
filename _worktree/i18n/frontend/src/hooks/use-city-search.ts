import { useCallback, useEffect, useRef, useState } from 'react'
import type { GeoResult } from '@/types/geo-result'
import type { SearchStatus } from '@/types/search-status'
import { searchCities } from '@/services/weather-api'

const DEBOUNCE_MS = 240
const MIN_TERM_LENGTH = 2

async function executeSearch(
  term: string,
  isCurrent: () => boolean,
  apply: (results: GeoResult[], status: SearchStatus) => void,
): Promise<void> {
  try {
    const results = await searchCities(term)
    if (!isCurrent()) return
    apply(results, results.length > 0 ? 'success' : 'empty')
  } catch {
    if (isCurrent()) apply([], 'error')
  }
}

export function useCitySearch() {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [status, setStatus] = useState<SearchStatus>('idle')
  const requestId = useRef(0)

  const apply = useCallback((next: GeoResult[], nextStatus: SearchStatus) => {
    setResults(next)
    setStatus(nextStatus)
  }, [])

  const reset = useCallback(() => {
    requestId.current += 1
    setResults([])
    setStatus('idle')
  }, [])

  useEffect(() => {
    const trimmed = term.trim()
    if (trimmed.length < MIN_TERM_LENGTH) {
      reset()
      return
    }
    setStatus('loading')
    const timer = setTimeout(() => {
      const currentId = ++requestId.current
      void executeSearch(trimmed, () => requestId.current === currentId, apply)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [term, apply, reset])

  return { term, setTerm, results, status, reset }
}
