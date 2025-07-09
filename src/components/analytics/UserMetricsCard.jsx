import React, { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getUserMetrics } from '../../services/analyticsService';
import { formatCurrency } from '../../utils/dataUtils';

const { FiTrendingUp, FiCalendar, FiMapPin, FiDollarSign } = FiIcons;

const UserMetricsCard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await getUserMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to load metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="text-center py-4">
          <SafeIcon icon={FiIcons.FiAlertTriangle} className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
          <p className="text-gray-500">Unable to load your metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Your Health Journey</h3>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-xl">
            <div className="flex items-center mb-2">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">Bookings</span>
            </div>
            <p className="text-blue-900 text-lg font-bold">{metrics.total_bookings}</p>
            <p className="text-xs text-blue-700">
              {metrics.completed_bookings} completed
              {metrics.cancelled_bookings > 0 && `, ${metrics.cancelled_bookings} cancelled`}
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-xl">
            <div className="flex items-center mb-2">
              <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Savings</span>
            </div>
            <p className="text-green-900 text-lg font-bold">
              {formatCurrency(metrics.savings_amount || 0)}
            </p>
            <p className="text-xs text-green-700">
              {metrics.total_spent > 0 ? `Spent ${formatCurrency(metrics.total_spent)}` : 'No payments yet'}
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded-xl">
            <div className="flex items-center mb-2">
              <SafeIcon icon={FiMapPin} className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-purple-800 font-medium">Countries</span>
            </div>
            <p className="text-purple-900 text-lg font-bold">
              {metrics.countries_visited}
            </p>
            <p className="text-xs text-purple-700">
              {metrics.countries_visited === 0 ? 'Start your journey' : 'Countries visited'}
            </p>
          </div>

          <div className="bg-orange-50 p-3 rounded-xl">
            <div className="flex items-center mb-2">
              <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-orange-800 font-medium">Activity</span>
            </div>
            {metrics.last_booking_date ? (
              <>
                <p className="text-orange-900 text-sm font-bold">Last booking</p>
                <p className="text-xs text-orange-700">
                  {new Date(metrics.last_booking_date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-orange-900 text-sm">No bookings yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMetricsCard;