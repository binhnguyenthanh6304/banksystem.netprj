import { useState, useEffect } from 'react';
import { PlusIcon } from 'lucide-react';
import Modal from '../../components/componentsAdmin/Modal';
import { useAuth } from '../../context/AuthContext';
import { Account, AddNewAccountAdmin, User } from '../../context/types';

const Accounts = () => {
  const { getAccounts, addAccount, updateAccount, getUsers } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userCache, setUserCache] = useState<Map<number, string>>(new Map());
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newAccountModalOpen, setNewAccountModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Account>>({});
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newAccountForm, setNewAccountForm] = useState<AddNewAccountAdmin>({
    numberAccount: '',
    accountName: '',
    transactionPassword: '',
    confirmPassword: '',
    userId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Số tài khoản mỗi trang

  // Lấy danh sách tài khoản và người dùng
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Lấy danh sách người dùng trước
        const usersResponse = await getUsers();
        console.log('GetUsers response:', JSON.stringify(usersResponse, null, 2));
        const newUserCache = new Map<number, string>();
        if (usersResponse.isSuccess && usersResponse.data) {
          const filteredUsers = usersResponse.data
            .filter((user: any) => user.Role?.toLowerCase() === 'user')
            .map((user: any) => ({
              id: user.Id,
              email: user.Email,
              phone: user.Phone || '',
              fullname: user.FullName,
              role: user.Role,
            }));
          setUsers(filteredUsers);
          filteredUsers.forEach((user: any) => {
            console.log('Processing user:', JSON.stringify(user, null, 2));
            if (user.id) {
              newUserCache.set(parseInt(user.id), user.fullname || user.email || 'Unknown');
            }
          });
          setUserCache(newUserCache);
          console.log('UserCache:', Array.from(newUserCache.entries()));
        } else {
          console.error('Failed to fetch users:', usersResponse.message);
        }

        // Lấy danh sách tài khoản sau khi userCache đã được populate
        const accountsResponse = await getAccounts();
        console.log('GetAccounts response:', JSON.stringify(accountsResponse, null, 2));
        if (accountsResponse.isSuccess && accountsResponse.data) {
          const mappedAccounts = accountsResponse.data
            .filter((acc: any) => acc.AccountId !== undefined && acc.AccountId !== null)
            .map((acc: any) => {
              const userId = acc.UserId;
              const userName = userId && newUserCache.get(userId) ? newUserCache.get(userId)! : 'Unknown';
              console.log(`Mapping account ${acc.AccountId}: UserId=${userId}, userName=${userName}`);
              return {
                id: acc.AccountId,
                accountNumber: acc.AccountNumber || '',
                accountName: acc.AccountName || '',
                balance: acc.Balance != null ? `$${acc.Balance.toFixed(2)}` : '$0.00',
                userName,
                userId: acc.UserId || 0,
                createdAt: acc.CreatedAt ? new Date(acc.CreatedAt).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
              };
            });
          console.log('Mapped accounts:', JSON.stringify(mappedAccounts, null, 2));
          setAccounts(mappedAccounts);
          setCurrentPage(1); // Reset về trang đầu tiên khi dữ liệu thay đổi
        } else {
          setError(accountsResponse.message || 'Cannot retrieve account list');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getAccounts, getUsers]);

  // Xử lý thêm tài khoản mới
  const handleNewAccount = async () => {
    if (!newAccountForm.numberAccount || !newAccountForm.accountName || !newAccountForm.userId) {
      setError('Account Number, Account Name, and Owner are required');
      return;
    }
    if (!/^\d+$/.test(newAccountForm.numberAccount)) {
      setError('Account Number must contain only digits');
      return;
    }
    if (newAccountForm.transactionPassword !== newAccountForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await addAccount({
        numberAccount: newAccountForm.numberAccount,
        accountName: newAccountForm.accountName,
        transactionPassword: newAccountForm.transactionPassword,
        confirmPassword: newAccountForm.confirmPassword,
        userId: newAccountForm.userId,
      });
      console.log('AddAccount response:', JSON.stringify(response, null, 2));
      if (response.isSuccess) {
        setNewAccountModalOpen(false);
        setNewAccountForm({
          numberAccount: '',
          accountName: '',
          transactionPassword: '',
          confirmPassword: '',
          userId: '',
        });
        const accountsResponse = await getAccounts();
        console.log('GetAccounts after add:', JSON.stringify(accountsResponse, null, 2));
        if (accountsResponse.isSuccess && accountsResponse.data) {
          const mappedAccounts = accountsResponse.data
            .filter((acc: any) => acc.AccountId !== undefined && acc.AccountId !== null)
            .map((acc: any) => {
              const userId = acc.UserId;
              const userName = userId && userCache.get(userId) ? userCache.get(userId)! : 'Unknown';
              return {
                id: acc.AccountId,
                accountNumber: acc.AccountNumber || '',
                accountName: acc.AccountName || '',
                balance: acc.Balance != null ? `$${acc.Balance.toFixed(2)}` : '$0.00',
                userName,
                userId: acc.UserId || 0,
                createdAt: acc.CreatedAt ? new Date(acc.CreatedAt).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
              };
            });
          setAccounts(mappedAccounts);
          setCurrentPage(1); // Reset về trang đầu tiên sau khi thêm tài khoản
        }
        alert('Account created successfully');
      } else {
        setError(response.message || 'Failed to add account');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding account');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý chỉnh sửa tài khoản
  const handleEditAccount = async (id: number, updatedFields: Partial<Account> = {}) => {
    if (!updatedFields.accountName || !updatedFields.accountNumber) {
      setError('Account Name and Account Number are required');
      return;
    }
    if (!/^\d+$/.test(updatedFields.accountNumber)) {
      setError('Account Number must contain only digits');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        accountName: updatedFields.accountName,
        accountNumber: updatedFields.accountNumber,
      };
      const response = await updateAccount(id.toString(), payload);
      console.log('UpdateAccount response:', JSON.stringify(response, null, 2));
      if (response.isSuccess) {
        const accountsResponse = await getAccounts();
        console.log('GetAccounts after update:', JSON.stringify(accountsResponse, null, 2));
        if (accountsResponse.isSuccess && accountsResponse.data) {
          const mappedAccounts = accountsResponse.data
            .filter((acc: any) => acc.AccountId !== undefined && acc.AccountId !== null)
            .map((acc: any) => {
              const userId = acc.UserId;
              const userName = userId && userCache.get(userId) ? userCache.get(userId)! : 'Unknown';
              return {
                id: acc.AccountId,
                accountNumber: acc.AccountNumber || '',
                accountName: acc.AccountName || '',
                balance: acc.Balance != null ? `$${acc.Balance.toFixed(2)}` : '$0.00',
                userName,
                userId: acc.UserId || 0,
                createdAt: acc.CreatedAt ? new Date(acc.CreatedAt).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
              };
            });
          setAccounts(mappedAccounts);
          setCurrentPage(1); // Reset về trang đầu tiên sau khi cập nhật
        }
        setModalOpen(false);
        setEditMode(false);
        alert('Account updated successfully');
      } else {
        setError(response.message || 'Failed to update account');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating account');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý xem chi tiết tài khoản
  const handleViewAccount = (id: number) => {
    const account = accounts.find(acc => acc.id === id);
    if (account) {
      setSelectedAccount(account);
      setEditForm({ accountName: account.accountName, accountNumber: account.accountNumber });
      setModalOpen(true);
    }
  };

  // Lọc tài khoản
  const filteredAccounts = accounts.filter(account => {
    const userName = account.userName || '';
    const accountId = account.id?.toString() || '';
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accountId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Logic phân trang
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Accounts Management</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          onClick={() => setNewAccountModalOpen(true)}
        >
          <PlusIcon size={18} />
          New Account
        </button>
      </div>

      {/* Form tìm kiếm */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search accounts..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Hiển thị trạng thái */}
      {isLoading ? (
        <div className="text-gray-500 mb-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : accounts.length === 0 ? (
        <div className="text-gray-500 mb-4">No accounts found</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="p-4">Owner</th>
                    <th className="p-4">Account Name</th>
                    <th className="p-4">Account Number</th>
                    <th className="p-4">Balance</th>
                    <th className="p-4">Create At</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAccounts.map(account => (
                    <tr key={account.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{account.userName}</td>
                      <td className="p-4">{account.accountName}</td>
                      <td className="p-4">{account.accountNumber}</td>
                      <td className="p-4 font-medium">{account.balance}</td>
                      <td className="p-4 font-medium">{account.createdAt}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            onClick={() => handleViewAccount(account.id)}
                          >
                            View
                          </button>
                          {/* <button
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                            onClick={() => {
                              setEditMode(true);
                              handleViewAccount(account.id);
                            }}
                          >
                            Edit
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAccounts.length)} of {filteredAccounts.length} requests
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

        </>
      )}

      {/* Modal chi tiết tài khoản */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditMode(false);
          setEditForm({});
        }}
        title={`Account Details - ${selectedAccount?.accountName || ''}`}
      >
        {selectedAccount && (
          <div className="space-y-6">
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500">Account Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.accountNumber || selectedAccount.accountNumber}
                    onChange={e => setEditForm({ ...editForm, accountNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Account Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.accountName || selectedAccount.accountName}
                    onChange={e => setEditForm({ ...editForm, accountName: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleEditAccount(selectedAccount.id, editForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{selectedAccount.userName}</h3>
                    <p className="text-gray-500">Account Name: <strong>{selectedAccount.accountName}</strong></p>
                  </div>
                  <div className="text-xl font-bold">{selectedAccount.balance}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium">{selectedAccount.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created Date</p>
                    <p className="font-medium">{selectedAccount.createdAt}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Account
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal thêm tài khoản mới */}
      <Modal isOpen={newAccountModalOpen} onClose={() => setNewAccountModalOpen(false)} title="Add New Account">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500">Owner</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newAccountForm.userId}
              onChange={e => setNewAccountForm({ ...newAccountForm, userId: e.target.value })}
            >
              <option value="">Select user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullname ? `${user.fullname} - ${user.email}` : user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Account Number</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newAccountForm.numberAccount}
              onChange={e => setNewAccountForm({ ...newAccountForm, numberAccount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500">Account Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newAccountForm.accountName}
              onChange={e => setNewAccountForm({ ...newAccountForm, accountName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500">Transaction Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newAccountForm.transactionPassword}
              onChange={e => setNewAccountForm({ ...newAccountForm, transactionPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newAccountForm.confirmPassword}
              onChange={e => setNewAccountForm({ ...newAccountForm, confirmPassword: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleNewAccount}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Accounts;