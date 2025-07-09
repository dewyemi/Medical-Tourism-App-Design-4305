import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import BookingForm from './BookingForm';
import SearchBar from './SearchBar';
import { getPlatformMetrics } from '../services/analyticsService';

const { FiStar, FiUsers, FiMapPin, FiSearch } = FiIcons;

const HeroSection = () => {
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [metrics, setMetrics] = useState({
    userCount: '10K+',
    destinationCount: '50+',
    avgRating: 4.9
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getPlatformMetrics();
        setMetrics({
          userCount: formatUserCount(data.user_count),
          destinationCount: formatDestinationCount(data.top_destinations?.length || 0),
          avgRating: data.avg_platform_rating?.toFixed(1) || 4.9
        });
      } catch (err) {
        console.error('Error fetching platform metrics:', err);
        // Keep default values if there's an error
      }
    };
    fetchMetrics();
  }, []);

  const formatUserCount = (count) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}K+`;
    }
    return `${count}+`;
  };

  const formatDestinationCount = (count) => {
    return `${Math.max(count, 10)}+`;
  };

  const handleBookingSuccess = () => {
    console.log('Booking created successfully!');
  };

  return (
    <>
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-4 py-8 text-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to MediTravel</h2>
          <p className="text-primary-100">Discover world-class healthcare destinations</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          {isSearchExpanded ? (
            <div className="bg-white rounded-xl shadow-lg">
              <SearchBar 
                isFullScreen={false} 
                onClose={() => setIsSearchExpanded(false)}
              />
            </div>
          ) : (
            <div 
              className="relative cursor-pointer"
              onClick={() => setIsSearchExpanded(true)}
            >
              <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <div className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300">
                Search destinations or treatments...
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <SafeIcon icon={FiMapPin} className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{metrics.destinationCount}</p>
              <p className="text-xs text-primary-100">Countries</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <SafeIcon icon={FiUsers} className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{metrics.userCount}</p>
              <p className="text-xs text-primary-100">Patients</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <SafeIcon icon={FiStar} className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{metrics.avgRating}</p>
              <p className="text-xs text-primary-100">Rating</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsBookingModalOpen(true)}
          className="w-full bg-white text-primary-600 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Start Your Journey
        </button>
      </div>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)}>
        <BookingForm
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      </Modal>
    </>
  );
};

export default HeroSection;