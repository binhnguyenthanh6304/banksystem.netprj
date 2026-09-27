import { useState } from 'react';
import Layout from './components/componentsAdmin/Layout';
import DashboardAdmin from './admin/pages/Dashboard';
import Users from './admin/pages/Users';
import Transactions from './admin/pages/Transactions';
import Accounts from './admin/pages/Accounts';
import ChequeBook from './admin/pages/ChequeBook';
import Address from './admin/pages/Address';
import ChequeBookRequest from './admin/pages/checkRequest/ChequeBookRequest';
import ChangeOfAddress from './admin/pages/checkRequest/ChangeOfAddress';
import StopPayment from './admin/pages/checkRequest/StopPayment';
import HelpAdmin from './admin/pages/checkRequest/HelpAdmin';
import AdminProfile from './admin/pages/AdminProfile';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BankProvider } from './context/BankContext';
import Login from './user/pages/Login';
import Register from './user/pages/Register';
import AddNewAccount from './user/pages/AddNewAccount';
import PersonalInformation from './user/pages/Personal_Information';
import Dashboard from './user/pages/Dashboard';
import AccountDetails from './user/pages/AccountDetails';
import TransactionHistory from './user/pages/TransactionHistory';
import FundsTransfer from './user/pages/FundsTransfer';
import ServiceRequests from './user/pages/ServiceRequests';
import Statements from './user/pages/Statements';
import Help from './user/pages/Help';
import Header from './components/componentsUser/Header';
import Footer from './components/componentsUser/Footer';
import ProtectedRoute from './components/componentsUser/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function UserRoutes() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
            <Route path="/register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
            <Route path="/addNewAccount" element={<ErrorBoundary><AddNewAccount /></ErrorBoundary>} />
            <Route path="/profile" element={<ProtectedRoute><ErrorBoundary><PersonalInformation /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/account/:id" element={<ProtectedRoute><ErrorBoundary><AccountDetails /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/transactions/:id" element={<ProtectedRoute><ErrorBoundary><TransactionHistory /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><ErrorBoundary><FundsTransfer /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><ErrorBoundary><ServiceRequests /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/statements" element={<ProtectedRoute><ErrorBoundary><Statements /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><ErrorBoundary><Help /></ErrorBoundary></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

function AdminRoutes() {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeServiceRequestTab, setActiveServiceRequestTab] = useState('chequeBookRequest');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <ErrorBoundary><DashboardAdmin /></ErrorBoundary>;
      case 'users':
        return <ErrorBoundary><Users /></ErrorBoundary>;
      case 'transactions':
        return <ErrorBoundary><Transactions /></ErrorBoundary>;
      case 'accounts':
        return <ErrorBoundary><Accounts /></ErrorBoundary>;
      case 'adminProfile':
        return <ErrorBoundary><AdminProfile /></ErrorBoundary>;
      case 'chequeBook':
        return <ErrorBoundary><ChequeBook /></ErrorBoundary>;
      case 'address':
        return <ErrorBoundary><Address /></ErrorBoundary>;
      case 'checkRequest':
        switch (activeServiceRequestTab) {
          case 'chequeBookRequest':
            return (
              <ErrorBoundary>
                <ChequeBookRequest setActiveServiceRequestTab={setActiveServiceRequestTab} activeServiceRequestTab={activeServiceRequestTab} />
              </ErrorBoundary>
            );
          case 'changeOfAddress':
            return (
              <ErrorBoundary>
                <ChangeOfAddress setActiveServiceRequestTab={setActiveServiceRequestTab} activeServiceRequestTab={activeServiceRequestTab} />
              </ErrorBoundary>
            );
          case 'stopPayment':
            return (
              <ErrorBoundary>
                <StopPayment setActiveServiceRequestTab={setActiveServiceRequestTab} activeServiceRequestTab={activeServiceRequestTab} />
              </ErrorBoundary>
            );
          case 'helpAdmin':
            return (
              <ErrorBoundary>
                <HelpAdmin setActiveServiceRequestTab={setActiveServiceRequestTab} activeServiceRequestTab={activeServiceRequestTab} />
              </ErrorBoundary>
            );
          default:
            return (
              <ErrorBoundary>
                <ChequeBookRequest setActiveServiceRequestTab={setActiveServiceRequestTab} activeServiceRequestTab={activeServiceRequestTab} />
              </ErrorBoundary>
            );
        }
      default:
        return <ErrorBoundary><DashboardAdmin /></ErrorBoundary>;
    }
  };

  return (
    <ErrorBoundary>
      <Layout activeView={activeView} setActiveView={setActiveView}>
        {renderView()}
      </Layout>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary fallback={<div className="p-4 text-center text-red-500">Application failed to load. Please try again later.</div>}>
      <BrowserRouter>
        <AuthProvider>
          <BankProvider>
            <Routes>
              {/* USER ROUTES */}
              <Route path="/*" element={<UserRoutes />} />
              {/* ADMIN ROUTES */}
              <Route path="/admin/*" element={<AdminRoutes />} />
            </Routes>
          </BankProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;