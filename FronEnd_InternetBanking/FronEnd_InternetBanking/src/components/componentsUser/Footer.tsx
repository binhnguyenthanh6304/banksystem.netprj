import React from 'react';
import { ShieldIcon, PhoneIcon, MailIcon, ClockIcon } from 'lucide-react'; // Icon hỗ trợ hiển thị UI

// Component Footer hiển thị phần chân trang
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8"> {/* Nền xám đậm, chữ trắng, padding dọc */}
      <div className="container mx-auto px-4"> {/* Căn giữa nội dung, padding ngang */}
        
        {/* Grid chia làm 3 cột trên màn hình lớn, 1 cột trên màn hình nhỏ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Cột 1: Giới thiệu SecureBank */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <ShieldIcon className="mr-2" /> {/* Icon khiên bảo mật */}
              SecureBank
            </h3>
            <p className="text-gray-300">
              Providing secure and reliable banking services since 1990. Your
              trusted partner for all financial needs.
              {/* Mô tả ngắn gọn về ngân hàng */}
            </p>
          </div>

          {/* Cột 2: Các liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  About Us {/* Giới thiệu */}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  Locations {/* Chi nhánh */}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  Careers {/* Tuyển dụng */}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  Terms & Conditions {/* Điều khoản */}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  Privacy Policy {/* Chính sách bảo mật */}
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center">
                <PhoneIcon size={16} className="mr-2" /> {/* Icon điện thoại */}
                1-800-SECURE-BANK
              </p>
              <p className="flex items-center">
                <MailIcon size={16} className="mr-2" /> {/* Icon email */}
                support@securebank.com
              </p>
              <p className="flex items-center">
                <ClockIcon size={16} className="mr-2" /> {/* Icon đồng hồ */}
                24/7 Customer Service {/* Hỗ trợ khách hàng 24/7 */}
              </p>
            </div>
          </div>
        </div>

        {/* Phần cuối: Bản quyền và ghi chú */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} SecureBank. All rights reserved.</p> {/* Năm hiện tại */}
          <p className="mt-2 text-sm">
            SecureBank is a member of FDIC. All deposits are insured up to
            $250,000. {/* Ghi chú bảo hiểm tiền gửi */}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; // Xuất component Footer để sử dụng nơi khác
