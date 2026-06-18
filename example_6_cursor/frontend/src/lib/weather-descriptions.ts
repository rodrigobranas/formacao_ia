export const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Poucas nuvens',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com gelo',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve forte',
  80: 'Pancadas fracas',
  81: 'Pancadas moderadas',
  82: 'Pancadas fortes',
  95: 'Tempestade',
  96: 'Tempestade com granizo',
  99: 'Tempestade severa',
};

export function getWeatherDescription(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? 'Condição atual';
}
