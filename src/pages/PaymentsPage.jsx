import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { usePayment } from '../contexts/PaymentContext';
import { useLanguage } from '../contexts/LanguageContext';
import CurrencySelector from '../components/payment/CurrencySelector';
import { formatDate } from '../utils/dataUtils';

const { FiDollarSign, FiCreditCard, FiPhone, FiFileText, FiDownload, FiFilter, FiEye } = FiIcons;

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { 
    paymentHistory, 
    loadingPaymentHistory, 
    formatCurrency 
  } = usePayment();
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  
  // Payment method icons
  const methodIcons = {
    stripe: FiCreditCard,
    momo: FiPhone,
    bank_transfer: FiFileText,
    cash: FiDollarSign
  };
  
  // Payment status colors
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  };
  
  // Apply filters
  const filteredPayments = paymentHistory.filter(payment => {
    if (filterStatus !== 'all' && payment.payment_status !== filterStatus) {
      return false;
    }
    if (filterMethod !== 'all' && payment.payment_method !== filterMethod) {
      return false;
    }
    return true;
  });
  
  // Download payment receipt
  const downloadReceipt = (payment) => {
    // In a real application, this would download the receipt
    console.log('Download receipt for payment:', payment.id);
  };
  
  // View payment details
  const viewPaymentDetails = (payment) => {
    // In a real application, this would navigate to payment details
    console.log('View payment details:', payment.id);
  };
  
  if (loadingPaymentHistory) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('payments.title')}
        </h2>
        <p className="text-gray-600">
          {t('payments.description')}
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {t('payments.currencySettings')}
          </h3>
        </div>
        <div className="p-4">
          <CurrencySelector />
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('payments.history')}
        </h3>
        
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">{t('payments.allStatuses')}</option>
            <option value="pending">{t('payments.pending')}</option>
            <option value="processing">{t('payments.processing')}</option>
            <option value="completed">{t('payments.completed')}</option>
            <option value="failed">{t('payments.failed')}</option>
            <option value="refunded">{t('payments.refunded')}</option>
          </select>
          
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">{t('payments.allMethods')}</option>
            <option value="stripe">{t('payments.creditCard')}</option>
            <option value="momo">{t('payments.mobileMoney')}</option>
            <option value="bank_transfer">{t('payments.bankTransfer')}</option>
            <option value="cash">{t('payments.cash')}</option>
          </select>
          
          <button className="p-2 bg-gray-100 rounded-lg">
            <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {paymentHistory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <SafeIcon 
            icon={FiDollarSign} 
            className="w-16 h-16 text-gray-300 mx-auto mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('payments.noPayments')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('payments.noPaymentsDescription')}
          </p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            {t('payments.viewBookings')}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('payments.date')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('payments.service')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('payments.amount')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('payments.method')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('payments.status')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    {t('payments.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const MethodIcon = methodIcons[payment.payment_method] || FiDollarSign;
                  const statusClass = statusColors[payment.payment_status] || 'bg-gray-100 text-gray-800';
                  
                  return (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          {payment.booking?.treatment ? (
                            <p className="font-medium text-gray-900">
                              {payment.booking.treatment.name}
                            </p>
                          ) : (
                            <p className="font-medium text-gray-900">
                              {t('payments.medicalService')}
                            </p>
                          )}
                          {payment.booking?.destination && (
                            <p className="text-sm text-gray-600">
                              {payment.booking.destination.name}, {payment.booking.destination.city}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className={`p-1.5 rounded-full ${
                            payment.payment_method === 'stripe' ? 'bg-blue-100 text-blue-600' :
                            payment.payment_method === 'momo' ? 'bg-green-100 text-green-600' :
                            payment.payment_method === 'bank_transfer' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          } mr-2`}>
                            <SafeIcon icon={MethodIcon} className="w-4 h-4" />
                          </div>
                          <span className="text-gray-800">
                            {payment.payment_method === 'stripe' ? t('payments.creditCard') :
                             payment.payment_method === 'momo' ? t('payments.mobileMoney') :
                             payment.payment_method === 'bank_transfer' ? t('payments.bankTransfer') :
                             payment.payment_method === 'cash' ? t('payments.cash') :
                             payment.payment_method}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                          {payment.payment_status === 'pending' ? t('payments.pending') :
                           payment.payment_status === 'processing' ? t('payments.processing') :
                           payment.payment_status === 'completed' ? t('payments.completed') :
                           payment.payment_status === 'failed' ? t('payments.failed') :
                           payment.payment_status === 'refunded' ? t('payments.refunded') :
                           payment.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewPaymentDetails(payment)}
                            className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                            title={t('payments.viewDetails')}
                          >
                            <SafeIcon icon={FiEye} className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          {payment.payment_status === 'completed' && (
                            <button
                              onClick={() => downloadReceipt(payment)}
                              className="p-1.5 bg-blue-100 rounded-lg hover:bg-blue-200"
                              title={t('payments.downloadReceipt')}
                            >
                              <SafeIcon icon={FiDownload} className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;