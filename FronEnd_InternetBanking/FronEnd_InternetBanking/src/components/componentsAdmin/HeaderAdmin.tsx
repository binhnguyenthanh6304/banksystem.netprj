import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  setActiveView?: (view: string) => void;
}

const Header = ({ setActiveView }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ AuthContext
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <button
        className="flex items-center gap-3"
        onClick={() => setActiveView && setActiveView('adminProfile')}
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <UserCircleIcon size={24} />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium">
            {user?.fullname || user?.username || 'Admin'}
          </p>
          <p className="text-xs text-gray-500">
            {user?.role || 'Administrator'}
          </p>
        </div>
      </button>
      <button
        className="rounded-md flex items-center gap-3 p-4 text-left hover:bg-gray-100 transition-colors"
        onClick={handleLogout}
      >
        <LogOutIcon size={20} />
        <span>Logout</span>
      </button>
    </header>
  );
};

export default Header;