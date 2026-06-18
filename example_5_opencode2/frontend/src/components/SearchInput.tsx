import { Loader2, Search } from 'lucide-react'
import { useState, FormEvent } from 'react'

interface SearchInputProps {
  onSearch: (city: string) => void
  isLoading?: boolean
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      onSearch(trimmed)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center gap-2 rounded-full border border-input bg-card px-1 py-1 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring"
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite uma cidade..."
          className="h-10 w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          aria-label="Cidade"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Buscar'
        )}
      </button>
    </form>
  )
}
