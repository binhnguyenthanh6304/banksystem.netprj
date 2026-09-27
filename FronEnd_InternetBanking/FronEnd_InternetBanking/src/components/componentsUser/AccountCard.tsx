import React from 'react';
import { Link } from 'react-router-dom'; // Dùng để chuyển trang trong nội bộ app
import { Account } from '../../context/BankContext'; // Kiểu dữ liệu Account
import { CreditCardIcon, ArrowRightIcon } from 'lucide-react'; // Icon hiển thị trong UI

// Định nghĩa props cho component AccountCard
interface AccountCardProps {
  account: Account; // Truyền vào một đối tượng account kiểu Account
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  // Hàm định dạng số tiền theo kiểu USD
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD' // Nếu account chưa có đơn vị tiền, tạm thời dùng USD
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Phần tiêu đề: Tên tài khoản và icon */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {account.accountName}
          </h3>
          <CreditCardIcon className="text-blue-800" /> {/* Icon thẻ tín dụng */}
        </div>
        {/* Hiển thị số tài khoản, tách mỗi 4 chữ số */}
        <p className="text-gray-500 text-sm">
          Account Number:{' '}
          {account.accountNumber
            ? account.accountNumber.replace(/(\d{4})/g, '$1 ').trim() // Thêm khoảng trắng mỗi 4 số
            : 'N/A'} {/* Nếu không có số tài khoản thì hiển thị N/A */}
        </p>
      </div>

      {/* Phần hiển thị số dư */}
      <div className="p-5">
        <div className="mb-4">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(account.balance)} {/* Hiển thị số dư được định dạng */}
          </p>
        </div>

        {/* Hai nút điều hướng: Xem chi tiết và xem giao dịch */}
        <div className="flex space-x-2">
          {/* Nút dẫn đến trang chi tiết tài khoản */}
          <Link
            to={`/account/${account.id}`}
            className="flex-1 bg-blue-800 text-white py-2 px-4 rounded-md text-center text-sm hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          {/* Nút dẫn đến trang giao dịch của tài khoản */}
          <Link
            to={`/transactions/${account.id}`}
            className="flex items-center justify-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            Transactions <ArrowRightIcon size={16} className="ml-1" /> {/* Icon mũi tên */}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountCard; // Export component để sử dụng ở nơi khác
