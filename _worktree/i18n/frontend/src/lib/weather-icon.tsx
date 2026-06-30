import type { ReactNode } from 'react'
import type { WeatherGroup } from '@/types/weather-group'
import { groupForCode } from './weather-code'

const SUN = (
  <>
    <circle cx="12" cy="12" r="3.6" />
    <path d="M12 3.4V5M12 19v1.6M4.6 4.6l1.1 1.1M18.3 18.3l1.1 1.1M3.4 12H5M19 12h1.6M4.6 19.4l1.1-1.1M18.3 5.7l1.1-1.1" />
  </>
)
const MOON = <path d="M16.8 14.6A6.4 6.4 0 0 1 9.4 7.2 6.4 6.4 0 1 0 16.8 14.6Z" />
const CLOUD = <path d="M7.2 18.5h8.6a3.4 3.4 0 0 0 .3-6.8 5 5 0 0 0-9.7-1.3A3.7 3.7 0 0 0 7.2 18.5Z" />

const GROUP_BODY: Record<WeatherGroup, (isDay: boolean) => ReactNode> = {
  clear: (isDay) => (isDay ? SUN : MOON),
  cloudy: () => (
    <>
      <path d="M6 16.5h8a3.1 3.1 0 0 0 .3-6.2 4.6 4.6 0 0 0-8.9-1.2A3.4 3.4 0 0 0 6 16.5Z" />
      <path d="M9 19.5h9.4a2.7 2.7 0 0 0 .2-5.4" />
    </>
  ),
  fog: () => (
    <>
      {CLOUD}
      <path d="M5 21h10M7 18.5h11" strokeOpacity=".7" />
    </>
  ),
  drizzle: () => (
    <>
      {CLOUD}
      <path d="M9 20.5v1M12.5 20.5v1.4M16 20.5v1" />
    </>
  ),
  rain: () => (
    <>
      {CLOUD}
      <path d="M8.6 20l-.8 2M12 20l-.8 2.2M15.4 20l-.8 2" />
    </>
  ),
  snow: () => (
    <>
      {CLOUD}
      <path d="M9 20.6v.1M12.5 20.4v.1M16 20.6v.1" strokeWidth="2.4" />
    </>
  ),
  thunder: () => (
    <>
      {CLOUD}
      <path d="M12.8 19l-2.4 3h2.6l-1.6 2.6" />
    </>
  ),
}

type WeatherIconProps = {
  code: number
  isDay: boolean
  size?: number
  label?: string
}

export function WeatherIcon({ code, isDay, size = 40, label }: WeatherIconProps) {
  const group = groupForCode(code)
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-icon-group={group}
      data-icon-day={isDay ? 'day' : 'night'}
      role="img"
      aria-label={label ?? group}
    >
      {GROUP_BODY[group](isDay)}
    </svg>
  )
}
