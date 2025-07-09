import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { findMatchingProviders } from '../../services/providerMatchingService';
import { getTreatmentDetails } from '../../services/treatmentRecommendationService';

const { 
  FiUser, FiStar, FiCheck, FiAward, FiCalendar, FiMapPin, 
  FiFilter, FiClock, FiGlobe, FiDollarSign, FiMessageSquare 
} = FiIcons;

const ProviderMatchingSystem = () => {
  const { treatmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [treatment, setTreatment] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minExperience: 0,
    minRating: 0,
    languages: [],
    sortBy: 'match'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (treatmentId) {
      fetchData();
    }
  }, [treatmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch treatment details
      const treatmentData = await getTreatmentDetails(treatmentId);
      setTreatment(treatmentData);
      
      // Fetch matching providers
      const providersData = await findMatchingProviders(treatmentId);
      setProviders(providersData);
    } catch (err) {
      setError('Failed to load providers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...providers];
    
    // Apply minimum experience filter
    if (filters.minExperience > 0) {
      filtered = filtered.filter(p => p.years_experience >= filters.minExperience);
    }
    
    // Apply minimum rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(p => p.avg_rating >= filters.minRating);
    }
    
    // Apply language filter
    if (filters.languages.length > 0) {
      filtered = filtered.filter(p => 
        p.profile && 
        p.profile.languages && 
        p.profile.languages.some(lang => filters.languages.includes(lang))
      );
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'match':
        filtered.sort((a, b) => b.match_score - a.match_score);
        break;
      case 'experience':
        filtered.sort((a, b) => b.years_experience - a.years_experience);
        break;
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.avg_rating || 0) - parseFloat(a.avg_rating || 0));
        break;
      default:
        filtered.sort((a, b) => b.match_score - a.match_score);
    }
    
    return filtered;
  };

  const filteredProviders = applyFilters();

  const viewProviderProfile = (providerId) => {
    navigate(`/providers/${providerId}`);
  };

  const requestAppointment = (providerId) => {
    navigate(`/request-appointment/${providerId}?treatment=${treatmentId}`);
  };

  // Render experience level badge
  const renderExpertiseLevel = (level) => {
    let color;
    
    switch (level) {
      case 'basic':
        color = 'bg-gray-100 text-gray-800';
        break;
      case 'intermediate':
        color = 'bg-blue-100 text-blue-800';
        break;
      case 'advanced':
        color = 'bg-green-100 text-green-800';
        break;
      case 'expert':
        color = 'bg-purple-100 text-purple-800';
        break;
      case 'pioneer':
        color = 'bg-yellow-100 text-yellow-800';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Provider Matching</h2>
          {treatment && (
            <p className="text-gray-600">
              Finding the best providers for {treatment.name}
            </p>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-3 md:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
        >
          <SafeIcon icon={FiFilter} className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-4">Filter Providers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Experience (years)
              </label>
              <input
                type="number"
                min="0"
                value={filters.minExperience}
                onChange={(e) => setFilters({...filters, minExperience: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="0">Any rating</option>
                <option value="3">3+ stars</option>
                <option value="4">4+ stars</option>
                <option value="4.5">4.5+ stars</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Languages
              </label>
              <select
                multiple
                value={filters.languages}
                onChange={(e) => setFilters({
                  ...filters, 
                  languages: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-11"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Arabic">Arabic</option>
                <option value="Hindi">Hindi</option>
                <option value="Mandarin">Mandarin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="match">Best Match</option>
                <option value="experience">Most Experience</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Providers List */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <SafeIcon icon={FiUser} className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Providers</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find providers matching your criteria. Try adjusting your filters.
          </p>
          {showFilters && filters.minExperience > 0 && (
            <button
              onClick={() => setFilters({...filters, minExperience: 0})}
              className="text-primary-600 hover:underline"
            >
              Clear experience filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProviders.map((provider, index) => (
            <div 
              key={provider.provider_id} 
              className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex flex-col md:flex-row">
                  <div className="flex items-start md:w-1/3 mb-4 md:mb-0">
                    <div className="w-16 h-16 rounded-full bg-primary-50 flex-shrink-0 flex items-center justify-center overflow-hidden mr-4">
                      {provider.profile?.profile_image_url ? (
                        <img 
                          src={provider.profile.profile_image_url} 
                          alt={provider.provider_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <SafeIcon icon={FiUser} className="w-8 h-8 text-primary-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-900 text-lg mr-2">
                          Dr. {provider.provider_name}
                        </h3>
                        {index === 0 && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            Top Match
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        {provider.avg_rating && (
                          <div className="flex items-center mr-3">
                            <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm text-gray-600">{provider.avg_rating}</span>
                            <span className="text-xs text-gray-500 ml-1">({provider.review_count})</span>
                          </div>
                        )}
                        {renderExpertiseLevel(provider.expertise_level || 'intermediate')}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {provider.profile?.specializations?.join(', ') || provider.expertise_level + ' specialist'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 md:pl-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      <div className="flex items-center">
                        <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm">{provider.success_rate || 95}% success rate</span>
                      </div>
                      
                      <div className="flex items-center">
                        <SafeIcon icon={FiClock} className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm">{provider.years_experience} years experience</span>
                      </div>
                      
                      <div className="flex items-center">
                        <SafeIcon icon={FiAward} className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm">Board certified</span>
                      </div>
                      
                      <div className="flex items-center">
                        <SafeIcon icon={FiMapPin} className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-sm">
                          {provider.profile?.location || 'International'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-sm">{provider.availability_count || 'Limited'} slots available</span>
                      </div>
                      
                      <div className="flex items-center">
                        <SafeIcon icon={FiGlobe} className="w-4 h-4 text-teal-500 mr-2" />
                        <span className="text-sm">
                          {provider.profile?.languages?.slice(0, 2).join(', ') || 'English'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => viewProviderProfile(provider.provider_id)}
                        className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors flex items-center"
                      >
                        <SafeIcon icon={FiUser} className="w-4 h-4 mr-2" />
                        View Profile
                      </button>
                      
                      <button
                        onClick={() => requestAppointment(provider.provider_id)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center"
                      >
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                        Schedule Consultation
                      </button>
                      
                      <button
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center"
                      >
                        <SafeIcon icon={FiMessageSquare} className="w-4 h-4 mr-2" />
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderMatchingSystem;