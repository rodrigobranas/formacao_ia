import { FormEvent } from 'react';
import { Loader2, LocateFixed, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeatherCityField } from '@/components/WeatherCityField';
import { WeatherErrorAlert } from '@/components/WeatherErrorAlert';
import type { WeatherStatus } from '@/types/weather-status';

type WeatherSearchFormProps = {
  city: string;
  status: WeatherStatus;
  errorMessage: string;
  onCityChange: (city: string) => void;
  onSearch: (city: string) => void;
  onUseLocation: () => void;
};

export function WeatherSearchForm({
  city,
  status,
  errorMessage,
  onCityChange,
  onSearch,
  onUseLocation,
}: WeatherSearchFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(city.trim());
  };

  return (
    <div>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-foreground" htmlFor="city">
          Cidade
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WeatherCityField city={city} onCityChange={onCityChange} />
          <Button className="h-11 shrink-0" disabled={status === 'loading'} type="submit">
            {status === 'loading' ? <Loader2 className="animate-spin" /> : <Search />}
            Buscar
          </Button>
        </div>
      </form>
      <Button
        className="mt-4 h-11 w-full justify-center sm:w-auto"
        disabled={status === 'loading'}
        onClick={onUseLocation}
        type="button"
        variant="outline"
      >
        <LocateFixed />
        Usar minha localização
      </Button>
      {errorMessage ? <WeatherErrorAlert message={errorMessage} /> : null}
    </div>
  );
}
