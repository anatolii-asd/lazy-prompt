import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from './locales/en.json';
import ukTranslations from './locales/uk.json';

export type Language = 'en' | 'uk';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translations = {
  en: enTranslations,
  uk: ukTranslations,
};

// Helper function to get nested translation value
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key];
    }
    return undefined;
  }, obj);
}

// Helper function to get saved language from localStorage
function getSavedLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'uk') {
      return saved;
    }
  }
  return 'en'; // Default to English
}

// Helper function to save language to localStorage
function saveLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = getSavedLanguage();
    setLanguageState(savedLanguage);
    setIsLoading(false);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const t = (key: string, defaultValue?: string): string => {
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
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

export default TranslationProvider;