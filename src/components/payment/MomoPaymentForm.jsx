import { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { usePayment } from '../../contexts/PaymentContext';
import { useLanguage } from '../../contexts/LanguageContext';

const { FiPhone, FiCheck, FiCopy, FiAlertCircle } = FiIcons;

const MomoPaymentForm = ({ bookingId, amount, provider, onSuccess, onError }) => {
  const { t } = useLanguage();
  const { processMomoPayment, formatCurrency, momoProviders } = usePayment();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [reference, setReference] = useState('');
  const [instructions, setInstructions] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Get provider details
  const providerDetails = momoProviders.find(p => p.code === provider);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError(t('payment.enterPhoneNumber'));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Process Mobile Money payment
      const result = await processMomoPayment(
        bookingId,
        amount,
        provider,
        phoneNumber
      );
      
      setReference(result.reference);
      setInstructions(result.instructions);
      setPaymentInitiated(true);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyReference = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleConfirm = () => {
    if (onSuccess) onSuccess({ reference });
  };
  
  if (paymentInitiated) {
    return (
      <div className="p-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <SafeIcon icon={FiPhone} className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t('payment.momoInitiated')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('payment.momoInstructions', { provider: providerDetails?.name || provider })}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              {t('payment.amount')}:
            </span>
            <span className="font-bold text-gray-900">
              {formatCurrency(amount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              {t('payment.phoneNumber')}:
            </span>
            <span className="font-medium text-gray-900">
              {phoneNumber}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">
              {t('payment.reference')}:
            </span>
            <div className="flex items-center">
              <span className="font-medium text-gray-900 mr-2">
                {reference}
              </span>
              <button 
                onClick={handleCopyReference}
                className="p-1.5 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <SafeIcon 
                  icon={copied ? FiCheck : FiCopy} 
                  className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-gray-600'}`} 
                />
              </button>
            </div>
          </div>
        </div>
        
        {instructions && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-blue-800 text-sm">
            <h4 className="font-medium mb-2">{t('payment.followSteps')}:</h4>
            <div dangerouslySetInnerHTML={{ __html: instructions }}></div>
          </div>
        )}
        
        <button
          onClick={handleConfirm}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <SafeIcon icon={FiCheck} className="w-5 h-5 mr-2 inline-block" />
          {t('payment.confirmPayment')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('payment.mobileMoney')}
          </h3>
          <p className="text-sm text-gray-500">
            {providerDetails?.name || provider}
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
            {t('payment.mobileNumber')}
          </label>
          <div className="relative">
            <SafeIcon 
              icon={FiPhone} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="tel"
              placeholder="e.g., +225 0701234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t('payment.internationalFormat')}
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              {t('payment.processing')}
            </>
          ) : (
            <>
              <SafeIcon icon={FiPhone} className="w-5 h-5 mr-2" />
              {t('payment.payWithMomo')}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MomoPaymentForm;