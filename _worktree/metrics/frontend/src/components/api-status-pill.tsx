import { useMemo } from 'react'
import type { ApiStatus } from '@/types/api-status'

const STATUS_COLOR: Record<ApiStatus, string> = {
  checking: '#f5cf4a',
  online: '#48d39a',
  offline: '#ef5e6f',
}

const STATUS_LABEL: Record<ApiStatus, string> = {
  checking: 'Verificando API…',
  online: 'API conectada',
  offline: 'API indisponível',
}

type ApiStatusPillProps = {
  status: ApiStatus
}

export function ApiStatusPill({ status }: ApiStatusPillProps) {
  const color = useMemo(() => STATUS_COLOR[status], [status])
  const label = useMemo(() => STATUS_LABEL[status], [status])

  return (
    <span className="wx-pill" role="status" aria-live="polite">
      <span className="pdot" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  )
}
