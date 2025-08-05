import { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

const { FiGlobe, FiCheck } = FiIcons;

const LanguageSwitcher = ({ className, minimal = false }) => {
  const { language, changeLanguage, supportedLanguages, direction } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };
  
  // Find current language details
  const currentLanguage = supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];
  
  if (minimal) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={toggleDropdown}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label="Change language"
        >
          <SafeIcon icon={FiGlobe} className="w-5 h-5 text-gray-600" />
        </button>
        
        {isOpen && (
          <div 
            className={`absolute top-full mt-1 ${direction === 'rtl' ? 'right-0' : 'left-0'} bg-white rounded-lg shadow-lg py-1 z-50 min-w-[160px] border border-gray-200`}
          >
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{lang.nativeName}</span>
                {lang.code === language && (
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none"
      >
        <SafeIcon icon={FiGlobe} className="w-5 h-5 text-gray-600" />
        <span className="font-medium">{currentLanguage.nativeName}</span>
      </button>
      
      {isOpen && (
        <div 
          className={`absolute top-full mt-1 ${direction === 'rtl' ? 'right-0' : 'left-0'} bg-white rounded-lg shadow-lg py-1 z-50 min-w-[160px] border border-gray-200`}
        >
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
            >
              <span>{lang.nativeName}</span>
              {lang.code === language && (
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;