import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import BookingForm from './BookingForm';

const { FiCalendar, FiPhone, FiFileText, FiDollarSign } = FiIcons;

const QuickActions = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookingSuccess = () => {
    // You can add a success notification here
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
      icon: FiPhone, 
      label: 'Call Support', 
      color: 'bg-green-500',
      action: () => window.open('tel:+1234567890')
    },
    { 
      icon: FiFileText, 
      label: 'Get Quote', 
      color: 'bg-purple-500',
      action: () => {}
    },
    { 
      icon: FiDollarSign, 
      label: 'Price Compare', 
      color: 'bg-orange-500',
      action: () => {}
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