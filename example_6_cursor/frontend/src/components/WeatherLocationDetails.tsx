import type { WeatherResponse } from '@/types/weather-response';

type WeatherLocationDetailsProps = {
  weather: WeatherResponse;
};

export function WeatherLocationDetails({ weather }: WeatherLocationDetailsProps) {
  return (
    <dl className="mt-auto grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-3">
      <div>
        <dt className="font-medium text-muted-foreground">Atualizado</dt>
        <dd className="mt-1 text-foreground">
          {new Date(weather.current.time).toLocaleString('pt-BR')}
        </dd>
      </div>
      <div>
        <dt className="font-medium text-muted-foreground">Latitude</dt>
        <dd className="mt-1 text-foreground">{weather.location.latitude.toFixed(2)}</dd>
      </div>
      <div>
        <dt className="font-medium text-muted-foreground">Longitude</dt>
        <dd className="mt-1 text-foreground">{weather.location.longitude.toFixed(2)}</dd>
      </div>
    </dl>
  );
}
