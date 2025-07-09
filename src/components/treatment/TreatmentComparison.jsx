import React, { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { compareTreatments, getTreatmentDetails } from '../../services/treatmentRecommendationService';
import { formatCurrency } from '../../utils/dataUtils';

const { FiInfo, FiDollarSign, FiClock, FiThumbsUp, FiAlertTriangle, FiCheck, FiX, FiCalendar } = FiIcons;

const TreatmentComparison = ({ treatmentIds = [] }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedTreatments, setSelectedTreatments] = useState(treatmentIds);
  const [availableTreatments, setAvailableTreatments] = useState([]);

  // Fetch available treatments for selection
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        // This would normally be a separate API call to get all treatments
        // For demo purposes, we'll use a hardcoded list
        setAvailableTreatments([
          { id: '1', name: 'Hip Replacement' },
          { id: '2', name: 'Knee Replacement' },
          { id: '3', name: 'Dental Implants' },
          { id: '4', name: 'LASIK Eye Surgery' },
          { id: '5', name: 'Gastric Bypass' },
          { id: '6', name: 'Coronary Artery Bypass' },
          { id: '7', name: 'IVF Treatment' },
          { id: '8', name: 'Spinal Fusion' }
        ]);
      } catch (err) {
        console.error('Error fetching treatments:', err);
      }
    };

    fetchTreatments();
  }, []);

  // Load comparison data when selected treatments change
  useEffect(() => {
    if (selectedTreatments.length >= 2) {
      fetchComparisonData();
    }
  }, [selectedTreatments]);

  const fetchComparisonData = async () => {
    if (selectedTreatments.length < 2) {
      setError('Please select at least 2 treatments to compare');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await compareTreatments(selectedTreatments);
      setComparisonData(data);
    } catch (err) {
      setError('Failed to compare treatments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTreatment = (treatmentId) => {
    if (selectedTreatments.includes(treatmentId)) return;
    
    // Limit to max 3 treatments for comparison
    if (selectedTreatments.length >= 3) {
      setSelectedTreatments([...selectedTreatments.slice(1), treatmentId]);
    } else {
      setSelectedTreatments([...selectedTreatments, treatmentId]);
    }
  };

  const handleRemoveTreatment = (treatmentId) => {
    setSelectedTreatments(selectedTreatments.filter(id => id !== treatmentId));
  };

  const handleViewTreatment = (treatmentId) => {
    navigate(`/treatments/${treatmentId}`);
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Treatment Comparison</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Treatment selection */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-800 mb-2">Select Treatments to Compare</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedTreatments.map(id => {
            const treatment = availableTreatments.find(t => t.id === id);
            return (
              <div key={id} className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg flex items-center">
                <span className="mr-2">{treatment?.name || `Treatment ${id}`}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTreatment(id)}
                  className="text-primary-500 hover:text-primary-700"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        <select
          value=""
          onChange={(e) => handleAddTreatment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="" disabled>Add treatment to compare</option>
          {availableTreatments
            .filter(t => !selectedTreatments.includes(t.id))
            .map(treatment => (
              <option key={treatment.id} value={treatment.id}>
                {treatment.name}
              </option>
            ))}
        </select>

        {selectedTreatments.length < 2 && (
          <p className="text-sm text-yellow-600 mt-2">
            <SafeIcon icon={FiInfo} className="w-4 h-4 inline mr-1" />
            Please select at least 2 treatments to compare
          </p>
        )}
      </div>

      {/* Comparison table */}
      {comparisonData && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
                  Criteria
                </th>
                {comparisonData.treatments.map((treatment, index) => (
                  <th key={treatment.id} className="text-left py-3 px-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
                    {treatment.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Cost row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-200 flex items-center">
                  <SafeIcon icon={FiDollarSign} className="w-4 h-4 text-green-600 mr-2" />
                  <span>Estimated Cost</span>
                </td>
                {comparisonData.treatments.map(treatment => (
                  <td key={treatment.id} className="py-3 px-4 border-b border-gray-200">
                    {treatment.min_price ? formatCurrency(treatment.min_price) : 'Varies by location'}
                    {treatment.pricing && treatment.pricing.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Price range across {treatment.pricing.length} destinations
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Success rate row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-200 flex items-center">
                  <SafeIcon icon={FiThumbsUp} className="w-4 h-4 text-blue-600 mr-2" />
                  <span>Success Rate</span>
                </td>
                {comparisonData.treatments.map(treatment => (
                  <td key={treatment.id} className="py-3 px-4 border-b border-gray-200">
                    {treatment.success_rate ? `${treatment.success_rate}%` : 'Not specified'}
                  </td>
                ))}
              </tr>

              {/* Recovery time row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-200 flex items-center">
                  <SafeIcon icon={FiClock} className="w-4 h-4 text-orange-600 mr-2" />
                  <span>Recovery Time</span>
                </td>
                {comparisonData.treatments.map(treatment => (
                  <td key={treatment.id} className="py-3 px-4 border-b border-gray-200">
                    {treatment.recovery_time || 'Varies by patient'}
                  </td>
                ))}
              </tr>

              {/* Risk level row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-200 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-red-600 mr-2" />
                  <span>Risk Level</span>
                </td>
                {comparisonData.treatments.map(treatment => (
                  <td key={treatment.id} className="py-3 px-4 border-b border-gray-200">
                    {treatment.risk_level || 'Not specified'}
                  </td>
                ))}
              </tr>

              {/* Side effects row */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-200 flex items-center">
                  <SafeIcon icon={FiInfo} className="w-4 h-4 text-purple-600 mr-2" />
                  <span>Side Effects</span>
                </td>
                {comparisonData.treatments.map(treatment => (
                  <td key={treatment.id} className="py-3 px-4 border-b border-gray-200">
                    {treatment.side_effects && treatment.side_effects.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm">
                        {treatment.side_effects.slice(0, 3).map((effect, idx) => (
                          <li key={idx}>{effect}</li>
                        ))}
                        {treatment.side_effects.length > 3 && (
                          <li className="text-blue-600 cursor-pointer">+{treatment.side_effects.length - 3} more</li>
                        )}
                      </ul>
                    ) : 'Not specified'}
                  </td>
                ))}
              </tr>

              {/* Actions row */}
              <tr>
                <td className="py-4 px-4"></td>
                {comparisonData.treatments.map(treatment => (
                  <td key={treatment.id} className="py-4 px-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleViewTreatment(treatment.id)}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        Find Providers
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!comparisonData && selectedTreatments.length >= 2 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <SafeIcon icon={FiInfo} className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No Comparison Data Available</h3>
          <p className="text-gray-600 mb-4">We couldn't find comparison data for the selected treatments</p>
          <button
            onClick={fetchComparisonData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TreatmentComparison;