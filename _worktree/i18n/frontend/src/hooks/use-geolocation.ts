import { useCallback, useState } from 'react'
import type { Coordinates } from '@/types/coordinates'
import type { GeolocationStatus } from '@/types/geolocation-status'

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8000,
  maximumAge: 600000,
}

function roundCoordinates(coords: GeolocationCoordinates): Coordinates {
  return {
    latitude: Number(coords.latitude.toFixed(4)),
    longitude: Number(coords.longitude.toFixed(4)),
  }
}

export function useGeolocation(onGranted: (coordinates: Coordinates) => void) {
  const [status, setStatus] = useState<GeolocationStatus>('idle')

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported')
      return
    }
    setStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('granted')
        onGranted(roundCoordinates(position.coords))
      },
      () => setStatus('denied'),
      GEO_OPTIONS,
    )
  }, [onGranted])

  return { status, requestLocation }
}
