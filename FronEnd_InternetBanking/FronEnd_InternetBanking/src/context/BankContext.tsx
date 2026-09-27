import React, { useState, useEffect, createContext, useContext } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';
import { User } from './types';

export type CommonResponse<T> = {
  isSuccess?: boolean;
  status?: string;
  message: string;
  data: T | null;
};

export interface Account {
  id: number;
  accountNumber: string;
  accountName: string;
  balance: number;
  userId: number;
}

export interface Transaction {
  id: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description: string;
  createdAt: string;
  reference: string;
}

export interface ServiceRequest {
  type: 'chequeBook' | 'addressChange' | 'stopPayment';
  status: 'pending' | 'completed' | 'rejected';
  requestDate: string;
  details: Record<string, string>;
  id?: number;
}

interface StatementSummary {
  AccountNumber: string;
  AccountName: string;
  OpeningBalance: number;
  ClosingBalance: number;
  TotalCredits: number;
  TotalDebits: number;
}

interface BankContextType {
  user: User | null; // Thêm user vào interface
  accounts: Account[];
  getAccount: (id: string) => Account | undefined;
  transactions: Transaction[];
  getAccountTransactions: (accountId: string, limit?: number) => Transaction[];
  sendTransferOtp: (
    FromAccountNumber: string,
    TransactionPassword: string
  ) => Promise<{ success: boolean; message: string }>;
  confirmTransfer: (
    transferData: {
      FromAccountNumber: string;
      ToAccountNumber: string;
      Amount: number;
      Description: string;
      TransactionPassword: string;
    },
    otp: string
  ) => Promise<{ success: boolean; message: string }>;
  serviceRequests: ServiceRequest[];
  submitServiceRequest: (
    request: Omit<ServiceRequest, 'requestDate' | 'status'>
  ) => Promise<{ success: boolean; message: string }>;
  getStatement: (
    accountId: number,
    type: 'monthly' | 'annual',
    month: number | null,
    year: number
  ) => Promise<{ summary: StatementSummary; transactions: Transaction[] } | null>;
  getAccounts: () => Promise<CommonResponse<Account[]>>;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;

