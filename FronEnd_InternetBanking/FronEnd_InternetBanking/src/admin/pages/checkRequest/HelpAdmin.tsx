import React, { useState, useEffect } from 'react';
import { Filter, Eye, Edit } from 'lucide-react';
import Modal from '../../../components/componentsAdmin/Modal';
import API from '../../../utils/api';
import { CommonResponse, Helps } from '../../../context/types';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../context/AuthContext';

interface HelpProps {
    activeServiceRequestTab: string;
    setActiveServiceRequestTab: (tab: string) => void;
}

const Help = ({ activeServiceRequestTab, setActiveServiceRequestTab }: HelpProps) => {
    const { updateHelpRequest } = useAuth();
    const [requests, setRequests] = useState<Helps[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedRequest, setSelectedRequest] = useState<Helps | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [formData, setFormData] = useState<Helps>({
        id: '',
        sender: '',
        email: '',
        question: '',
        answer: null,
        sentDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        replyDate: null,
        isCurrent: true,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Gọi API để lấy danh sách help requests
    useEffect(() => {
        const fetchHelpRequests = async () => {
            setLoading(true);
            try {
                const response = await API.get<CommonResponse<Helps[]>>('/Support');
                console.log('API Response:', response.data);

                if (response.data.status === 'success' && Array.isArray(response.data.data)) {
                    const mappedRequests: Helps[] = response.data.data.map((item: any) => ({
                        id: String(item.Id),
                        sender: item.Sender || '',
                        email: item.Email || '',
                        question: item.Question || '',
                        answer: item.Answer || null,
                        sentDate: item.SentDate ? new Date(item.SentDate).toISOString().split('T')[0] : '',
                        status: item.Status || 'Pending',
                        replyDate: item.ReplyDate || null,
                        isCurrent: item.Status === 'Pending',
                    }));
                    setRequests(mappedRequests);
                } else {
                    setError('Không thể tải danh sách yêu cầu trợ giúp.');
                    toast.error('Không thể tải danh sách yêu cầu trợ giúp.', {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                }
            } catch (err: any) {
                console.error('API Error:', err.response?.data || err.message);
                setError('Lỗi khi tải dữ liệu: ' + (err.response?.data?.message || err.message));
                toast.error('Lỗi khi tải dữ liệu: ' + (err.response?.data?.message || err.message), {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchHelpRequests();
    }, []);

    const handleCreate = () => {
        setModalMode('create');
        setFormData({
            id: `HELP-${Math.floor(1000 + Math.random() * 9000)}`,
            sender: '',
            email: '',
            question: '',
            answer: null,
            sentDate: new Date().toISOString().split('T')[0],
            status: 'Pending',
            replyDate: null,
            isCurrent: true,
        });
        setModalOpen(true);
    };

    const handleEdit = (id: string) => {
        const request = requests.find((req) => req.id === id);
        if (request) {
            setSelectedRequest(request);
            setFormData(request);
            setModalMode('edit');
            setModalOpen(true);
        }
    };

    const handleViewDetails = (id: string) => {
        const request = requests.find((req) => req.id === id);
        if (request) {
            setSelectedRequest(request);
            setModalMode('view');
            setModalOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            setRequests([...requests, formData]);
            // TODO: Gọi API POST nếu có endpoint, ví dụ: API.post('/Support', formData)
            toast.success(`Yêu cầu ${formData.id} đã được tạo thành công`, {
                position: 'top-right',
                autoClose: 3000,
            });
        } else if (modalMode === 'edit') {
            try {
                const response = await updateHelpRequest(formData.id, formData.answer || '');
                if (response.isSuccess) {
                    setRequests((prev) =>
                        prev.map((req) =>
                            req.id === formData.id
                                ? {
                                    ...req,
                                    answer: formData.answer,
                                    status: formData.status,
                                    replyDate: formData.replyDate || new Date().toISOString().split('T')[0],
                                    isCurrent: formData.isCurrent,
                                }
                                : req,
                        ),
                    );
                    toast.success(`Đã cập nhật câu trả lời cho yêu cầu ${formData.id} thành công!`, {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                } else {
                    toast.error(response.message || 'Không thể cập nhật yêu cầu', {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                }
            } catch (err: any) {
                console.error('Update Error:', err.response?.data || err.message);
                toast.error('Lỗi khi cập nhật yêu cầu: ' + (err.response?.data?.message || err.message), {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        }
        setModalOpen(false);
        setFormData({
            id: '',
            sender: '',
            email: '',
            question: '',
            answer: null,
            sentDate: new Date().toISOString().split('T')[0],
            status: 'Pending',
            replyDate: null,
            isCurrent: true,
        });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'isCurrent' ? value === 'true' : value,
            status: name === 'isCurrent' ? (value === 'true' ? 'Pending' : 'Resolved') : prev.status,
        }));
    };

    const filteredRequests = requests.filter((request) => {
        const matchesSearch =
            request.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const truncateReason = (reason: string | null, maxLength: number = 10) => {
        if (!reason) return 'N/A';
        if (reason.length <= maxLength) return reason;
        return reason.substring(0, maxLength) + '...';
    };

    if (loading) {
        return <div className="text-center py-8">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-600">{error}</div>;
    }

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAccounts = filteredRequests.slice(startIndex, endIndex);

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
                                : 'border-transparent text-gray-500 hover:text-gray-300'
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

            <div className="flex justify-between items-center mb-4">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={handleCreate}
                >
                    Create New Help Request
                </button>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search help requests..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2">
                            <Filter size={16} />
                            <span>More Filters</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="p-4">Sender</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Question</th>
                                <th className="p-4">Answer</th>
                                <th className="p-4">Sent Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAccounts.map((request) => (
                                <tr key={request.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{request.sender}</td>
                                    <td className="p-4">{truncateReason(request.email)}</td>
                                    <td className="p-4">{truncateReason(request.question)}</td>
                                    <td className="p-4">{truncateReason(request.answer)}</td>
                                    <td className="p-4">{request.sentDate}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${request.status.toLowerCase() === 'resolved'
                                                ? 'bg-blue-100 text-blue-800'
                                                : request.status.toLowerCase() === 'closed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {request.status.toLowerCase() === 'pending'
                                                ? 'Pending'
                                                : request.status.toLowerCase() === 'resolved'
                                                    ? 'Resolved'
                                                    : 'Closed'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="View Details"
                                                onClick={() => handleViewDetails(request.id)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit"
                                                onClick={() => handleEdit(request.id)}
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </div>
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
                onClose={() => {
                    setModalOpen(false);
                    setFormData({
                        id: '',
                        sender: '',
                        email: '',
                        question: '',
                        answer: null,
                        sentDate: new Date().toISOString().split('T')[0],
                        status: 'Pending',
                        replyDate: null,
                        isCurrent: true,
                    });
                }}
                title={
                    modalMode === 'create'
                        ? 'Create Help Request'
                        : modalMode === 'edit'
                            ? `Edit Help Request - ${selectedRequest?.id || ''}`
                            : `Help Request Details - ${selectedRequest?.id || ''}`
                }
            >
                {modalMode === 'view' && selectedRequest ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Sender</p>
                                <p className="font-medium">{selectedRequest.sender}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{selectedRequest.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Question</p>
                                <p className="font-medium">{selectedRequest.question}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Answer</p>
                                <p className="font-medium">{selectedRequest.answer || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Sent Date</p>
                                <p className="font-medium">{selectedRequest.sentDate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">{selectedRequest.status}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Reply Date</p>
                                <p className="font-medium">{selectedRequest.replyDate || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Is Current</p>
                                <p className="font-medium">{selectedRequest.isCurrent ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500">Sender</label>
                                <input
                                    type="text"
                                    name="sender"
                                    value={formData.sender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={modalMode === 'edit'}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={modalMode === 'edit'}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Question</label>
                                <input
                                    type="text"
                                    name="question"
                                    value={formData.question}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={modalMode === 'edit'}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Answer</label>
                                <input
                                    type="text"
                                    name="answer"
                                    value={formData.answer || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Sent Date</label>
                                <input
                                    type="date"
                                    name="sentDate"
                                    value={formData.sentDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={modalMode === 'edit'}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Reply Date</label>
                                <input
                                    type="date"
                                    name="replyDate"
                                    value={formData.replyDate || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Is Current</label>
                                <select
                                    name="isCurrent"
                                    value={formData.isCurrent.toString()}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                {modalMode === 'create' ? 'Create Request' : 'Update Request'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Help;