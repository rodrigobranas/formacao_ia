import type { AppLocale } from '@/i18n/config'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from 'react-i18next'

const LOCALE_OPTIONS: Array<{ locale: AppLocale; flag: string; labelKey: string }> = [
  { locale: 'pt-BR', flag: '🇧🇷', labelKey: 'locale.ptBR' },
  { locale: 'en', flag: '🇺🇸', labelKey: 'locale.en' },
]

export function LocaleSwitcher() {
  const { locale, setLocale, localeLabel } = useLocale()
  const { t } = useTranslation()

  return (
    <div className="wx-locale-switcher" role="group" aria-label={t('locale.switcherLabel')}>
      {LOCALE_OPTIONS.map((option) => {
        const isActive = locale === option.locale
        const label = t(option.labelKey)

        return (
          <button
            key={option.locale}
            type="button"
            className="wx-locale-option"
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            onClick={() => setLocale(option.locale)}
          >
            <span aria-hidden="true">{option.flag}</span>
          </button>
        )
      })}
      <span className="sr-only">{t('locale.current', { locale: localeLabel })}</span>
    </div>
  )
}
