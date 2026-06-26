import { AlertCircle } from 'lucide-react'

type ErrorToastProps = {
  message: string
  recoverable: boolean
  onRetry: () => void
}

export function ErrorToast({ message, recoverable, onRetry }: ErrorToastProps) {
  return (
    <div className="wx-toast show" role="alert">
      <AlertCircle aria-hidden="true" />
      <span>{message}</span>
      {recoverable && (
        <button type="button" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  )
}
