export type AirQuality = {
  european_aqi: number
  category: {
    label: string
    description: string
  }
  pollutants: {
    pm2_5: number | null
    pm10: number | null
    ozone: number | null
    nitrogen_dioxide: number | null
  }
  units: {
    pm2_5: string
    pm10: string
    ozone: string
    nitrogen_dioxide: string
  }
}
