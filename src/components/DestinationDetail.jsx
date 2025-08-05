import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import BookingForm from './BookingForm';
import ReviewsList from './ReviewsList';
import DestinationAnalytics from './analytics/DestinationAnalytics';
import { getDestinationById } from '../services/destinationService';
import { getDestinationReviews, createReview } from '../services/reviewService';
import { formatDate } from '../utils/dataUtils';

const { FiStar, FiMapPin, FiChevronLeft, FiCalendar, FiCheck, FiDollarSign, FiBarChart2 } = FiIcons;

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [destinationData, reviewsData] = await Promise.all([
          getDestinationById(id),
          getDestinationReviews(id)
        ]);
        
        setDestination(destinationData);
        setReviews(reviewsData);
        setError(null);
      } catch (err) {
        setError('Failed to load destination details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleBookingSuccess = () => {
    console.log('Booking created successfully!');
  };

  const handleRatingChange = (rating) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleReviewChange = (e) => {
    setNewReview(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      await createReview({
        destination_id: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      // Refresh reviews
      const reviewsData = await getDestinationReviews(id);
      setReviews(reviewsData);
      
      // Reset and close modal
      setNewReview({ rating: 5, comment: '' });
      setIsReviewModalOpen(false);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Destination not found'}
        </div>
        <button 
          onClick={() => navigate('/destinations')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          Back to Destinations
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pb-6">
        <div className="relative">
          <img 
            src={destination.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'} 
            alt={destination.name} 
            className="w-full h-60 object-cover"
          />
          <button 
            onClick={() => navigate('/destinations')}
            className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full"
          >
            <SafeIcon icon={FiChevronLeft} className="w-5 h-5 text-gray-800" />
          </button>
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Save {destination.savings_percentage || '70%'}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{destination.name}</h1>
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium text-yellow-700">{destination.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 mb-4">
            <SafeIcon icon={FiMapPin} className="w-5 h-5 mr-2" />
            <span>{destination.city}, {destination.country}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <button
              onClick={toggleAnalytics}
              className="flex items-center text-primary-600 text-sm font-medium"
            >
              <SafeIcon icon={FiBarChart2} className="w-4 h-4 mr-1" />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
          </div>
          
          {showAnalytics ? (
            <DestinationAnalytics />
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <p className="text-gray-700">
                  {destination.description || 'This premier healthcare destination offers world-class medical facilities with significant cost savings compared to Western countries. Patients can expect top-quality care in modern facilities with internationally trained medical staff.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <div className="flex items-center mb-2">
                    <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Cost Savings</span>
                  </div>
                  <p className="text-blue-900 text-lg font-bold">{destination.savings_percentage || '60-80%'}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-xl">
                  <div className="flex items-center mb-2">
                    <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Accredited</span>
                  </div>
                  <p className="text-green-900 text-sm">JCI & ISO Certified</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="text-primary-600 text-sm font-medium"
                  >
                    Add Review
                  </button>
                </div>
                
                <ReviewsList reviews={reviews} />
              </div>
              
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium flex items-center justify-center"
              >
                <SafeIcon icon={FiCalendar} className="w-5 h-5 mr-2" />
                Book Treatment
              </button>
            </>
          )}
        </div>
      </div>
      
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)}>
        <BookingForm 
          onClose={() => setIsBookingModalOpen(false)} 
          onSuccess={handleBookingSuccess}
          initialDestination={id}
        />
      </Modal>
      
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)}>
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
            <button 
              onClick={() => setIsReviewModalOpen(false)} 
              className="text-gray-500 hover:text-gray-700"
            >
              <SafeIcon icon={FiIcons.FiX} className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleReviewSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <SafeIcon 
                      icon={FiStar} 
                      className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={handleReviewChange}
                rows="4"
                placeholder="Share your experience with this destination..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default DestinationDetail;