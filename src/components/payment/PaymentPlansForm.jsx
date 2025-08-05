import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiDollarSign, 
  FiCheck, 
  FiClock,
  FiAlertCircle,
  FiInfo,
  FiCreditCard
} from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { usePayment } from '../../contexts/PaymentContext';
import { useLanguage } from '../../contexts/LanguageContext';

const PaymentPlansForm = ({ bookingId, amount, currency, onSuccess, onError }) => {
  const { t } = useLanguage();
  const { createPaymentPlan, formatCurrency } = usePayment();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [downPayment, setDownPayment] = useState(amount * 0.3); // 30% default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const paymentPlans = [
    {
      id: 'plan_3_months',
      name: '3-Month Plan',
      installments: 3,
      frequency: 'monthly',
      description: 'Pay in 3 monthly installments',
      icon: FiCalendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      minDownPayment: 0.25, // 25%
      interestRate: 0.05, // 5%
      popular: false
    },
    {
      id: 'plan_6_months',
      name: '6-Month Plan',
      installments: 6,
      frequency: 'monthly',
      description: 'Pay in 6 monthly installments',
      icon: FiDollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      minDownPayment: 0.20, // 20%
      interestRate: 0.08, // 8%
      popular: true
    },
    {
      id: 'plan_12_months',
      name: '12-Month Plan',
      installments: 12,
      frequency: 'monthly',
      description: 'Pay in 12 monthly installments',
      icon: FiClock,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      minDownPayment: 0.15, // 15%
      interestRate: 0.12, // 12%
      popular: false
    },
    {
      id: 'plan_custom',
      name: 'Custom Plan',
      installments: 'custom',
      frequency: 'monthly',
      description: 'Create a custom payment schedule',
      icon: FiCreditCard,
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      minDownPayment: 0.10, // 10%
      interestRate: 0.15, // 15%
      popular: false
    }
  ];

  const [customInstallments, setCustomInstallments] = useState(6);

  const calculatePlanDetails = (plan) => {
    const totalAmount = amount;
    const interest = totalAmount * plan.interestRate;
    const totalWithInterest = totalAmount + interest;
    const downPaymentAmount = Math.max(downPayment, totalAmount * plan.minDownPayment);
    const remainingAmount = totalWithInterest - downPaymentAmount;
    const installmentCount = plan.installments === 'custom' ? customInstallments : plan.installments;
    const installmentAmount = remainingAmount / installmentCount;

    return {
      totalAmount,
      interest,
      totalWithInterest,
      downPaymentAmount,
      remainingAmount,
      installmentAmount,
      installmentCount,
      monthlyPayment: installmentAmount
    };
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    const minDown = amount * plan.minDownPayment;
    if (downPayment < minDown) {
      setDownPayment(minDown);
    }
    setError(null);
  };

  const handleDownPaymentChange = (value) => {
    const numValue = parseFloat(value) || 0;
    const minDown = selectedPlan ? amount * selectedPlan.minDownPayment : 0;
    
    if (numValue >= minDown && numValue <= amount) {
      setDownPayment(numValue);
      setError(null);
    } else if (numValue < minDown) {
      setError(`Minimum down payment is ${formatCurrency(minDown, currency)}`);
    } else {
      setError(`Down payment cannot exceed total amount`);
    }
  };

  const handleCreatePlan = async () => {
    if (!selectedPlan) {
      setError('Please select a payment plan');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const planDetails = calculatePlanDetails(selectedPlan);
      const installmentCount = selectedPlan.installments === 'custom' ? customInstallments : selectedPlan.installments;

      const paymentPlan = await createPaymentPlan({
        bookingId,
        totalAmount: planDetails.totalWithInterest,
        downPayment: planDetails.downPaymentAmount,
        installments: installmentCount,
        frequency: selectedPlan.frequency,
        interestRate: selectedPlan.interestRate
      });

      if (onSuccess) onSuccess(paymentPlan);
    } catch (err) {
      console.error('Payment plan creation error:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanDetails = selectedPlan ? calculatePlanDetails(selectedPlan) : null;

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Choose Your Payment Plan
        </h3>
        <p className="text-gray-600">
          Spread your medical tourism costs over time
        </p>
        <div className="mt-3 text-lg font-bold text-blue-600">
          Total: {formatCurrency(amount, currency)}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Payment Plans Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {paymentPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePlanSelect(plan)}
            className={`relative p-4 rounded-lg cursor-pointer transition-all border-2 ${
              selectedPlan?.id === plan.id
                ? `${plan.bgColor} ${plan.borderColor} border-2`
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${plan.color} text-white mr-3`}>
                  <SafeIcon icon={plan.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-medium ${selectedPlan?.id === plan.id ? plan.textColor : 'text-gray-900'}`}>
                    {plan.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {plan.description}
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                selectedPlan?.id === plan.id
                  ? `${plan.color} border-transparent`
                  : 'border-gray-300'
              }`}>
                {selectedPlan?.id === plan.id && (
                  <SafeIcon icon={FiCheck} className="w-3 h-3 text-white m-auto" />
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Installments:</span>
                <span className="font-medium">
                  {plan.installments === 'custom' ? 'Custom' : plan.installments}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-medium">{(plan.interestRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min. Down Payment:</span>
                <span className="font-medium">{(plan.minDownPayment * 100)}%</span>
              </div>
            </div>

            {plan.id === 'plan_custom' && selectedPlan?.id === plan.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Installments
                </label>
                <select
                  value={customInstallments}
                  onChange={(e) => setCustomInstallments(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[3, 6, 9, 12, 18, 24].map(num => (
                    <option key={num} value={num}>{num} months</option>
                  ))}
                </select>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Down Payment Configuration */}
      {selectedPlan && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Configure Down Payment</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'USD' ? '$' : currency}
                </span>
                <input
                  type="number"
                  min={amount * selectedPlan.minDownPayment}
                  max={amount}
                  step="0.01"
                  value={downPayment}
                  onChange={(e) => handleDownPaymentChange(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum: {formatCurrency(amount * selectedPlan.minDownPayment, currency)} 
                ({(selectedPlan.minDownPayment * 100)}%)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[0.25, 0.5, 0.75].map(percentage => (
                <button
                  key={percentage}
                  onClick={() => setDownPayment(amount * percentage)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {(percentage * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Plan Summary */}
      {selectedPlanDetails && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-3">Payment Plan Summary</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-800">Treatment Cost:</span>
              <span className="font-medium">{formatCurrency(selectedPlanDetails.totalAmount, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Interest ({(selectedPlan.interestRate * 100).toFixed(1)}%):</span>
              <span className="font-medium">{formatCurrency(selectedPlanDetails.interest, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="text-blue-800 font-medium">Total with Interest:</span>
              <span className="font-bold">{formatCurrency(selectedPlanDetails.totalWithInterest, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Down Payment:</span>
              <span className="font-medium">{formatCurrency(selectedPlanDetails.downPaymentAmount, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Remaining Amount:</span>
              <span className="font-medium">{formatCurrency(selectedPlanDetails.remainingAmount, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="text-blue-800 font-medium">Monthly Payment:</span>
              <span className="font-bold text-lg">{formatCurrency(selectedPlanDetails.monthlyPayment, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <SafeIcon icon={FiInfo} className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-2">Payment Plan Terms:</p>
            <ul className="space-y-1 text-xs">
              <li>• Down payment is due immediately upon plan confirmation</li>
              <li>• Monthly installments are automatically charged on the same date each month</li>
              <li>• Late payments incur a 5% late fee</li>
              <li>• Missing 2 consecutive payments may result in plan cancellation</li>
              <li>• Treatment can begin after down payment is received</li>
              <li>• Early payment discount of 2% available for full balance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Terms Acceptance */}
      <div className="flex items-start mb-6">
        <input
          type="checkbox"
          id="accept-terms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 mr-3"
        />
        <label htmlFor="accept-terms" className="text-sm text-gray-700">
          I accept the payment plan terms and conditions, including automatic payment processing 
          and late fees for missed payments.
        </label>
      </div>

      {/* Create Plan Button */}
      <button
        onClick={handleCreatePlan}
        disabled={!selectedPlan || !acceptedTerms || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Creating Payment Plan...
          </>
        ) : (
          <>
            <SafeIcon icon={FiCalendar} className="w-5 h-5 mr-2" />
            Create Payment Plan
          </>
        )}
      </button>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Secure payment processing • No hidden fees • Cancel anytime before treatment
        </p>
      </div>
    </div>
  );
};

export default PaymentPlansForm;