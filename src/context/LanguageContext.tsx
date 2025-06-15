
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useEffect, useState } from 'react';
import { DEFAULT_LANGUAGE, translations, getTranslation } from '@/lib/translations';
import type { Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('appLanguage') as Language | null;
      return storedLang && translations[storedLang] ? storedLang : DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLanguage', language);
      // Optionally, set lang attribute on html tag for CSS selectors or accessibility
      document.documentElement.lang = language.startsWith('en') ? 'en' : (language === 'zh-CN' ? 'zh-CN' : 'zh-TW');
    }
  }, [language]);

  const t = (key: string): string => {
    return getTranslation(language, key, translations);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
