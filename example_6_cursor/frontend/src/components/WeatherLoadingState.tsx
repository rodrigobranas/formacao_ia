import { Loader2 } from 'lucide-react';

export function WeatherLoadingState() {
  return (
    <div className="flex h-full min-h-[360px] items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Carregando clima
    </div>
  );
}
