import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { usePayment } from '../../contexts/PaymentContext';
import { useLanguage } from '../../contexts/LanguageContext';

const { FiCreditCard, FiPhone, FiDollarSign, FiChevronRight, FiBitcoin, FiCalendar, FiTrendingUp } = FiIcons;

const PaymentMethodSelector = ({ onSelect }) => {
  const { t } = useLanguage();
  const { momoProviders, loadingMomoProviders } = usePayment();
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  const handleSelect = (method) => {
    setSelectedMethod(method);
    if (onSelect) onSelect(method);
  };
  
  const paymentMethods = [
    { 
      id: 'stripe', 
      name: t('payment.creditCard'),
      icon: FiCreditCard, 
      description: t('payment.creditCardDesc'),
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    { 
      id: 'momo', 
      name: t('payment.mobileMoney'),
      icon: FiPhone, 
      description: t('payment.mobileMoneyDesc'),
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    { 
      id: 'crypto', 
      name: 'Cryptocurrency',
      icon: FiBitcoin, 
      description: 'Pay with Bitcoin, Ethereum, USDT, or USDC',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    { 
      id: 'payment_plan', 
      name: 'Payment Plan',
      icon: FiCalendar, 
      description: 'Spread payments over 3-12 months',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    { 
      id: 'bank_transfer', 
      name: t('payment.bankTransfer'),
      icon: FiDollarSign, 
      description: t('payment.bankTransferDesc'),
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    }
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('payment.selectMethod')}
      </h3>
      
      {paymentMethods.map((method) => (
        <div 
          key={method.id}
          onClick={() => handleSelect(method.id)}
          className={`p-4 rounded-lg cursor-pointer transition-all ${
            selectedMethod === method.id 
              ? `${method.bgColor} ${method.borderColor} border-2` 
              : 'bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${method.color} text-white mr-4`}>
                <SafeIcon icon={method.icon} className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-medium ${selectedMethod === method.id ? method.textColor : 'text-gray-900'}`}>
                  {method.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {method.description}
                </p>
              </div>
            </div>
            <SafeIcon 
              icon={FiChevronRight} 
              className={`w-5 h-5 ${selectedMethod === method.id ? method.textColor : 'text-gray-400'}`}
            />
          </div>
          
          {/* Show Mobile Money providers when selected */}
          {selectedMethod === 'momo' && method.id === 'momo' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t('payment.selectProvider')}
              </p>
              
              {loadingMomoProviders ? (
                <div className="flex justify-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {momoProviders.map((provider) => (
                    <button
                      key={provider.code}
                      className="flex items-center justify-center p-2 border border-gray-200 rounded-lg hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect({ method: 'momo', provider: provider.code });
                      }}
                    >
                      {provider.logo_url ? (
                        <img 
                          src={provider.logo_url} 
                          alt={provider.name} 
                          className="h-6 mr-2" 
                        />
                      ) : (
                        <SafeIcon icon={FiPhone} className="w-5 h-5 text-green-500 mr-2" />
                      )}
                      <span className="text-sm font-medium">{provider.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;