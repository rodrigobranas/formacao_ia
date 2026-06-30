import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { createInstance, type i18n as I18nInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { DEFAULT_LOCALE, type AppLocale, resources } from './config'

type RenderWithI18nOptions = Omit<RenderOptions, 'wrapper'> & {
  locale?: AppLocale
}

export function createTestI18n(locale: AppLocale = DEFAULT_LOCALE): I18nInstance {
  const instance = createInstance()

  void instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    initAsync: false,
    returnNull: false,
  })

  return instance
}

export function renderWithI18n(ui: ReactElement, { locale = DEFAULT_LOCALE, ...options }: RenderWithI18nOptions = {}) {
  const i18n = createTestI18n(locale)

  function Wrapper({ children }: { children: ReactNode }) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  }

  return {
    i18n,
    ...render(ui, { wrapper: Wrapper, ...options }),
  }
}
