import { MapPin } from 'lucide-react';

type WeatherCityFieldProps = {
  city: string;
  onCityChange: (city: string) => void;
};

export function WeatherCityField({ city, onCityChange }: WeatherCityFieldProps) {
  return (
    <div className="relative flex-1">
      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id="city"
        className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        placeholder="Ex.: Lisboa"
        value={city}
        onChange={(event) => onCityChange(event.target.value)}
      />
    </div>
  );
}
