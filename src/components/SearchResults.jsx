import React from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiActivity, FiStar } = FiIcons;

const SearchResults = ({ results, onItemClick }) => {
  const navigate = useNavigate();
  
  const { destinations = [], treatments = [] } = results;
  const hasResults = destinations.length > 0 || treatments.length > 0;
  
  if (!hasResults) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No results found</p>
      </div>
    );
  }
  
  const handleDestinationClick = (destination) => {
    navigate(`/destinations/${destination.id}`);
    if (onItemClick) onItemClick();
  };
  
  const handleTreatmentClick = (treatment) => {
    navigate(`/treatments/${treatment.id}`);
    if (onItemClick) onItemClick();
  };
  
  return (
    <div className="divide-y divide-gray-100">
      {destinations.length > 0 && (
        <div className="pb-4">
          <h3 className="px-4 pt-4 pb-2 text-sm font-medium text-gray-500">Destinations</h3>
          <div className="space-y-2">
            {destinations.map(destination => (
              <div 
                key={destination.id} 
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleDestinationClick(destination)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    <SafeIcon icon={FiMapPin} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{destination.name}</h4>
                      <div className="flex items-center text-yellow-500">
                        <SafeIcon icon={FiStar} className="w-4 h-4 mr-1 fill-current" />
                        <span className="text-sm">{destination.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{destination.city}, {destination.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {treatments.length > 0 && (
        <div className="pb-4">
          <h3 className="px-4 pt-4 pb-2 text-sm font-medium text-gray-500">Treatments</h3>
          <div className="space-y-2">
            {treatments.map(treatment => (
              <div 
                key={treatment.id} 
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleTreatmentClick(treatment)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                    <SafeIcon icon={FiActivity} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                    <p className="text-sm text-gray-500">{treatment.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;