
/**
 * @fileOverview Custom hook for accessing language state and translation functions.
 * 
 * This hook provides a convenient way for components to access the language
 * context including the current language, language setter, and translation
 * function. It includes built-in error handling to ensure proper usage.
 * 
 * Usage: const { language, setLanguage, t } = useLanguage();
 */

"use client"; // Required for React hooks in client components

// Import React's useContext hook for accessing context
import { useContext } from 'react';
// Import the LanguageContext to access language state and translation
import { LanguageContext } from '@/context/LanguageContext';

/**
 * Custom hook for accessing language state and translation functionality
 * 
 * This hook provides a safe way to access the language context with built-in
 * error handling. It ensures that components using this hook are properly
 * wrapped with a LanguageProvider.
 * 
 * @returns {LanguageContextType} Object containing:
 *   - language: Current active language code (Language)
 *   - setLanguage: Function to change the current language
 *   - t: Translation function for getting localized strings
 * 
 * @throws {Error} If used outside of a LanguageProvider component
 * 
 * @example
 * function MyComponent() {
 *   const { language, setLanguage, t } = useLanguage();
 *   
 *   return (
 *     <div>
 *       <h1>{t('page.title')}</h1>
 *       <button onClick={() => setLanguage('en')}>
 *         {t('buttons.english')}
 *       </button>
 *       <p>Current language: {language}</p>
 *     </div>
 *   );
 * }
 */
export function useLanguage() {
  // Access the language context
  const context = useContext(LanguageContext);
  
  // Ensure the hook is used within a LanguageProvider
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  // Return the language state and translation function
  return context;
}
