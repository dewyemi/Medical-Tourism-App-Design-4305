import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { formatDate } from '../utils/dataUtils';

const { FiStar, FiUser } = FiIcons;

const ReviewsList = ({ reviews, limit = 3 }) => {
  // Display either all reviews or limited number based on prop
  const displayedReviews = limit ? reviews.slice(0, limit) : reviews;
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-xl">
        <p className="text-gray-500">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedReviews.map((review) => (
        <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              {review.profile?.avatar_url ? (
                <img 
                  src={review.profile.avatar_url} 
                  alt="User" 
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                  <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-500" />
                </div>
              )}
              <span className="font-medium text-gray-800">
                {review.profile?.first_name 
                  ? `${review.profile.first_name} ${review.profile.last_name?.charAt(0) || ''}.` 
                  : review.user?.email.split('@')[0] || 'Anonymous'}
              </span>
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <SafeIcon 
                  key={i}
                  icon={FiStar} 
                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
          
          <p className="text-gray-700 mb-2">{review.comment}</p>
          
          <div className="text-xs text-gray-500">
            {formatDate(review.created_at)}
          </div>
        </div>
      ))}
      
      {limit && reviews.length > limit && (
        <div className="text-center">
          <button className="text-primary-600 font-medium text-sm">
            View all {reviews.length} reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;