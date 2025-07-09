import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getSystemAnalytics } from '../../services/adminService';

const { FiBarChart3, FiUsers, FiActivity, FiTrendingUp } = FiIcons;

const SystemAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getSystemAnalytics(timeRange);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load system analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Failed to load analytics'}
        </div>
      </div>
    );
  }

  // Chart options
  const userGrowthOption = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: analytics.userGrowth.map(item => item.date)
    },
    yAxis: { type: 'value' },
    series: [{
      data: analytics.userGrowth.map(item => item.count),
      type: 'line',
      smooth: true,
      color: '#3B82F6'
    }]
  };

  const bookingStatusOption = {
    tooltip: { trigger: 'item' },
    series: [{
      name: 'Booking Status',
      type: 'pie',
      radius: ['50%', '70%'],
      data: analytics.bookingStatus,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">System Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{analytics.totalUsers}</p>
            </div>
            <SafeIcon icon={FiUsers} className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-green-900">{analytics.totalBookings}</p>
            </div>
            <SafeIcon icon={FiActivity} className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Active Providers</p>
              <p className="text-2xl font-bold text-purple-900">{analytics.activeProviders}</p>
            </div>
            <SafeIcon icon={FiIcons.FiUserCheck} className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Revenue</p>
              <p className="text-2xl font-bold text-orange-900">${analytics.revenue}</p>
            </div>
            <SafeIcon icon={FiTrendingUp} className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ReactECharts option={userGrowthOption} style={{ height: '300px' }} />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          <ReactECharts option={bookingStatusOption} style={{ height: '300px' }} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analytics.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <SafeIcon icon={FiActivity} className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                activity.type === 'user' ? 'bg-blue-100 text-blue-800' :
                activity.type === 'booking' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;