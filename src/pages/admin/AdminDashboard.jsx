import { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import UserManagement from '../../components/admin/UserManagement';
import RoleManagement from '../../components/admin/RoleManagement';
import SystemAnalytics from '../../components/admin/SystemAnalytics';
import ProviderOnboarding from '../../components/admin/ProviderOnboarding';

const { FiUsers, FiShield, FiBarChart3, FiUserPlus } = FiIcons;

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <SafeIcon icon={FiIcons.FiLock} className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'roles', label: 'Roles & Permissions', icon: FiShield },
    { id: 'providers', label: 'Healthcare Providers', icon: FiUserPlus },
    { id: 'analytics', label: 'System Analytics', icon: FiBarChart3 }
  ];

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, roles, and system settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'roles' && <RoleManagement />}
        {activeTab === 'providers' && <ProviderOnboarding />}
        {activeTab === 'analytics' && <SystemAnalytics />}
      </div>
    </div>
  );
};

export default AdminDashboard;