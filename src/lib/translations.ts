import { Language } from '../contexts/AuthContext';
import enTranslations from '../i18n/locales/en.json';
import ukTranslations from '../i18n/locales/uk.json';

const translations = {
  en: enTranslations,
  uk: ukTranslations,
};

// Helper function to get nested translation value
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key];
    }
    return undefined;
  }, obj);
}

export function translate(language: Language, key: string, defaultValue?: string): any {
  const translation = getNestedValue(translations[language], key);
  if (translation !== undefined) {
    return translation;
  }
  
  // Fallback to English if not found in current language
  if (language !== 'en') {
    const fallback = getNestedValue(translations.en, key);
    if (fallback !== undefined) {
      return fallback;
    }
  }
  
  // Return default value or key if no translation found
  return defaultValue || key;
}

export default translate;