import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
} from 'lucide-react'
import type { WeatherCondition } from '@/lib/weather'

interface WeatherIconProps {
  condition: WeatherCondition
  className?: string
}

export function WeatherIcon({ condition, className }: WeatherIconProps) {
  const iconClass = className ?? 'h-12 w-12'

  switch (condition) {
    case 'clear':
      return <Sun className={iconClass} />
    case 'partly-cloudy':
      return <CloudSun className={iconClass} />
    case 'cloudy':
      return <Cloud className={iconClass} />
    case 'fog':
      return <CloudFog className={iconClass} />
    case 'drizzle':
      return <Droplets className={iconClass} />
    case 'rain':
      return <CloudRain className={iconClass} />
    case 'freezing-rain':
      return <CloudRain className={iconClass} />
    case 'snow':
      return <CloudSnow className={iconClass} />
    case 'thunderstorm':
      return <CloudLightning className={iconClass} />
    default:
      return <Cloud className={iconClass} />
  }
}
