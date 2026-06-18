import { ApiStatusIndicator } from '@/components/ApiStatusIndicator';
import { WeatherPanel } from '@/components/WeatherPanel';
import { useApiStatus } from '@/hooks/useApiStatus';

export function HomePage() {
  const apiStatus = useApiStatus();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="relative flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">IA para Devs</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Painel de clima</h1>
          </div>
          <ApiStatusIndicator status={apiStatus} />
        </header>
        <div className="flex flex-1 flex-col py-6">
          <WeatherPanel />
        </div>
      </div>
    </div>
  );
}
