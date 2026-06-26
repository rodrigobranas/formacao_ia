import { useEffect, useState } from 'react'
import type { ApiStatus } from '@/types/api-status'
import { fetchHealth } from '@/services/health-api'

const POLL_INTERVAL_MS = 5000

export function useApiStatus(): ApiStatus {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    const checkStatus = async () => {
      const healthy = await fetchHealth()
      setApiStatus(healthy ? 'online' : 'offline')
    }
    checkStatus()
    const interval = setInterval(checkStatus, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return apiStatus
}
