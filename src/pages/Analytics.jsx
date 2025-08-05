import { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../components/AuthProvider';
import UserMetricsCard from '../components/analytics/UserMetricsCard';
import PlatformMetricsCard from '../components/analytics/PlatformMetricsCard';

const { FiBarChart2, FiUsers, FiMap, FiActivity } = FiIcons;

const Analytics = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('user');

  if (!user) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-center">
          <SafeIcon icon={FiIcons.FiLock} className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please sign in to view analytics</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'user', label: 'Your Journey', icon: FiUsers },
    { id: 'platform', label: 'Platform', icon: FiBarChart2 },
    { id: 'destinations', label: 'Destinations', icon: FiMap },
    { id: 'treatments', label: 'Treatments', icon: FiActivity }
  ];

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics</h2>
      
      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
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
      
      {/* Content */}
      <div>
        {activeTab === 'user' && (
          <UserMetricsCard />
        )}
        
        {activeTab === 'platform' && (
          <PlatformMetricsCard />
        )}
        
        {activeTab === 'destinations' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-8">
              <SafeIcon icon={FiMap} className="w-12 h-12 mx-auto text-primary-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Destination Analytics</h3>
              <p className="text-gray-600 mb-6">
                View detailed analytics for each destination by visiting the destination details page.
              </p>
              <button 
                onClick={() => window.location.href = '/destinations'}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium"
              >
                Browse Destinations
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'treatments' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-8">
              <SafeIcon icon={FiActivity} className="w-12 h-12 mx-auto text-primary-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Treatment Analytics</h3>
              <p className="text-gray-600 mb-6">
                View detailed analytics for each treatment by visiting the treatment details page.
              </p>
              <button 
                onClick={() => window.location.href = '/treatments'}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium"
              >
                Browse Treatments
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;