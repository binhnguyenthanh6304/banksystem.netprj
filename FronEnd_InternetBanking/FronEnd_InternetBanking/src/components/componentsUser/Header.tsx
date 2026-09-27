import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Link để điều hướng, useNavigate để chuyển trang bằng code
import { useAuth } from '../../context/AuthContext'; // Hook lấy thông tin user và chức năng logout
import { LogOutIcon, UserIcon, HelpCircleIcon, ShieldIcon } from 'lucide-react'; // Icon hỗ trợ giao diện

// Component Header hiển thị thanh điều hướng chính
const Header: React.FC = () => {
  const { user, logout } = useAuth(); // Lấy thông tin người dùng và hàm logout từ context
  const navigate = useNavigate(); // Dùng để chuyển hướng sau khi logout

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm logout
    navigate('/login'); // Chuyển hướng về trang đăng nhập
  };

  return (
    <header className="bg-blue-800 text-white shadow-md"> {/* Thanh header với màu nền xanh, chữ trắng */}
      <div className="container mx-auto px-4 py-4"> {/* Căn giữa nội dung, padding trong */}
        <div className="flex justify-between items-center"> {/* Flex: chia trái và phải */}

          {/* Logo ngân hàng (trái) */}
          <Link to="/" className="text-2xl font-bold flex items-center">
            <ShieldIcon className="mr-2" /> {/* Icon bảo vệ */}
            SecureBank
          </Link>

          {/* Nếu đã đăng nhập (user tồn tại) thì hiển thị thanh menu */}
          {user ? (
            <div className="flex items-center">
              {/* Thanh menu (chỉ hiển thị trên màn hình >= md) */}
              <nav className="hidden md:block mr-8">
                <ul className="flex space-x-6">
                  <li>
                    <Link to="/" className="hover:text-blue-200 transition-colors">
                      Accounts {/* Trang tài khoản */}
                    </Link>
                  </li>
                  <li>
                    <Link to="/transfer" className="hover:text-blue-200 transition-colors">
                      Funds Transfer {/* Trang chuyển tiền */}
                    </Link>
                  </li>
                  <li>
                    <Link to="/services" className="hover:text-blue-200 transition-colors">
                      Services {/* Dịch vụ */}
                    </Link>
                  </li>
                  <li>
                    <Link to="/statements" className="hover:text-blue-200 transition-colors">
                      Statements {/* Sao kê */}
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Cột phải: Trợ giúp, tên người dùng, nút đăng xuất */}
              <div className="flex items-center space-x-4">
                {/* Link trợ giúp */}
                <Link to="/help" className="hover:text-blue-200 transition-colors">
                  <HelpCircleIcon size={20} />
                </Link>

                {/* Hiển thị icon và tên người dùng */}
                <Link to="/profile" className="hover:text-blue-200 transition-colors">
                  <div className="flex items-center text-sm">
                    <UserIcon size={16} className="mr-1" />
                    <span className="hidden md:inline">{user.name}</span> {/* Chỉ hiện tên khi màn hình lớn */}
                  </div>
                </Link>

                {/* Nút đăng xuất */}
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm hover:text-blue-200 transition-colors"
                >
                  <LogOutIcon size={16} className="mr-1" />
                  <span className="hidden md:inline">Logout</span> {/* Ẩn trên mobile */}
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login"> {/* Nếu chưa đăng nhập thì có thể chuyển hướng đến login */}
              {/* Có thể thêm nút "Login" ở đây nếu cần */}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; // Export để sử dụng ở nơi khác
