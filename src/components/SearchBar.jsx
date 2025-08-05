import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { searchDestinations } from '../services/destinationService';
import { searchTreatments } from '../services/treatmentService';

const { FiSearch, FiX, FiMapPin, FiActivity } = FiIcons;

const SearchBar = ({ onClose, isFullScreen = false }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ destinations: [], treatments: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults({ destinations: [], treatments: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) return;

    setIsLoading(true);
    try {
      const [destinationsData, treatmentsData] = await Promise.all([
        searchDestinations(searchTerm),
        searchTreatments(searchTerm)
      ]);

      setSearchResults({
        destinations: destinationsData || [],
        treatments: treatmentsData || []
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDestination = (destination) => {
    navigate(`/destinations/${destination.id}`);
    if (onClose) onClose();
  };

  const handleSelectTreatment = (treatment) => {
    navigate(`/treatments/${treatment.id}`);
    if (onClose) onClose();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults({ destinations: [], treatments: [] });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const filteredResults = () => {
    if (activeTab === 'all') {
      return {
        destinations: searchResults.destinations,
        treatments: searchResults.treatments
      };
    } else if (activeTab === 'destinations') {
      return {
        destinations: searchResults.destinations,
        treatments: []
      };
    } else {
      return {
        destinations: [],
        treatments: searchResults.treatments
      };
    }
  };

  const results = filteredResults();
  const totalResults = results.destinations.length + results.treatments.length;

  return (
    <div className={`bg-white ${isFullScreen ? 'h-full' : 'rounded-xl shadow-lg'}`}>
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search destinations or treatments..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {searchTerm && (
            <button 
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {searchTerm.length >= 2 && (
          <div className="flex mt-3 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setActiveTab('destinations')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'destinations' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              Destinations ({results.destinations.length})
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'treatments' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              Treatments ({results.treatments.length})
            </button>
          </div>
        )}
      </div>

      <div className={`${isFullScreen ? 'max-h-[calc(100vh-150px)]' : 'max-h-80'} overflow-y-auto`}>
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 mb-2"></div>
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : (
          <>
            {searchTerm.length >= 2 && totalResults === 0 && (
              <div className="p-4 text-center">
                <p className="text-gray-500">No results found for "{searchTerm}"</p>
              </div>
            )}

            {results.destinations.length > 0 && (
              <div>
                {activeTab !== 'treatments' && (
                  <div className="p-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                    Destinations
                  </div>
                )}
                {results.destinations.map(destination => (
                  <div
                    key={destination.id}
                    onClick={() => handleSelectDestination(destination)}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <SafeIcon icon={FiMapPin} className="text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{destination.name}</h4>
                        <p className="text-sm text-gray-500">{destination.city}, {destination.country}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.treatments.length > 0 && (
              <div>
                {activeTab !== 'destinations' && (
                  <div className="p-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                    Treatments
                  </div>
                )}
                {results.treatments.map(treatment => (
                  <div
                    key={treatment.id}
                    onClick={() => handleSelectTreatment(treatment)}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <SafeIcon icon={FiActivity} className="text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                        <p className="text-sm text-gray-500">{treatment.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchBar;