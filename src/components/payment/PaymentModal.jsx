import { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Modal from '../Modal';
import PaymentMethodSelector from './PaymentMethodSelector';
import StripePaymentForm from './StripePaymentForm';
import MomoPaymentForm from './MomoPaymentForm';
import BankTransferForm from './BankTransferForm';
import CryptoPaymentForm from './CryptoPaymentForm';
import PaymentPlansForm from './PaymentPlansForm';
import CurrencySelector from './CurrencySelector';
import { useLanguage } from '../../contexts/LanguageContext';

const { FiX, FiDollarSign } = FiIcons;

const PaymentModal = ({ isOpen, onClose, bookingId, amount, onSuccess }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState('method'); // method, currency, payment
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  const handleSelectMethod = (method) => {
    if (typeof method === 'object' && method.method === 'momo') {
      setSelectedMethod('momo');
      setSelectedProvider(method.provider);
      setStep('payment');
    } else {
      setSelectedMethod(method);
      if (method === 'stripe' || method === 'bank_transfer') {
        setStep('currency');
      } else if (method === 'crypto' || method === 'payment_plan') {
        setStep('payment'); // Crypto and payment plans handle their own flow
      } else {
        setStep('payment');
      }
    }
  };
  
  const handlePaymentSuccess = (result) => {
    if (onSuccess) {
      onSuccess(result);
    }
  };
  
  const handleBack = () => {
    if (step === 'currency') {
      setStep('method');
    } else if (step === 'payment') {
      if (selectedMethod === 'momo') {
        setStep('method');
      } else {
        setStep('currency');
      }
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 'method':
        return <PaymentMethodSelector onSelect={handleSelectMethod} />;
      
      case 'currency':
        return (
          <div>
            <CurrencySelector />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep('payment')}
                className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                {t('payment.continue')}
              </button>
            </div>
          </div>
        );
      
      case 'payment':
        if (selectedMethod === 'stripe') {
          return (
            <StripePaymentForm
              bookingId={bookingId}
              amount={amount}
              onSuccess={handlePaymentSuccess}
            />
          );
        } else if (selectedMethod === 'momo') {
          return (
            <MomoPaymentForm
              bookingId={bookingId}
              amount={amount}
              provider={selectedProvider}
              onSuccess={handlePaymentSuccess}
            />
          );
        } else if (selectedMethod === 'bank_transfer') {
          return (
            <BankTransferForm
              bookingId={bookingId}
              amount={amount}
              onSuccess={handlePaymentSuccess}
            />
          );
        } else if (selectedMethod === 'crypto') {
          return (
            <CryptoPaymentForm
              bookingId={bookingId}
              amount={amount}
              currency="USD"
              onSuccess={handlePaymentSuccess}
            />
          );
        } else if (selectedMethod === 'payment_plan') {
          return (
            <PaymentPlansForm
              bookingId={bookingId}
              amount={amount}
              currency="USD"
              onSuccess={handlePaymentSuccess}
            />
          );
        }
        return null;
      
      default:
        return null;
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl overflow-hidden max-w-lg w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('payment.makePayment')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          {step !== 'method' && (
            <button
              onClick={handleBack}
              className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
            >
              <SafeIcon icon={FiIcons.FiChevronLeft} className="w-5 h-5 mr-1" />
              {t('payment.back')}
            </button>
          )}
          
          {renderStepContent()}
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;