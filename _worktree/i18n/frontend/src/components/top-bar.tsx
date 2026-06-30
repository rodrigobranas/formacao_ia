import type { ReactNode } from 'react'
import { CloudSun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type TopBarProps = {
  searchSlot: ReactNode
  actionsSlot: ReactNode
}

export function TopBar({ searchSlot, actionsSlot }: TopBarProps) {
  const { t } = useTranslation()

  return (
    <header className="wx-topbar">
      <div className="wx-brand">
        <span className="logo" aria-hidden="true">
          <CloudSun size={18} />
        </span>
        {t('brand.name')}<small>{t('brand.tagline')}</small>
      </div>
      {searchSlot}
      <div className="wx-actions">{actionsSlot}</div>
    </header>
  )
}
