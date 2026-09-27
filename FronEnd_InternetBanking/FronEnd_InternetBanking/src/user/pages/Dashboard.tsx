import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';          // Lấy thông tin người dùng đang đăng nhập
import { useBank } from '../../context/BankContext';          // Lấy thông tin tài khoản ngân hàng
import AccountCard from '../../components/componentsUser/AccountCard';       // Component hiển thị từng thẻ tài khoản
import {
  BanknoteIcon,
  ArrowRightIcon,
  ClipboardListIcon,
  HelpCircleIcon
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();          // Lấy thông tin người dùng từ context
  const { accounts } = useBank();      // Lấy danh sách tài khoản của người dùng
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Chào mừng người dùng */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.fullname}
        </h1>
        <p className="text-gray-600">
          Manage your accounts and banking services
        </p>
      </div>

      {/* Acount */}
      <div className="relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span>Your Accounts</span>
          <p className="ml-4">
            <Link
              to="/addNewAccount"
              className="flex items-center text-sm text-blue-800 hover:text-blue-700 font-medium"
            >
              Add new Accounts
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </p>
        </h2>
        {/* Nút cuộn trái */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 
             bg-white/80 text-gray-700 hover:bg-blue-100 
             rounded-md px-2 py-3 shadow-lg transition "
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        {/* Danh sách tài khoản */}
        <div ref={scrollRef} className="overflow-x-hidden">
          <div className="flex space-x-3 pb-5">
            {accounts.map(account => (
              <div key={account.id} className="min-w-[390px]">
                <AccountCard account={account} />
              </div>
            ))}
          </div>
        </div>

        {/* Nút cuộn phải */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 
             bg-white/80 text-gray-700 hover:bg-blue-100 
             rounded-md px-2 py-3 shadow-lg transition"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Các chức năng nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Chuyển tiền nhanh */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <BanknoteIcon className="text-blue-800 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Quick Transfer
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Transfer money between your accounts or to other bank accounts
          </p>
          <Link
            to="/transfer"
            className="flex items-center text-blue-800 hover:text-blue-700 font-medium"
          >
            Make a Transfer <ArrowRightIcon size={16} className="ml-1" />
          </Link>
        </div>

        {/* Các dịch vụ ngân hàng */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <ClipboardListIcon className="text-blue-800 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Services</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Request cheque books, change address, or stop payments
          </p>
          <Link
            to="/services"
            className="flex items-center text-blue-800 hover:text-blue-700 font-medium"
          >
            View Services <ArrowRightIcon size={16} className="ml-1" />
          </Link>
        </div>

        {/* Trợ giúp & hỗ trợ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <HelpCircleIcon className="text-blue-800 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Help & Support
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Find answers to common questions or contact customer support
          </p>
          <Link
            to="/help"
            className="flex items-center text-blue-800 hover:text-blue-700 font-medium"
          >
            Get Help <ArrowRightIcon size={16} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Thông báo gợi ý bảo mật */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Security Tip
        </h3>
        <p className="text-gray-700">
          Always ensure you log out after your banking session and never share
          your login credentials with anyone. SecureBank will never ask for your
          full password or transaction password via email or phone.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
