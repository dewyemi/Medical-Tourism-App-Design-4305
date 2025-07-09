import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiMapPin, FiHeart, FiUser, FiBarChart2 } = FiIcons;

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/destinations', icon: FiMapPin, label: 'Destinations' },
    { path: '/treatments', icon: FiHeart, label: 'Treatments' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
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