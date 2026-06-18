import type { HealthResponse } from '@/types/health-response';

const API_BASE_URL = 'http://localhost:3000';

export async function fetchHealthStatus(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}
