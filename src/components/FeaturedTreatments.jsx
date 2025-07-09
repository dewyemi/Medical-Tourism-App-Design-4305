import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import BookingForm from './BookingForm';
import { getTreatments } from '../services/treatmentService';

const { FiHeart, FiEye, FiSmile } = FiIcons;

const iconMap = {
  Heart: FiHeart,
  Eye: FiEye,
  Smile: FiSmile,
};

const FeaturedTreatments = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        const data = await getTreatments();
        // Get featured treatments (top 3 by procedure count)
        const featuredTreatments = data
          .sort((a, b) => b.procedure_count - a.procedure_count)
          .slice(0, 3);
        setTreatments(featuredTreatments);
      } catch (err) {
        setError('Failed to load treatments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  const handleBookingSuccess = () => {
    console.log('Booking created successfully!');
  };

  const handleBookNow = (treatment) => {
    setSelectedTreatment(treatment);
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Treatments</h3>
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Treatments</h3>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Treatments</h3>
        {treatments.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No treatments available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className={`p-3 rounded-xl ${treatment.color || 'bg-primary-100 text-primary-600'}`}>
                  <SafeIcon 
                    icon={treatment.icon_name && iconMap[treatment.icon_name] ? 
                      iconMap[treatment.icon_name] : FiHeart} 
                    className="w-6 h-6" 
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{treatment.name}</h4>
                  <p className="text-sm text-gray-500">{treatment.procedure_count}+ procedures</p>
                </div>
                <button 
                  onClick={() => handleBookNow(treatment)}
                  className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}
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

export default FeaturedTreatments;