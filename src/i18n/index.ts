import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import ja from './locales/ja';

const resources = {
  en: { translation: en },
  ja: { translation: ja },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      // Read lang from <html lang="..."> set by the server, then fall back to navigator
      order: ['htmlTag', 'navigator'],
      caches: [],
    },
    interpolation: {
      escapeValue: false,
    },
    initImmediate: false,
  });

export default i18n;
