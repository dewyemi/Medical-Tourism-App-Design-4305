import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getProviderProfile, requestProviderAppointment } from '../../services/providerMatchingService';

const { 
  FiUser, FiStar, FiAward, FiCalendar, FiMapPin, FiClock, 
  FiMail, FiPhone, FiGlobe, FiCheckCircle, FiBookOpen, FiMessageSquare 
} = FiIcons;

const ProviderProfile = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    treatmentId: '',
    preferredDate: '',
    notes: ''
  });

  useEffect(() => {
    if (providerId) {
      fetchProviderProfile();
    }
  }, [providerId]);

  const fetchProviderProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProviderProfile(providerId);
      setProvider(data);
    } catch (err) {
      setError('Failed to load provider profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAppointment = async () => {
    if (!appointmentData.treatmentId || !appointmentData.preferredDate) {
      return;
    }

    try {
      setLoading(true);
      await requestProviderAppointment(
        providerId,
        appointmentData.treatmentId,
        appointmentData.preferredDate,
        appointmentData.notes
      );
      setShowAppointmentModal(false);
      // Show success message or redirect
      navigate('/appointments');
    } catch (err) {
      setError('Failed to request appointment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <SafeIcon icon={FiIcons.FiAlertTriangle} className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Provider</h3>
          <p className="text-gray-600 mb-4">{error || 'Provider not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { basic_profile, provider_profile, expertise, availability, reviews, statistics } = provider;

  return (
    <div className="space-y-6">
      {/* Provider Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 -mt-16 flex justify-center md:justify-start">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                {provider_profile?.profile_image_url ? (
                  <img 
                    src={provider_profile.profile_image_url} 
                    alt={basic_profile?.first_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                    <SafeIcon icon={FiUser} className="w-16 h-16 text-primary-500" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-3/4 mt-4 md:mt-0 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Dr. {basic_profile?.first_name} {basic_profile?.last_name}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {provider_profile?.specializations?.join(', ') || provider_profile?.provider_type || 'Medical Professional'}
                  </p>
                </div>
                
                <div className="mt-3 md:mt-0 flex flex-col md:items-end">
                  <div className="flex items-center justify-center md:justify-end">
                    <div className="flex items-center mr-3">
                      <SafeIcon icon={FiStar} className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-bold text-lg">{statistics.avg_rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({statistics.review_count} reviews)</span>
                    </div>
                    {provider_profile?.verified && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <SafeIcon icon={FiCheckCircle} className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {statistics.expertise_count} procedures • {provider_profile?.experience_years || expertise[0]?.years_experience} years experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 px-2">
        <button
          onClick={() => setShowAppointmentModal(true)}
          className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
        >
          <SafeIcon icon={FiCalendar} className="w-5 h-5 mr-2" />
          Schedule Consultation
        </button>
        
        <button
          className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
        >
          <SafeIcon icon={FiMessageSquare} className="w-5 h-5 mr-2" />
          Send Message
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'overview' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('expertise')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'expertise' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Expertise
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'availability' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Availability
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'reviews' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({statistics.review_count})
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Dr. {basic_profile?.first_name} {basic_profile?.last_name}</h3>
              <p className="text-gray-700 mb-6">
                {provider_profile?.bio || 
                  `Dr. ${basic_profile?.first_name} ${basic_profile?.last_name} is a highly skilled healthcare provider with ${provider_profile?.experience_years || expertise[0]?.years_experience} years of experience. Their practice focuses on delivering exceptional patient care with a strong emphasis on patient education and comfort.`
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                        <SafeIcon icon={FiMail} className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{basic_profile?.email || 'Contact via platform'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                        <SafeIcon icon={FiPhone} className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{basic_profile?.phone_number || 'Contact via platform'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                        <SafeIcon icon={FiMapPin} className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{basic_profile?.city}{basic_profile?.country ? `, ${basic_profile.country}` : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Qualifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
                        <SafeIcon icon={FiAward} className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Certifications</p>
                        <p className="font-medium">
                          {provider_profile?.certifications?.join(', ') || 'Board Certified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-3">
                        <SafeIcon icon={FiBookOpen} className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Education</p>
                        <p className="font-medium">
                          {provider_profile?.education?.university || 'Medical University'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mr-3">
                        <SafeIcon icon={FiGlobe} className="w-5 h-5 text-teal-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Languages</p>
                        <p className="font-medium">
                          {provider_profile?.languages?.join(', ') || 'English'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Statistics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary-600">{provider_profile?.success_rate || expertise[0]?.success_rate || 95}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary-600">{provider_profile?.total_patients || 500}+</p>
                    <p className="text-sm text-gray-600">Patients Treated</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary-600">{provider_profile?.experience_years || expertise[0]?.years_experience}</p>
                    <p className="text-sm text-gray-600">Years Experience</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary-600">{statistics.expertise_count}</p>
                    <p className="text-sm text-gray-600">Specialties</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'expertise' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Expertise</h3>
              
              {expertise.length === 0 ? (
                <p className="text-gray-600 italic">No expertise information available</p>
              ) : (
                <div className="space-y-6">
                  {expertise.map(exp => (
                    <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="p-2 bg-primary-50 rounded-lg mr-4">
                          <SafeIcon icon={FiIcons.FiActivity} className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{exp.treatment?.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{exp.treatment?.category}</p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="flex items-center">
                              <SafeIcon icon={FiClock} className="w-4 h-4 text-blue-500 mr-1" />
                              <span className="text-sm">{exp.years_experience} years</span>
                            </div>
                            <div className="flex items-center">
                              <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-green-500 mr-1" />
                              <span className="text-sm">{exp.procedures_performed}+ procedures</span>
                            </div>
                            <div className="flex items-center">
                              <SafeIcon icon={FiThumbsUp} className="w-4 h-4 text-purple-500 mr-1" />
                              <span className="text-sm">{exp.success_rate}% success rate</span>
                            </div>
                            <div className="flex items-center">
                              <SafeIcon icon={FiAward} className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-sm capitalize">{exp.expertise_level} level</span>
                            </div>
                          </div>
                          
                          {exp.specialization_details && (
                            <p className="text-sm text-gray-700">
                              {exp.specialization_details}
                            </p>
                          )}
                          
                          {exp.certifications && exp.certifications.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Certifications:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {exp.certifications.map((cert, idx) => (
                                  <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'availability' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Schedule</h3>
              
              {availability.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-md font-medium text-gray-800 mb-1">No Availability Information</h4>
                  <p className="text-gray-600 mb-4">The provider hasn't set their availability schedule yet</p>
                  <button
                    onClick={() => setShowAppointmentModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg"
                  >
                    Request Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                      <div key={day} className="text-center font-medium text-gray-700">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Availability slots */}
                  <div className="grid grid-cols-7 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                      const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
                      const hasAvailability = dayAvailability.length > 0;
                      
                      return (
                        <div 
                          key={dayOfWeek} 
                          className={`rounded-lg p-2 text-center min-h-[100px] border ${
                            hasAvailability ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          {hasAvailability ? (
                            <div className="space-y-1">
                              {dayAvailability.map((slot, idx) => (
                                <div 
                                  key={idx} 
                                  className="bg-white rounded px-1 py-0.5 text-xs border border-green-200"
                                >
                                  {new Date(`2000-01-01T${slot.start_time}`).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                  {' - '}
                                  {new Date(`2000-01-01T${slot.end_time}`).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              ))}
                              <button className="text-xs text-primary-600 hover:underline mt-1">
                                Book
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Not Available</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-blue-700">
                      <SafeIcon icon={FiInfo} className="w-4 h-4 inline mr-1" />
                      The provider may have additional availability not shown here. Request an appointment for more options.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Reviews</h3>
              
              {reviews.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <SafeIcon icon={FiStar} className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-md font-medium text-gray-800 mb-1">No Reviews Yet</h4>
                  <p className="text-gray-600">Be the first to leave a review for this provider</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          {review.user_profile?.avatar_url ? (
                            <img 
                              src={review.user_profile.avatar_url} 
                              alt="Reviewer" 
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">
                              {review.is_anonymous ? 'Anonymous Patient' : 
                                review.user_profile?.first_name ? 
                                  `${review.user_profile.first_name} ${review.user_profile.last_name?.charAt(0) || ''}` : 
                                  review.user?.email?.split('@')[0] || 'Patient'
                              }
                            </h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <SafeIcon 
                                  key={i} 
                                  icon={FiStar} 
                                  className={`w-4 h-4 ${i < review.overall_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{review.review_text}</p>
                          
                          {/* Review details */}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="font-medium mr-1">Communication:</span>
                              <span>{review.communication_rating}/5</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="font-medium mr-1">Knowledge:</span>
                              <span>{review.knowledge_rating}/5</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="font-medium mr-1">Bedside Manner:</span>
                              <span>{review.bedside_manner_rating}/5</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="font-medium mr-1">Wait Time:</span>
                              <span>{review.wait_time_rating}/5</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                            {review.would_recommend && (
                              <div className="flex items-center text-green-600 text-xs">
                                <SafeIcon icon={FiThumbsUp} className="w-3 h-3 mr-1" />
                                Would recommend
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Request Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Request Appointment</h2>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiIcons.FiX} className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment
                </label>
                <select
                  value={appointmentData.treatmentId}
                  onChange={(e) => setAppointmentData({...appointmentData, treatmentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a treatment</option>
                  {expertise.map(exp => (
                    <option key={exp.treatment_id} value={exp.treatment_id}>
                      {exp.treatment?.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={appointmentData.preferredDate}
                  onChange={(e) => setAppointmentData({...appointmentData, preferredDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={appointmentData.notes}
                  onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Any specific concerns or questions you'd like to discuss..."
                ></textarea>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAppointment}
                  disabled={!appointmentData.treatmentId || !appointmentData.preferredDate}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400"
                >
                  Request Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;