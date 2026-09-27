import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import { BookIcon, MapPinIcon, BanIcon, CheckCircleIcon } from 'lucide-react';

type ServiceType = 'chequeBook' | 'addressChange' | 'stopPayment';

const ServiceRequests: React.FC = () => {
  const { accounts, submitServiceRequest, serviceRequests } = useBank();
  const [activeService, setActiveService] = useState<ServiceType>('chequeBook');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [formData, setFormData] = useState({
    chequeBookPages: '5',
    addressDetail: '',
    city: '',
    district: '',
    chequeNumber: '',
    chequeDate: '',
    payeeName: '',
    reason: 'lost',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/?depth=1');
        const data = await response.json();
        const cityList = data.map((item: any) => ({
          code: item.code,
          name: item.name,
        }));
        setCities(cityList);
      } catch (error) {
        console.error('Error fetching cities:', error);
        alert('Failed to load cities. Please try again later.');
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (formData.city) {
      const selectedCity = cities.find((city) => city.name === formData.city);
      if (selectedCity) {
        const fetchDistricts = async () => {
          try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedCity.code}?depth=2`);
            const data = await response.json();
            const districtList = data.districts.map((item: any) => ({
              code: item.code,
              name: item.name,
            }));
            setDistricts(districtList);
          } catch (error) {
            console.error('Error fetching districts:', error);
            alert('Failed to load districts. Please try again later.');
          }
        };
        fetchDistricts();
      } else {
        setDistricts([]);
      }
    } else {
      setDistricts([]);
    }
  }, [formData.city, cities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const numericAccountId = Number(selectedAccount);
    if ((activeService === 'chequeBook' || activeService === 'stopPayment') && isNaN(numericAccountId)) {
      setErrorMessage('Please select a valid account.');
      return;
    }

    let details: Record<string, any> = {};
    switch (activeService) {
      case 'chequeBook':
        details = {
          accountId: numericAccountId,
          pages: formData.chequeBookPages,
        };
        break;
      case 'addressChange':
        details = {
          addressDetail: formData.addressDetail,
          city: formData.city,
          district: formData.district,
        };
        break;
      case 'stopPayment':
        details = {
          accountId: numericAccountId,
          chequeNumber: formData.chequeNumber,
          chequeDate: formData.chequeDate,
          payeeName: formData.payeeName,
          reason: formData.reason,
        };
        break;
    }

    const response = await submitServiceRequest({
      type: activeService,
      details,
    });

    if (response.success) {
      setSuccessMessage(response.message);
      setSelectedAccount('');
      setFormData({
        chequeBookPages: '5',
        addressDetail: '',
        city: '',
        district: '',
        chequeNumber: '',
        chequeDate: '',
        payeeName: '',
        reason: 'lost',
      });
      setTimeout(() => setSuccessMessage(''), 5000);
    } else {
      setErrorMessage(response.message);
    }
  };


  const getServiceName = (service: ServiceType): string => {
    switch (service) {
      case 'chequeBook':
        return 'Cheque Book Request';
      case 'addressChange':
        return 'Change of Address';
      case 'stopPayment':
        return 'Stop Payment';
    }
  };

  const getServiceIcon = (service: ServiceType) => {
    switch (service) {
      case 'chequeBook':
        return <BookIcon size={20} />;
      case 'addressChange':
        return <MapPinIcon size={20} />;
      case 'stopPayment':
        return <BanIcon size={20} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Service Requests</h1>
      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-center">
            <CheckCircleIcon className="text-green-500 mr-2" size={20} />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-800 text-white p-4">
              <h2 className="text-lg font-semibold">Services</h2>
            </div>
            <div className="p-0">
              <button
                className={`w-full text-left px-4 py-3 flex items-center space-x-3 ${activeService === 'chequeBook' ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-800' : 'hover:bg-gray-50'}`}
                onClick={() => setActiveService('chequeBook')}
              >
                <BookIcon size={20} />
                <span>Cheque Book Request</span>
              </button>
              <button
                className={`w-full text-left px-4 py-3 flex items-center space-x-3 ${activeService === 'addressChange' ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-800' : 'hover:bg-gray-50'}`}
                onClick={() => setActiveService('addressChange')}
              >
                <MapPinIcon size={20} />
                <span>Change of Address</span>
              </button>
              <button
                className={`w-full text-left px-4 py-3 flex items-center space-x-3 ${activeService === 'stopPayment' ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-800' : 'hover:bg-gray-50'}`}
                onClick={() => setActiveService('stopPayment')}
              >
                <BanIcon size={20} />
                <span>Stop Payment of Cheque</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
            <div className="bg-blue-800 text-white p-4">
              <h2 className="text-lg font-semibold">Recent Requests</h2>
            </div>
            <div className="p-4">
              {serviceRequests.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {serviceRequests.map((request, index) => (
                    <li key={index} className="py-3">
                      <div className="flex items-center">
                        <div className="mr-3 text-gray-500">{getServiceIcon(request.type)}</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {getServiceName(request.type)}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${request.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No recent service requests.</p>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-800 text-white p-6">
              <h2 className="text-xl font-semibold flex items-center">
                {getServiceIcon(activeService)}
                <span className="ml-2">{getServiceName(activeService)}</span>
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {(activeService === 'chequeBook' || activeService === 'stopPayment') && (
                <div>
                  <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Account
                  </label>
                  <select
                    id="account"
                    name="account"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    required
                  >
                    <option value="">Select an account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountName} - {account.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {activeService === 'chequeBook' && (
                <>
                  <div>
                    <label htmlFor="chequeBookPages" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Cheque Leaves
                    </label>
                    <select
                      id="chequeBookPages"
                      name="chequeBookPages"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.chequeBookPages}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="5">5 Leaves</option>
                      <option value="10">10 Leaves</option>
                      <option value="15">15 Leaves</option>
                    </select>
                  </div>
                </>
              )}
              {activeService === 'addressChange' && (
                <>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <select
                      id="city"
                      name="city"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city.code} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <select
                      id="district"
                      name="district"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a district</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Detail
                    </label>
                    <textarea
                      id="addressDetail"
                      name="addressDetail"
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your new address detail (e.g., street, house number)"
                      value={formData.addressDetail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Note: Address change will be applied to all your accounts. You may be required to submit address proof at your branch.
                  </p>
                </>
              )}
              {activeService === 'stopPayment' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="chequeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Cheque Number
                      </label>
                      <input
                        type="text"
                        id="chequeNumber"
                        name="chequeNumber"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter cheque number"
                        value={formData.chequeNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="chequeDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Cheque Date
                      </label>
                      <input
                        type="date"
                        id="chequeDate"
                        name="chequeDate"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.chequeDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="payeeName" className="block text-sm font-medium text-gray-700 mb-1">
                      Payee Name
                    </label>
                    <input
                      type="text"
                      id="payeeName"
                      name="payeeName"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter payee name"
                      value={formData.payeeName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Stop Payment
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="lost">Lost Cheque</option>
                      <option value="stolen">Stolen Cheque</option>
                      <option value="dispute">Payment Dispute</option>
                      <option value="other">Other Reason</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500">
                    Note: Stop payment requests are subject to the cheque not being already processed. A fee may apply.
                  </p>
                </>
              )}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequests;