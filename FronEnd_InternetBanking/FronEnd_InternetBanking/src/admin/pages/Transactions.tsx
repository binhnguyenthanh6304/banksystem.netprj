import { useState, useEffect } from 'react';
import { FilterIcon, DownloadIcon } from 'lucide-react';
import Modal from '../../components/componentsAdmin/Modal';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../context/types';

// Hàm chuyển đổi định dạng ngày giờ
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isToday ? `Today, ${time}` : `${date.toLocaleDateString()}, ${time}`;
};

// Hàm chuyển đổi Amount thành định dạng chuỗi (ví dụ: "+$1234")
const formatAmount = (amount: number): string => {
  return amount >= 0 ? `+$${amount}` : `-$${Math.abs(amount)}`;
};

const Transactions = () => {
  const { getTranssaction } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const response = await getTranssaction();
      if (response.isSuccess && response.data) {
        // Ánh xạ dữ liệu từ API sang định dạng Transaction
        const mappedTransactions: Transaction[] = response.data.map((item: any) => ({
          transactionID: item.Reference,
          sender: item.FromAccountNumber,
          recipient: item.ToAccountNumber,
          amount: formatAmount(item.Amount),
          description: item.Description,
          date: formatDate(item.CreatedAt),
        }));
        setTransactions(mappedTransactions);
      } else {
        setError(response.message || 'Failed to fetch transactions');
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [getTranssaction]);

  const handleExport = () => {
    alert('Exporting transactions data...');
  };

  const handleViewTransaction = (id: string) => {
    const transaction = transactions.find((tx) => tx.transactionID === id);
    if (transaction) {
      setSelectedTransaction({
        id: transaction.transactionID,
        user: transaction.sender,
        recipient: transaction.recipient,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
      });
      setModalOpen(true);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const sender = transaction.sender || '';
    const transactionID = transaction.transactionID || '';
    const matchesSearch =
      sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transactionID.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const truncateReason = (reason: string, maxLength: number = 20) => {
    if (reason.length <= maxLength) return reason;
    return reason.substring(0, maxLength) + '...';
  };

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!filteredTransactions.length) return <div>No transactions found.</div>;

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccounts = filteredTransactions.slice(startIndex, endIndex);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          onClick={handleExport}
        >
          <DownloadIcon size={18} />
          Export
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2"
            onClick={() => alert('More filters will be implemented here')}
          >
            <FilterIcon size={16} />
            <span>More Filters</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Sender</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Description</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.transactionID} className="border-b hover:bg-gray-50">
                  <td className="p-4">{transaction.transactionID}</td>
                  <td className="p-4">{transaction.sender}</td>
                  <td className="p-4">{transaction.recipient}</td>
                  <td
                    className={`p-4 ${transaction.amount.includes('+') ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {transaction.amount}
                  </td>
                  <td className="p-4">{truncateReason(transaction.description)}</td>
                  <td className="p-4">{transaction.date}</td>
                  <td className="p-4">
                    <button
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      onClick={() => handleViewTransaction(transaction.transactionID)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} requests
            </div>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded-md ${currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {[currentPage - 1, currentPage, currentPage + 1]
                .filter((page) => page >= 1 && page <= totalPages)
                .map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded-md ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

              <button
                className={`px-3 py-1 rounded-md ${currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
      {/* ---------- Transaction Details ---------- */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Transaction Details - ${selectedTransaction?.id || ''}`}
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{selectedTransaction.id}</h3>
                <p className="text-gray-500">{selectedTransaction.date}</p>
              </div>
              <div
                className={`text-xl font-bold ${selectedTransaction.amount.includes('+') ? 'text-green-500' : 'text-red-500'}`}
              >
                {selectedTransaction.amount}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Sender</p>
                <p className="font-medium">{selectedTransaction.user}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recipient</p>
                <p className="font-medium">{selectedTransaction.recipient}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{selectedTransaction.description}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Transactions;