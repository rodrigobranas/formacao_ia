import { useMemo } from 'react';
import type { ApiStatus } from '@/types/api-status';

const STATUS_COLORS: Record<ApiStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-red-500',
  checking: 'bg-yellow-500',
};

type ApiStatusIndicatorProps = {
  status: ApiStatus;
};

export function ApiStatusIndicator({ status }: ApiStatusIndicatorProps) {
  const colorClass = useMemo(
    () => STATUS_COLORS[status] ?? 'bg-gray-500',
    [status],
  );

  return (
    <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 backdrop-blur-sm">
      <div className={`h-2.5 w-2.5 rounded-full ${colorClass} animate-pulse`} />
      <span className="text-sm font-medium text-muted-foreground">API Status</span>
    </div>
  );
}
