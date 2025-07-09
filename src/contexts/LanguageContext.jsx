import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

// Create language context
const LanguageContext = createContext();

// Translation data object (to be populated dynamically)
const translations = {
  en: {},
  fr: {},
  ar: {}
};

// Helper function to load translations
const loadTranslations = async (lang) => {
  try {
    const { data, error } = await supabase
      .from('translations_emirafrik')
      .select('key, value')
      .eq('language_code', lang);
    
    if (error) throw error;
    
    // Convert array to object format
    const translationObj = {};
    data.forEach(item => {
      translationObj[item.key] = item.value;
    });
    
    translations[lang] = translationObj;
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [direction, setDirection] = useState('ltr');
  const [loading, setLoading] = useState(true);
  
  // Initialize language from user preference or browser
  useEffect(() => {
    const initializeLanguage = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user has a language preference
          const { data, error } = await supabase
            .from('user_language_preferences')
            .select('language_code')
            .eq('user_id', user.id)
            .single();
          
          if (!error && data) {
            // If user has a preference, use it
            setLanguage(data.language_code);
            
            // Get language direction
            const { data: langData, error: langError } = await supabase
              .from('languages_emirafrik')
              .select('direction')
              .eq('code', data.language_code)
              .single();
            
            if (!langError && langData) {
              setDirection(langData.direction);
            }
          } else {
            // If no preference, use browser language or default to English
            const browserLang = navigator.language.split('-')[0];
            const supportedLang = ['en', 'fr', 'ar'].includes(browserLang) ? browserLang : 'en';
            setLanguage(supportedLang);
            setDirection(supportedLang === 'ar' ? 'rtl' : 'ltr');
          }
        } else {
          // No user, use browser language or default to English
          const browserLang = navigator.language.split('-')[0];
          const supportedLang = ['en', 'fr', 'ar'].includes(browserLang) ? browserLang : 'en';
          setLanguage(supportedLang);
          setDirection(supportedLang === 'ar' ? 'rtl' : 'ltr');
        }
        
        // Load translations
        await Promise.all(['en', 'fr', 'ar'].map(lang => loadTranslations(lang)));
        
      } catch (error) {
        console.error('Error initializing language:', error);
        setLanguage('en');
        setDirection('ltr');
      } finally {
        setLoading(false);
      }
    };
    
    initializeLanguage();
  }, []);
  
  // Save user language preference
  const saveUserLanguagePreference = async (lang) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('user_language_preferences')
          .upsert({ 
            user_id: user.id, 
            language_code: lang,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };
  
  // Change language
  const changeLanguage = async (lang) => {
    try {
      if (!['en', 'fr', 'ar'].includes(lang)) {
        throw new Error('Unsupported language');
      }
      
      // Get language direction
      const { data, error } = await supabase
        .from('languages_emirafrik')
        .select('direction')
        .eq('code', lang)
        .single();
      
      if (error) throw error;
      
      setLanguage(lang);
      setDirection(data.direction);
      
      // Save user preference
      await saveUserLanguagePreference(lang);
      
      // Update document direction
      document.documentElement.dir = data.direction;
      document.documentElement.lang = lang;
      
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };
  
  // Translation function
  const t = (key, params = {}) => {
    // Get translation from loaded translations
    const translation = translations[language][key] || translations['en'][key] || key;
    
    // Replace parameters
    return translation.replace(/\{\{(\w+)\}\}/g, (_, param) => params[param] || '');
  };
  
  const value = {
    language,
    direction,
    changeLanguage,
    t,
    loading,
    supportedLanguages: [
      { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
      { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' }
    ]
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;