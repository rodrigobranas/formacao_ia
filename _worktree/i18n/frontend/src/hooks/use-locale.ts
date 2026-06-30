import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from '@/i18n/config'

export function useLocale(): {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  localeLabel: string
} {
  const { i18n, t } = useTranslation()
  const locale = isAppLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE

  const setLocale = useCallback(
    (nextLocale: AppLocale) => {
      void i18n.changeLanguage(nextLocale)
    },
    [i18n],
  )

  const localeLabel = useMemo(() => {
    return locale === 'pt-BR' ? t('locale.ptBR') : t('locale.en')
  }, [locale, t])

  return { locale, setLocale, localeLabel }
}
