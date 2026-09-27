import React, { useState, useCallback } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { User, Account, AddressRequest } from '../../context/types';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from 'lucide-react';

const PersonalInformation: React.FC = () => {
  const { user, getAccounts, getAddresses } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [address, setAddress] = useState<AddressRequest | null>(null);
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm làm mới dữ liệu
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In user để kiểm tra dữ liệu
      console.log("User data:", user);

      // Gọi API để lấy danh sách tài khoản
      const accountsResponse = await getAccounts();
      if (accountsResponse.isSuccess && accountsResponse.data) {
        const mappedAccounts: Account[] = accountsResponse.data.map((acc: any) => ({
          id: acc.AccountId,
          accountNumber: acc.AccountNumber,
          accountName: acc.AccountName,
          balance: acc.Balance.toString(), // Chuyển number thành string
          userName: acc.UserName || 'Unknown', // Gán mặc định
          userId: acc.UserId,
          createdAt: acc.CreatedAt || new Date().toISOString(), // Gán mặc định
        }));
        console.log("Accounts:", mappedAccounts);
        setAccounts(mappedAccounts);
      } else {
        console.error("Failed to fetch accounts:", accountsResponse.message);
      }

      // Gọi API để lấy danh sách địa chỉ
      const addressesResponse = await getAddresses();
      if (addressesResponse.isSuccess && addressesResponse.data) {
        console.log("Addresses:", addressesResponse.data);
        // Chọn địa chỉ có isCurrent: true hoặc địa chỉ đầu tiên
        const currentAddress = addressesResponse.data.find(addr => addr.isCurrent) || addressesResponse.data[0] || null;
        setAddress(currentAddress);
      } else {
        console.error("Failed to fetch addresses:", addressesResponse.message);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAccounts, getAddresses, user]);

  // Gọi dữ liệu lần đầu khi component được mount
  useEffect(() => {
    refreshData();
  }, []); // Chỉ chạy một lần khi mount

  const toggleAccountDetails = (accountId: string) => {
    setExpandedAccount(expandedAccount === accountId ? null : accountId);
  };

  // Xử lý địa chỉ với giá trị mặc định
  const getAddress = () => {
    if (!address) return 'Chưa có thông tin địa chỉ';
    const { addressDetail, district, city, country } = address;
    return [
      addressDetail || 'Không xác định',
      district || 'Không xác định',
      city || 'Không xác định',
      country || 'Không xác định',
    ].join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Personal Information Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Personal Information</h1>
          <p className="text-gray-600">
            Review and manage your personal details and linked accounts
          </p>
        </div>

        {/* Personal Details Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-8">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-medium">
                {user?.fullname?.split(' ').map(n => n[0]).join('') || ''}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800">{user?.fullname || 'Không xác định'}</h2>
                <p className="text-gray-600">Personal Banking Customer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-gray-800 font-medium">{user?.fullname || 'Không xác định'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="text-gray-800 font-medium">{user?.phone || 'Không xác định'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-gray-800 font-medium">{user?.email || 'Không xác định'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="text-gray-800 font-medium">{getAddress()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Accounts Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Linked Accounts</h2>
            <Link to="/addNewAccount">
              <button className="text-sm text-blue-800 hover:text-blue-700 font-medium flex items-center">
                Add New Account
                <PlusIcon className="ml-1 h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Account List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            {accounts.map((account: Account) => (
              <div key={account.id} className="border-b border-gray-100 last:border-b-0">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => account.id && toggleAccountDetails(account.id.toString())}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div>
                        <h3 className="font-semibold text-gray-800">{account.accountName || 'Không xác định'}</h3>
                        <p className="text-sm text-gray-500">{account.accountNumber || 'Không xác định'}</p>
                      </div>
                    </div>
                    <div>
                      {expandedAccount === account.id?.toString() ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedAccount === account.id?.toString() && (
                  <div className="bg-gray-50 px-4 py-4 pl-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Account Number</p>
                        <p className="text-gray-800 font-medium">{account.accountNumber || 'Không xác định'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                        <p className="text-gray-800 font-medium">{account.balance || '0'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <Link
                        to={`/statements`}
                        className="text-blue-800 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        View Statements
                        <ChevronDownIcon className="ml-1 h-4 w-4 rotate-270" />
                      </Link>
                      <Link
                        to={`/accounts`}
                        className="text-blue-800 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        Manage Account
                        <ChevronDownIcon className="ml-1 h-4 w-4 rotate-270" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;