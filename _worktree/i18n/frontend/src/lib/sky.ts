import type { WeatherGroup } from '@/types/weather-group'
import { groupForCode } from './weather-code'

export type SkyGradient = {
  from: string
  via: string
  to: string
  glow: string
}

const DAY_SKY: Record<WeatherGroup, SkyGradient> = {
  clear: { from: '#3b82d9', via: '#1f5fae', to: '#0d2f5c', glow: 'rgba(126,196,255,.35)' },
  cloudy: { from: '#566576', via: '#3a4656', to: '#1b2430', glow: 'rgba(150,170,190,.18)' },
  fog: { from: '#6a727c', via: '#4a525c', to: '#272d35', glow: 'rgba(170,180,190,.16)' },
  drizzle: { from: '#46586c', via: '#2f3e50', to: '#171f2b', glow: 'rgba(120,160,200,.2)' },
  rain: { from: '#3c4b5c', via: '#293647', to: '#141b25', glow: 'rgba(110,150,195,.22)' },
  snow: { from: '#5b6c7e', via: '#3f4f61', to: '#222d3a', glow: 'rgba(190,205,220,.2)' },
  thunder: { from: '#3a3550', via: '#262138', to: '#13111f', glow: 'rgba(150,120,210,.26)' },
}

const NIGHT_SKY: Record<WeatherGroup, SkyGradient> = {
  clear: { from: '#1c3056', via: '#11203f', to: '#080e1c', glow: 'rgba(94,150,255,.22)' },
  cloudy: { from: '#2a3340', via: '#1a212c', to: '#0c1018', glow: 'rgba(120,140,170,.13)' },
  fog: { from: '#333a44', via: '#222932', to: '#10141a', glow: 'rgba(140,150,165,.12)' },
  drizzle: { from: '#27323f', via: '#1a232f', to: '#0c1019', glow: 'rgba(90,130,180,.16)' },
  rain: { from: '#252f3c', via: '#19222e', to: '#0b0f17', glow: 'rgba(90,130,180,.18)' },
  snow: { from: '#313c49', via: '#222b36', to: '#10151d', glow: 'rgba(170,190,210,.16)' },
  thunder: { from: '#2b2640', via: '#1b1830', to: '#0e0c18', glow: 'rgba(140,110,200,.22)' },
}

export function skyForGroup(group: WeatherGroup, isDay: boolean): SkyGradient {
  return isDay ? DAY_SKY[group] : NIGHT_SKY[group]
}

export function skyForCode(code: number, isDay: boolean): SkyGradient {
  return skyForGroup(groupForCode(code), isDay)
}
