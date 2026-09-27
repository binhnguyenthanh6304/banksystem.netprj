import React, { useState, useEffect, useCallback } from 'react';
import { useBank } from '../../context/BankContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon, AlertTriangleIcon, ShieldIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const FundsTransfer: React.FC = () => {
  const { accounts, sendTransferOtp, confirmTransfer } = useBank();
  const { user } = useAuth();
  const [fromAccountNumber, setFromAccountNumber] = useState<string>('');
  const [toAccountNumber, setToAccountNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [transactionPassword, setTransactionPassword] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [recipientName, setRecipientName] = useState<string>('');
  const [isValidAccount, setIsValidAccount] = useState<boolean>(false);
  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);


  const selectedAccount = accounts.find((acc) => acc.accountNumber === fromAccountNumber);

  useEffect(() => {
    if (selectedAccount && !description) {
      setDescription(`${selectedAccount.accountName} transfer money`);
    }
  }, [selectedAccount, description]);

  const validateAccountAndBalance = useCallback(async () => {
    if (!toAccountNumber || !fromAccountNumber || !amount || parseFloat(amount) <= 0) {
      setRecipientName('');
      setIsValidAccount(false);
      setIsBalanceSufficient(true);
      setError('');
      setAmountError('');
      setIsValidating(false);
      return;
    }
    setIsValidating(true);
    try {
      const response = await API.get(`/Transfers/validate-account/${toAccountNumber}`, {
        params: { fromAccountNumber, amount: parseFloat(amount) },
      });
      const { data } = response.data;
      setIsValidAccount(data.IsValid || '');
      setRecipientName(data.AccountName || '');
      setIsBalanceSufficient(data.IsBalanceSufficient || true);
      setError(!data.AccountName ? 'Invalid recipient account number' : '');
      setAmountError(data.AccountName && !data.IsBalanceSufficient ? 'Insufficient balance in sender account' : '');
    } catch (err: any) {
      setIsValidAccount(false);
      setRecipientName('');
      setIsBalanceSufficient(false);
      setError('Error validating account');
      setAmountError('');
    } finally {
      setIsValidating(false);
    }
  }, [toAccountNumber, fromAccountNumber, amount]);

  useEffect(() => {
    validateAccountAndBalance();
  }, [validateAccountAndBalance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please log in to perform a transfer');
      return;
    }
    if (!fromAccountNumber) {
      setError('Please select a source account');
      return;
    }
    if (!toAccountNumber) {
      setError('Please enter a destination account number');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) < 10) {
      setAmountError('Amount must be at least $10.');
      return;
    }
    if (!isValidAccount) {
      setError('Please enter the recipients account number and a valid amount');
      return;
    }
    if (!isBalanceSufficient) {
      setAmountError('Insufficient balance in sender account');
      return;
    }
    if (isValidating) {
      setError('Please wait for validation to complete');
      return;
    }
    setShowConfirmation(true);
  };

  const sendOtpForTransfer = async () => {
    setIsProcessing(true);
    setError('');
    setAmountError('');
    setSuccess('');

    if (!transactionPassword) {
      setError('Please enter a transaction password');
      setIsProcessing(false);
      return;
    }

    try {
      const result = await sendTransferOtp(fromAccountNumber, transactionPassword);
      if (result.success) {
        setSuccess(result.message);
        setIsOtpSent(true);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error sending OTP.');
    } finally {
      setIsProcessing(false);
    }
  };

  const submitOtpTransfer = async () => {
    setIsProcessing(true);
    setError('');
    setAmountError('');
    setSuccess('');

    if (!otp) {
      setError('Please enter the OTP');
      setIsProcessing(false);
      return;
    }

    try {
      const result = await confirmTransfer(
        {
          FromAccountNumber: fromAccountNumber,
          ToAccountNumber: toAccountNumber,
          Amount: parseFloat(amount),
          Description: description,
          TransactionPassword: transactionPassword,
        },
        otp
      );
      if (result.success) {
        setShowSuccessModal(true);
        setSuccess('Transfer completed successfully');
        setFromAccountNumber('');
        setToAccountNumber('');
        setAmount('');
        setTransactionPassword('');
        setDescription('');
        setOtp('');
        setIsOtpSent(false);
        setShowConfirmation(false);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP confirmation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelTransfer = () => {
    setShowConfirmation(false);
    setTransactionPassword('');
    setOtp('');
    setError('');
    setAmountError('');
    setSuccess('');
    setIsOtpSent(false);
  };

  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Funds Transfer</h1>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-center">
              <AlertTriangleIcon className="text-red-500 mr-2" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex items-center">
              <CheckCircleIcon className="text-green-500 mr-2" size={20} />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-800 text-white p-6">
            <h2 className="text-xl font-semibold">Transfer Money</h2>
            <p className="text-blue-100 mt-1">Transfer funds between accounts</p>
          </div>

          {!showConfirmation ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700 mb-1">
                  From Account
                </label>
                <select
                  id="fromAccount"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={fromAccountNumber}
                  onChange={(e) => setFromAccountNumber(e.target.value)}
                  required
                >
                  <option value="">Select an account</option>
                  {accounts.map((account) => (
                    <option key={account.accountNumber} value={account.accountNumber}>
                      {account.accountName} - {account.accountNumber} - ${account.balance}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="toAccount" className="block text-sm font-medium text-gray-700 mb-1">
                  To Account
                </label>
                <input
                  type="text"
                  id="toAccount"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter account number"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value)}
                  required
                />
                {isValidating && (
                  <p className="text-sm text-gray-500 mt-1">Validating...</p>
                )}
                {recipientName && !isValidating && (
                  <p className="text-sm text-green-600 mt-1">Recipient: {recipientName}</p>
                )}
                {!recipientName && toAccountNumber && !isValidating && (
                  <p className="text-sm text-red-600 mt-1">Invalid account number</p>
                )}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">USD</span>
                  </div>
                </div>
                {selectedAccount && amount && (
                  <p className="text-xs text-gray-500 mt-1">
                    Available balance: ${selectedAccount.balance}
                  </p>
                )}
                {amountError && (
                  <p className="text-sm text-red-600 mt-1">{amountError}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  id="description"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a description for this transfer"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-md flex items-start">
                <ShieldIcon className="text-blue-800 mr-3 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Secure Transfer</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    All transfers are encrypted and secure. You'll be asked to confirm this transfer with your transaction password.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-6">
              <div className="bg-yellow-50 p-4 rounded-md mb-4">
                <h3 className="text-lg font-medium text-yellow-800">Confirm Transfer</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please review the transfer details and enter your transaction password to confirm.
                </p>
              </div>

              <div className="border-t border-b border-gray-200 py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">From Account:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedAccount?.accountName} - {selectedAccount?.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">To Account:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {recipientName && `${recipientName}`} - {toAccountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount:</span>
                  <span className="text-sm font-medium text-gray-900">${parseFloat(amount)}</span>
                </div>
                {description && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Description:</span>
                    <span className="text-sm font-medium text-gray-900">{description}</span>
                  </div>
                )}
              </div>

              {!isOtpSent ? (
                <>
                  <div>
                    <label htmlFor="transactionPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Password
                    </label>
                    <input
                      type="password"
                      id="transactionPassword"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Enter your transaction password"
                      value={transactionPassword}
                      onChange={(e) => setTransactionPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={cancelTransfer}
                      type="button"
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendOtpForTransfer}
                      type="button"
                      className="flex-1 py-2 px-4 text-white bg-blue-800 rounded-md"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Sending OTP...' : 'Confirm Transfer'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-green-700">
                      An OTP has been sent to your email. Please enter it below to complete the transfer.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter OTP sent to your email"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={cancelTransfer}
                      type="button"
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitOtpTransfer}
                      type="button"
                      className="flex-1 py-2 px-4 text-white bg-blue-800 rounded-md"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Submit OTP & Transfer'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
            <CheckCircleIcon className="text-green-500 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Transfer Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your funds have been transferred successfully.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsTransfer;