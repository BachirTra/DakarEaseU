import { useCallback } from 'react';
import { usePreferencesStore } from '@/features/profile/store/preferencesStore';
import { t as translate, type Locale } from '@/lib/i18n';

export function useTranslation() {
  const locale = usePreferencesStore((s) => s.locale);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) =>
      translate(path, vars, locale as Locale),
    [locale],
  );

  return { t, locale };
}
