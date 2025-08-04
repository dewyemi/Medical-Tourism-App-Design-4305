import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';

const PaymentContext = createContext(null);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const { user } = useAuth();
  const [currencies, setCurrencies] = useState([]);
  const [momoProviders, setMomoProviders] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [loadingMomoProviders, setLoadingMomoProviders] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(true);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  
  // Initialize Stripe
  useEffect(() => {
    // Load Stripe.js dynamically
    const loadStripe = async () => {
      if (window.Stripe) {
        setStripeLoaded(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => setStripeLoaded(true);
      document.body.appendChild(script);
    };
    
    loadStripe();
  }, []);
  
  // Load currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoadingCurrencies(true);
        const { data, error } = await supabase
          .from('currencies_emirafrik')
          .select('*')
          .eq('is_active', true)
          .order('code');
        
        if (error) throw error;
        setCurrencies(data);
        
        // Set default currency based on user preference or default to USD
        if (user) {
          const { data: profileData } = await supabase
            .from('user_profiles_meditravel')
            .select('preferred_currency')
            .eq('id', user.id)
            .single();
            
          if (profileData?.preferred_currency) {
            setSelectedCurrency(profileData.preferred_currency);
          }
        }
      } catch (error) {
        console.error('Error loading currencies:', error);
      } finally {
        setLoadingCurrencies(false);
      }
    };
    
    fetchCurrencies();
  }, [user]);
  
  // Load MoMo providers
  useEffect(() => {
    const fetchMomoProviders = async () => {
      try {
        setLoadingMomoProviders(true);
        const { data, error } = await supabase
          .from('momo_providers_emirafrik')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (error) throw error;
        setMomoProviders(data);
      } catch (error) {
        console.error('Error loading MoMo providers:', error);
      } finally {
        setLoadingMomoProviders(false);
      }
    };
    
    fetchMomoProviders();
  }, []);
  
  // Load payment history when user is authenticated
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user) return;
      
      try {
        setLoadingPaymentHistory(true);
        const { data, error } = await supabase
          .from('payments_emirafrik')
          .select(`
            *,
            booking:booking_id(
              id, 
              booking_date, 
              destination:destination_id(name, city, country),
              treatment:treatment_id(name, category)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPaymentHistory(data || []);
      } catch (error) {
        console.error('Error loading payment history:', error);
      } finally {
        setLoadingPaymentHistory(false);
      }
    };
    
    fetchPaymentHistory();
  }, [user]);
  
  // Update user's preferred currency
  const updatePreferredCurrency = async (currencyCode) => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_profiles_meditravel')
        .update({ preferred_currency: currencyCode })
        .eq('id', user.id);
      
      setSelectedCurrency(currencyCode);
    } catch (error) {
      console.error('Error updating preferred currency:', error);
    }
  };
  
  // Create a new payment
  const createPayment = async (paymentData) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const { data, error } = await supabase
        .from('payments_emirafrik')
        .insert({
          ...paymentData,
          user_id: user.id,
          currency: selectedCurrency,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh payment history
      const { data: updatedHistory, error: historyError } = await supabase
        .from('payments_emirafrik')
        .select(`
          *,
          booking:booking_id(
            id, 
            booking_date, 
            destination:destination_id(name, city, country),
            treatment:treatment_id(name, category)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!historyError) {
        setPaymentHistory(updatedHistory || []);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };
  
  // Process Stripe payment
  const processStripePayment = async (bookingId, amount, metadata = {}) => {
    if (!stripeLoaded) throw new Error('Stripe not loaded');
    
    try {
      // Create payment record
      const payment = await createPayment({
        booking_id: bookingId,
        amount,
        payment_method: 'stripe',
        payment_status: 'pending',
        metadata
      });
      
      // Call serverless function to initialize Stripe payment
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: selectedCurrency,
          payment_id: payment.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize Stripe payment');
      }
      
      const { clientSecret } = await response.json();
      
      // Initialize Stripe Elements
      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      
      return {
        paymentId: payment.id,
        stripe,
        clientSecret
      };
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      throw error;
    }
  };
  
  // Process Cryptocurrency payment
  const processCryptoPayment = async (bookingId, amount, currency, cryptoCurrency, metadata = {}) => {
    try {
      // Create payment record
      const payment = await createPayment({
        booking_id: bookingId,
        amount,
        payment_method: 'crypto',
        provider: cryptoCurrency,
        payment_status: 'pending',
        metadata: {
          ...metadata,
          crypto_currency: cryptoCurrency,
          original_currency: currency
        }
      });

      // Get crypto wallet address for the selected currency
      const { data: walletData, error: walletError } = await supabase
        .from('crypto_wallets_emirafrik')
        .select('*')
        .eq('currency', cryptoCurrency)
        .eq('is_active', true)
        .single();

      if (walletError) throw new Error('Crypto wallet not available');

      // Convert amount to crypto (this would normally use real-time exchange rates)
      const cryptoRates = {
        'BTC': 43000,
        'ETH': 2600,
        'USDT': 1,
        'USDC': 1
      };
      
      const cryptoAmount = amount / (cryptoRates[cryptoCurrency] || 1);

      return {
        paymentId: payment.id,
        walletAddress: walletData.address,
        cryptoAmount,
        cryptoCurrency,
        network: walletData.network,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      };
    } catch (error) {
      console.error('Error processing crypto payment:', error);
      throw error;
    }
  };

  // Create Payment Plan
  const createPaymentPlan = async (planData) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const response = await fetch('/api/create-payment-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...planData,
          user_id: user.id,
          currency: selectedCurrency
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment plan');
      }

      const paymentPlan = await response.json();
      return paymentPlan;
    } catch (error) {
      console.error('Error creating payment plan:', error);
      throw error;
    }
  };

  // Get crypto wallets
  const getCryptoWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_wallets_emirafrik')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching crypto wallets:', error);
      throw error;
    }
  };
  const processMomoPayment = async (bookingId, amount, provider, phoneNumber, metadata = {}) => {
    try {
      // Create payment record
      const payment = await createPayment({
        booking_id: bookingId,
        amount,
        payment_method: 'momo',
        provider,
        payment_status: 'pending',
        metadata: {
          ...metadata,
          phone_number: phoneNumber
        }
      });
      
      // Call serverless function to initialize MoMo payment
      const response = await fetch('/api/create-momo-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: selectedCurrency,
          payment_id: payment.id,
          provider,
          phone_number: phoneNumber
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize Mobile Money payment');
      }
      
      const { reference, instructions } = await response.json();
      
      return {
        paymentId: payment.id,
        reference,
        instructions
      };
    } catch (error) {
      console.error('Error processing Mobile Money payment:', error);
      throw error;
    }
  };
  
  // Get currency symbol
  const getCurrencySymbol = (code) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '$';
  };
  
  // Format currency
  const formatCurrency = (amount, currencyCode = selectedCurrency) => {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toFixed(2)}`;
  };
  
  const value = {
    currencies,
    loadingCurrencies,
    selectedCurrency,
    setSelectedCurrency: updatePreferredCurrency,
    momoProviders,
    loadingMomoProviders,
    paymentHistory,
    loadingPaymentHistory,
    stripeLoaded,
    processStripePayment,
    processMomoPayment,
    processCryptoPayment,
    createPaymentPlan,
    getCryptoWallets,
    formatCurrency,
    getCurrencySymbol
  };
  
  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentContext;