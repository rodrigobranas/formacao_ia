import { useCallback, useState, type KeyboardEvent } from 'react'
import type { GeoResult } from '@/types/geo-result'
import type { SearchStatus } from '@/types/search-status'

type SuggestionNavParams = {
  status: SearchStatus
  results: GeoResult[]
  onSelect: (result: GeoResult) => void
  onTermChange: (value: string) => void
}

type KeyContext = {
  activeIndex: number
  length: number
  setActiveIndex: (index: number) => void
  selectAt: (index: number) => void
  dismiss: () => void
}

const KEY_HANDLERS: Record<string, (event: KeyboardEvent, context: KeyContext) => void> = {
  ArrowDown: (event, c) => {
    event.preventDefault()
    c.setActiveIndex(Math.min(c.length - 1, c.activeIndex + 1))
  },
  ArrowUp: (event, c) => {
    event.preventDefault()
    c.setActiveIndex(Math.max(0, c.activeIndex - 1))
  },
  Enter: (event, c) => {
    event.preventDefault()
    c.selectAt(c.activeIndex < 0 ? 0 : c.activeIndex)
  },
  Escape: (_event, c) => c.dismiss(),
}

export function useSuggestionNav(params: SuggestionNavParams) {
  const { status, results, onSelect, onTermChange } = params
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dismissed, setDismissed] = useState(false)
  const open = (status === 'success' || status === 'empty') && !dismissed

  const selectAt = useCallback(
    (index: number) => {
      const result = results[index] ?? results[0]
      if (result) {
        setDismissed(true)
        onSelect(result)
      }
    },
    [results, onSelect],
  )

  const handleChange = useCallback(
    (value: string) => {
      setDismissed(false)
      setActiveIndex(-1)
      onTermChange(value)
    },
    [onTermChange],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return
      const context = { activeIndex, length: results.length, setActiveIndex, selectAt, dismiss: () => setDismissed(true) }
      KEY_HANDLERS[event.key]?.(event, context)
    },
    [open, activeIndex, results.length, selectAt],
  )

  return { open, activeIndex, handleKeyDown, handleChange }
}
