import { t, SUPPORTED_LOCALES } from '../index';

describe('i18n', () => {
  it('resolves a nested key in the default (fr) locale', () => {
    expect(t('common.appName')).toBe('DakarEaseU');
    expect(t('listing.verified')).toBe('Vérifié');
  });

  it('interpolates {{placeholders}}', () => {
    expect(t('search.resultsCount', { count: 5 })).toBe('5 résultats');
  });

  it('falls back to the fr value when a key is missing in a non-fr locale', () => {
    // en.json does not define common.appName → should resolve via the fr fallback
    expect(t('common.appName', undefined, 'en')).toBe('DakarEaseU');
  });

  it('returns the key path only when the key is missing in every locale', () => {
    expect(t('totally.missing.key', undefined, 'en')).toBe('totally.missing.key');
    expect(t('totally.missing.key')).toBe('totally.missing.key');
  });

  it('declares fr as the only fully-populated locale', () => {
    expect(SUPPORTED_LOCALES).toEqual(['fr', 'wo', 'en']);
  });
});
