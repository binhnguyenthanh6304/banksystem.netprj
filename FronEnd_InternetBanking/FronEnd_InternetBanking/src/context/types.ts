export type CommonResponse<T> = {
    isSuccess?: boolean;
    status?: string;
    message: string;
    data: T | null;
};

export type User = {
    id: string;
    email: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    fullname?: string;
    addressDetail?: string;
    district?: string;
    province?: string;
    country?: string;
    role?: string;
    username?: string;
};

export type RegisterForm = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    addressDetail: string;
    district: string;
    city: string;
    country: string;
    role: string;
};

export type AddNewAccount = {
    numberAccount: string;
    accountName: string;
    transactionPassword: string;
    confirmPassword: string;
};

export type AddNewAccountAdmin = {
    numberAccount: string;
    accountName: string;
    transactionPassword: string;
    confirmPassword: string;
    userId: string;
};

export type Account = {
    id: number;
    accountNumber: string;
    accountName: string;
    balance: string;
    // password: string;
    userName: string;
    userId: number;
    createdAt: string;
};

export type Transaction = {
    transactionID: string;
    sender: string;
    recipient: string;
    amount: string;
    description: string;
    date: string;
};

export type AddressRequest = {
    id: number;
    userName: string;
    email: string;
    addressDetail: string;
    district: string;
    city: string;
    country: string;
    isCurrent: boolean;
};

export type ChequeBookRequestType = {
    Id: string;
    Customer: string;
    Account: string;
    Leaves: number;
    Status: string;
};

export type ChequeBookType = {
    Id: string;
    CheckNumber: string;
    AccountName: string;
    IssueDate: string;
    Status: string;
    CancellationReason: string;
};

export type FaqItem = {
    id: number;
    question: string;
    answer: string;
    categoryId: number;
    category: string;
};

export type Category = {
    categoryId: number;
    categoryName: string;
};

export type Helps = {
    id: string;
    sender: string;
    email: string;
    question: string;
    answer: string | null;
    sentDate: string;
    status: string;
    replyDate: string | null;
    isCurrent: boolean;
};

export type StopPaymentRequest = {
    id: string;
    customer: string;
    account: string;
    chequeNumber: string;
    chequeDate: string;
    payeeName: string;
    reasonForStopPayment: string;
    status: string;
    requestDate: string;
};

export type AddressChangeRequest = {
    id: string;
    customer: string;
    newAddress: string;
    requestDate: string;
    status: string;
};

export type AuthContextType = {
    user: User | null;
    login: (username: string, password: string) => Promise<CommonResponse<boolean>>;
    logout: () => void;
    register: (form: RegisterForm) => Promise<CommonResponse<boolean>>;
    getUsers: () => Promise<CommonResponse<User[]>>;
    getUserAdmin: (form: User) => Promise<CommonResponse<User>>;
    addAccount: (form: AddNewAccount | AddNewAccountAdmin) => Promise<CommonResponse<boolean>>;
    getAccounts: () => Promise<CommonResponse<Account[]>>;
    updateAccount: (accountId: string, form: Partial<Account>) => Promise<CommonResponse<boolean>>;
    updateUser: (userId: string, form: Partial<User>) => Promise<CommonResponse<boolean>>;
    getTranssaction: () => Promise<CommonResponse<Transaction[]>>;
    getAddresses: () => Promise<CommonResponse<AddressRequest[]>>;
    updateAddress: (addressId: number, form: Partial<AddressRequest>) => Promise<CommonResponse<boolean>>;
    deleteAddress: (addressId: number) => Promise<CommonResponse<boolean>>;
    getChequeBookRequests: () => Promise<CommonResponse<ChequeBookRequestType[]>>;
    approveChequeBookRequest: (requestId: string) => Promise<CommonResponse<boolean>>;
    rejectChequeBookRequest: (requestId: string) => Promise<CommonResponse<boolean>>;
    getChequeBooks: () => Promise<CommonResponse<ChequeBookType[]>>;
    updateHelpRequest: (id: string, answer: string) => Promise<CommonResponse<boolean>>;
    approveStopPaymentRequest: (requestId: string) => Promise<CommonResponse<boolean>>;
    rejectStopPaymentRequest: (requestId: string) => Promise<CommonResponse<boolean>>;
    approveAddressChangeRequest: (requestId: string) => Promise<CommonResponse<boolean>>;
    rejectAddressChangeRequest: (requestId: string) => Promise<CommonResponse<boolean>>;
    loginAttempts: { [username: string]: number };
    isAccountLocked: boolean;
    isLoading: boolean;
};