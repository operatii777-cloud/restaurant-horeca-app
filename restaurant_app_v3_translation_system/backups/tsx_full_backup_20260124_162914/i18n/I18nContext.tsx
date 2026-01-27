import { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from './translations';

type Language = 'ro' | 'en';
type TranslationKey = string;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or default to 'ro'
    const saved = localStorage.getItem('adminLanguage');
    return (saved === 'en' || saved === 'ro') ? saved : 'ro';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('adminLanguage', lang);
  };

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`[I18N] Missing translation key: ${key}`);
        return key; // Return key for missing translations - developers should fix dependencies
      }
    }

    return typeof value === 'string' ? value : key; // Return key for non-string values
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};

