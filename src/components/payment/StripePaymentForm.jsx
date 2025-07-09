import React, { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { usePayment } from '../../contexts/PaymentContext';
import { useLanguage } from '../../contexts/LanguageContext';

const { FiCreditCard, FiLock, FiCheck, FiAlertCircle } = FiIcons;

const StripePaymentForm = ({ bookingId, amount, onSuccess, onError }) => {
  const { t } = useLanguage();
  const { processStripePayment, formatCurrency, stripeLoaded } = usePayment();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [stripeElements, setStripeElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  
  useEffect(() => {
    if (!stripeLoaded) return;
    
    const initializeStripe = async () => {
      try {
        setLoading(true);
        
        // Initialize Stripe payment
        const { stripe, clientSecret } = await processStripePayment(bookingId, amount);
        
        // Create Elements instance
        const elements = stripe.elements();
        
        // Create Card Element
        const card = elements.create('card', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '16px',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a',
            },
          },
        });
        
        // Mount Card Element
        card.mount('#card-element');
        
        // Listen for errors
        card.on('change', (event) => {
          setError(event.error ? event.error.message : null);
        });
        
        setStripeElements({ stripe, elements, clientSecret });
        setCardElement(card);
        
      } catch (err) {
        console.error('Error initializing Stripe:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initializeStripe();
    
    // Cleanup function
    return () => {
      if (cardElement) {
        cardElement.unmount();
      }
    };
  }, [stripeLoaded, bookingId, amount, processStripePayment]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripeElements || !cardElement) {
      setError('Payment system not initialized');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { stripe, clientSecret } = stripeElements;
      
      // Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });
      
      if (result.error) {
        throw result.error;
      } else if (result.paymentIntent.status === 'succeeded') {
        setPaymentComplete(true);
        if (onSuccess) onSuccess(result.paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (paymentComplete) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <SafeIcon icon={FiCheck} className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {t('payment.successful')}
        </h3>
        <p className="text-gray-600 mb-4">
          {t('payment.successMessage')}
        </p>
        <div className="text-green-700 font-bold text-xl">
          {formatCurrency(amount)}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('payment.cardPayment')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('payment.securePayment')}
          </p>
        </div>
        <div className="text-xl font-bold text-primary-600">
          {formatCurrency(amount)}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-start">
          <SafeIcon icon={FiAlertCircle} className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payment.cardDetails')}
          </label>
          <div className="border border-gray-300 rounded-lg p-3.5 bg-white">
            {/* Stripe Card Element will be mounted here */}
            <div id="card-element"></div>
          </div>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <SafeIcon icon={FiLock} className="w-3 h-3 mr-1" />
            {t('payment.secureInfo')}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !stripeLoaded}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              {t('payment.processing')}
            </>
          ) : (
            <>
              <SafeIcon icon={FiCreditCard} className="w-5 h-5 mr-2" />
              {t('payment.payNow')}
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 flex justify-center">
        <img 
          src="https://res.cloudinary.com/dbwmirzyk/image/upload/v1651234567/payment-providers_gqwzoj.png" 
          alt="Payment providers" 
          className="h-6"
        />
      </div>
    </div>
  );
};

export default StripePaymentForm;