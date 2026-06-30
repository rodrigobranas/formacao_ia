import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type ErrorToastProps = {
  message: string
  recoverable: boolean
  onRetry: () => void
}

export function ErrorToast({ message, recoverable, onRetry }: ErrorToastProps) {
  const { t } = useTranslation()

  return (
    <div className="wx-toast show" role="alert">
      <AlertCircle aria-hidden="true" />
      <span>{message}</span>
      {recoverable && (
        <button type="button" onClick={onRetry}>
          {t('errors.retry')}
        </button>
      )}
    </div>
  )
}
