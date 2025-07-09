import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { createBooking } from '../services/bookingService';
import { getDestinations } from '../services/destinationService';
import { getTreatments } from '../services/treatmentService';

const { FiCalendar, FiMapPin, FiActivity, FiCheck, FiX } = FiIcons;

const BookingForm = ({ onClose, onSuccess, initialDestination, initialTreatment }) => {
  const [destinations, setDestinations] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    destination_id: initialDestination || '',
    treatment_id: initialTreatment || '',
    booking_date: format(new Date().setDate(new Date().getDate() + 7), 'yyyy-MM-dd'),
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [destinationsData, treatmentsData] = await Promise.all([
          getDestinations(),
          getTreatments()
        ]);
        setDestinations(destinationsData);
        setTreatments(treatmentsData);
        setError(null);
      } catch (err) {
        setError('Failed to load form data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update form data if initial values change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      destination_id: initialDestination || prev.destination_id,
      treatment_id: initialTreatment || prev.treatment_id
    }));
  }, [initialDestination, initialTreatment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createBooking(formData);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError('Failed to create booking');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Book Medical Treatment</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <SafeIcon icon={FiX} className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <select
              name="destination_id"
              value={formData.destination_id}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a destination</option>
              {destinations.map(destination => (
                <option key={destination.id} value={destination.id}>
                  {destination.name} - {destination.city}, {destination.country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treatment
            </label>
            <select
              name="treatment_id"
              value={formData.treatment_id}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a treatment</option>
              {treatments.map(treatment => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name} ({treatment.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Date
            </label>
            <div className="relative">
              <SafeIcon icon={FiCalendar} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                required
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any specific requirements or questions..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400"
          >
            {submitting ? 'Processing...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;