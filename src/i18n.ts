/**
 * @fileoverview i18next setup. Strings load over HTTP from
 * `public/locales/<lng>/app.json` (single `app` namespace). Every `t()` call
 * also carries an English default, the fallback when a key is missing.
 */
import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SUPPORTED_LANGUAGES, isLanguageSupported } from './config/languages';

export { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, isLanguageSupported } from './config/languages';
export type { SupportedLanguage } from './config/languages';

/** Initial language: URL segment, then stored choice, then `en`. */
const detectLanguageFromPath = (): string => {
  if (typeof window === 'undefined') return 'en';
  const pathLang = window.location.pathname.split('/')[1];
  if (pathLang && isLanguageSupported(pathLang)) return pathLang;
  try {
    const stored = localStorage.getItem('language');
    if (stored && isLanguageSupported(stored)) return stored;
  } catch {
    // localStorage may throw in private browsing
  }
  return 'en';
};

let initialized = false;

/** Idempotent; called by di_web's initializeWebApp during boot. */
export function initializeI18n(): void {
  if (initialized) return;
  initialized = true;

  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: detectLanguageFromPath(),
      fallbackLng: 'en',
      initImmediate: false,
      supportedLngs: [...SUPPORTED_LANGUAGES],
      debug: false,
      interpolation: { escapeValue: false },
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      detection: {
        order: ['path', 'localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'language',
        lookupFromPathIndex: 0,
      },
      load: 'currentOnly',
      lowerCaseLng: true,
      nonExplicitSupportedLngs: false,
      defaultNS: 'app',
      ns: ['app', 'auth'],
    } as InitOptions);
}

export default i18n;
