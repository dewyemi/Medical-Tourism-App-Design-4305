import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import BookingForm from './BookingForm';
import { getDestinations } from '../services/destinationService';

const { FiStar, FiMapPin } = FiIcons;

const PopularDestinations = () => {
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const data = await getDestinations();
        // Get popular destinations (top 4 by rating)
        const popularDestinations = data
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        setDestinations(popularDestinations);
      } catch (err) {
        setError('Failed to load destinations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const handleBookingSuccess = () => {
    console.log('Booking created successfully!');
  };

  const handleBookTreatment = (destination) => {
    setSelectedDestination(destination);
    setIsBookingModalOpen(true);
  };

  const viewDestinationDetails = (destinationId) => {
    navigate(`/destinations/${destinationId}`);
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Popular Destinations</h3>
          <button 
            onClick={() => navigate('/destinations')}
            className="text-primary-600 text-sm font-medium"
          >
            See All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
              <div className="h-32 bg-gray-200 rounded-t-xl"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Popular Destinations</h3>
          <button 
            onClick={() => navigate('/destinations')}
            className="text-primary-600 text-sm font-medium"
          >
            See All
          </button>
        </div>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Popular Destinations</h3>
          <button 
            onClick={() => navigate('/destinations')}
            className="text-primary-600 text-sm font-medium"
          >
            See All
          </button>
        </div>
        
        {destinations.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No destinations available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {destinations.map((dest) => (
              <div key={dest.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div 
                  className="relative cursor-pointer" 
                  onClick={() => viewDestinationDetails(dest.id)}
                >
                  <img 
                    src={dest.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop'} 
                    alt={dest.name} 
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Save {dest.savings_percentage || '70%'}
                  </div>
                </div>
                <div className="p-4">
                  <div 
                    className="flex items-center justify-between mb-2 cursor-pointer"
                    onClick={() => viewDestinationDetails(dest.id)}
                  >
                    <h4 className="font-semibold text-gray-900">{dest.name}</h4>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{dest.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1" />
                    {dest.city}, {dest.country}
                  </div>
                  <button
                    onClick={() => handleBookTreatment(dest)}
                    className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  >
                    Book Treatment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)}>
        <BookingForm 
          onClose={() => setIsBookingModalOpen(false)} 
          onSuccess={handleBookingSuccess}
          initialDestination={selectedDestination?.id}
        />
      </Modal>
    </>
  );
};

export default PopularDestinations;