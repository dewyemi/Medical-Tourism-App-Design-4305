import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import QuickActions from '../components/QuickActions';
import PopularDestinations from '../components/PopularDestinations';
import FeaturedTreatments from '../components/FeaturedTreatments';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getDestinations } from '../services/destinationService';
import { getTreatments } from '../services/treatmentService';

const { FiAlertCircle } = FiIcons;

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [destinationsLoaded, setDestinationsLoaded] = useState(false);
  const [treatmentsLoaded, setTreatmentsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prefetch data for child components to improve perceived performance
    const prefetchData = async () => {
      try {
        // Start both requests in parallel
        const destinationsPromise = getDestinations();
        const treatmentsPromise = getTreatments();

        // Wait for both to complete
        await Promise.all([destinationsPromise, treatmentsPromise]);
        
        setDestinationsLoaded(true);
        setTreatmentsLoaded(true);
      } catch (err) {
        console.error('Error prefetching data:', err);
        setError('Failed to load application data. Please try again later.');
      } finally {
        // Set loading to false after a minimum display time (for UX)
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    prefetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading MediTravel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
        <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <HeroSection />
      <QuickActions />
      <PopularDestinations />
      <FeaturedTreatments />
      
      {/* Promotional Banner */}
      <div className="px-4 py-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Join our Health Journey Program</h3>
          <p className="text-primary-100 mb-4">
            Get personalized treatment recommendations and exclusive discounts
          </p>
          <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Sign Up Now
          </button>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Stories</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <span className="text-primary-600 font-medium">JD</span>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <h4 className="font-semibold text-gray-900 mr-2">John D.</h4>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <SafeIcon 
                      key={star} 
                      icon={FiIcons.FiStar} 
                      className="w-3 h-3 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                "I saved over 70% on my dental treatment and enjoyed a beautiful vacation 
                at the same time. The care I received was world-class!"
              </p>
              <p className="text-xs text-gray-500 mt-2">Bangkok, Thailand • Dental Procedure</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <span className="text-green-600 font-medium">SM</span>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <h4 className="font-semibold text-gray-900 mr-2">Sarah M.</h4>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <SafeIcon 
                      key={star} 
                      icon={FiIcons.FiStar} 
                      className="w-3 h-3 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                "MediTravel made the entire process seamless. From booking to post-treatment care,
                everything was handled professionally and with great care."
              </p>
              <p className="text-xs text-gray-500 mt-2">Istanbul, Turkey • Hip Replacement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;