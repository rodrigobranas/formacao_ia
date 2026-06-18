import { HealthReport } from '../types/health';

export function buildHealthReport(): HealthReport {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };
}
