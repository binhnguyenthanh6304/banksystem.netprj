import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBank } from '../../context/BankContext';
import { ArrowLeftIcon, BanknoteIcon, HistoryIcon, PrinterIcon } from 'lucide-react';

const AccountDetails: React.FC = () => {
  // Lấy `id` tài khoản từ URL
  const { id } = useParams<{ id: string }>();

  // Lấy các hàm từ BankContext
  const { getAccount, getAccountTransactions } = useBank();

  // Tìm tài khoản dựa vào id
  const account = getAccount(id || '');

  // Lấy 5 giao dịch gần nhất
  const recentTransactions = getAccountTransactions(id || '', 5);

  // Nếu không tìm thấy tài khoản
  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-red-600">
          Account not found
        </h2>
        <Link to="/" className="mt-4 inline-flex items-center text-blue-800 hover:underline">
          <ArrowLeftIcon size={16} className="mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Link quay lại danh sách tài khoản */}
      <Link to="/" className="inline-flex items-center text-blue-800 hover:underline mb-6">
        <ArrowLeftIcon size={16} className="mr-1" /> Back to Accounts
      </Link>

      {/* Thông tin tài khoản */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-blue-800 text-white p-6">
          <h1 className="text-2xl font-bold">{account.accountName}</h1>
          <p className="text-blue-100 mt-1">Account Number: {account.accountNumber}</p>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Current Balance</h2>
            {/* định dạng tiền tệ ở đây nếu muốn */}
            {/* <p className="text-3xl font-bold text-gray-900">{formatCurrency(account.balance)}</p> */}
          </div>

          {/* Các nút chức năng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={`/transactions/${account.id}`} className="flex items-center justify-center bg-blue-800 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors">
              <HistoryIcon size={18} className="mr-2" />
              View Transactions
            </Link>
            <Link to="/transfer" className="flex items-center justify-center bg-blue-700 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors">
              <BanknoteIcon size={18} className="mr-2" />
              Transfer Funds
            </Link>
            <Link to="/statements" className="flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-500 transition-colors">
              <PrinterIcon size={18} className="mr-2" />
              Account Statement
            </Link>
          </div>
        </div>
      </div>

      {/* Giao dịch gần đây */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        {recentTransactions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map(transaction => {    
                  const accountId = id ? parseInt(id) : 0; 
                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.reference}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.toAccountId === accountId ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.toAccountId === accountId ? '+' : '-'} {transaction.amount +'$'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Link đến trang xem toàn bộ giao dịch */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <Link to={`/transactions/${account.id}`} className="text-sm text-blue-800 hover:underline">
                View all transactions
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No recent transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default AccountDetails;