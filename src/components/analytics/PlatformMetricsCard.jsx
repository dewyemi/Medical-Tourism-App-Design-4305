import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getPlatformMetrics } from '../../services/analyticsService';

const { FiUsers, FiCalendar, FiStar } = FiIcons;

const PlatformMetricsCard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await getPlatformMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to load platform metrics');
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
        <div className="h-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <SafeIcon icon={FiIcons.FiAlertTriangle} className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Metrics Unavailable</h3>
          <p className="text-gray-600">
            We're unable to load platform metrics at the moment.
          </p>
        </div>
      </div>
    );
  }

  // Prepare monthly trend chart
  const monthlyTrends = metrics.monthly_trends || [];
  const trendOption = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: monthlyTrends.map(item => item.month.substring(5)), // Show only MM part
      axisLabel: {
        interval: 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Bookings',
        data: monthlyTrends.map(item => item.count),
        type: 'line',
        smooth: true,
        color: '#3B82F6',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(59, 130, 246, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(59, 130, 246, 0.1)'
              }
            ]
          }
        }
      }
    ]
  };

  // Booking status chart
  const bookingStats = metrics.booking_stats || { total: 0, completed: 0, pending: 0, cancelled: 0 };
  const bookingStatusData = [
    { name: 'Completed', value: bookingStats.completed },
    { name: 'Pending', value: bookingStats.pending },
    { name: 'Cancelled', value: bookingStats.cancelled }
  ].filter(item => item.value > 0);

  const bookingOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: bookingStatusData.map(item => item.name)
    },
    series: [
      {
        name: 'Booking Status',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: bookingStatusData.map(item => ({
          value: item.value,
          name: item.name
        })),
        color: ['#10B981', '#F59E0B', '#EF4444']
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Platform Overview</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-primary-600">{metrics.user_count}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{bookingStats.total}</p>
              <p className="text-xs text-gray-500">Total Bookings</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <SafeIcon icon={FiStar} className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {metrics.avg_platform_rating ? metrics.avg_platform_rating.toFixed(1) : '-'}
              </p>
              <p className="text-xs text-gray-500">Avg. Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Booking Trends</h3>
          </div>
          <div className="p-4 h-64">
            {monthlyTrends.length > 0 ? (
              <ReactECharts option={trendOption} style={{ height: '100%' }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No trend data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Booking Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Booking Status</h3>
          </div>
          <div className="p-4 h-64">
            {bookingStats.total > 0 ? (
              <ReactECharts option={bookingOption} style={{ height: '100%' }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No booking data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Destinations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Top Destinations</h3>
        </div>
        <div className="p-4">
          {metrics.top_destinations && metrics.top_destinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {metrics.top_destinations.map((dest, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-gray-900">{dest.name}</h4>
                    <div className="flex items-center text-yellow-500">
                      <SafeIcon icon={FiStar} className="w-4 h-4 mr-1 fill-current" />
                      <span className="text-sm">{dest.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{dest.city}, {dest.country}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No destination data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Treatments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Top Treatments</h3>
        </div>
        <div className="p-4">
          {metrics.top_treatments && metrics.top_treatments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {metrics.top_treatments.map((treatment, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">{treatment.name}</h4>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">{treatment.category}</p>
                    <p className="text-sm text-primary-600">{treatment.procedure_count}+ procedures</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No treatment data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformMetricsCard;