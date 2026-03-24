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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load translations and get saved locale from localStorage
    loadTranslations().then(() => {
      const savedLocale = localStorage.getItem('locale') as Locale | null
      if (savedLocale && LOCALES.includes(savedLocale)) {
        setLocaleState(savedLocale)
      }
      setMounted(true)
    })
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const translate = (key: string): string => {
    return t(key, locale)
  }

  if (!mounted) {
    return <>{children}</>
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
