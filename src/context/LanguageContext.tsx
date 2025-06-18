
/**
 * @fileOverview Language Context Provider for internationalization support.
 * 
 * This context manages the application's language state and provides translation
 * functionality throughout the Red Mansion platform. It supports:
 * - Traditional Chinese (zh-TW) - Primary language for classical literature
 * - Simplified Chinese (zh-CN) - Alternative Chinese variant
 * - English (en) - International users and accessibility
 * 
 * Features:
 * - Persistent language selection via localStorage
 * - Automatic browser language detection on first visit
 * - Real-time language switching without page reload
 * - Translation function (t) for accessing localized strings
 * - HTML lang attribute synchronization for accessibility
 */

"use client"; // Required for browser APIs (localStorage, document)

// Import React types and hooks for state management
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useEffect, useState } from 'react';
// Import translation system and language definitions
import { DEFAULT_LANGUAGE, translations, getTranslation } from '@/lib/translations';
import type { Language } from '@/lib/translations';

/**
 * Type definition for the language context value
 * 
 * Defines the interface that components can access when using this context
 */
interface LanguageContextType {
  language: Language; // Current active language code
  setLanguage: Dispatch<SetStateAction<Language>>; // Function to change language
  t: (key: string) => string; // Translation function for getting localized strings
}

/**
 * Language Context
 * 
 * Provides language state and translation functionality to the entire application.
 * Undefined default ensures proper error handling when used outside provider.
 */
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Props for the LanguageProvider component
 */
interface LanguageProviderProps {
  children: ReactNode; // Child components that will receive language context
}

/**
 * Language Provider Component
 * 
 * This component wraps the application and provides language/translation
 * functionality to all child components. It handles:
 * - Language state management with localStorage persistence
 * - Browser detection and automatic language selection
 * - HTML lang attribute updates for accessibility compliance
 * - Translation function provision to all components
 * 
 * @param children - Child components that will receive the language context
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  /**
   * Language state with intelligent initialization
   * 
   * Initializes language from localStorage if available, otherwise falls back
   * to DEFAULT_LANGUAGE. Uses a function initializer to prevent SSR issues.
   */
  const [language, setLanguage] = useState<Language>(() => {
    // Check if we're in the browser (not during SSR)
    if (typeof window !== 'undefined') {
      // Try to get previously stored language preference
      const storedLang = localStorage.getItem('appLanguage') as Language | null;
      // Return stored language if valid, otherwise use default
      return storedLang && translations[storedLang] ? storedLang : DEFAULT_LANGUAGE;
    }
    // During SSR, use default language
    return DEFAULT_LANGUAGE;
  });

  /**
   * Effect to persist language changes and update document attributes
   * 
   * This effect runs whenever the language changes and:
   * - Saves the new language to localStorage for persistence
   * - Updates the HTML document's lang attribute for accessibility
   * - Ensures proper language detection by screen readers and browsers
   */
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // Persist language selection to localStorage
      localStorage.setItem('appLanguage', language);
      
      // Update HTML lang attribute for accessibility and SEO
      // Maps our language codes to standard HTML lang values
      document.documentElement.lang = language.startsWith('en') 
        ? 'en' // English
        : (language === 'zh-CN' ? 'zh-CN' : 'zh-TW'); // Chinese variants
    }
  }, [language]); // Re-run when language changes

  /**
   * Translation function
   * 
   * Provides a convenient way for components to access translated strings.
   * Uses the current language state and the global translations object.
   * 
   * @param key - Translation key to look up (e.g., 'page.title')
   * @returns Translated string in the current language
   */
  const t = (key: string): string => {
    return getTranslation(language, key, translations);
  };

  /**
   * Provider component that makes language state and translation function
   * available to all child components through React Context.
   */
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
