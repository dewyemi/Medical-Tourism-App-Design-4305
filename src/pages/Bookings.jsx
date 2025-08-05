import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getUserBookings, updateBookingStatus, deleteBooking } from '../services/bookingService';
import { getStatusColor, getStatusIcon } from '../utils/dataUtils';
import Modal from '../components/Modal';

const { 
  FiCalendar, FiMapPin, FiActivity, FiCheck, 
  FiClock, FiXCircle, FiInfo, FiTrash2
} = FiIcons;

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
      console.error(err);
    }
  };
  
  const handleDeleteClick = (booking) => {
    setSelectedBooking(booking);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedBooking) return;
    
    try {
      setIsDeleting(true);
      await deleteBooking(selectedBooking.id);
      setIsDeleteModalOpen(false);
      
      // Remove from list
      setBookings(bookings.filter(b => b.id !== selectedBooking.id));
      setSelectedBooking(null);
    } catch (err) {
      setError('Failed to delete booking');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Your Bookings</h2>
      
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
      
      {!loading && bookings.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <div className="mb-4">
            <SafeIcon icon={FiCalendar} className="w-12 h-12 mx-auto text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
          <p className="text-gray-600 mb-6">You haven't made any medical bookings yet.</p>
          <button 
            onClick={() => navigate('/treatments')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium"
          >
            Explore Treatments
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        {bookings.map((booking) => {
          const statusColor = getStatusColor(booking.status);
          const StatusIcon = FiIcons[getStatusIcon(booking.status)] || FiClock;
          
          return (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {booking.treatment?.name || 'Medical Treatment'}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1" />
                      {booking.destination?.name || 'Medical Destination'}, {booking.destination?.city || 'City'}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusColor}`}>
                    <SafeIcon icon={StatusIcon} className="w-3 h-3 mr-1" />
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center text-gray-700 mb-3">
                  <SafeIcon icon={FiCalendar} className="w-5 h-5 mr-2 text-gray-500" />
                  <span>
                    {booking.booking_date ? format(new Date(booking.booking_date), 'MMMM d, yyyy') : 'Date not set'}
                  </span>
                </div>
                
                {booking.notes && (
                  <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {booking.notes}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="flex-1 bg-primary-500 text-white py-2 rounded-lg font-medium text-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium text-sm"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {(booking.status === 'completed' || booking.status === 'cancelled') && (
                    <>
                      <button
                        className="flex-1 bg-primary-50 text-primary-600 py-2 rounded-lg font-medium text-sm flex items-center justify-center"
                      >
                        <SafeIcon icon={FiInfo} className="w-4 h-4 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => handleDeleteClick(booking)}
                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium text-sm flex items-center justify-center"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="bg-white rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <SafeIcon icon={FiTrash2} className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Booking</h3>
            <p className="text-gray-600">
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium disabled:bg-red-300"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bookings;