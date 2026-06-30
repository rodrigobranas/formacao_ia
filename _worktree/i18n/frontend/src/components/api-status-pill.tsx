import { useMemo } from 'react'
import type { ApiStatus } from '@/types/api-status'
import { useTranslation } from 'react-i18next'

const STATUS_COLOR: Record<ApiStatus, string> = {
  checking: '#f5cf4a',
  online: '#48d39a',
  offline: '#ef5e6f',
}

const STATUS_LABEL_KEY: Record<ApiStatus, string> = {
  checking: 'apiStatus.checking',
  online: 'apiStatus.online',
  offline: 'apiStatus.offline',
}

type ApiStatusPillProps = {
  status: ApiStatus
}

export function ApiStatusPill({ status }: ApiStatusPillProps) {
  const { t } = useTranslation()
  const color = useMemo(() => STATUS_COLOR[status], [status])
  const label = t(STATUS_LABEL_KEY[status])

  return (
    <span className="wx-pill" role="status" aria-live="polite">
      <span className="pdot" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  )
}
