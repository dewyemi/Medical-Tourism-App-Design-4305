import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import BookingForm from './BookingForm';
import { getTreatments } from '../services/treatmentService';

const { FiHeart, FiEye, FiSmile, FiActivity } = FiIcons;

const iconMap = {
  Heart: FiHeart,
  Eye: FiEye,
  Smile: FiSmile,
  Activity: FiActivity,
};

const FeaturedTreatments = () => {
  const navigate = useNavigate();
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
        // Get featured treatments (top 6 by procedure count)
        const featuredTreatments = data
          .sort((a, b) => b.procedure_count - a.procedure_count)
          .slice(0, 6);
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

  const handleViewDetails = (treatmentId) => {
    navigate(`/treatments/${treatmentId}`);
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Treatments</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white rounded-xl shadow-sm animate-pulse">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Featured Treatments</h3>
          <button 
            onClick={() => navigate('/treatments')}
            className="text-primary-600 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        {treatments.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No treatments available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {treatments.map((treatment) => {
              const IconComponent = treatment.icon_name && iconMap[treatment.icon_name] 
                ? iconMap[treatment.icon_name] 
                : FiActivity;
              
              return (
                <div 
                  key={treatment.id} 
                  className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-3 rounded-xl ${treatment.color || 'bg-primary-100 text-primary-600'}`}>
                      <SafeIcon icon={IconComponent} className="w-6 h-6" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900">{treatment.name}</h4>
                      <p className="text-xs text-gray-500">{treatment.procedure_count}+ procedures</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBookNow(treatment)}
                      className="flex-1 bg-primary-50 text-primary-600 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                    >
                      Book
                    </button>
                    <button
                      onClick={() => handleViewDetails(treatment.id)}
                      className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
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