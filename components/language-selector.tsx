'use client'

import { useLanguage } from '@/components/language-context'
import "flag-icons/css/flag-icons.min.css";
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
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <span className="fi fi-us rounded-xs" />
          {t('language.english')}
        </SelectItem>
        <SelectItem value="de">
          <span className="fi fi-de rounded-xs" />
          {t('language.german')}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
