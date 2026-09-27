import { useState, useEffect } from 'react';
import { Filter, Eye, Check, X } from 'lucide-react';
import Modal from '../../../components/componentsAdmin/Modal';
import API from '../../../utils/api';
import { CommonResponse, type StopPaymentRequest } from '../../../context/types';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../context/AuthContext';

interface StopPaymentProps {
  activeServiceRequestTab: string;
  setActiveServiceRequestTab: (tab: string) => void;
}

const StopPayment = ({ activeServiceRequestTab, setActiveServiceRequestTab }: StopPaymentProps) => {
  const { approveStopPaymentRequest, rejectStopPaymentRequest } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StopPaymentRequest | null>(null);
  const [requests, setRequests] = useState<StopPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Gọi API để lấy danh sách stop payment requests
  useEffect(() => {
    const fetchStopPaymentRequests = async () => {
      setLoading(true);
      try {
        const response = await API.get<CommonResponse<StopPaymentRequest[]>>('/StopPaymentRequests');
        console.log('API Response:', response.data);

        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          const mappedRequests: StopPaymentRequest[] = response.data.data.map((item: any) => ({
            id: String(item.Id),
            customer: item.Customer || '',
            account: item.Account || '',
            chequeNumber: item.ChequeNumber || '',
            chequeDate: item.ChequeDate ? new Date(item.ChequeDate).toISOString().split('T')[0] : '',
            payeeName: item.PayeeName || '',
            reasonForStopPayment: item.ReasonForStopPayment || '',
            status: item.Status.charAt(0).toUpperCase() + item.Status.slice(1).toLowerCase(),
            requestDate: item.RequestDate ? new Date(item.RequestDate).toISOString().split('T')[0] : '',
          }));
          setRequests(mappedRequests);
        } else {
          setError('Không thể tải danh sách yêu cầu dừng thanh toán.');
          toast.error('Không thể tải danh sách yêu cầu dừng thanh toán.', {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      } catch (err: any) {
        console.error('API Error:', err.response?.data || err.message);
        const errorMessage = 'Lỗi khi tải dữ liệu: ' + (err.response?.data?.message || err.message);
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStopPaymentRequests();
  }, []);

  const handleViewDetails = (id: string) => {
    const request = requests.find((req) => req.id === id);
    if (request) {
      setSelectedRequest(request);
      setModalOpen(true);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await approveStopPaymentRequest(id);
      if (response.isSuccess) {
        setRequests(requests.map((req) => (req.id === id ? { ...req, status: 'Approved' } : req)));
        toast.success(`Yêu cầu dừng thanh toán ${id} đã được phê duyệt thành công!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(response.message || 'Không thể phê duyệt yêu cầu', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err: any) {
      console.error('Approve Error:', err.response?.data || err.message);
      toast.error('Lỗi khi phê duyệt: ' + (err.response?.data?.message || err.message), {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await rejectStopPaymentRequest(id);
      if (response.isSuccess) {
        setRequests(requests.map((req) => (req.id === id ? { ...req, status: 'Rejected' } : req)));
        toast.success(`Yêu cầu dừng thanh toán ${id} đã bị từ chối thành công!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(response.message || 'Không thể từ chối yêu cầu', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err: any) {
      console.error('Reject Error:', err.response?.data || err.message);
      toast.error('Lỗi khi từ chối: ' + (err.response?.data?.message || err.message), {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const filteredRequests = requests.filter((request) =>
    [request.customer, request.id, request.account, request.chequeNumber].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const truncateReason = (reason: string, maxLength: number = 20) => {
    if (reason.length <= maxLength) return reason;
    return reason.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  // Logic phân trang
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`border-b-2 py-4 px-1 font-medium ${activeServiceRequestTab === 'chequeBookRequest'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveServiceRequestTab('chequeBookRequest')}
            >
              Cheque Book Request
            </button>
            <button
              className={`border-b-2 py-4 px-1 font-medium ${activeServiceRequestTab === 'changeOfAddress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveServiceRequestTab('changeOfAddress')}
            >
              Change of Address
            </button>
            <button
              className={`border-b-2 py-4 px-1 font-medium ${activeServiceRequestTab === 'stopPayment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveServiceRequestTab('stopPayment')}
            >
              Stop Payment
            </button>
            <button
              className={`border-b-2 py-4 px-1 font-medium ${activeServiceRequestTab === 'helpAdmin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveServiceRequestTab('helpAdmin')}
            >
              Send Mail
            </button>
          </nav>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search stop payments..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2"
            onClick={() => toast.info('More filters will be implemented here', { position: 'top-right', autoClose: 3000 })}
          >
            <Filter size={16} />
            <span>More Filters</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 max-w-[1070px]">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-gray-500 border-b sticky top-0 bg-white">
                <th className="p-4 whitespace-nowrap min-w-[100px]">Request ID</th>
                <th className="p-4 whitespace-nowrap min-w-[150px]">Customer</th>
                <th className="p-4 whitespace-nowrap min-w-[120px]">Account</th>
                <th className="p-4 whitespace-nowrap min-w-[120px]">Cheque Number</th>
                <th className="p-4 whitespace-nowrap min-w-[120px]">Cheque Date</th>
                <th className="p-4 whitespace-nowrap min-w-[150px]">Payee Name</th>
                <th className="p-4 whitespace-nowrap min-w-[180px]">Reason for Stop Payment</th>
                <th className="p-4 whitespace-nowrap min-w-[100px]">Status</th>
                <th className="p-4 whitespace-nowrap min-w-[120px]">Request Date</th>
                <th className="p-4 whitespace-nowrap min-w-[120px] text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRequests.map((request) => (
                <tr key={request.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 whitespace-nowrap">{request.id}</td>
                  <td className="p-4 whitespace-nowrap">{request.customer}</td>
                  <td className="p-4 whitespace-nowrap">{request.account}</td>
                  <td className="p-4 whitespace-nowrap">{request.chequeNumber}</td>
                  <td className="p-4 whitespace-nowrap">{request.chequeDate}</td>
                  <td className="p-4 whitespace-nowrap">{request.payeeName}</td>
                  <td className="p-4 whitespace-nowrap">{truncateReason(request.reasonForStopPayment)}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${request.status === 'Approved'
                          ? 'bg-blue-100 text-blue-800'
                          : request.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">{request.requestDate}</td>
                  <td className="p-4 whitespace-nowrap flex justify-center space-x-2">
                    <button
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                      onClick={() => handleViewDetails(request.id)}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Approve"
                      onClick={() => handleApprove(request.id)}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Reject"
                      onClick={() => handleReject(request.id)}
                    >
                      <X size={18} />
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
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
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Stop Payment Request Details - ${selectedRequest?.id || ''}`}
      >
        {selectedRequest && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedRequest.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account</p>
                <p className="font-medium">{selectedRequest.account}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cheque Number</p>
                <p className="font-medium">{selectedRequest.chequeNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cheque Date</p>
                <p className="font-medium">{selectedRequest.chequeDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payee Name</p>
                <p className="font-medium">{selectedRequest.payeeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reason for Stop Payment</p>
                <p className="font-medium">{selectedRequest.reasonForStopPayment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{selectedRequest.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Request Date</p>
                <p className="font-medium">{selectedRequest.requestDate}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => toast.info(`Edit request ${selectedRequest.id} will be implemented here`, { position: 'top-right', autoClose: 3000 })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Request
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StopPayment;