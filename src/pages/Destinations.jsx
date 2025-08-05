import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getDestinations, searchDestinations } from '../services/destinationService';
import Modal from '../components/Modal';
import BookingForm from '../components/BookingForm';

const { FiFilter, FiSearch, FiStar, FiMapPin } = FiIcons;

const Destinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await getDestinations();
      setDestinations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load destinations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      fetchDestinations();
      return;
    }
    
    try {
      setLoading(true);
      const data = await searchDestinations(searchTerm);
      setDestinations(data);
      setError(null);
    } catch (err) {
      setError('Failed to search destinations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    console.log('Booking created successfully!');
  };

  const handleBookNow = (destination) => {
    setSelectedDestination(destination);
    setIsBookingModalOpen(true);
  };
  
  const viewDestinationDetails = (id) => {
    navigate(`/destinations/${id}`);
  };

  return (
    <>
      <div className="px-4 py-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-1 relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search destinations..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!loading && destinations.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No destinations found</p>
          </div>
        )}

        <div className="space-y-4">
          {destinations.map((dest) => (
            <div key={dest.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="relative cursor-pointer"
                onClick={() => viewDestinationDetails(dest.id)}
              >
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Save {dest.savings_percentage}
                </div>
              </div>
              <div className="p-4">
                <div 
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => viewDestinationDetails(dest.id)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{dest.name}</h3>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{dest.rating}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1" />
                  {dest.city}, {dest.country}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {dest.description ? dest.description.substring(0, 100) + '...' : ''}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBookNow(dest)}
                    className="flex-1 bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  >
                    Book Treatment
                  </button>
                  <button
                    onClick={() => viewDestinationDetails(dest.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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

export default Destinations;