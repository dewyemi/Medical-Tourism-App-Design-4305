// Application configuration
export const config = {
  // Environment settings
  development: {
    enableFallbacks: true,
    logLevel: 'debug',
    enableMockData: true
  },
  production: {
    enableFallbacks: true,
    logLevel: 'error',
    enableMockData: false
  },
  
  // Feature flags
  features: {
    offlineMode: true,
    realTimeUpdates: true,
    analyticsTracking: true,
    paymentProcessing: true,
    multiLanguage: true
  },
  
  // API configuration
  api: {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // UI configuration
  ui: {
    chunkSizeWarningLimit: 1000,
    enableLazyLoading: true,
    enableCodeSplitting: true
  },
  
  // Default values
  defaults: {
    language: 'en',
    currency: 'USD',
    theme: 'light',
    pageSize: 20
  }
};

// Get current environment
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Get current config
export const getCurrentConfig = () => {
  return isDevelopment ? config.development : config.production;
};

// Utility to safely log based on environment
export const safeLog = (level, message, data = null) => {
  const currentConfig = getCurrentConfig();
  
  if (currentConfig.logLevel === 'debug' || 
      (currentConfig.logLevel === 'error' && level === 'error')) {
    if (data) {
      console[level](message, data);
    } else {
      console[level](message);
    }
  }
};