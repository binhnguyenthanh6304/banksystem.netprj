import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBank } from '../../context/BankContext';
import { ArrowLeftIcon, FilterIcon, SearchIcon, PrinterIcon } from 'lucide-react';
const TransactionHistory: React.FC = () => {
  const { id } = useParams<{ id: string; }>();
  const {
    getAccount,
    getAccountTransactions
  } = useBank();
  const account = getAccount(id || '');
  const allTransactions = getAccountTransactions(id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'transfer' | 'receive'>('all');
  const [limit] = useState<number | null>(null);
  if (!account) {
    return <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-xl font-semibold text-red-600">
        Account not found
      </h2>
      <Link to="/" className="mt-4 inline-flex items-center text-blue-800 hover:underline">
        <ArrowLeftIcon size={16} className="mr-1" /> Back to Dashboard
      </Link>
    </div>;
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const accountId = id ? parseInt(id) : 0;
  // Filter transactions based on search term, type, and limit
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredTransactions = allTransactions
    .filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(transaction =>
      transactionType === 'all' ||
      (transactionType === 'transfer' && transaction.fromAccountId === accountId) ||
      (transactionType === 'receive' && transaction.toAccountId === accountId)
    )
    .slice(0, limit || undefined);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Cắt dữ liệu theo trang
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePrint = () => {
    window.print();
  };
  return <div className="container mx-auto px-4 py-8">
    <Link to={`/account/${id}`} className="inline-flex items-center text-blue-800 hover:underline mb-6">
      <ArrowLeftIcon size={16} className="mr-1" /> Back to Account Details
    </Link>
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="bg-blue-800 text-white p-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-blue-100 mt-1">
          {account.accountName} - {account.accountNumber}
        </p>
      </div>
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search transactions..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FilterIcon size={18} className="mr-2 text-gray-500" />
              <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={transactionType} onChange={e => setTransactionType(e.target.value as 'all' | 'transfer' | 'receive')}>
                <option value="all">All Transactions</option>
                <option value="transfer">Transfer</option>
                <option value="receive">Receive</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {filteredTransactions.length > 0 ? <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map(transaction => {
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
                      {transaction.toAccountId === accountId ? '+' : '-'} {transaction.amount + '$'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-2">
            <button onClick={handlePrint} className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
              <PrinterIcon size={16} className="mr-1" /> Print
            </button>
            {/* <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
              <DownloadIcon size={16} className="mr-1" /> Export
            </button> */}
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:text-gray-400"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        )}
      </> : <div className="p-6 text-center">
        <p className="text-gray-600">
          No transactions found matching your criteria.
        </p>
      </div>}
    </div>
  </div>;
};
export default TransactionHistory;