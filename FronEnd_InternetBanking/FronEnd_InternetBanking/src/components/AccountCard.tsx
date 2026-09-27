import React from 'react';
import { Link } from 'react-router-dom';
import { Account } from '../context/BankContext';
import { CreditCardIcon, ArrowRightIcon } from 'lucide-react';
interface AccountCardProps {
  account: Account;
}
const AccountCard: React.FC<AccountCardProps> = ({
  account
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account.currency
    }).format(value);
  };
  return <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {account.accountType}
          </h3>
          <CreditCardIcon className="text-blue-800" />
        </div>
        <p className="text-gray-500 text-sm">
          Account Number:{' '}
          {account.accountNumber.replace(/(\d{4})/g, '$1 ').trim()}
        </p>
      </div>
      <div className="p-5">
        <div className="mb-4">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(account.balance)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to={`/account/${account.id}`} className="flex-1 bg-blue-800 text-white py-2 px-4 rounded-md text-center text-sm hover:bg-blue-700 transition-colors">
            View Details
          </Link>
          <Link to={`/transactions/${account.id}`} className="flex items-center justify-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-200 transition-colors">
            Transactions <ArrowRightIcon size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>;
};
export default AccountCard;