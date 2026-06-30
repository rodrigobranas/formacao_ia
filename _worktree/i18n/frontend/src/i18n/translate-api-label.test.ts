import { translateApiLabel } from './translate-api-label'
import { initI18n, resources } from './config'
import i18n from 'i18next'
import { toAirQualityCategory, toCondition, toUvCategory } from '../../../backend/src/services/weather-codes'

const WMO_CODES = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]
const UV_VALUES = [0, 3, 6, 8, 11]
const AQI_VALUES = [10, 30, 50, 70, 90, 110]

function apiKey(label: string) {
  return `apiLabels.${label}`
}

describe('translateApiLabel', () => {
  it('translates known backend labels with the active locale', async () => {
    initI18n()
    await i18n.changeLanguage('en')

    expect(translateApiLabel('Céu limpo')).toBe('Clear sky')
  })

  it('returns an unknown API label unchanged', async () => {
    await i18n.changeLanguage('pt-BR')

    expect(translateApiLabel('Céu limpo')).toBe('Céu limpo')
    expect(translateApiLabel('label-desconhecido')).toBe('label-desconhecido')
  })

  it('keeps locale apiLabels in sync with backend-emitted PT labels', () => {
    const labels = new Set<string>()

    WMO_CODES.forEach((code) => labels.add(toCondition(code).label))
    labels.add(toCondition(-1).label)
    UV_VALUES.forEach((value) => {
      const category = toUvCategory(value)
      if (category) labels.add(category.label)
    })
    AQI_VALUES.forEach((value) => {
      const category = toAirQualityCategory(value)
      if (category) {
        labels.add(category.label)
        labels.add(category.description)
      }
    })
    labels.add('Localização atual')

    for (const label of labels) {
      expect(resources['pt-BR'].translation).toHaveProperty(apiKey(label))
      expect(resources.en.translation).toHaveProperty(apiKey(label))
    }
  })
})
