import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOutIcon, UserIcon, HelpCircleIcon, ShieldIcon } from 'lucide-react';
const Header: React.FC = () => {
    const {user,logout} = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
    logout();
    navigate('/login');
    };
    return <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold flex items-center">
                <ShieldIcon className="mr-2" />
                SecureBank
                </Link>
                {user ? <div className="flex items-center">
                    <nav className="hidden md:block mr-8">
                        <ul className="flex space-x-6">
                            <li>
                                <Link to="/" className="hover:text-blue-200 transition-colors">
                                    Accounts
                                </Link>
                            </li>
                            <li>
                                <Link to="/transfer" className="hover:text-blue-200 transition-colors">
                                    Funds Transfer
                                </Link>
                            </li>
                            <li>
                                <Link to="/services" className="hover:text-blue-200 transition-colors">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link to="/statements" className="hover:text-blue-200 transition-colors">
                                    Statements
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Link to="/help" className="hover:text-blue-200 transition-colors">
                            <HelpCircleIcon size={20} />
                        </Link>
                        <div className="flex items-center text-sm">
                            <UserIcon size={16} className="mr-1" />
                            <span className="hidden md:inline">{user.fullname}</span>
                        </div>
                        <button onClick={handleLogout} className="flex items-center text-sm hover:text-blue-200 transition-colors">
                            <LogOutIcon size={16} className="mr-1" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div> : <Link to="/login" className="py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md transition-colors">
                </Link>}
            </div>
        </div>
    </header>;
};
export default Header;