import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import BookingForm from './BookingForm';

const { FiCalendar, FiPhone, FiFileText, FiDollarSign, FiMapPin, FiHeart, FiBarChart2 } = FiIcons;

const QuickActions = () => {
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const handleBookingSuccess = () => {
    console.log('Booking created successfully!');
  };

  const actions = [
    {
      icon: FiCalendar,
      label: 'Book Consultation',
      color: 'bg-blue-500',
      action: () => setIsBookingModalOpen(true)
    },
    {
      icon: FiMapPin,
      label: 'Destinations',
      color: 'bg-green-500',
      action: () => navigate('/destinations')
    },
    {
      icon: FiHeart,
      label: 'Treatments',
      color: 'bg-purple-500',
      action: () => navigate('/treatments')
    },
    {
      icon: FiBarChart2,
      label: 'Analytics',
      color: 'bg-orange-500',
      action: () => navigate('/analytics')
    },
  ];

  return (
    <>
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <SafeIcon icon={action.icon} className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
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

export default QuickActions;