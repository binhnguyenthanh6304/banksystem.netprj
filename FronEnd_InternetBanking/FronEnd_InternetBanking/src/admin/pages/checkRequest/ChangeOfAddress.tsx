import { useState, useEffect } from 'react';
import { FilterIcon, EyeIcon, CheckIcon, XIcon } from 'lucide-react';
import Modal from '../../../components/componentsAdmin/Modal';
import API from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { CommonResponse } from '../../../context/types';
import { toast } from 'react-toastify';

interface AddressChangeRequest {
  id: string;
  customer: string;
  newAddress: string;
  requestDate: string;
  status: string;
}

interface ChangeOfAddressProps {
  activeServiceRequestTab: string;
  setActiveServiceRequestTab: (tab: string) => void;
}

function ChangeOfAddress
  ({ activeServiceRequestTab, setActiveServiceRequestTab }
    : ChangeOfAddressProps) {
  const { approveAddressChangeRequest, rejectAddressChangeRequest } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AddressChangeRequest | null>(null);
  const [requests, setRequests] = useState<AddressChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Gọi API để lấy danh sách address change requests
  useEffect(() => {
    const fetchAddressChangeRequests = async () => {
      setIsLoading(true);
      try {
        const response = await API.get<CommonResponse<AddressChangeRequest[]>>(
          '/AddressChangeRequests',
        );
        console.log('API Response:', JSON.stringify(response.data, null, 2));
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          const mappedRequests: AddressChangeRequest[] = response.data.data.map((item: any) => ({
            id: String(item.Id),
            customer: item.Customer || '',
            newAddress: item.NewAddress || '',
            requestDate: item.RequestDate ? new Date(item.RequestDate).toISOString().split('T')[0] : '',
            status: item.Status.charAt(0).toUpperCase() + item.Status.slice(1).toLowerCase(),
          }));
          setRequests(mappedRequests);
        } else {
          setError('Không thể tải danh sách yêu cầu thay đổi địa chỉ.');
          toast.error('Không thể tải danh sách yêu cầu thay đổi địa chỉ.');
        }
      } catch (err: any) {
        console.error('API Error:', err.response?.data || err.message);
        const errorMessage = 'Lỗi khi tải dữ liệu: ' + (err.response?.data?.message || err.message);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddressChangeRequests();
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
      const response = await approveAddressChangeRequest(id);
      if (response.isSuccess) {
        setRequests(requests.map((req) => (req.id === id ? { ...req, status: 'Approved' } : req)));
        toast.success(`The request to change the address has been approved successfully!`, {
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
      const response = await rejectAddressChangeRequest(id);
      if (response.isSuccess) {
        setRequests(requests.map((req) => (req.id === id ? { ...req, status: 'Rejected' } : req)));
        toast.success(`The request to change the address has been rejected successfully!`, {
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

  const filteredRequests = requests.filter((request) =>
    [request.customer, request.id, request.newAddress, request.status].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  // Logic phân trang
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccounts = filteredRequests.slice(startIndex, endIndex);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="mb-4">
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
            placeholder="Search address changes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2"
            onClick={() => toast.info('More filters will be implemented here')}
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
                <th className="p-4">Request ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">New Address</th>
                <th className="p-4">Request Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentAccounts.map((request) => (
                <tr key={request.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{request.id}</td>
                  <td className="p-4">{request.customer}</td>
                  <td className="p-4">{request.newAddress}</td>
                  <td className="p-4">{request.requestDate}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${request.status === 'Approved'
                          ? 'bg-blue-100 text-blue-800'
                          : request.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                        onClick={() => handleViewDetails(request.id)}
                      >
                        <EyeIcon size={18} />
                      </button>
                      <button
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Approve"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckIcon size={18} />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Reject"
                        onClick={() => handleReject(request.id)}
                      >
                        <XIcon size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Change of Address Detail - ${selectedRequest?.id || ''}`}
      >
        {selectedRequest && (
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedRequest.customer || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">New Address</p>
                <p className="font-medium">{selectedRequest.newAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Request Date</p>
                <p className="font-medium">{selectedRequest.requestDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{selectedRequest.status || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChangeOfAddress;