import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RegisterForm, User } from '../../context/types';
import Modal from '../../components/componentsAdmin/Modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

interface UserRequest {
  id: string;
  initial: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  city: string;
  district: string;
  addressDetail: string;
  joinDate: string;
  accounts: string[];
}

interface ServerUser {
  Id?: string;
  FullName?: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  City?: string;
  District?: string;
  AddressDetail?: string;
  Role?: string;
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  addressDetail?: string;
  role?: string;
}

const Users = () => {
  const { getUsers, user, register, updateUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [modalOpen, setModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRequest | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [users, setUsers] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    province: '',
    district: '',
    addressDetail: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'User',
  });
  const [editUser, setEditUser] = useState<UserRequest | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để truy cập danh sách người dùng.');
        navigate('/login');
        return;
      }
      setIsLoading(true);
      try {
        const response = await getUsers();
        console.log('Full API response:', JSON.stringify(response, null, 2));
        console.log('response.data:', JSON.stringify(response.data, null, 2));
        if (response.isSuccess && Array.isArray(response.data)) {
          const convertedUsers: UserRequest[] = response.data.map((user: ServerUser) => {
            const fullName = user.FullName || user.fullName || '';
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            const addressDetail = user.AddressDetail || user.addressDetail || user.Address || user.address || '';
            const district = user.District || user.district || '';
            const city = user.City || user.city || '';
            console.log('User address from server:', { addressDetail, district, city });
            return {
              id: user.Id || user.id || '',
              initial: firstName.charAt(0).toUpperCase() || '',
              firstName,
              lastName,
              name: fullName,
              email: user.Email || user.email || '',
              role: user.Role || user.role || 'User',
              phone: user.Phone || user.phone || '',
              city,
              district,
              addressDetail,
              joinDate: new Date().toISOString().split('T')[0],
              accounts: [],
            };
          });
          setUsers(convertedUsers);
          console.log('Converted users:', JSON.stringify(convertedUsers, null, 2));
        } else {
          console.error('response.data is not an array or isSuccess is false:', response);
          toast.error(response.message || 'Dữ liệu người dùng không đúng định dạng.');
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy danh sách người dùng:', JSON.stringify(error.response?.data || error.message, null, 2));
        toast.error('Không thể lấy danh sách người dùng.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [getUsers, navigate]);

  // Fetch provinces
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => res.json())
      .then(data => {
        const provincesData = data.map((p: any) => ({
          code: p.code,
          name: p.name,
        }));
        console.log('Provinces data:', JSON.stringify(provincesData, null, 2));
        setProvinces(provincesData);
      })
      .catch((error) => {
        console.error('Error fetching provinces:', error);
        setProvinces([{ code: 1, name: 'Hà Nội' }, { code: 2, name: 'TP Hồ Chí Minh' }]);
        toast.error('Không thể tải danh sách tỉnh/thành.');
      });
  }, []);

  // Fetch districts for add user modal
  useEffect(() => {
    if (newUser.province) {
      setIsLoadingDistricts(true);
      const selectedProvince = provinces.find(p => p.name === newUser.province);
      if (selectedProvince) {
        fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
          .then(res => res.json())
          .then(data => {
            const districtNames = data.districts.map((d: any) => d.name);
            console.log('Districts data for add user:', JSON.stringify(districtNames, null, 2));
            setDistricts(districtNames);
          })
          .catch((error) => {
            console.error('Error fetching districts:', error);
            setDistricts([]);
            toast.error('Không thể tải danh sách quận/huyện.');
          })
          .finally(() => setIsLoadingDistricts(false));
      } else {
        setDistricts([]);
        setIsLoadingDistricts(false);
      }
    } else {
      setDistricts([]);
      setIsLoadingDistricts(false);
    }
    setNewUser(prev => ({ ...prev, district: '' }));
  }, [newUser.province, provinces]);

  // Fetch districts for edit user modal
  useEffect(() => {
    if (editUser?.city) {
      setIsLoadingDistricts(true);
      const selectedProvince = provinces.find(p => p.name === editUser.city);
      if (selectedProvince) {
        fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
          .then(res => res.json())
          .then(data => {
            const districtNames = data.districts.map((d: any) => d.name);
            console.log('Districts data for edit user:', JSON.stringify(districtNames, null, 2));
            setDistricts(districtNames);
            // Chỉ đặt lại district nếu district hiện tại không thuộc danh sách mới
            if (editUser.district && !districtNames.includes(editUser.district)) {
              setEditUser(prev => (prev ? { ...prev, district: '' } : prev));
            }
          })
          .catch((error) => {
            console.error('Error fetching districts for edit user:', error);
            setDistricts([]);
            toast.error('Không thể tải danh sách quận/huyện.');
          })
          .finally(() => setIsLoadingDistricts(false));
      } else {
        setDistricts([]);
        setIsLoadingDistricts(false);
        if (editUser) {
          setEditUser(prev => (prev ? { ...prev, district: '' } : prev));
        }
      }
    } else {
      setDistricts([]);
      setIsLoadingDistricts(false);
      if (editUser) {
        setEditUser(prev => (prev ? { ...prev, district: '' } : prev));
      }
    }
  }, [editUser?.city, provinces]);

  if (!user || user.role !== 'Admin') {
    return <div>Bạn không có quyền truy cập trang này.</div>;
  }

  const handleAddUser = () => {
    setAddUserModalOpen(true);
  };

  const handleViewUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setModalOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      console.log('Selected user for edit:', user);
      setEditUser({
        ...user,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        city: user.city || '',
        district: user.district || '',
        addressDetail: user.addressDetail || '',
      });
      setEditUserModalOpen(true);
    } else {
      toast.error('Không tìm thấy người dùng.');
    }
  };

  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditUser((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    const nameRegex = /\d/;
    if (nameRegex.test(newUser.firstName) || nameRegex.test(newUser.lastName)) {
      errors.inputName = 'Tên và họ không được chứa số!';
    }
    if (!newUser.firstName || !newUser.lastName) {
      errors.inputName = errors.inputName || 'Tên và họ không được để trống!';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|yahoo|vn)$/;
    if (!emailRegex.test(newUser.email)) {
      errors.email = 'Email không hợp lệ! (Phải có đuôi .com, .yahoo hoặc .vn)';
    }
    if (users.some((u) => u.email === newUser.email)) {
      errors.email = 'Email đã tồn tại!';
    }

    if (!newUser.province) {
      errors.province = 'Vui lòng chọn tỉnh/thành!';
    }

    if (!newUser.district) {
      errors.district = 'Vui lòng chọn quận/huyện!';
    }

    if (!newUser.addressDetail.trim()) {
      errors.addressDetail = 'Địa chỉ chi tiết không được để trống!';
    }

    const phoneRegex = /^(\+84|0)(3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(newUser.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ! Phải bắt đầu bằng 03/05/07/08/09 và có 10 chữ số.';
    }

    if (!newUser.username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống!';
    }
    if (users.some((u) => u.email.split('@')[0] === newUser.username)) {
      errors.username = 'Tên đăng nhập đã tồn tại!';
    }

    if (!newUser.password) {
      errors.password = 'Mật khẩu không được để trống!';
    } else if (newUser.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
    }

    if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Vui lòng kiểm tra lại các trường thông tin.');
      return;
    }

    try {
      const registerForm: RegisterForm = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        confirmPassword: newUser.confirmPassword,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        addressDetail: newUser.addressDetail,
        district: newUser.district,
        city: newUser.province,
        country: 'Việt Nam',
        role: newUser.role,
      };
      const response = await register(registerForm);
      if (response.isSuccess && response.data) {
        const nameUser = `${newUser.firstName} ${newUser.lastName}`;
        const newUserData: UserRequest = {
          id: `#${users.length + 1}`,
          initial: newUser.firstName.charAt(0).toUpperCase(),
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          name: nameUser,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          city: newUser.province,
          district: newUser.district,
          addressDetail: newUser.addressDetail,
          joinDate: new Date().toISOString().split('T')[0],
          accounts: [],
        };
        setUsers([...users, newUserData]);
        setAddUserModalOpen(false);
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          province: '',
          district: '',
          addressDetail: '',
          phone: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: '',
        });
        setFieldErrors({});
        toast.success(`Người dùng ${nameUser} đã được thêm thành công`);

        try {
          const usersResponse = await getUsers();
          if (usersResponse.isSuccess && usersResponse.data) {
            const convertedUsers: UserRequest[] = usersResponse.data.map((user: ServerUser) => {
              const fullName = user.FullName || user.fullName || '';
              const nameParts = fullName.trim().split(' ');
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';
              const addressDetail = user.AddressDetail || user.addressDetail || user.Address || user.address || '';
              const district = user.District || user.district || '';
              const city = user.City || user.city || '';
              console.log('User address from server:', { addressDetail, district, city });
              return {
                id: user.Id || user.id || '',
                initial: firstName.charAt(0).toUpperCase() || '',
                firstName,
                lastName,
                name: fullName,
                email: user.Email || user.email || '',
                role: user.Role || user.role || 'User',
                phone: user.Phone || user.phone || '',
                city,
                district,
                addressDetail,
                joinDate: new Date().toISOString().split('T')[0],
                accounts: [],
              };
            });
            setUsers(convertedUsers);
            console.log('Updated users after register:', convertedUsers);
          }
        } catch (error: any) {
          console.error('Error refreshing users:', error.response?.data || error.message);
          toast.error('Lỗi khi làm mới danh sách người dùng.');
        }
      } else {
        toast.error(response.message || 'Không thể thêm người dùng.');
      }
    } catch (error: any) {
      console.error('Error adding user:', error.response?.data || error.message);
      toast.error('Không thể thêm người dùng.');
    }
  };

  const handleSubmitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) {
      toast.error('Không có dữ liệu người dùng để chỉnh sửa.');
      return;
    }

    const errors: { [key: string]: string } = {};

    const nameRegex = /\d/;
    if (nameRegex.test(editUser.firstName) || nameRegex.test(editUser.lastName)) {
      errors.inputName = 'Tên và họ không được chứa số!';
    }
    if (!editUser.firstName || !editUser.lastName) {
      errors.inputName = errors.inputName || 'Tên và họ không được để trống!';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|yahoo|vn)$/;
    if (!emailRegex.test(editUser.email)) {
      errors.email = 'Email không hợp lệ! (Phải có đuôi .com, .yahoo hoặc .vn)';
    }
    if (users.some((u) => u.email === editUser.email && u.id !== editUser.id)) {
      errors.email = 'Email đã tồn tại!';
    }

    if (!editUser.city) {
      errors.province = 'Vui lòng chọn tỉnh/thành!';
    }

    if (!editUser.district) {
      errors.district = 'Vui lòng chọn quận/huyện!';
    }

    if (!editUser.addressDetail.trim()) {
      errors.addressDetail = 'Địa chỉ chi tiết không được để trống!';
    }

    const phoneRegex = /^(\+84|0)(3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(editUser.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ! Phải bắt đầu bằng 03/05/07/08/09 và có 10 chữ số.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Vui lòng kiểm tra lại các trường thông tin.');
      return;
    }

    try {
      const updateForm: Partial<User> = {
        email: editUser.email,
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        phone: editUser.phone,
        addressDetail: editUser.addressDetail,
        district: editUser.district,
        province: editUser.city,
        country: '',
        role: editUser.role,
      };
      console.log('Editing user ID:', editUser.id);
      console.log('Submitting update for user:', updateForm);
      const response = await updateUser(editUser.id, updateForm);
      if (response.isSuccess) {
        const updatedName = `${editUser.firstName} ${editUser.lastName}`;
        setUsers(
          users.map((u) =>
            u.id === editUser.id
              ? {
                ...editUser,
                name: updatedName,
              }
              : u
          )
        );
        setEditUserModalOpen(false);
        setEditUser(null);
        setFieldErrors({});
        setDistricts([]);
        toast.success(`Người dùng ${updatedName} đã được cập nhật thành công`);

        try {
          const usersResponse = await getUsers();
          if (usersResponse.isSuccess && usersResponse.data) {
            const convertedUsers: UserRequest[] = usersResponse.data.map((user: ServerUser) => {
              const fullName = user.FullName || user.fullName || '';
              const nameParts = fullName.trim().split(' ');
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';
              const addressDetail = user.AddressDetail || user.addressDetail || user.Address || user.address || '';
              const district = user.District || user.district || '';
              const city = user.City || user.city || '';
              console.log('User address from server:', { addressDetail, district, city });
              return {
                id: user.Id || user.id || '',
                initial: firstName.charAt(0).toUpperCase() || '',
                firstName,
                lastName,
                name: fullName,
                email: user.Email || user.email || '',
                role: user.Role || user.role || 'User',
                phone: user.Phone || user.phone || '',
                city,
                district,
                addressDetail,
                joinDate: new Date().toISOString().split('T')[0],
                accounts: [],
              };
            });
            setUsers(convertedUsers);
            console.log('Updated users after edit:', convertedUsers);
          } else {
            console.error('Failed to fetch updated users:', usersResponse);
            toast.error('Không thể làm mới danh sách người dùng.');
          }
        } catch (error: any) {
          console.error('Error refreshing users:', error.response?.data || error.message);
          toast.error('Lỗi khi làm mới danh sách người dùng.');
        }
      } else {
        toast.error(response.message || 'Không thể cập nhật người dùng.');
      }
    } catch (error: any) {
      console.error('Error updating user:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        toast.error('Người dùng không tồn tại hoặc endpoint không đúng.');
      } else if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Lỗi hệ thống khi cập nhật người dùng.');
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All Roles' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  console.log('Filtered users:', filteredUsers);
  console.log('searchTerm:', searchTerm);
  console.log('selectedRole:', selectedRole);
  // Logic phân trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccounts = filteredUsers.slice(startIndex, endIndex);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const truncateReason = (reason: string, maxLength: number = 20) => {
    if (reason.length <= maxLength) return reason;
    return reason.substring(0, maxLength) + '...';
  };

  return (
    <div>
      <ToastContainer />
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          onClick={handleAddUser}
        >
          <PlusIcon size={18} />
          Add User
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search user..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2 w-full"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            >
              <span>{selectedRole}</span>
              <ChevronDownIcon size={16} />
            </button>
            <div
              className={`absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg ${isRoleDropdownOpen ? '' : 'hidden'}`}
            >
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => {
                      setSelectedRole('All Roles');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    All Roles
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedRole('User');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    User
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedRole('Admin');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Admin
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Address</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentAccounts.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{user.id}</td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{truncateReason(user.email)}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">{user.phone}</td>
                  <td className="p-4">
                    {user.city || user.district || user.addressDetail
                      ? truncateReason(
                        `${user.addressDetail || ''}${user.addressDetail && (user.district || user.city) ? ', ' : ''}${user.district || ''}${user.district && user.city ? ', ' : ''}${user.city || ''}`
                      )
                      : 'Chưa cung cấp địa chỉ'}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        onClick={() => handleViewUser(user.id)}
                      >
                        View
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        onClick={() => handleEdit(user.id)}
                      >
                        Edit
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} requests
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
      {/* ---------- User Detail ---------- */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`User Detail - ${selectedUser?.firstName || ''}`}>
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
                {selectedUser.initial}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedUser.firstName}</h3>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{selectedUser.firstName + ' ' + selectedUser.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {selectedUser.city || selectedUser.district || selectedUser.addressDetail
                    ? `${selectedUser.addressDetail || ''}${selectedUser.addressDetail && (selectedUser.district || selectedUser.city) ? ', ' : ''}${selectedUser.district || ''}${selectedUser.district && selectedUser.city ? ', ' : ''}${selectedUser.city || ''}`
                    : 'Chưa cung cấp địa chỉ'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Join Date</p>
                <p className="font-medium">{selectedUser.joinDate}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleEdit(selectedUser.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit User
              </button>
            </div>

          </div>
        )}
      </Modal>
      {/* ---------- Add New User ---------- */}
      <Modal isOpen={addUserModalOpen} onClose={() => setAddUserModalOpen(false)} title="Thêm người dùng mới">
        <div className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmitNewUser}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  name="firstName"
                  type="text"
                  required
                  placeholder="First Name"
                  value={newUser.firstName}
                  onChange={handleNewUserChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <input
                  name="lastName"
                  type="text"
                  required
                  placeholder="Last Name"
                  value={newUser.lastName}
                  onChange={handleNewUserChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            {fieldErrors.inputName && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.inputName}</p>
            )}
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              value={newUser.email}
              onChange={handleNewUserChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
            )}
            <select
              name="province"
              required
              value={newUser.province}
              onChange={handleNewUserChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="">-- Choice Province --</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
            {fieldErrors.province && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.province}</p>
            )}
            <select
              name="district"
              required
              value={newUser.district}
              onChange={handleNewUserChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              disabled={!newUser.province || isLoadingDistricts}
            >
              <option value="">{isLoadingDistricts ? 'Loading...' : '-- Choice District --'}</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {fieldErrors.district && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.district}</p>
            )}
            <input
              name="addressDetail"
              type="text"
              required
              placeholder="Address Detail"
              value={newUser.addressDetail}
              onChange={handleNewUserChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {fieldErrors.addressDetail && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.addressDetail}</p>
            )}
            <input
              name="phone"
              type="tel"
              required
              placeholder="Phone Number"
              value={newUser.phone}
              onChange={handleNewUserChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {fieldErrors.phone && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>
            )}
            <input
              name="username"
              type="text"
              required
              placeholder="Username"
              value={newUser.username}
              onChange={handleNewUserChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {fieldErrors.username && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.username}</p>
            )}
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={newUser.password}
              onChange={handleNewUserChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {fieldErrors.password && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
            )}
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm Password"
              value={newUser.confirmPassword}
              onChange={handleNewUserChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
            )}
            <div>
              <label className="text-sm text-gray-500">Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleNewUserChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add User
            </button>
          </form>
        </div>
      </Modal>
      {/* ---------- Edit User ---------- */}
      <Modal
        isOpen={editUserModalOpen}
        onClose={() => {
          setEditUserModalOpen(false);
          setEditUser(null);
          setFieldErrors({});
          setDistricts([]);
        }}
        title={`Edit User - ${editUser?.firstName || ''}`}
      >
        {editUser && (
          <div className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmitEditUser}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="firstName"
                  type="text"
                  required
                  placeholder="First Name"
                  value={editUser.firstName || ''}
                  onChange={handleEditUserChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  name="lastName"
                  type="text"
                  required
                  placeholder="Last Name"
                  value={editUser.lastName || ''}
                  onChange={handleEditUserChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              {fieldErrors.inputName && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.inputName}</p>
              )}
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                value={editUser.email}
                onChange={handleEditUserChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
              <select
                name="city"
                required
                value={editUser.city}
                onChange={handleEditUserChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="">-- Select Province/City --</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
              {fieldErrors.province && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.province}</p>
              )}
              <select
                name="district"
                required
                value={editUser.district}
                onChange={handleEditUserChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                disabled={!editUser.city || isLoadingDistricts}
              >
                <option value="">{isLoadingDistricts ? 'Đang tải...' : '-- Select District --'}</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {fieldErrors.district && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.district}</p>
              )}
              <input
                name="addressDetail"
                type="text"
                required
                placeholder="Address Detail"
                value={editUser.addressDetail}
                onChange={handleEditUserChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              {fieldErrors.addressDetail && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.addressDetail}</p>
              )}
              <input
                name="phone"
                type="tel"
                required
                placeholder="Phone Number"
                value={editUser.phone}
                onChange={handleEditUserChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              {fieldErrors.phone && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>
              )}
              <div>
                <label className="text-sm text-gray-500">Role</label>
                <select
                  name="role"
                  value={editUser.role}
                  onChange={handleEditUserChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditUserModalOpen(false);
                    setEditUser(null);
                    setFieldErrors({});
                    setDistricts([]);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users; 