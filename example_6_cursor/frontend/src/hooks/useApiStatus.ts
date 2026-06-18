import { useEffect, useState } from 'react';
import { fetchHealthStatus } from '@/services/healthService';
import type { ApiStatus } from '@/types/api-status';

export function useApiStatus(): ApiStatus {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      const health = await fetchHealthStatus();
      setApiStatus(health ? 'online' : 'offline');
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return apiStatus;
}
