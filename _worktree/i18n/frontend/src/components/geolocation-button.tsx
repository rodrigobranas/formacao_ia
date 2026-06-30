import { useMemo } from 'react'
import { LocateFixed } from 'lucide-react'
import type { GeolocationStatus } from '@/types/geolocation-status'
import { useTranslation } from 'react-i18next'

type GeolocationButtonProps = {
  status: GeolocationStatus
  onClick: () => void
}

export function GeolocationButton({ status, onClick }: GeolocationButtonProps) {
  const { t } = useTranslation()
  const busy = useMemo(() => status === 'requesting', [status])
  const label = t('geo.useCurrentLocation')

  return (
    <button
      type="button"
      className={busy ? 'wx-iconbtn busy' : 'wx-iconbtn'}
      onClick={onClick}
      aria-label={label}
      aria-busy={busy}
      title={label}
    >
      <LocateFixed aria-hidden="true" />
    </button>
  )
}
