import { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import SearchBar from './SearchBar';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

const { FiBell, FiSearch } = FiIcons;

const Header = () => {
  const { t } = useLanguage();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">EMIRAFRIK</h1>
            <p className="text-xs text-gray-500">{t('header.tagline')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <LanguageSwitcher minimal={true} />
          
          <button 
            className="p-2 rounded-full bg-gray-100" 
            onClick={() => setIsSearchModalOpen(true)}
          >
            <SafeIcon icon={FiSearch} className="w-5 h-5 text-gray-600" />
          </button>
          
          <button className="p-2 rounded-full bg-gray-100 relative">
            <SafeIcon icon={FiBell} className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
      
      <Modal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)}>
        <SearchBar onClose={() => setIsSearchModalOpen(false)} />
      </Modal>
    </header>
  );
};

export default Header;