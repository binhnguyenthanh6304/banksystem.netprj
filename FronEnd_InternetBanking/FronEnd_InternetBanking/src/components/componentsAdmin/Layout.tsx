import React from 'react';
import Sidebar from './Sidebar';
import Header from './HeaderAdmin';
interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}
const Layout = ({
  children,
  activeView,
  setActiveView
}: LayoutProps) => {
  return <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col">
        <Header setActiveView={setActiveView} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>;
};
export default Layout;