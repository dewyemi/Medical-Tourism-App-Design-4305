import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from './Modal';
import BookingForm from './BookingForm';
import ReviewsList from './ReviewsList';
import TreatmentAnalytics from './analytics/TreatmentAnalytics';
import { getTreatmentById } from '../services/treatmentService';
import { getTreatmentReviews, createReview } from '../services/reviewService';

const { FiStar, FiChevronLeft, FiCalendar, FiClock, FiDollarSign, FiBarChart2 } = FiIcons;

const iconMap = {
  Heart: FiIcons.FiHeart,
  Eye: FiIcons.FiEye,
  Smile: FiIcons.FiSmile,
  Activity: FiIcons.FiActivity,
  Brain: FiIcons.FiZap, // FiBrain doesn't exist, using FiZap as alternative
  Scissors: FiIcons.FiScissors,
};

const TreatmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [treatment, setTreatment] = useState(null);
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
        const [treatmentData, reviewsData] = await Promise.all([
          getTreatmentById(id),
          getTreatmentReviews(id)
        ]);
        
        setTreatment(treatmentData);
        setReviews(reviewsData);
        setError(null);
      } catch (err) {
        setError('Failed to load treatment details');
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
        treatment_id: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      // Refresh reviews
      const reviewsData = await getTreatmentReviews(id);
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

  if (error || !treatment) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Treatment not found'}
        </div>
        <button 
          onClick={() => navigate('/treatments')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          Back to Treatments
        </button>
      </div>
    );
  }

  const TreatmentIcon = treatment.icon_name && iconMap[treatment.icon_name] 
    ? iconMap[treatment.icon_name] 
    : FiIcons.FiActivity;

  return (
    <>
      <div className="pb-6">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 relative">
          <button 
            onClick={() => navigate('/treatments')}
            className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full"
          >
            <SafeIcon icon={FiChevronLeft} className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex flex-col items-center text-white pt-6 pb-4">
            <div className={`p-4 rounded-full bg-white/20 backdrop-blur-sm mb-4`}>
              <SafeIcon icon={TreatmentIcon} className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold mb-1">{treatment.name}</h1>
            <div className="text-primary-100">{treatment.category}</div>
            
            <div className="flex items-center mt-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="font-bold mr-1">{treatment.procedure_count}+</span> 
              <span className="text-sm">procedures worldwide</span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
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
            <TreatmentAnalytics />
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <p className="text-gray-700">
                  {treatment.description || 'This advanced medical treatment is performed by skilled specialists using the latest technology and techniques. Patients can expect excellent outcomes with proper care and follow-up.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <div className="flex items-center mb-2">
                    <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Avg. Cost</span>
                  </div>
                  <p className="text-blue-900 text-lg font-bold">
                    {treatment.average_cost 
                      ? `$${treatment.average_cost}` 
                      : '$1,500 - $8,000'}
                  </p>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-xl">
                  <div className="flex items-center mb-2">
                    <SafeIcon icon={FiClock} className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="text-orange-800 font-medium">Recovery</span>
                  </div>
                  <p className="text-orange-900 text-sm">
                    {treatment.recovery_time || '1-4 weeks typical'}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Patient Reviews</h2>
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
                Book This Treatment
              </button>
            </>
          )}
        </div>
      </div>
      
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)}>
        <BookingForm 
          onClose={() => setIsBookingModalOpen(false)} 
          onSuccess={handleBookingSuccess}
          initialTreatment={id}
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
                placeholder="Share your experience with this treatment..."
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

export default TreatmentDetail;