import { useMemo } from 'react'
import { LocateFixed } from 'lucide-react'
import type { GeolocationStatus } from '@/types/geolocation-status'

type GeolocationButtonProps = {
  status: GeolocationStatus
  onClick: () => void
}

export function GeolocationButton({ status, onClick }: GeolocationButtonProps) {
  const busy = useMemo(() => status === 'requesting', [status])

  return (
    <button
      type="button"
      className={busy ? 'wx-iconbtn busy' : 'wx-iconbtn'}
      onClick={onClick}
      aria-label="Usar minha localização"
      aria-busy={busy}
      title="Usar minha localização"
    >
      <LocateFixed aria-hidden="true" />
    </button>
  )
}
