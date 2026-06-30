import i18n from 'i18next'
import { DEFAULT_LOCALE, initI18n, LOCALE_STORAGE_KEY, syncDocumentLang } from './config'

describe('i18n config', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.lang = ''
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('uses pt-BR when localStorage has no saved locale', () => {
    const instance = initI18n()

    expect(instance.language).toBe(DEFAULT_LOCALE)
    expect(document.documentElement.lang).toBe(DEFAULT_LOCALE)
  })

  it('loads English when wx-locale is en', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en')

    const instance = initI18n()

    expect(instance.language).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('falls back to pt-BR when localStorage has an unsupported locale', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'fr')

    const instance = initI18n()

    expect(instance.language).toBe(DEFAULT_LOCALE)
    expect(document.documentElement.lang).toBe(DEFAULT_LOCALE)
  })

  it('persists wx-locale when language changes', async () => {
    const instance = initI18n()

    await instance.changeLanguage('en')

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
  })

  it('syncDocumentLang updates the html lang attribute', () => {
    syncDocumentLang('en')

    expect(document.documentElement.lang).toBe('en')
  })

  afterAll(() => {
    window.localStorage.clear()
    void i18n.changeLanguage(DEFAULT_LOCALE)
  })
})
