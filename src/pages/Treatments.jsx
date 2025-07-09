import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getTreatments, getTreatmentsByCategory } from '../services/treatmentService';
import Modal from '../components/Modal';
import BookingForm from '../components/BookingForm';

const {
  FiHeart, FiEye, FiSmile, FiScissors, 
  FiActivity, FiBrain, FiChevronRight
} = FiIcons;

const iconMap = {
  Heart: FiHeart,
  Eye: FiEye,
  Smile: FiSmile,
  Scissors: FiScissors,
  Activity: FiActivity,
  Brain: FiBrain,
};

const Treatments = () => {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async (category = null) => {
    try {
      setLoading(true);
      let data;
      
      if (category) {
        data = await getTreatmentsByCategory(category);
        setActiveCategory(category);
      } else {
        data = await getTreatments();
        setActiveCategory(null);
      }
      
      setTreatments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load treatments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    console.log('Booking created successfully!');
  };

  const handleBookNow = (treatment) => {
    setSelectedTreatment(treatment);
    setIsBookingModalOpen(true);
  };
  
  const viewTreatmentDetails = (id) => {
    navigate(`/treatments/${id}`);
  };
  
  // Get unique categories for filtering
  const categories = [...new Set(treatments.map(t => t.category))];

  return (
    <>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Treatment Categories</h2>
          
          {categories.length > 0 && (
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchTreatments()}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    activeCategory === null 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  All
                </button>
                
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => fetchTreatments(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                      activeCategory === category 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
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

        <div className="grid grid-cols-1 gap-4">
          {treatments.map((treatment) => (
            <div 
              key={treatment.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${treatment.color || 'bg-primary-100 text-primary-600'}`}>
                  <SafeIcon 
                    icon={treatment.icon_name && iconMap[treatment.icon_name] ? iconMap[treatment.icon_name] : FiActivity} 
                    className="w-6 h-6" 
                  />
                </div>
                
                <div 
                  className="flex-1 ml-4 cursor-pointer" 
                  onClick={() => viewTreatmentDetails(treatment.id)}
                >
                  <h3 className="font-semibold text-gray-900">{treatment.name}</h3>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500 mr-2">{treatment.category}</p>
                    <p className="text-xs text-primary-600">{treatment.procedure_count}+ procedures</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBookNow(treatment)}
                    className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                  >
                    Book
                  </button>
                  
                  <button
                    onClick={() => viewTreatmentDetails(treatment.id)}
                    className="p-2 text-gray-500 hover:text-primary-600"
                  >
                    <SafeIcon icon={FiChevronRight} className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Need Help Choosing?</h3>
          <p className="text-primary-100 mb-4">
            Speak with our medical consultants for personalized recommendations
          </p>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Book Consultation
          </button>
        </div>
      </div>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)}>
        <BookingForm
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
          initialTreatment={selectedTreatment?.id}
        />
      </Modal>
    </>
  );
};

export default Treatments;