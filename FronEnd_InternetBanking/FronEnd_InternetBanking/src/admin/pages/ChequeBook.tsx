import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, FilterIcon, EyeIcon, CheckIcon, XIcon } from 'lucide-react';
import Modal from '../../components/componentsAdmin/Modal';
import { useAuth } from '../../context/AuthContext';
import { type ChequeBookType } from '../../context/types';

const ChequeBook = () => {
    const { getChequeBooks } = useAuth();
    const [requests, setRequests] = useState<ChequeBookType[]>([]);
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ChequeBookType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Fetch cheque books from API
    useEffect(() => {
        const fetchChequeBooks = async () => {
            setIsLoading(true);
            try {
                const response = await getChequeBooks();
                console.log('Fetched cheque books:', JSON.stringify(response, null, 2));
                if (response.isSuccess && response.data) {
                    setRequests(response.data);
                } else {
                    setError(response.message || 'Failed to fetch cheque books');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching cheque books');
            } finally {
                setIsLoading(false);
            }
        };
        fetchChequeBooks();
    }, [getChequeBooks]);

    // Reset currentPage when filteredRequests change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus]);

    const handleViewDetails = (id: string) => {
        const request = requests.find(req => req.Id === id);
        if (request) {
            setSelectedRequest(request);
            setModalOpen(true);
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesSearch =
            (request.CheckNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (request.AccountName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (request.CancellationReason || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'All Status' || request.Status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRequests = filteredRequests.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Cheque Book</h1>
            </div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search cheque books..."
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
                                <span>{selectedStatus}</span>
                                <ChevronDownIcon size={16} />
                            </button>
                            <div id="statusDropdown" className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg hidden">
                                <ul className="py-1">
                                    {['All Status', 'active', 'approved', 'rejected'].map(status => (
                                        <li key={status}>
                                            <button
                                                onClick={() => {
                                                    setSelectedStatus(status);
                                                    document.getElementById('statusDropdown')?.classList.add('hidden');
                                                }}
                                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2">
                            <FilterIcon size={16} />
                            <span>More Filters</span>
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-500 mb-4">Loading...</div>
            ) : error ? (
                <div className="text-red-500 mb-4">{error}</div>
            ) : requests.length === 0 ? (
                <div className="text-gray-500 mb-4">No cheque books found</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="p-4">Request ID</th>
                                    <th className="p-4">Check Number</th>
                                    <th className="p-4">Account Name</th>
                                    <th className="p-4">Issue Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Cancellation Reason</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRequests.map(request => (
                                    <tr key={request.Id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{request.Id}</td>
                                        <td className="p-4">{request.CheckNumber}</td>
                                        <td className="p-4">{request.AccountName}</td>
                                        <td className="p-4">{new Date(request.IssueDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${request.Status === 'approved'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : request.Status === 'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {request.Status.charAt(0).toUpperCase() + request.Status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4">{request.CancellationReason || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="View Details"
                                                    onClick={() => handleViewDetails(request.Id)}
                                                >
                                                    <EyeIcon size={18} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
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
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`Cheque Book Details - ${selectedRequest?.Id || ''}`}
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Request ID</p>
                                <p className="font-medium">{selectedRequest.Id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Check Number</p>
                                <p className="font-medium">{selectedRequest.CheckNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Account Name</p>
                                <p className="font-medium">{selectedRequest.AccountName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Issue Date</p>
                                <p className="font-medium">{new Date(selectedRequest.IssueDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${selectedRequest.Status === 'approved'
                                            ? 'bg-blue-100 text-blue-800'
                                            : selectedRequest.Status === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {selectedRequest.Status.charAt(0).toUpperCase() + selectedRequest.Status.slice(1)}
                                    </span>
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Cancellation Reason</p>
                                <p className="font-medium">{selectedRequest.CancellationReason || '-'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ChequeBook;
