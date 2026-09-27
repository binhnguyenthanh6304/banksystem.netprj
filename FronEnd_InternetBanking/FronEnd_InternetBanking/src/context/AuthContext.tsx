import React, { useEffect, useState, createContext, useContext } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { CommonResponse, User, RegisterForm, AddNewAccount, AddNewAccountAdmin, AuthContextType, Transaction, Account, AddressRequest, ChequeBookRequestType, ChequeBookType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // const [loginAttempts, setLoginAttempts] = useState(0);
  const [isAccountLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttemptsByUser, setLoginAttemptsByUser] = useState<{ [username: string]: number }>({});


  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    console.log('Stored user:', storedUser);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

    }

    setIsLoading(false);
  }, []);


  const login = async (username: string, password: string): Promise<CommonResponse<boolean>> => {
    setIsLoading(true);
    try {
      const response = await API.post('/Auth/login', { username, password });
      console.log('Login response:', JSON.stringify(response.data, null, 2));
      const { user, token } = response.data.data;

      if (!user || !token) {
        return {
          isSuccess: false,
          message: 'Phản hồi không hợp lệ từ server.',
          data: false,
        };
      }

      const userData: User = {
        id: user.Id,
        fullname: user.FullName,
        email: user.Email,
        phone: user.Phone,
        addressDetail: user.AddressDetail,
        district: user.District,
        province: user.Province,
        country: user.Country,
        role: user.Role,
        username: user.Username,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setLoginAttemptsByUser(prev => {
        const updated = { ...prev };
        delete updated[username];
        return updated;
      });

      const role = user.Role?.toLowerCase().trim();
      if (role === "user") {
        navigate('/dashboard');
      } else if (role === "admin") {
        navigate('/admin');
      } else {
        navigate('/');
      }

      return {
        isSuccess: true,
        message: 'Login successful.',
        data: true
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.data || 'Login failed.';
      if (message === 'Account does not exist.' || message.includes('has been locked')) {
        return {
          isSuccess: false,
          message,
          data: false
        };
      }

      setLoginAttemptsByUser(prev => {
        const current = prev[username] || 0;
        return { ...prev, [username]: current + 1 };
      });

      return {
        isSuccess: false,
        message,
        data: false
      };
    }
  };

  const addAccount = async (form: AddNewAccount | AddNewAccountAdmin): Promise<CommonResponse<boolean>> => {
    try {
      let payload;
      if ('userId' in form) {
        payload = {
          accountNumber: form.numberAccount,
          accountName: form.accountName,
          transactionPassword: form.transactionPassword,
          userId: parseInt(form.userId),
        };
      } else {
        const userString = localStorage.getItem('user');
        if (!userString) {
          return {
            isSuccess: false,
            message: 'Người dùng chưa đăng nhập.',
            data: false,
          };
        }
        const user = JSON.parse(userString) as User;
        payload = {
          accountNumber: form.numberAccount,
          accountName: form.accountName,
          transactionPassword: form.transactionPassword,
          userId: parseInt(user.id),
        };
      }
      console.log('AddAccount payload:', JSON.stringify(payload, null, 2));

      const response = await API.post('/Accounts', payload);
      console.log('AddAccount response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: response.status === 201 || response.status === 200,
        message: 'Tài khoản đã được thêm thành công.',
        data: true,
      };
    } catch (error: any) {
      console.error('AddAccount error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể thêm tài khoản.',
        data: false,
      };
    }
  };

  const getUserAdmin = async (form: User): Promise<CommonResponse<User>> => {
    try {
      const response = await API.get('/Auth/users');
      console.log('GetUserAdmin response:', JSON.stringify(response.data, null, 2));
      const userData = response.data.data.find((u: User) => u.id === form.id);
      if (userData) {
        return {
          isSuccess: true,
          message: 'Đã lấy thông tin admin thành công.',
          data: userData,
        };
      }
      return {
        isSuccess: false,
        message: 'Không tìm thấy thông tin người dùng.',
        data: null,
      };
    } catch (error: any) {
      console.error('GetUserAdmin error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể lấy thông tin admin.',
        data: null,
      };
    }
  };

  const getUsers = async (): Promise<CommonResponse<User[]>> => {
    try {
      const response = await API.get('/Auth/users');
      console.log('GetUsers response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: true,
        message: 'Đã lấy danh sách người dùng thành công.',
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('GetUsers error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách người dùng.',
        data: null,
      };
    }
  };

  const register = async (form: RegisterForm): Promise<CommonResponse<boolean>> => {
    try {
      console.log('Register payload:', JSON.stringify(form, null, 2));
      const response = await API.post('/Auth/register', form);
      console.log('Register response:', JSON.stringify(response.data, null, 2));
      if (response.data?.message === 'User registered successfully.') {
        return {
          isSuccess: true,
          message: 'Đăng ký thành công.',
          data: true,
        };
      } else {
        return {
          isSuccess: false,
          message: response.data?.message || 'Đăng ký thất bại.',
          data: false,
        };
      }
    } catch (error: any) {
      console.error('Register error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Đã xảy ra lỗi không mong muốn.',
        data: false,
      };
    }
  };

  const updateUser = async (userId: string, form: Partial<User>): Promise<CommonResponse<boolean>> => {
    try {
      console.log('UpdateUser payload:', JSON.stringify(form, null, 2));
      const response = await API.put(`/Auth/users/${userId}`, form);
      console.log('UpdateUser response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: true,
        message: 'Cập nhật người dùng thành công.',
        data: true,
      };
    } catch (error: any) {
      console.error('UpdateUser error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể cập nhật người dùng.',
        data: false,
      };
    }
  };

  const getTranssaction = async (): Promise<CommonResponse<Transaction[]>> => {
    try {
      const response = await API.get('/Transfers/transactions-admin');
      console.log('GetTransactions response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: true,
        message: 'Đã lấy danh sách giao dịch thành công.',
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('GetTransactions error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách giao dịch.',
        data: null,
      };
    }
  };

  const getAccounts = async (): Promise<CommonResponse<Account[]>> => {
    try {
      const response = await API.get('/Accounts');
      return {
        isSuccess: true,
        message: 'Đã lấy danh sách tài khoản thành công.',
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('GetAccounts error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách tài khoản.',
        data: null,
      };
    }
  };

  const updateAccount = async (accountId: string, form: Partial<Account>): Promise<CommonResponse<boolean>> => {
    try {
      console.log('UpdateAccount payload:', JSON.stringify(form, null, 2));
      const response = await API.put(`/Accounts/${accountId}`, form);
      console.log('UpdateAccount response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: true,
        message: 'Cập nhật tài khoản thành công.',
        data: true,
      };
    } catch (error: any) {
      console.error('UpdateAccount error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể cập nhật tài khoản.',
        data: false,
      };
    }
  };

  const getAddresses = async (): Promise<CommonResponse<AddressRequest[]>> => {
    try {
      const response = await API.get('/Address');
      console.log('GetAddresses response:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'success') {
        const addresses = response.data.data.map((item: any) => ({
          id: item.Id,
          userName: item.UserName,
          email: item.Email,
          addressDetail: item.AddressDetail,
          district: item.District,
          city: item.City,
          country: item.Country,
          isCurrent: item.IsCurrent,
        }));
        return {
          isSuccess: true,
          message: response.data.message || 'Đã lấy danh sách địa chỉ thành công.',
          data: addresses,
        };
      }
      return {
        isSuccess: false,
        message: response.data.message || 'Không thể lấy danh sách địa chỉ.',
        data: null,
      };
    } catch (error: any) {
      console.error('GetAddresses error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách địa chỉ.',
        data: null,
      };
    }
  };

  const updateAddress = async (addressId: number, form: Partial<AddressRequest>): Promise<CommonResponse<boolean>> => {
    try {
      const payload = {
        UserName: form.userName,
        Email: form.email,
        AddressDetail: form.addressDetail,
        District: form.district,
        City: form.city,
        Country: form.country,
        IsCurrent: form.isCurrent,
      };
      console.log('UpdateAddress payload:', JSON.stringify(payload, null, 2));

      const response = await API.put(`/Address/${addressId}`, payload);
      console.log('UpdateAddress response:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'success') {
        return {
          isSuccess: true,
          message: response.data.message || 'Cập nhật địa chỉ thành công.',
          data: true,
        };
      }
      return {
        isSuccess: false,
        message: response.data.message || 'Không thể cập nhật địa chỉ.',
        data: false,
      };
    } catch (error: any) {
      console.error('UpdateAddress error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể cập nhật địa chỉ.',
        data: false,
      };
    }
  };

  const deleteAddress = async (addressId: number): Promise<CommonResponse<boolean>> => {
    try {
      const response = await API.delete(`/Address/${addressId}`);
      console.log('DeleteAddress response:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'success') {
        return {
          isSuccess: true,
          message: response.data.message || 'Xóa địa chỉ thành công.',
          data: true,
        };
      }
      return {
        isSuccess: false,
        message: response.data.message || 'Không thể xóa địa chỉ.',
        data: false,
      };
    } catch (error: any) {
      console.error('DeleteAddress error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể xóa địa chỉ.',
        data: false,
      };
    }
  };

  const getChequeBookRequests = async (): Promise<CommonResponse<ChequeBookRequestType[]>> => {
    try {
      const response = await API.get('/CheckbookRequests');
      console.log('GetChequeBookRequests response:', JSON.stringify(response.data, null, 2));
      const mappedData = response.data.data.map((item: any) => ({
        Id: String(item.Id),
        Customer: item.Customer,
        Account: item.Account,
        Leaves: item.Leaves,
        Status: item.Status,
      }));
      return {
        isSuccess: true,
        message: 'Đã lấy danh sách yêu cầu sổ séc thành công.',
        data: mappedData,
      };
    } catch (error: any) {
      console.error('GetChequeBookRequests error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách yêu cầu sổ séc.',
        data: null,
      };
    }
  };

  const approveStopPaymentRequest = async (requestId: string): Promise<CommonResponse<boolean>> => {
    try {
      const response = await API.put(`/StopPaymentRequests/${requestId}?status=approved`);
      console.log('ApproveChequeBookRequest response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: response.data.status === 'success',
        message: response.data.message || 'Yêu cầu hủy séc đã được phê duyệt thành công.',
        data: true,
      };
    } catch (error: any) {
      console.error('ApproveChequeBookRequest error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể phê duyệt yêu cầu hủy séc.',
        data: false,
      };
    }
  };

  const rejectStopPaymentRequest = async (requestId: string): Promise<CommonResponse<boolean>> => {
    try {
      const response = await API.put(`/StopPaymentRequests/${requestId}?status=rejected`);
      console.log('RejectChequeBookRequest response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: response.data.status === 'success',
        message: response.data.message || 'Yêu cầu hủy séc đã bị từ chối.',
        data: true,
      };
    } catch (error: any) {
      console.error('RejectChequeBookRequest error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể từ chối yêu cầu hủy séc.',
        data: false,
      };
    }
  };
  const approveAddressChangeRequest = async (requestId: string): Promise<CommonResponse<boolean>> => {
    try {
      const response = await API.put(`/AddressChangeRequests/${requestId}?status=approved`);
      console.log('ApproveChequeBookRequest response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: response.data.status === 'success',
        message: response.data.message || 'Yêu cầu đổi địa chỉ đã được phê duyệt thành công.',
        data: true,
      };
    } catch (error: any) {
      console.error('ApproveChequeBookRequest error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể phê duyệt yêu cầu đổi địa chỉ.',
        data: false,
      };
    }
  };

  const rejectAddressChangeRequest = async (requestId: string): Promise<CommonResponse<boolean>> => {
    try {
      const response = await API.put(`/AddressChangeRequests/${requestId}?status=rejected`);
      console.log('RejectChequeBookRequest response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: response.data.status === 'success',
        message: response.data.message || 'Yêu cầu đổi địa chỉ đã bị từ chối.',
        data: true,
      };
    } catch (error: any) {
      console.error('RejectChequeBookRequest error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể từ chối yêu cầu đổi địa chỉ.',
        data: false,
      };
    }
  };
  const approveChequeBookRequest = async (requestId: string): Promise<CommonResponse<boolean>> => {
    try {
      const response = await API.put(`/CheckbookRequests/${requestId}?status=approved`);
      console.log('ApproveChequeBookRequest response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: response.data.status === 'success',
        message: response.data.message || 'Yêu cầu sổ séc đã được phê duyệt thành công.',
        data: true,
      };
    } catch (error: any) {
      console.error('ApproveChequeBookRequest error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể phê duyệt yêu cầu sổ séc.',
        data: false,
      };
    }
  };

  const rejectChequeBookRequest = async (requestId: string): Promise<CommonResponse<boolean>> => {
    try {
      const response = await API.put(`/CheckbookRequests/${requestId}?status=rejected`);
      console.log('RejectChequeBookRequest response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: response.data.status === 'success',
        message: response.data.message || 'Yêu cầu sổ séc đã bị từ chối.',
        data: true,
      };
    } catch (error: any) {
      console.error('RejectChequeBookRequest error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể từ chối yêu cầu sổ séc.',
        data: false,
      };
    }
  };

  const getChequeBooks = async (): Promise<CommonResponse<ChequeBookType[]>> => {
    try {
      const response = await API.get('/Checks');
      console.log('GetChequeBooks response:', JSON.stringify(response.data, null, 2));
      const mappedData = response.data.data.map((item: any) => ({
        Id: String(item.Id),
        CheckNumber: item.CheckNumber,
        AccountName: item.AccountName,
        IssueDate: item.IssueDate,
        Status: item.Status,
        CancellationReason: item.CancellationReason || '',
      }));
      return {
        isSuccess: true,
        message: 'Đã lấy danh sách sổ séc thành công.',
        data: mappedData,
      };
    } catch (error: any) {
      console.error('GetChequeBooks error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách sổ séc.',
        data: null,
      };
    }
  };

  const updateHelpRequest = async (id: string, answer: string): Promise<CommonResponse<boolean>> => {
    try {
      const response = await API.put(`/Support/answer/${id}`, answer, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('UpdateHelpRequest response:', JSON.stringify(response.data, null, 2));
      return {
        isSuccess: response.data.status === 'success',
        message: response.data.message || 'Cập nhật câu trả lời thành công.',
        data: true,
      };
    } catch (error: any) {
      console.error('UpdateHelpRequest error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể cập nhật câu trả lời.',
        data: false,
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        addAccount,
        getUserAdmin,
        getUsers,
        updateUser,
        getTranssaction,
        getAccounts,
        updateAccount,
        getAddresses,
        updateAddress,
        deleteAddress,
        getChequeBookRequests,
        approveStopPaymentRequest,
        rejectStopPaymentRequest,
        approveAddressChangeRequest,
        rejectAddressChangeRequest,
        approveChequeBookRequest,
        rejectChequeBookRequest,
        getChequeBooks,
        updateHelpRequest,
        loginAttempts: loginAttemptsByUser,
        isAccountLocked,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};