import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../components/AuthProvider';
import { getUserProfile } from '../services/profileService';
import { getUserBookings } from '../services/bookingService';
import { getUserReviews } from '../services/reviewService';

const { 
  FiUser, FiSettings, FiHelpCircle, FiLogOut, 
  FiFileText, FiCalendar, FiCreditCard, FiEdit,
  FiStar, FiMapPin, FiActivity
} = FiIcons;

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    bookingsCount: 0,
    reviewsCount: 0,
    countriesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile and stats data in parallel
        const [profileData, bookings, reviews] = await Promise.all([
          getUserProfile(),
          getUserBookings(),
          getUserReviews()
        ]);
        
        setProfile(profileData);
        
        // Calculate stats
        const uniqueCountries = new Set(
          bookings.map(booking => booking.destination?.country).filter(Boolean)
        );
        
        setStats({
          bookingsCount: bookings.length,
          reviewsCount: reviews.length,
          countriesCount: uniqueCountries.size
        });
        
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  const menuItems = [
    {
      icon: FiFileText,
      label: 'My Bookings',
      color: 'text-blue-600',
      action: () => navigate('/bookings')
    },
    {
      icon: FiCalendar,
      label: 'Appointments',
      color: 'text-green-600',
      action: () => navigate('/bookings')
    },
    {
      icon: FiStar,
      label: 'My Reviews',
      color: 'text-yellow-600',
      action: () => {}
    },
    {
      icon: FiCreditCard,
      label: 'Payment Methods',
      color: 'text-purple-600',
      action: () => {}
    },
    {
      icon: FiSettings,
      label: 'Settings',
      color: 'text-gray-600',
      action: () => {}
    },
    {
      icon: FiHelpCircle,
      label: 'Help & Support',
      color: 'text-orange-600',
      action: () => {}
    },
    {
      icon: FiLogOut,
      label: 'Logout',
      color: 'text-red-600',
      action: signOut
    },
  ];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 relative">
        <button 
          onClick={() => navigate('/profile/edit')} 
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"
          aria-label="Edit profile"
        >
          <SafeIcon icon={FiEdit} className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
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
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
            
            {(profile?.city || profile?.country) && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1" />
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </div>
            )}
            
            <p className="text-sm text-primary-600 font-medium mt-1">Premium Member</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Quick Stats</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-primary-600">{stats.bookingsCount}</p>
            <p className="text-xs text-gray-500">Bookings</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <SafeIcon icon={FiActivity} className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.bookingsCount > 0 ? '$2,400' : '$0'}
            </p>
            <p className="text-xs text-gray-500">Saved</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <SafeIcon icon={FiMapPin} className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.countriesCount}</p>
            <p className="text-xs text-gray-500">Countries</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full flex items-center space-x-4 p-4 border-b border-gray-100 last:border-b-0"
          >
            <SafeIcon icon={item.icon} className={`w-5 h-5 ${item.color}`} />
            <span className="flex-1 text-left font-medium text-gray-700">{item.label}</span>
            <SafeIcon icon={FiIcons.FiChevronRight} className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Profile;