      try {
        const res = await API.get(`/Accounts/user/${user.id}`);
        const mappedAccounts: Account[] = res.data.data.map((acc: any) => ({
          id: acc.AccountId,
          accountNumber: acc.AccountNumber,
          accountName: acc.AccountName,
          balance: parseFloat(acc.Balance),
          userId: acc.UserId,
        }));
        setAccounts(mappedAccounts);
      } catch (error: any) {
        console.error('Error fetching accounts:', error.response?.data || error.message);
      }
    };

    const fetchTransactions = async () => {
      try {
        const res = await API.get('/Transfers/transactions');
        const mappedTransactions: Transaction[] = res.data.data.map((tx: any) => ({
          id: tx.Id,
          fromAccountId: tx.FromAccountId,
          toAccountId: tx.ToAccountId,
          amount: parseFloat(tx.Amount),
          description: tx.Description,
          createdAt: tx.CreatedAt,
          reference: tx.Reference,
        }));
        setTransactions(mappedTransactions);
      } catch (error: any) {
        console.error('Error fetching transactions:', error.response?.data || error.message);
      }
    };

    fetchAccounts();
    fetchTransactions();
  }, [user]);

  const getAccount = (id: string): Account | undefined => {
    return accounts.find((account) => account.id.toString() === id);
  };

  const getAccountTransactions = (accountId: string, limit?: number): Transaction[] => {
    const filtered = transactions
      .filter((tx) => tx.fromAccountId.toString() === accountId || tx.toAccountId.toString() === accountId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return limit ? filtered.slice(0, limit) : filtered;
  };
  const getAccounts = async (): Promise<CommonResponse<Account[]>> => {
    try {
      const res = await API.get(`/Accounts/user/${user?.id}`);
      const mappedAccounts: Account[] = res.data.data.map((acc: any) => ({
        id: acc.AccountId,
        accountNumber: acc.AccountNumber,
        accountName: acc.AccountName,
        balance: parseFloat(acc.Balance),
        userId: acc.UserId,
      }));
      setAccounts(mappedAccounts); // Cập nhật trạng thái accounts
      return {
        isSuccess: true,
        message: 'Đã lấy danh sách tài khoản thành công.',
        data: mappedAccounts,
      };
    } catch (error: any) {
      console.error('Error fetching accounts:', error.response?.data || error.message);
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách tài khoản.',
        data: null,
      };
    }
  };

  const sendTransferOtp = async (
    FromAccountNumber: string,
    TransactionPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    console.log('Sending OTP request:', { FromAccountNumber, TransactionPassword });
    try {
      const response = await API.post('/Transfers/send-otp', {
        FromAccountNumber,
        TransactionPassword,
      });
      const { status, message } = response.data;
      return { success: status === 'Pending', message };
    } catch (error: any) {
      console.error('Send OTP error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'An error occurred while sending OTP.' };
    }
  };

  const confirmTransfer = async (
    transferData: {
      FromAccountNumber: string;
      ToAccountNumber: string;
      Amount: number;
      Description: string;
      TransactionPassword: string;
    },
    otp: string
  ): Promise<{ success: boolean; message: string }> => {
    console.log('Sending confirm transfer request:', { TransferRequest: transferData, Otp: otp });
    try {
      const response = await API.post('/Transfers/confirm-transfer', {
        TransferRequest: transferData,
        Otp: otp,
      });
      const { status, message } = response.data;
      if (status === 'Completed') {
        const resAccounts = await API.get(`/Accounts/user/${user?.id}`);
        const mappedAccounts: Account[] = resAccounts.data.data.map((acc: any) => ({
          id: acc.AccountId,
          accountNumber: acc.AccountNumber,
          accountName: acc.AccountName,
          balance: parseFloat(acc.Balance),
          userId: acc.UserId,
        }));
        setAccounts(mappedAccounts);

        const resTransactions = await API.get('/Transfers/transactions');
        const mappedTransactions: Transaction[] = resTransactions.data.data.map((tx: any) => ({
          id: tx.Id,
          fromAccountId: tx.FromAccountId,
          toAccountId: tx.ToAccountId,
          amount: parseFloat(tx.Amount),
          description: tx.Description,
          createdAt: tx.CreatedAt,
          reference: tx.Reference,
        }));
        setTransactions(mappedTransactions);

        return { success: true, message };
      }
      return { success: false, message };
    } catch (error: any) {
      console.error('Confirm transfer error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'An error occurred during the transfer.' };
    }
  };

  const submitServiceRequest = async (
    request: Omit<ServiceRequest, 'requestDate' | 'status'>
  ) => {
    try {
      const { accountId, ...detailsWithoutAccountId } = request.details;

      let response;
      if (request.type === 'addressChange') {
        const addressData = {
          userId: user?.id || 0,
          addressDetail: detailsWithoutAccountId.addressDetail || '',
          district: detailsWithoutAccountId.district || '',
          city: detailsWithoutAccountId.city || '',
          country: 'Vietnam',
          isCurrent: false,
        };
        const addressResponse = await API.post('/Address', addressData);
        const newAddressId = addressResponse.data.data;

        // Gửi yêu cầu thay đổi địa chỉ
        response = await API.post('/AddressChangeRequests', {
          userId: user?.id || 0,
          newAddressId,
          notes: `New address: ${detailsWithoutAccountId.addressDetail}, ${detailsWithoutAccountId.district}, ${detailsWithoutAccountId.city}`,
        });
      } else if (request.type === 'chequeBook' || request.type === 'stopPayment') {
        response = await API.post(
          request.type === 'chequeBook' ? '/CheckbookRequests' : '/StopPaymentRequests',
          {
            accountId: Number(accountId),
            userId: user?.id || 0,
            ...(request.type === 'chequeBook' && {
              checkbookNumber: detailsWithoutAccountId.pages,
              notes: `Request for ${detailsWithoutAccountId.pages} pages, delivery: ${detailsWithoutAccountId.deliveryOption}`,
            }),
            ...(request.type === 'stopPayment' && {
              checkNumber: detailsWithoutAccountId.chequeNumber,
              chequeDate: detailsWithoutAccountId.chequeDate,
              payeeName: detailsWithoutAccountId.payeeName,
              reason: detailsWithoutAccountId.reason,
              notes: `Stop payment request for cheque ${detailsWithoutAccountId.chequeNumber}`,
            }),
          }
        );
      }

      if (response && response.data.status === 'success') {
        const newRequest: ServiceRequest = {
          ...request,
          requestDate: new Date().toISOString(),
          status: 'pending',
          id: response.data.data?.id || Date.now(),
        };
        setServiceRequests((prev) => [newRequest, ...prev].slice(0, 5));
        return { success: true, message: 'Request submitted successfully.' };
      } else {
        return { success: false, message: response?.data.message || 'Unknown error' };
      }

    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit service request.',
      };

    }
  };


  const getStatement = async (
    accountId: number,
    type: 'monthly' | 'annual',
    month: number | null,
    year: number
  ): Promise<{ summary: StatementSummary; transactions: Transaction[] } | null> => {
    try {
      const params: any = {
        accountId,
        type,
        year,
      };

      if (type === 'monthly' && month !== null) {
        params.month = month;
      }

      const response = await API.get('/Statement', { params });
      const res = response.data;
      const data = res.data;

      if (res.status === 'success') {
        const summary: StatementSummary = {
          AccountNumber: data.AccountNumber,
          AccountName: data.AccountName,
          OpeningBalance: data.OpeningBalance,
          ClosingBalance: data.ClosingBalance,
          TotalCredits: data.TotalCredits,
          TotalDebits: data.TotalDebits,
        };

        const transactions = (data.Transactions || []).map((t: any) => ({
          id: t.Id,
          fromAccountId: t.FromAccountId,
          toAccountId: t.ToAccountId,
          amount: parseFloat(t.Amount),
          description: t.Description,
          createdAt: t.CreatedAt,
          reference: t.Reference,
        }));

        return { summary, transactions };
      }

      return null;
    } catch (error: any) {
      console.error('Error fetching statement:', error.response?.data || error.message);
      return null;
    }
  };


  return (
    <BankContext.Provider
      value={{
        user, // Cung cấp user trong context
        accounts,
        getAccount,
        transactions,
        getAccountTransactions,
        sendTransferOtp,
        confirmTransfer,
        serviceRequests,
        submitServiceRequest,
        getStatement,
        getAccounts,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = (): BankContextType => {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};