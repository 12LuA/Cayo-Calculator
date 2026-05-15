'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Locale } from '@/lib/i18n'
import { DEFAULT_LOCALE, LOCALES, loadTranslations, t } from '@/lib/i18n'


interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    // Load translations and initialize locale from storage or browser settings.
    loadTranslations().then(() => {
      if (!isMounted) return

      const savedLocale = localStorage.getItem('locale') as Locale | null
      const browserLocale = navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'

      let initialLocale: Locale = DEFAULT_LOCALE

      if (savedLocale && LOCALES.includes(savedLocale)) {
        initialLocale = savedLocale
      } else if (LOCALES.includes(browserLocale)) {
        initialLocale = browserLocale
      }

      setLocaleState(initialLocale)
      setIsReady(true)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const translate = (key: string): string => {
    if (!isReady) {
      return key
    }
    return t(key, locale)
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
