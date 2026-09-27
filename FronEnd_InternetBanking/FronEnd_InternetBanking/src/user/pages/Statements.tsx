import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import {
  CalendarIcon,
  PrinterIcon,
  DownloadIcon,
  FileTextIcon,
} from 'lucide-react';

const Statements: React.FC = () => {
  const { accounts, getStatement } = useBank();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [statementType, setStatementType] = useState<'monthly' | 'annual'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showStatement, setShowStatement] = useState(false);
  const [summary, setSummary] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchStatement = async () => {
    if (!selectedAccount) return;

    try {
      const data = await getStatement(
        Number(selectedAccount),
        statementType,
        statementType === 'monthly' ? Number(selectedMonth) + 1 : null,
        Number(selectedYear)
      );
      if (data) {
        setSummary(data.summary);
        setTransactions(data.transactions || []);
        setShowStatement(true);
      } else {
        alert('No statement data found.');
      }
    } catch (error) {
      console.error('Error fetching statement:', error);
      alert('Error fetching statement data.');
    }
  };

  // Lấy tên tháng dựa trên selectedMonth
  const selectedMonthName = months[parseInt(selectedMonth)];

  //Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Statements</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-blue-800 text-white p-6">
          <h2 className="text-xl font-semibold">Generate Statement</h2>
          <p className="text-blue-100 mt-1">View and print your account statements</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">Select Account</label>
            <select
              id="account"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
            >
              <option value="">Select an account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.accountName} - {account.accountNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statement Type</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="statementType"
                  value="monthly"
                  checked={statementType === 'monthly'}
                  onChange={() => setStatementType('monthly')}
                />
                <span className="ml-2 text-gray-700">Monthly</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="statementType"
                  value="annual"
                  checked={statementType === 'annual'}
                  onChange={() => setStatementType('annual')}
                />
                <span className="ml-2 text-gray-700">Annual</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {statementType === 'monthly' && (
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  id="month"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index.toString()}>{month}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                id="year"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={fetchStatement}
              disabled={!selectedAccount}
              className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white ${selectedAccount ? 'bg-blue-800 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              View Statement
            </button>
          </div>
        </div>
      </div>

      {showStatement && summary && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 print:shadow-none" id="printableStatement">
          <div className="bg-blue-800 text-white p-6 flex justify-between items-center print:bg-white print:text-black">
            <div>
              <h2 className="text-xl font-semibold">Account Statement</h2>
              <p className="text-blue-100 mt-1 print:text-gray-600">{selectedMonthName} {selectedYear}</p>
            </div>
            <div className="flex space-x-2 print:hidden">
              <button onClick={handlePrint}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-600">
                <PrinterIcon size={16} className="mr-1" /> Print
              </button>
              <button
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-600">
                <DownloadIcon size={16} className="mr-1" /> Download
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <FileTextIcon className="text-blue-800 mr-2 print:text-black" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Statement Summary
                  </h3>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <CalendarIcon size={16} className="mr-1" />
                  {selectedMonthName} {selectedYear}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Account</h4>
                  <p className="font-medium">
                    {summary.AccountName} - {summary.AccountNumber}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Account Holder</h4>
                  <p className="font-medium">{summary.AccountName}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">
                    Opening Balance
                  </h4>
                  <p className="font-medium">
                    {formatCurrency(summary.OpeningBalance)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">
                    Closing Balance
                  </h4>
                  <p className="font-medium">
                    {formatCurrency(summary.ClosingBalance)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Total Credits</h4>
                  <p className="font-medium text-green-600">
                    {formatCurrency(summary.TotalCredits)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Total Debits</h4>
                  <p className="font-medium text-red-600">
                    {formatCurrency(summary.TotalDebits)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transaction Details
              </h3>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedTransactions.map(transaction => {
                        const accountId = selectedAccount ? parseInt(selectedAccount) : 0;
                        console.log(accountId)
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
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No transactions found for this period.
                </p>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 print:mt-8">
            <p className="text-xs text-gray-500 text-center">
              This statement is system generated and does not require a
              signature.
              <br />
              For any discrepancies, please contact customer support at
              1-800-SECURE-BANK.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statements;