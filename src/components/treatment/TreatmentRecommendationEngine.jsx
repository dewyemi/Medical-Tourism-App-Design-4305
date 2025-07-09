import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getTreatmentRecommendations, savePatientPreferences } from '../../services/treatmentRecommendationService';
import { formatCurrency } from '../../utils/dataUtils';

const { FiTarget, FiPlus, FiCheck, FiClock, FiTrendingUp, FiDollarSign, FiAward, FiShield } = FiIcons;

const TreatmentRecommendationEngine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    budget_min: 0,
    budget_max: 10000,
    preferred_countries: [],
    preferred_treatment_types: [],
    preferred_hospital_types: [],
    preferred_accommodation_level: 'standard',
    required_amenities: [],
    language_requirements: []
  });
  const [condition, setCondition] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [severity, setSeverity] = useState('moderate');
  
  const fetchRecommendations = async () => {
    if (!condition) {
      setError('Please enter your medical condition');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Save preferences first
      await savePatientPreferences(preferences);
      
      // Then get recommendations
      const data = await getTreatmentRecommendations(condition, symptoms, severity);
      setRecommendations(data || []);
    } catch (err) {
      setError('Failed to get treatment recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim())) {
      setSymptoms([...symptoms, currentSymptom.trim()]);
      setCurrentSymptom('');
    }
  };
  
  const handleRemoveSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };
  
  const handleViewTreatment = (treatmentId) => {
    navigate(`/treatments/${treatmentId}`);
  };
  
  const handleFindProvider = (treatmentId) => {
    navigate(`/provider-matching/${treatmentId}`);
  };
  
  // Helper to render match score as stars
  const renderMatchScore = (score) => {
    const fullStars = Math.floor(score / 20);
    const hasHalfStar = score % 20 >= 10;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <SafeIcon 
            key={index}
            icon={index < fullStars ? FiIcons.FiStar : (index === fullStars && hasHalfStar ? FiIcons.FiStar : FiIcons.FiStar)} 
            className={`w-4 h-4 ${index < fullStars ? 'text-yellow-400 fill-current' : (index === fullStars && hasHalfStar ? 'text-yellow-400' : 'text-gray-300')}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-600">{score}%</span>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Treatment Recommendation Engine</h2>
      
      {/* Input form */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medical Condition *
          </label>
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="E.g., Knee arthritis, Cataracts, Dental implants"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symptoms
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={currentSymptom}
              onChange={(e) => setCurrentSymptom(e.target.value)}
              placeholder="Add symptom"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSymptom())}
            />
            <button
              type="button"
              onClick={handleAddSymptom}
              className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, index) => (
              <div key={index} className="bg-primary-50 text-primary-700 px-2 py-1 rounded-lg flex items-center">
                <span className="mr-1">{symptom}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveSymptom(symptom)}
                  className="text-primary-500 hover:text-primary-700"
                >
                  <SafeIcon icon={FiIcons.FiX} className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          className="text-primary-600 text-sm font-medium flex items-center mb-4"
        >
          <SafeIcon icon={showPreferences ? FiIcons.FiChevronDown : FiIcons.FiChevronRight} className="w-4 h-4 mr-1" />
          {showPreferences ? 'Hide Patient Preferences' : 'Show Patient Preferences'}
        </button>
        
        {showPreferences && (
          <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="font-medium text-gray-800 mb-3">Treatment Preferences</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Budget (USD)
                </label>
                <input
                  type="number"
                  value={preferences.budget_min}
                  onChange={(e) => setPreferences({...preferences, budget_min: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Budget (USD)
                </label>
                <input
                  type="number"
                  value={preferences.budget_max}
                  onChange={(e) => setPreferences({...preferences, budget_max: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accommodation Preference
              </label>
              <select
                value={preferences.preferred_accommodation_level}
                onChange={(e) => setPreferences({...preferences, preferred_accommodation_level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="budget">Budget</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Countries
              </label>
              <select
                multiple
                value={preferences.preferred_countries}
                onChange={(e) => setPreferences({
                  ...preferences, 
                  preferred_countries: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24"
              >
                <option value="Thailand">Thailand</option>
                <option value="India">India</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Singapore">Singapore</option>
                <option value="Turkey">Turkey</option>
                <option value="Mexico">Mexico</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="Brazil">Brazil</option>
                <option value="South Korea">South Korea</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={fetchRecommendations}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <SafeIcon icon={FiTarget} className="w-4 h-4 mr-2" />
                Get Recommendations
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recommended Treatments
          </h3>
          
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start p-4">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                      <SafeIcon 
                        icon={index === 0 ? FiAward : (index === 1 ? FiShield : FiTarget)} 
                        className={`w-8 h-8 ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-blue-500' : 
                          'text-primary-500'
                        }`} 
                      />
                    </div>
                    {index === 0 && (
                      <div className="bg-yellow-500 text-white text-xs font-medium text-center py-1 mt-1 rounded">
                        Top Match
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {recommendation.treatment_name}
                      </h4>
                      <div className="mt-1 md:mt-0">
                        {renderMatchScore(recommendation.match_score)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {recommendation.recommendation_reason}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
                      <div className="flex items-center">
                        <SafeIcon icon={FiDollarSign} className="w-4 h-4 text-green-500 mr-1" />
                        <span>{formatCurrency(recommendation.estimated_cost)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <SafeIcon icon={FiCheck} className="w-4 h-4 text-blue-500 mr-1" />
                        <span>{recommendation.success_rate}% success</span>
                      </div>
                      
                      <div className="flex items-center">
                        <SafeIcon icon={FiClock} className="w-4 h-4 text-orange-500 mr-1" />
                        <span>2-4 weeks recovery</span>
                      </div>
                      
                      <div className="flex items-center">
                        <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-purple-500 mr-1" />
                        <span>High satisfaction</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewTreatment(recommendation.treatment_id)}
                        className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                      >
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleFindProvider(recommendation.treatment_id)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        Find Provider
                      </button>
                      
                      <button
                        className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        Compare Options
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && !error && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <SafeIcon icon={FiTarget} className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No Recommendations Yet</h3>
          <p className="text-gray-600">Enter your medical condition and preferences to get personalized treatment recommendations</p>
        </div>
      )}
    </div>
  );
};

export default TreatmentRecommendationEngine;