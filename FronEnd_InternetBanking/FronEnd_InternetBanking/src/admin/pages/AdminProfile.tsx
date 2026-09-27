import React, { useEffect, useState } from 'react';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User, AddressRequest } from '../../context/types';

const AdminProfile = () => {
  const { user, getUserAdmin, getAddresses, isLoading } = useAuth();
  const [adminData, setAdminData] = useState<User | null>(null);
  const [address, setAddress] = useState<AddressRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user || user.role?.toLowerCase() !== 'admin') {
        setError('Không có quyền truy cập hoặc người dùng không phải admin.');
        return;
      }

      // Debug: Log dữ liệu user
      console.log('User from AuthContext:', JSON.stringify(user, null, 2));

      // Sử dụng user nếu có đủ thông tin cơ bản
      if (user.email && user.phone && user.role) {
        setAdminData(user);
      } else {
        // Gọi API getUserAdmin nếu user thiếu thông tin
        try {
          const response = await getUserAdmin(user);
          console.log('getUserAdmin response:', JSON.stringify(response, null, 2));
          if (response.isSuccess && response.data) {
            setAdminData(response.data);
          } else {
            setError(response.message || 'Không thể lấy thông tin admin.');
          }
        } catch (err) {
          setError('Lỗi khi lấy thông tin admin. Vui lòng thử lại.');
        }
      }

      // Gọi API getAddresses để lấy địa chỉ
      try {
        const addressResponse = await getAddresses();
        console.log('getAddresses response:', JSON.stringify(addressResponse, null, 2));
        if (addressResponse.isSuccess && addressResponse.data) {
          // Lấy địa chỉ hiện tại (isCurrent: true) hoặc địa chỉ đầu tiên
          const currentAddress = addressResponse.data.find(addr => addr.isCurrent) || addressResponse.data[0] || null;
          setAddress(currentAddress);
        } else {
          setError(addressResponse.message || 'Không thể lấy thông tin địa chỉ.');
        }
      } catch (err) {
        setError('Lỗi khi lấy thông tin địa chỉ. Vui lòng thử lại.');
      }
    };

    fetchAdminData();
  }, [user, getUserAdmin, getAddresses]);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!adminData) {
    return <div>Không tìm thấy thông tin admin.</div>;
  }

  // Tạo chuỗi địa chỉ linh hoạt
  const addressString = address
    ? [
        address.addressDetail,
        address.district,
        address.city,
        address.country,
      ]
        .filter(Boolean)
        .join(', ') || 'N/A'
    : adminData.addressDetail || adminData.district || adminData.province || adminData.country
      ? [
          adminData.addressDetail,
          adminData.district,
          adminData.province,
          adminData.country,
        ]
          .filter(Boolean)
          .join(', ') || 'N/A'
      : 'N/A';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hồ sơ Admin</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white mb-4">
              <UserIcon size={64} />
            </div>
            <h2 className="text-xl font-bold">{adminData.fullname || `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim() || adminData.username || 'Admin'}</h2>
            <p className="text-blue-600 font-medium">{adminData.role || 'Administrator'}</p>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Thông tin liên hệ</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MailIcon size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{adminData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p>{adminData.phone}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Thông tin tài khoản</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPinIcon size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p>{addressString}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;