import { useLocation, useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

const { FiHome, FiMapPin, FiHeart, FiUser, FiBarChart2, FiDollarSign } = FiIcons;

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const navItems = [
    { path: '/', icon: FiHome, label: t('navigation.home') },
    { path: '/destinations', icon: FiMapPin, label: t('navigation.destinations') },
    { path: '/treatments', icon: FiHeart, label: t('navigation.treatments') },
    { path: '/payments', icon: FiDollarSign, label: t('navigation.payments') },
    { path: '/analytics', icon: FiBarChart2, label: t('navigation.analytics') },
    { path: '/profile', icon: FiUser, label: t('navigation.profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500'
              }`}
            >
              <SafeIcon icon={item.icon} className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;