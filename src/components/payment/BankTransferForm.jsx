import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { usePayment } from '../../contexts/PaymentContext';
import { useLanguage } from '../../contexts/LanguageContext';

const { FiCopy, FiCheck, FiDollarSign, FiUpload } = FiIcons;

const BankTransferForm = ({ bookingId, amount, onSuccess }) => {
  const { t } = useLanguage();
  const { formatCurrency } = usePayment();
  const [loading, setLoading] = useState(false);
  const [confirmationFile, setConfirmationFile] = useState(null);
  const [confirmationPreview, setConfirmationPreview] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});
  
  // Sample bank accounts by currency
  const bankAccounts = {
    USD: {
      bankName: 'Emirates International Bank',
      accountName: 'EMIRAFRIK Medical Tourism LLC',
      accountNumber: '1234567890',
      iban: 'AE123456789012345678901',
      swiftCode: 'EMIRTESXXX',
    },
    AED: {
      bankName: 'Dubai Islamic Bank',
      accountName: 'EMIRAFRIK Medical Tourism LLC',
      accountNumber: '9876543210',
      iban: 'AE987654321098765432109',
      swiftCode: 'DIBIAEAD',
    },
    XOF: {
      bankName: 'Ecobank',
      accountName: 'EMIRAFRIK Medical Tourism SARL',
      accountNumber: '5678901234',
      iban: 'CI93CI182010010000045720022',
      swiftCode: 'ECOCCIAB',
    }
  };
  
  // Generate a reference number for the transfer
  useState(() => {
    const ref = `EMF-${bookingId.substring(0, 6)}-${Date.now().toString().substring(8, 13)}`;
    setReferenceNumber(ref);
  }, [bookingId]);
  
  const handleCopy = (field, value) => {
    navigator.clipboard.writeText(value);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => {
      setCopied({ ...copied, [field]: false });
    }, 2000);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setConfirmationFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfirmationPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!confirmationFile) {
      setError(t('payment.uploadReceipt'));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you would upload the file to storage
      // and create a payment record in the database
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSuccess) {
        onSuccess({
          method: 'bank_transfer',
          reference: referenceNumber,
          receipt: confirmationFile.name
        });
      }
    } catch (err) {
      console.error('Error submitting bank transfer:', err);
      setError(err.message || t('payment.errorSubmitting'));
    } finally {
      setLoading(false);
    }
  };
  
  // Get bank account details for selected currency
  const { selectedCurrency } = usePayment();
  const bankAccount = bankAccounts[selectedCurrency] || bankAccounts.USD;
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('payment.bankTransfer')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('payment.bankTransferInfo')}
          </p>
        </div>
        <div className="text-xl font-bold text-primary-600">
          {formatCurrency(amount)}
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-gray-700 mb-3">
          {t('payment.bankDetails')}:
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('payment.bankName')}:</span>
            <span className="font-medium">{bankAccount.bankName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('payment.accountName')}:</span>
            <span className="font-medium">{bankAccount.accountName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('payment.accountNumber')}:</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">{bankAccount.accountNumber}</span>
              <button 
                onClick={() => handleCopy('accountNumber', bankAccount.accountNumber)}
                className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <SafeIcon 
                  icon={copied.accountNumber ? FiCheck : FiCopy} 
                  className={`w-4 h-4 ${copied.accountNumber ? 'text-green-500' : 'text-gray-600'}`} 
                />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">IBAN:</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">{bankAccount.iban}</span>
              <button 
                onClick={() => handleCopy('iban', bankAccount.iban)}
                className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <SafeIcon 
                  icon={copied.iban ? FiCheck : FiCopy} 
                  className={`w-4 h-4 ${copied.iban ? 'text-green-500' : 'text-gray-600'}`} 
                />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">SWIFT/BIC:</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">{bankAccount.swiftCode}</span>
              <button 
                onClick={() => handleCopy('swift', bankAccount.swiftCode)}
                className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <SafeIcon 
                  icon={copied.swift ? FiCheck : FiCopy} 
                  className={`w-4 h-4 ${copied.swift ? 'text-green-500' : 'text-gray-600'}`} 
                />
              </button>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{t('payment.reference')}:</span>
              <div className="flex items-center">
                <span className="font-bold text-primary-600 mr-2">{referenceNumber}</span>
                <button 
                  onClick={() => handleCopy('reference', referenceNumber)}
                  className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  <SafeIcon 
                    icon={copied.reference ? FiCheck : FiCopy} 
                    className={`w-4 h-4 ${copied.reference ? 'text-green-500' : 'text-gray-600'}`} 
                  />
                </button>
              </div>
            </div>
            <p className="text-xs text-red-600 mt-1">
              {t('payment.referenceImportant')}
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payment.uploadConfirmation')}
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            {confirmationPreview ? (
              <div>
                <img 
                  src={confirmationPreview} 
                  alt="Payment confirmation" 
                  className="max-h-40 mx-auto mb-2"
                />
                <p className="text-sm text-gray-600">
                  {confirmationFile.name}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmationFile(null);
                    setConfirmationPreview(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  {t('payment.remove')}
                </button>
              </div>
            ) : (
              <div>
                <SafeIcon icon={FiUpload} className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  {t('payment.dragOrClick')}
                </p>
                <label className="inline-block px-4 py-2 bg-primary-50 text-primary-600 rounded-lg cursor-pointer hover:bg-primary-100">
                  {t('payment.browseFiles')}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>
          
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || !confirmationFile}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              {t('payment.processing')}
            </>
          ) : (
            <>
              <SafeIcon icon={FiDollarSign} className="w-5 h-5 mr-2" />
              {t('payment.confirmTransfer')}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BankTransferForm;