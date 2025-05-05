import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import swTranslation from './locales/sw/translation.json';
import frTranslation from './locales/fr/translation.json';
import arTranslation from './locales/ar/translation.json';
import nyTranslation from './locales/ny/translation.json';

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      sw: {
        translation: swTranslation,
      },
      fr: {
        translation: frTranslation,
      },
      ar: {
        translation: arTranslation,
      },
      ny: {
        translation: nyTranslation,
      },
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;