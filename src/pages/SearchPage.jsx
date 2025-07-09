import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { searchDestinations } from '../services/destinationService';
import { searchTreatments } from '../services/treatmentService';
import Layout from '../components/Layout';

const { FiSearch, FiX, FiFilter, FiMapPin, FiActivity } = FiIcons;

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ destinations: [], treatments: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    destinationCountry: '',
    treatmentCategory: ''
  });

  // Get unique filter options
  const countries = [...new Set(results.destinations.map(d => d.country))].sort();
  const categories = [...new Set(results.treatments.map(t => t.category))].sort();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query.trim()) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (term) => {
    if (!term || term.trim().length < 2) return;
    
    setIsLoading(true);
    try {
      const [destinationsData, treatmentsData] = await Promise.all([
        searchDestinations(term),
        searchTreatments(term)
      ]);
      
      setResults({
        destinations: destinationsData || [],
        treatments: treatmentsData || []
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      setSearchParams({ q: searchTerm });
      performSearch(searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResults({ destinations: [], treatments: [] });
    setSearchParams({});
  };

  const filteredResults = () => {
    let filtered = { ...results };
    
    if (filters.destinationCountry) {
      filtered.destinations = filtered.destinations.filter(
        d => d.country === filters.destinationCountry
      );
    }
    
    if (filters.treatmentCategory) {
      filtered.treatments = filtered.treatments.filter(
        t => t.category === filters.treatmentCategory
      );
    }
    
    if (activeTab === 'destinations') {
      filtered.treatments = [];
    } else if (activeTab === 'treatments') {
      filtered.destinations = [];
    }
    
    return filtered;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const displayResults = filteredResults();
  const totalResults = displayResults.destinations.length + displayResults.treatments.length;
  const hasSearched = searchTerm.trim().length >= 2;

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="mb-6">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search destinations or treatments..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
          
          {hasSearched && (
            <div className="flex mt-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'}`}
              >
                All Results
              </button>
              <button
                onClick={() => setActiveTab('destinations')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'destinations' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'}`}
              >
                Destinations
              </button>
              <button
                onClick={() => setActiveTab('treatments')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'treatments' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'}`}
              >
                Treatments
              </button>
            </div>
          )}
        </div>

        {/* Filter controls - only show when we have search results */}
        {hasSearched && totalResults > 0 && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Filters</h3>
              {(filters.destinationCountry || filters.treatmentCategory) && (
                <button 
                  onClick={() => setFilters({ destinationCountry: '', treatmentCategory: '' })}
                  className="text-xs text-primary-600"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {(activeTab === 'all' || activeTab === 'destinations') && countries.length > 0 && (
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Country</label>
                <select
                  value={filters.destinationCountry}
                  onChange={(e) => handleFilterChange('destinationCountry', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            )}
            
            {(activeTab === 'all' || activeTab === 'treatments') && categories.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Treatment Category</label>
                <select
                  value={filters.treatmentCategory}
                  onChange={(e) => handleFilterChange('treatmentCategory', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* No results */}
        {hasSearched && !isLoading && totalResults === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-xl">
            <SafeIcon icon={FiSearch} className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">
              We couldn't find any matches for "{searchTerm}"
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Try:</p>
              <ul className="text-sm text-gray-500 list-disc list-inside mb-4">
                <li>Using more general keywords</li>
                <li>Checking for typos or misspellings</li>
                <li>Searching for a related term</li>
              </ul>
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && totalResults > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchTerm}"
            </h3>
            
            {/* Destinations */}
            {displayResults.destinations.length > 0 && (
              <div className="mb-8">
                {activeTab !== 'treatments' && (
                  <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                    Destinations
                  </h4>
                )}
                <div className="space-y-4">
                  {displayResults.destinations.map(destination => (
                    <div
                      key={destination.id}
                      onClick={() => navigate(`/destinations/${destination.id}`)}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start p-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <SafeIcon icon={FiMapPin} className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-semibold text-gray-900">{destination.name}</h5>
                            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                              <SafeIcon icon={FiIcons.FiStar} className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs font-medium text-yellow-700">{destination.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{destination.city}, {destination.country}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {destination.description || 'Premier healthcare destination offering world-class medical services.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Treatments */}
            {displayResults.treatments.length > 0 && (
              <div>
                {activeTab !== 'destinations' && (
                  <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                    Treatments
                  </h4>
                )}
                <div className="space-y-4">
                  {displayResults.treatments.map(treatment => (
                    <div
                      key={treatment.id}
                      onClick={() => navigate(`/treatments/${treatment.id}`)}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start p-4">
                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <SafeIcon icon={FiActivity} className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">{treatment.name}</h5>
                          <div className="flex items-center mb-2">
                            <span className="text-sm text-gray-600 mr-2">{treatment.category}</span>
                            <span className="text-xs text-primary-600">{treatment.procedure_count}+ procedures</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {treatment.description || 'Advanced medical treatment performed by skilled specialists.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;