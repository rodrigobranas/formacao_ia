import type { WeatherCondition } from '../types/weather-condition';
import type { WeatherGroup } from '../types/weather-group';

type ConditionInfo = { label: string; group: WeatherGroup };
type Threshold<T> = { limit: number; value: T };

const CONDITIONS: Record<number, ConditionInfo> = {
  0: { label: 'Céu limpo', group: 'clear' },
  1: { label: 'Predominantemente limpo', group: 'clear' },
  2: { label: 'Parcialmente nublado', group: 'cloudy' },
  3: { label: 'Nublado', group: 'cloudy' },
  45: { label: 'Nevoeiro', group: 'fog' },
  48: { label: 'Nevoeiro com geada', group: 'fog' },
  51: { label: 'Garoa leve', group: 'drizzle' },
  53: { label: 'Garoa moderada', group: 'drizzle' },
  55: { label: 'Garoa intensa', group: 'drizzle' },
  56: { label: 'Garoa congelante leve', group: 'drizzle' },
  57: { label: 'Garoa congelante intensa', group: 'drizzle' },
  61: { label: 'Chuva fraca', group: 'rain' },
  63: { label: 'Chuva moderada', group: 'rain' },
  65: { label: 'Chuva forte', group: 'rain' },
  66: { label: 'Chuva congelante fraca', group: 'rain' },
  67: { label: 'Chuva congelante forte', group: 'rain' },
  71: { label: 'Neve fraca', group: 'snow' },
  73: { label: 'Neve moderada', group: 'snow' },
  75: { label: 'Neve forte', group: 'snow' },
  77: { label: 'Grãos de neve', group: 'snow' },
  80: { label: 'Pancadas de chuva fracas', group: 'rain' },
  81: { label: 'Pancadas de chuva moderadas', group: 'rain' },
  82: { label: 'Pancadas de chuva violentas', group: 'rain' },
  85: { label: 'Pancadas de neve fracas', group: 'snow' },
  86: { label: 'Pancadas de neve fortes', group: 'snow' },
  95: { label: 'Tempestade', group: 'thunder' },
  96: { label: 'Tempestade com granizo leve', group: 'thunder' },
  99: { label: 'Tempestade com granizo forte', group: 'thunder' },
};

const FALLBACK_CONDITION: ConditionInfo = { label: 'Tempo', group: 'cloudy' };

const UV_THRESHOLDS: Threshold<string>[] = [
  { limit: 3, value: 'Baixo' },
  { limit: 6, value: 'Moderado' },
  { limit: 8, value: 'Alto' },
  { limit: 11, value: 'Muito alto' },
];

const AIR_QUALITY_THRESHOLDS: Threshold<{ label: string; description: string }>[] = [
  { limit: 20, value: { label: 'Boa', description: 'Qualidade do ar excelente, sem riscos à saúde.' } },
  { limit: 40, value: { label: 'Razoável', description: 'Qualidade do ar aceitável para a maioria das pessoas.' } },
  { limit: 60, value: { label: 'Moderada', description: 'Grupos sensíveis podem sentir efeitos leves.' } },
  { limit: 80, value: { label: 'Ruim', description: 'Efeitos à saúde possíveis para grupos sensíveis.' } },
  { limit: 100, value: { label: 'Muito ruim', description: 'Efeitos à saúde para a população em geral.' } },
];

const AIR_QUALITY_WORST = {
  label: 'Péssima',
  description: 'Alerta de saúde: todos podem sofrer efeitos graves.',
};

export function toCondition(code: number): WeatherCondition {
  const info = CONDITIONS[code] ?? FALLBACK_CONDITION;
  return { code, label: info.label, group: info.group };
}

export function toUvCategory(uvIndex: number | null): { label: string } | null {
  if (uvIndex === null) {
    return null;
  }
  const match = UV_THRESHOLDS.find((threshold) => uvIndex < threshold.limit);
  return { label: match ? match.value : 'Extremo' };
}

export function toAirQualityCategory(
  europeanAqi: number | null,
): { label: string; description: string } | null {
  if (europeanAqi === null) {
    return null;
  }
  const match = AIR_QUALITY_THRESHOLDS.find((threshold) => europeanAqi <= threshold.limit);
  return match ? match.value : AIR_QUALITY_WORST;
}
