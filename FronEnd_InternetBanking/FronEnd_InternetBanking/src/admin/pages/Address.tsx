import React, { useState, useEffect } from 'react';
import { FilterIcon, EyeIcon, XIcon, EditIcon } from 'lucide-react';
import Modal from '../../components/componentsAdmin/Modal';
import { useAuth } from '../../context/AuthContext';
import { AddressRequest } from '../../context/types';

const Address = () => {
    const { getAddresses, updateAddress, deleteAddress } = useAuth();
    const [requests, setRequests] = useState<AddressRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedRequest, setSelectedRequest] = useState<AddressRequest | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [formData, setFormData] = useState<AddressRequest>({
        id: 0,
        userName: '',
        email: '',
        addressDetail: '',
        district: '',
        city: '',
        country: '',
        isCurrent: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            setIsLoading(true);
            const response = await getAddresses();
            if (response.isSuccess && response.data) {
                setRequests(response.data);
            } else {
                alert(response.message);
            }
            setIsLoading(false);
        };
        fetchAddresses();
    }, [getAddresses]);

    const handleEdit = (id: number) => {
        const request = requests.find(req => req.id === id);
        if (request) {
            setSelectedRequest(request);
            setFormData(request);
            setModalMode('edit');
            setModalOpen(true);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm(`Are you sure you want to delete address ${id}?`)) {
            const response = await deleteAddress(id);
            if (response.isSuccess) {
                setRequests(requests.filter(req => req.id !== id));
            } else {
                alert(response.message);
            }
        }
    };

    const handleViewDetails = (id: number) => {
        const request = requests.find(req => req.id === id);
        if (request) {
            setSelectedRequest(request);
            setModalMode('view');
            setModalOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const addressPayload: AddressRequest = {
            id: formData.id,
            userName: formData.userName,
            email: formData.email,
            addressDetail: formData.addressDetail,
            district: formData.district,
            city: formData.city,
            country: formData.country,
            isCurrent: formData.isCurrent,
        };

        let response;
        if (modalMode === 'edit') {
            response = await updateAddress(formData.id, addressPayload);
            if (response.isSuccess) {
                setRequests(requests.map(req => req.id === formData.id ? addressPayload : req));
            }
        }

        if (response?.isSuccess) {
            setModalOpen(false);
            setFormData({
                id: 0,
                userName: '',
                email: '',
                addressDetail: '',
                district: '',
                city: '',
                country: '',
                isCurrent: false,
            });
        } else {
            alert(response?.message || 'Operation failed.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'isCurrent' ? (value === 'true') : value,
        }));
    };

    const filteredRequests = requests.filter(request => {
        const matchesSearch =
            request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.id.toString().includes(searchTerm) ||
            request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.addressDetail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.country.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });
    const truncateReason = (reason: string, maxLength: number = 10) => {
        if (reason.length <= maxLength) return reason;
        return reason.substring(0, maxLength) + '...';
    };

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
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Address</h1>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search address..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2">
                            <FilterIcon size={16} />
                            <span>More Filters</span>
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="p-4">User Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Address Detail</th>
                                    <th className="p-4">District</th>
                                    <th className="p-4">City</th>
                                    <th className="p-4">Country</th>
                                    <th className="p-4">Is Current</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAccounts.map(request => (
                                    <tr key={request.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{request.userName}</td>
                                        <td className="p-4">{truncateReason(request.email)}</td>
                                        <td className="p-4">{truncateReason(request.addressDetail)}</td>
                                        <td className="p-4">{truncateReason(request.district)}</td>
                                        <td className="p-4">{request.city}</td>
                                        <td className="p-4">{request.country}</td>
                                        <td className="p-4">{request.isCurrent ? 'Yes' : 'No'}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View Details" onClick={() => handleViewDetails(request.id)}>
                                                    <EyeIcon size={18} />
                                                </button>
                                                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit" onClick={() => handleEdit(request.id)}>
                                                    <EditIcon size={18} />
                                                </button>
                                                <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete" onClick={() => handleDelete(request.id)}>
                                                    <XIcon size={18} />
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
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setFormData({
                        id: 0,
                        userName: '',
                        email: '',
                        addressDetail: '',
                        district: '',
                        city: '',
                        country: '',
                        isCurrent: false,
                    });
                }}
                title={modalMode === 'create' ? 'Create Address Change Request' :
                    modalMode === 'edit' ? `Edit Address Change Request - ${selectedRequest?.id || ''}` :
                        `Address Change Request Details - ${selectedRequest?.id || ''}`}
            >
                {modalMode === 'view' && selectedRequest ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">User Name</p>
                                <p className="font-medium">{selectedRequest.userName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{selectedRequest.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Address Detail</p>
                                <p className="font-medium">{selectedRequest.addressDetail}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">District</p>
                                <p className="font-medium">{selectedRequest.district}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">City</p>
                                <p className="font-medium">{selectedRequest.city}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Country</p>
                                <p className="font-medium">{selectedRequest.country}</p>
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
                                <label className="text-sm text-gray-500">User Name</label>
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
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
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Address Detail</label>
                                <input
                                    type="text"
                                    name="addressDetail"
                                    value={formData.addressDetail}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">District</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
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

export default Address;