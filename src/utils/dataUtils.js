/**
 * Utility functions for data management
 */

// Format currency values
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date to a human-readable format
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format date and time
export const formatDateTime = (dateTimeString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateTimeString).toLocaleString('en-US', options);
};

// Generate booking reference number
export const generateBookingReference = (bookingId) => {
  // Take first 8 characters of the UUID and add timestamp
  const prefix = bookingId.substring(0, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `MT-${prefix}-${timestamp}`;
};

// Calculate savings amount based on original price and savings percentage
export const calculateSavings = (originalPrice, savingsPercentage) => {
  // Remove % sign if present
  const percentage = parseFloat(savingsPercentage.replace('%', ''));
  return (originalPrice * percentage) / 100;
};

// Get status color based on status string
export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    processing: 'bg-purple-100 text-purple-800',
    paid: 'bg-emerald-100 text-emerald-800',
    refunded: 'bg-gray-100 text-gray-800'
  };
  
  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Get icon for status
export const getStatusIcon = (status) => {
  const statusIcons = {
    pending: 'FiClock',
    confirmed: 'FiCheck',
    completed: 'FiCheckCircle',
    cancelled: 'FiXCircle',
    processing: 'FiRefreshCw',
    paid: 'FiDollarSign',
    refunded: 'FiCornerLeftDown'
  };
  
  return statusIcons[status.toLowerCase()] || 'FiCircle';
};

// Truncate long text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Map treatment category to icon
export const getTreatmentIcon = (category) => {
  const categoryIcons = {
    'Heart Care': 'Heart',
    'Eye Care': 'Eye',
    'Oral Health': 'Smile',
    'Bone & Joint': 'Activity',
    'Brain & Nerves': 'Brain',
    'Aesthetic': 'Scissors',
    'Skin': 'Sun',
    'Digestive': 'Coffee',
    'Reproductive': 'Users'
  };
  
  return categoryIcons[category] || 'Activity';
};

// Group data by a specific property
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Sort data by specified field
export const sortByField = (array, field, ascending = true) => {
  const sorted = [...array].sort((a, b) => {
    if (a[field] < b[field]) return ascending ? -1 : 1;
    if (a[field] > b[field]) return ascending ? 1 : -1;
    return 0;
  });
  
  return sorted;
};

// Filter array by search term across multiple fields
export const multiFieldSearch = (array, searchTerm, fields) => {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item => 
    fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};