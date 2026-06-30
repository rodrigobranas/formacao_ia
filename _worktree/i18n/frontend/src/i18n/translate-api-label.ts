import i18n from 'i18next'

type Translate = (key: string, options?: { defaultValue: string }) => string

export function translateApiLabel(label: string, translate: Translate = i18n.t.bind(i18n)): string {
  return translate(`apiLabels.${label}`, { defaultValue: label })
}
