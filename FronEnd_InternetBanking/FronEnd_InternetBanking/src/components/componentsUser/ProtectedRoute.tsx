import React from 'react';
import { Navigate } from 'react-router-dom'; // Dùng để chuyển hướng người dùng
import { useAuth } from '../../context/AuthContext'; // Lấy thông tin người dùng và trạng thái loading

// Component dùng để bảo vệ route - chỉ cho phép truy cập nếu đã đăng nhập
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth(); // Lấy thông tin user và trạng thái loading từ context

  // Nếu đang loading (ví dụ: đang kiểm tra token), hiển thị thông báo hoặc spinner
  // if (isLoading) {
  //   return <div className="text-center py-10">Đang tải...</div>; // Có thể thay bằng spinner để UX tốt hơn
  // }

  // Nếu không có user (chưa đăng nhập), chuyển hướng đến trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị nội dung con (children)
  return <>{children}</>;
};

export default ProtectedRoute; // Export để sử dụng bọc các route cần bảo vệ
