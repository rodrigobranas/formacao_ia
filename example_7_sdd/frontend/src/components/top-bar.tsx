import type { ReactNode } from 'react'
import { CloudSun } from 'lucide-react'

type TopBarProps = {
  searchSlot: ReactNode
  actionsSlot: ReactNode
}

export function TopBar({ searchSlot, actionsSlot }: TopBarProps) {
  return (
    <header className="wx-topbar">
      <div className="wx-brand">
        <span className="logo" aria-hidden="true">
          <CloudSun size={18} />
        </span>
        Tempo<small>Open-Meteo</small>
      </div>
      {searchSlot}
      <div className="wx-actions">{actionsSlot}</div>
    </header>
  )
}
