import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/profileService';
import { getProviderApplication } from '../services/providerService';

const { FiUser, FiShield, FiSettings, FiEdit, FiMapPin, FiMail, FiPhone, FiCalendar, FiClock } = FiIcons;

const UserProfileWithRole = () => {
  const { user, userRoles, isAdmin, isHealthcareProvider } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [providerApplication, setProviderApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileData = await getUserProfile();
        setProfile(profileData);

        // If user has healthcare provider role or application, fetch provider data
        if (isHealthcareProvider || userRoles.includes('healthcare_provider')) {
          try {
            const applicationData = await getProviderApplication();
            setProviderApplication(applicationData);
          } catch (err) {
            // No application found, which is fine
          }
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isHealthcareProvider, userRoles]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'healthcare_provider':
        return 'bg-blue-100 text-blue-800';
      case 'patient':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return FiIcons.FiShield;
      case 'healthcare_provider':
        return FiIcons.FiUserCheck;
      case 'patient':
        return FiIcons.FiUser;
      default:
        return FiIcons.FiUser;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Main Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
        <button
          onClick={() => navigate('/profile/edit')}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          aria-label="Edit profile"
        >
          <SafeIcon icon={FiEdit} className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <SafeIcon icon={FiUser} className="w-10 h-10 text-primary-600" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : user?.email?.split('@')[0] || 'User'
                }
              </h2>
              
              {/* Role Badges */}
              <div className="flex flex-wrap gap-1">
                {userRoles.map(role => {
                  const RoleIcon = getRoleIcon(role);
                  return (
                    <div
                      key={role}
                      className={`flex items-center px-2 py-1 text-xs rounded-full ${getRoleColor(role)}`}
                    >
                      <SafeIcon icon={RoleIcon} className="w-3 h-3 mr-1" />
                      {role.replace('_', ' ')}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <SafeIcon icon={FiMail} className="w-4 h-4 mr-2" />
                {user?.email}
              </div>
              
              {profile?.phone_number && (
                <div className="flex items-center">
                  <SafeIcon icon={FiPhone} className="w-4 h-4 mr-2" />
                  {profile.phone_number}
                </div>
              )}
              
              {(profile?.city || profile?.country) && (
                <div className="flex items-center">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2" />
                  {[profile.city, profile.country].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Healthcare Provider Information */}
      {isHealthcareProvider && providerApplication && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Healthcare Provider Details</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              providerApplication.status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : providerApplication.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {providerApplication.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Specialization</p>
              <p className="text-blue-900">{providerApplication.specialization}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">License Number</p>
              <p className="text-blue-900">{providerApplication.license_number}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Experience</p>
              <p className="text-blue-900">{providerApplication.years_experience} years</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Institution</p>
              <p className="text-blue-900">{providerApplication.institution}</p>
            </div>
          </div>
          
          {providerApplication.bio && (
            <div className="mt-4">
              <p className="text-sm font-medium text-blue-700 mb-1">Professional Bio</p>
              <p className="text-blue-900 text-sm">{providerApplication.bio}</p>
            </div>
          )}
        </div>
      )}

      {/* Admin Access */}
      {isAdmin && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Admin Access</h3>
              <p className="text-red-700 text-sm">
                You have administrator privileges. Access the admin dashboard to manage users, roles, and system settings.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Account Actions</h3>
        </div>
        
        <div className="p-4 space-y-3">
          <button
            onClick={() => navigate('/profile/edit')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <SafeIcon icon={FiEdit} className="w-5 h-5 text-gray-600 mr-3" />
              <span className="font-medium text-gray-700">Edit Profile</span>
            </div>
            <SafeIcon icon={FiIcons.FiChevronRight} className="w-5 h-5 text-gray-400" />
          </button>
          
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <SafeIcon icon={FiSettings} className="w-5 h-5 text-gray-600 mr-3" />
              <span className="font-medium text-gray-700">Account Settings</span>
            </div>
            <SafeIcon icon={FiIcons.FiChevronRight} className="w-5 h-5 text-gray-400" />
          </button>
          
          {!isHealthcareProvider && !userRoles.includes('healthcare_provider') && (
            <button
              onClick={() => navigate('/provider-signup')}
              className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <SafeIcon icon={FiIcons.FiUserPlus} className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-700">Apply as Healthcare Provider</span>
              </div>
              <SafeIcon icon={FiIcons.FiChevronRight} className="w-5 h-5 text-blue-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileWithRole;