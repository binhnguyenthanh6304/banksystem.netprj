import { useState, useEffect } from 'react';
import { ChevronDownIcon, FilterIcon, EyeIcon, CheckIcon, XIcon } from 'lucide-react';
import Modal from '../../../components/componentsAdmin/Modal';
import { useAuth } from '../../../context/AuthContext';
import { type ChequeBookRequestType } from '../../../context/types';

interface ChequeBookProps {
  activeServiceRequestTab: string;
  setActiveServiceRequestTab: (tab: string) => void;
}

function ChequeBookRequest({
  activeServiceRequestTab,
  setActiveServiceRequestTab,
}: ChequeBookProps) {
  const { getChequeBookRequests, approveChequeBookRequest, rejectChequeBookRequest } = useAuth();
  const [requests, setRequests] = useState<ChequeBookRequestType[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChequeBookRequestType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Lấy danh sách yêu cầu sổ séc
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getChequeBookRequests();
        console.log('Fetched cheque book requests:', JSON.stringify(response, null, 2));
        if (response.isSuccess && response.data) {
          setRequests(response.data);
          setCurrentPage(1); // Reset về trang đầu tiên khi dữ liệu thay đổi
        } else {
          setError(response.message || 'Không thể tải danh sách yêu cầu sổ séc');
        }
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi tải danh sách yêu cầu sổ séc');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [getChequeBookRequests]);

  const handleViewDetails = (id: string) => {
    const request = requests.find(req => req.Id === id);
    if (request) {
      setSelectedRequest(request);
      setModalOpen(true);
    }
  };

  const handleApprove = async (id: string) => {
    const request = requests.find(req => req.Id === id);
    if (request?.Status.toLowerCase() !== 'pending') {
      setError('Yêu cầu này không ở trạng thái chờ xử lý');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await approveChequeBookRequest(id);
      if (response.isSuccess) {
        setSuccessMessage(`Yêu cầu đã được phê duyệt thành công`);
        // Cập nhật danh sách sau khi duyệt
        const updatedResponse = await getChequeBookRequests();
        if (updatedResponse.isSuccess && updatedResponse.data) {
          setRequests(updatedResponse.data);
          setCurrentPage(1); // Reset về trang đầu tiên
        }
      } else {
        setError(response.message || 'Không thể phê duyệt yêu cầu');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi phê duyệt yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    const request = requests.find(req => req.Id === id);
    if (request?.Status.toLowerCase() !== 'pending') {
      setError('Yêu cầu này không ở trạng thái chờ xử lý');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await rejectChequeBookRequest(id);
      if (response.isSuccess) {
        setSuccessMessage(`Yêu cầu đã bị từ chối`);
        // Cập nhật danh sách sau khi từ chối
        const updatedResponse = await getChequeBookRequests();
        if (updatedResponse.isSuccess && updatedResponse.data) {
          setRequests(updatedResponse.data);
          setCurrentPage(1); // Reset về trang đầu tiên
        }
      } else {
        setError(response.message || 'Không thể từ chối yêu cầu');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi từ chối yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      (request.Customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.Id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.Account || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || (request.Status || '') === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
            placeholder="Tìm kiếm yêu cầu sổ séc..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2 w-full"
              onClick={() => document.getElementById('statusDropdown')?.classList.toggle('hidden')}
            >
              <span>{selectedStatus === 'All Status' ? 'Tất cả trạng thái' : selectedStatus}</span>
              <ChevronDownIcon size={16} />
            </button>
            <div
              id="statusDropdown"
              className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg hidden"
            >
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => {
                      setSelectedStatus('All Status');
                      document.getElementById('statusDropdown')?.classList.add('hidden');
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Tất cả trạng thái
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedStatus('pending');
                      document.getElementById('statusDropdown')?.classList.add('hidden');
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Pending
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedStatus('approved');
                      document.getElementById('statusDropdown')?.classList.add('hidden');
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Approved
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedStatus('rejected');
                      document.getElementById('statusDropdown')?.classList.add('hidden');
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Rejected
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2">
            <FilterIcon size={16} />
            <span>Bộ lọc khác</span>
          </button>
        </div>
      </div>
      {successMessage && (
        <div className="text-green-500 mb-4">{successMessage}</div>
      )}
      {isLoading ? (
        <div className="text-gray-500 mb-4">Đang tải...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-500 mb-4">Không tìm thấy yêu cầu sổ séc</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="p-4">Mã yêu cầu</th>
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Tài khoản</th>
                    <th className="p-4">Số tờ</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.map(request => (
                    <tr key={request.Id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{request.Id}</td>
                      <td className="p-4">{request.Customer}</td>
                      <td className="p-4">{request.Account}</td>
                      <td className="p-4">{request.Leaves}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${request.Status.toLowerCase() === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : request.Status.toLowerCase() === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {request.Status.toLowerCase() === 'pending'
                            ? 'Pending'
                            : request.Status.toLowerCase() === 'approved'
                              ? 'Approved'
                              : 'Rejected'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Xem chi tiết"
                            onClick={() => handleViewDetails(request.Id)}
                          >
                            <EyeIcon size={18} />
                          </button>
                          <button
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Phê duyệt"
                            onClick={() => handleApprove(request.Id)}
                            disabled={isLoading || request.Status.toLowerCase() !== 'pending'}
                          >
                            <CheckIcon size={18} />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Từ chối"
                            onClick={() => handleReject(request.Id)}
                            disabled={isLoading || request.Status.toLowerCase() !== 'pending'}
                          >
                            <XIcon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        </>
      )}

      {/* ---------- Chi tiết yêu cầu sổ séc ---------- */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError(null);
          setSuccessMessage(null);
        }}
        title={`Chi tiết yêu cầu sổ séc - ${selectedRequest?.Id || ''}`}
      >
        {selectedRequest && (
          <div className="space-y-4">
            {successMessage && (
              <div className="text-green-500 mb-4">{successMessage}</div>
            )}
            {error && (
              <div className="text-red-500 mb-4">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã yêu cầu</p>
                <p className="font-medium">{selectedRequest.Id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Khách hàng</p>
                <p className="font-medium">{selectedRequest.Customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tài khoản</p>
                <p className="font-medium">{selectedRequest.Account}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số tờ</p>
                <p className="font-medium">{selectedRequest.Leaves}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${selectedRequest.Status.toLowerCase() === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedRequest.Status.toLowerCase() === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
                    {selectedRequest.Status.toLowerCase() === 'pending'
                      ? 'Pending'
                      : selectedRequest.Status.toLowerCase() === 'approved'
                        ? 'Approved'
                        : 'Rejected'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  handleApprove(selectedRequest.Id);
                }}
                className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${isLoading || selectedRequest.Status.toLowerCase() !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                disabled={isLoading || selectedRequest.Status.toLowerCase() !== 'pending'}
              >
                Phê duyệt yêu cầu
              </button>
              <button
                onClick={() => {
                  handleReject(selectedRequest.Id);
                }}
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${isLoading || selectedRequest.Status.toLowerCase() !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                disabled={isLoading || selectedRequest.Status.toLowerCase() !== 'pending'}
              >
                Từ chối yêu cầu
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ChequeBookRequest;
