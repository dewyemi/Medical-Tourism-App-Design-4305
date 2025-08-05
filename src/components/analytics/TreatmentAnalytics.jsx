import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getTreatmentMetrics } from '../../services/analyticsService';

const { FiBarChart2, FiUsers, FiCalendar, FiMapPin } = FiIcons;

const TreatmentAnalytics = () => {
  const { id } = useParams();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getTreatmentMetrics(id);
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to load treatment analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [id]);

  if (!id) {
    return null;
  }

  if (loading) {
    return (
      <div className="py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 my-4">
        <div className="text-center">
          <SafeIcon icon={FiIcons.FiAlertTriangle} className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
          <p className="text-gray-600">
            We're unable to load analytics for this treatment at the moment.
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const bookingStatusData = [
    { name: 'Completed', value: metrics.completed_bookings },
    { name: 'Cancelled', value: metrics.cancelled_bookings },
    { name: 'Pending', value: metrics.total_bookings - metrics.completed_bookings - metrics.cancelled_bookings }
  ].filter(item => item.value > 0);

  const bookingStatusOption = {
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
        color: ['#10B981', '#EF4444', '#F59E0B']
      }
    ]
  };

  // Popular destinations chart
  const destinationData = metrics.popular_destinations || [];
  const destinationOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: destinationData.map(item => item.name),
      axisLabel: {
        width: 100,
        overflow: 'truncate',
        interval: 0
      }
    },
    series: [
      {
        name: 'Bookings',
        type: 'bar',
        data: destinationData.map(item => item.count),
        color: '#3B82F6'
      }
    ]
  };

  // User demographics
  const demographics = metrics.user_demographics || { ageGroups: {}, genders: {} };
  const ageGroups = demographics.ageGroups || {};
  
  const ageGroupLabels = {
    'under25': 'Under 25',
    '25to34': '25-34',
    '35to44': '35-44',
    '45to54': '45-54',
    '55plus': '55+'
  };

  const ageGroupsData = Object.entries(ageGroups)
    .filter(([key]) => key !== 'unknown')
    .map(([key, value]) => ({
      name: ageGroupLabels[key] || key,
      value
    }));

  const ageGroupOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ageGroupsData.map(item => item.name)
    },
    series: [
      {
        name: 'Age Groups',
        type: 'pie',
        radius: '55%',
        data: ageGroupsData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        color: ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B']
      }
    ]
  };

  // Gender distribution
  const genders = demographics.genders || {};
  
  const genderData = Object.entries(genders).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));

  const genderOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: genderData.map(item => item.name)
    },
    series: [
      {
        name: 'Gender',
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
        data: genderData,
        color: ['#3B82F6', '#EC4899', '#8B5CF6']
      }
    ]
  };

  return (
    <div className="space-y-6 py-4">
      {/* Metrics Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Treatment Insights</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-primary-600">{metrics.total_bookings}</p>
              <p className="text-xs text-gray-500">Total Bookings</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <SafeIcon icon={FiMapPin} className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{destinationData.length}</p>
              <p className="text-xs text-gray-500">Destinations</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <SafeIcon icon={FiUsers} className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{demographics.userCount || 0}</p>
              <p className="text-xs text-gray-500">Unique Patients</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <SafeIcon icon={FiBarChart2} className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{metrics.avg_rating ? metrics.avg_rating.toFixed(1) : '-'}</p>
              <p className="text-xs text-gray-500">Avg. Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Booking Status</h3>
          </div>
          <div className="p-4 h-64">
            {metrics.total_bookings > 0 ? (
              <ReactECharts option={bookingStatusOption} style={{ height: '100%' }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No booking data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Age Demographics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Patient Age Groups</h3>
          </div>
          <div className="p-4 h-64">
            {ageGroupsData.some(group => group.value > 0) ? (
              <ReactECharts option={ageGroupOption} style={{ height: '100%' }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No demographic data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Popular Destinations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Popular Destinations</h3>
          </div>
          <div className="p-4 h-64">
            {destinationData.length > 0 ? (
              <ReactECharts option={destinationOption} style={{ height: '100%' }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No destination data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Gender Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Gender Distribution</h3>
          </div>
          <div className="p-4 h-64">
            {genderData.length > 0 ? (
              <ReactECharts option={genderOption} style={{ height: '100%' }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No gender data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Origin Countries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Patient Origin Countries</h3>
        </div>
        <div className="p-4">
          {demographics.topCountries && demographics.topCountries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {demographics.topCountries.map((country, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-gray-900">{country.count}</p>
                  <p className="text-sm text-gray-600">{country.country}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No country data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentAnalytics;