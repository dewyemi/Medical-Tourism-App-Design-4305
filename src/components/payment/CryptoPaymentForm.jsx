import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiBitcoin, 
  FiCheck, 
  FiCopy, 
  FiAlertCircle, 
  FiClock,
  FiLink,
  FiRefreshCw
} from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { usePayment } from '../../contexts/PaymentContext';
import { useLanguage } from '../../contexts/LanguageContext';

const CryptoPaymentForm = ({ bookingId, amount, currency, onSuccess, onError }) => {
  const { t } = useLanguage();
  const { processCryptoPayment, formatCurrency, getCryptoWallets } = usePayment();
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [confirmations, setConfirmations] = useState(0);
  const [cryptoWallets, setCryptoWallets] = useState([]);

  const supportedCryptos = [
    {
      code: 'BTC',
      name: 'Bitcoin',
      icon: FiBitcoin,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      network: 'bitcoin',
      confirmationsRequired: 6,
      estimatedTime: '60-120 minutes'
    },
    {
      code: 'ETH',
      name: 'Ethereum',
      icon: FiBitcoin, // Using generic icon, would be replaced with proper ETH icon
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      network: 'ethereum',
      confirmationsRequired: 12,
      estimatedTime: '5-15 minutes'
    },
    {
      code: 'USDT',
      name: 'Tether (USDT)',
      icon: FiBitcoin,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      network: 'ethereum',
      confirmationsRequired: 12,
      estimatedTime: '5-15 minutes'
    },
    {
      code: 'USDC',
      name: 'USD Coin (USDC)',
      icon: FiBitcoin,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      network: 'ethereum',
      confirmationsRequired: 12,
      estimatedTime: '5-15 minutes'
    }
  ];

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const wallets = await getCryptoWallets();
        setCryptoWallets(wallets);
      } catch (error) {
        console.error('Error fetching crypto wallets:', error);
      }
    };
    fetchWallets();
  }, [getCryptoWallets]);

  // Timer for payment expiration
  useEffect(() => {
    if (paymentData && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setError('Payment expired. Please create a new payment.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentData, timeRemaining]);

  const handleCryptoSelect = (cryptoCode) => {
    setSelectedCrypto(cryptoCode);
    setError(null);
  };

  const handleInitiatePayment = async () => {
    if (!selectedCrypto) {
      setError('Please select a cryptocurrency');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await processCryptoPayment(
        bookingId,
        amount,
        currency,
        selectedCrypto
      );

      setPaymentData(result);
      setTimeRemaining(1800); // 30 minutes
    } catch (err) {
      console.error('Crypto payment error:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (paymentData?.walletAddress) {
      navigator.clipboard.writeText(paymentData.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAmount = () => {
    if (paymentData?.cryptoAmount) {
      navigator.clipboard.writeText(paymentData.cryptoAmount.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData) return;

    try {
      setLoading(true);
      // Implementation would check blockchain for transaction
      // This is a placeholder for the actual blockchain integration
      const response = await fetch(`/api/check-crypto-payment/${paymentData.paymentId}`);
      const status = await response.json();
      
      setConfirmations(status.confirmations || 0);
      
      if (status.confirmed) {
        if (onSuccess) onSuccess(status);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const selectedCryptoData = supportedCryptos.find(c => c.code === selectedCrypto);

  if (paymentData) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center justify-center w-16 h-16 ${selectedCryptoData?.color} rounded-full mb-4`}
          >
            <SafeIcon icon={selectedCryptoData?.icon || FiBitcoin} className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Send {selectedCrypto}
          </h3>
          {timeRemaining > 0 ? (
            <div className="flex items-center justify-center text-orange-600 mb-2">
              <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                Expires in {formatTime(timeRemaining)}
              </span>
            </div>
          ) : (
            <div className="text-red-600 text-sm font-medium mb-2">
              Payment Expired
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Send exactly this amount:
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-mono text-lg font-bold">
                  {paymentData.cryptoAmount} {selectedCrypto}
                </span>
                <button
                  onClick={handleCopyAmount}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <SafeIcon icon={copied ? FiCheck : FiCopy} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                To this {selectedCryptoData?.network} address:
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-mono text-sm break-all mr-2">
                  {paymentData.walletAddress}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                >
                  <SafeIcon icon={copied ? FiCheck : FiCopy} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Network:</span>
                <span className="font-medium ml-1 capitalize">{selectedCryptoData?.network}</span>
              </div>
              <div>
                <span className="text-gray-600">Est. Time:</span>
                <span className="font-medium ml-1">{selectedCryptoData?.estimatedTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code placeholder */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
          <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-gray-500 text-sm">QR Code</span>
          </div>
          <p className="text-sm text-gray-600">
            Scan with your crypto wallet
          </p>
        </div>

        {/* Transaction Status */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900">Transaction Status</h4>
            <button
              onClick={checkPaymentStatus}
              disabled={loading}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
            >
              <SafeIcon 
                icon={FiRefreshCw} 
                className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} 
              />
              Refresh
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-800">Confirmations:</span>
              <span className="font-medium">
                {confirmations}/{selectedCryptoData?.confirmationsRequired}
              </span>
            </div>
            
            {paymentData.transactionHash && (
              <div className="flex items-center text-sm">
                <span className="text-blue-800 mr-2">Transaction:</span>
                <a
                  href={`https://etherscan.io/tx/${paymentData.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <span className="font-mono text-xs">
                    {paymentData.transactionHash.substring(0, 10)}...
                  </span>
                  <SafeIcon icon={FiLink} className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="space-y-1 text-xs">
                <li>• Send only {selectedCrypto} to this address</li>
                <li>• Send the exact amount shown above</li>
                <li>• Payment will be confirmed after {selectedCryptoData?.confirmationsRequired} confirmations</li>
                <li>• Do not send from an exchange (use a personal wallet)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Pay with Cryptocurrency
        </h3>
        <p className="text-gray-600">
          Select your preferred cryptocurrency for payment
        </p>
        <div className="mt-3 text-lg font-bold text-blue-600">
          {formatCurrency(amount, currency)}
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

      <div className="space-y-3 mb-6">
        {supportedCryptos.map((crypto) => (
          <motion.div
            key={crypto.code}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCryptoSelect(crypto.code)}
            className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
              selectedCrypto === crypto.code
                ? `${crypto.bgColor} ${crypto.textColor} border-current`
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${crypto.color} text-white mr-4`}>
                  <SafeIcon icon={crypto.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium">
                    {crypto.name}
                  </h4>
                  <p className="text-sm opacity-70">
                    Network: {crypto.network} • {crypto.estimatedTime}
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                selectedCrypto === crypto.code
                  ? 'bg-current border-current'
                  : 'border-gray-300'
              }`}>
                {selectedCrypto === crypto.code && (
                  <SafeIcon icon={FiCheck} className="w-3 h-3 text-white m-auto" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleInitiatePayment}
        disabled={!selectedCrypto || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Generating Payment...
          </>
        ) : (
          <>
            <SafeIcon icon={FiBitcoin} className="w-5 h-5 mr-2" />
            Generate Payment Address
          </>
        )}
      </button>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Powered by secure blockchain technology
        </p>
      </div>
    </div>
  );
};

export default CryptoPaymentForm;