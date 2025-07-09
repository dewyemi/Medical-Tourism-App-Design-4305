import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { usePayment } from '../../contexts/PaymentContext';
import { useLanguage } from '../../contexts/LanguageContext';

const { FiDollarSign, FiCheck } = FiIcons;

const CurrencySelector = () => {
  const { t } = useLanguage();
  const { 
    currencies, 
    loadingCurrencies, 
    selectedCurrency, 
    setSelectedCurrency 
  } = usePayment();
  
  if (loadingCurrencies) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('payment.selectCurrency')}
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {currencies.map((currency) => (
          <button
            key={currency.code}
            onClick={() => setSelectedCurrency(currency.code)}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              selectedCurrency === currency.code
                ? 'bg-primary-50 text-primary-600 border-2 border-primary-200'
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                <span className="font-bold text-gray-700">{currency.symbol}</span>
              </div>
              <div className="text-left">
                <p className="font-medium">{currency.code}</p>
                <p className="text-xs text-gray-500">{currency.name}</p>
              </div>
            </div>
            
            {selectedCurrency === currency.code && (
              <SafeIcon icon={FiCheck} className="w-5 h-5 text-primary-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CurrencySelector;