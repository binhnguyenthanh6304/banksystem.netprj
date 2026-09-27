import React from 'react';
import { LayoutDashboardIcon, UsersIcon, ArrowLeftRightIcon, WalletIcon, FileBarChartIcon, FileTextIcon, BookOpenIcon, MapPinIcon, ShieldIcon } from 'lucide-react';
interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}
const Sidebar = ({
  activeView,
  setActiveView
}: SidebarProps) => {
  const navItems = [
    {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboardIcon size={20} />
  }, {
    id: 'users',
    label: 'Users',
    icon: <UsersIcon size={20} />
  }, {
    id: 'transactions',
    label: 'Transactions',
    icon: <ArrowLeftRightIcon size={20} />
  }, {
    id: 'accounts',
    label: 'Accounts',
    icon: <WalletIcon size={20} />
  }, {
    id: 'chequeBook',
    label: 'ChequeBook',
    icon: <BookOpenIcon size={20} />
  }, {
    id: 'address',
    label: 'Address',
    icon: <MapPinIcon size={20} />
  }, {
    id: 'checkRequest',
    label: 'Services',
    icon: <FileTextIcon size={20} />
  },];
  return <aside className="w-60 bg-blue-800 text-white flex flex-col">
      <div className="p-6 flex items-center gap-2">
        <ShieldIcon size={24} />
        <h1 className="text-xl font-bold">Banking Admin</h1>
      </div>
      <nav className="flex-1">
        <ul>
          {navItems.map(item => <li key={item.id}>
              <button className={`w-full flex items-center gap-3 p-4 text-left hover:bg-blue-700 transition-colors ${activeView === item.id ? 'bg-blue-900' : ''}`} onClick={() => setActiveView(item.id)}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>)}
        </ul>
      </nav>
    </aside>;
};
export default Sidebar;