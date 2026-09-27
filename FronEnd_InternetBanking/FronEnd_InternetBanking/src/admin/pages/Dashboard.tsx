import React from 'react';
import { UsersIcon, ArrowLeftRightIcon, TrendingUpIcon, AlertCircleIcon } from 'lucide-react';
const Dashboard = () => {
  const handleGenerateReport = () => {
    alert('Generating report...');
  };
  const handleViewTransaction = (id: string) => {
    alert(`Viewing transaction ${id}`);
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors" onClick={handleGenerateReport}>
          Generate Report
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 rounded-md">
              <UsersIcon size={24} className="text-blue-600" />
            </div>
            <span className="text-green-500 text-sm font-medium">+12%</span>
          </div>
          <h2 className="text-3xl font-bold mb-1">24,532</h2>
          <p className="text-gray-500">Total Users</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 rounded-md">
              <ArrowLeftRightIcon size={24} className="text-green-600" />
            </div>
            <span className="text-green-500 text-sm font-medium">+8%</span>
          </div>
          <h2 className="text-3xl font-bold mb-1">$1.2M</h2>
          <p className="text-gray-500">Total Transactions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 rounded-md">
              <TrendingUpIcon size={24} className="text-purple-600" />
            </div>
            <span className="text-green-500 text-sm font-medium">+3%</span>
          </div>
          <h2 className="text-3xl font-bold mb-1">$5,230</h2>
          <p className="text-gray-500">Average Balance</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 rounded-md">
              <AlertCircleIcon size={24} className="text-orange-600" />
            </div>
            <span className="text-red-500 text-sm font-medium">-5%</span>
          </div>
          <h2 className="text-3xl font-bold mb-1">23</h2>
          <p className="text-gray-500">Flagged Transactions</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4">TX-38271</td>
                  <td>John Doe</td>
                  <td>Deposit</td>
                  <td className="text-green-500">+$1500</td>
                  <td>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Completed
                    </span>
                  </td>
                  <td>Today, 10:30 AM</td>
                  <td>
                    <button className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200" onClick={() => handleViewTransaction('TX-38271')}>
                      View
                    </button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4">TX-38272</td>
                  <td>Jane Smith</td>
                  <td>Withdrawal</td>
                  <td className="text-red-500">-$500</td>
                  <td>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Completed
                    </span>
                  </td>
                  <td>Today, 9:15 AM</td>
                  <td>
                    <button className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200" onClick={() => handleViewTransaction('TX-38272')}>
                      View
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-4">TX-38273</td>
                  <td>Robert Johnson</td>
                  <td>Transfer</td>
                  <td className="text-red-500">-$2000</td>
                  <td>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Pending
                    </span>
                  </td>
                  <td>Yesterday, 4:45 PM</td>
                  <td>
                    <button className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200" onClick={() => handleViewTransaction('TX-38273')}>
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>;
};
export default Dashboard;