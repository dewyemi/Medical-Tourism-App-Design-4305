import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import BookingForm from './BookingForm';

const { FiStar, FiUsers, FiMapPin } = FiIcons;

const HeroSection = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <SafeIcon icon={FiMapPin} className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">50+</p>
              <p className="text-xs text-primary-100">Countries</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <SafeIcon icon={FiUsers} className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-xs text-primary-100">Patients</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <SafeIcon icon={FiStar} className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">4.9</p>
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