import { t, SUPPORTED_LOCALES } from '../index';

describe('i18n', () => {
  it('resolves a nested key in the default (fr) locale', () => {
    expect(t('common.appName')).toBe('DakarEaseU');
    expect(t('listing.verified')).toBe('Vérifié');
  });

  it('interpolates {{placeholders}}', () => {
    expect(t('search.resultsCount', { count: 5 })).toBe('5 résultats');
  });

  it('falls back to the key path when missing in a non-fr locale', () => {
    expect(t('common.appName', undefined, 'en')).toBe('common.appName');
  });

  it('declares fr as the only fully-populated locale', () => {
    expect(SUPPORTED_LOCALES).toEqual(['fr', 'wo', 'en']);
  });
});
