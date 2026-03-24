'use client'

import { useLanguage } from '@/components/language-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <Select value={locale} onValueChange={setLocale}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t('language.english')}</SelectItem>
        <SelectItem value="de">{t('language.german')}</SelectItem>
      </SelectContent>
    </Select>
  )
}
