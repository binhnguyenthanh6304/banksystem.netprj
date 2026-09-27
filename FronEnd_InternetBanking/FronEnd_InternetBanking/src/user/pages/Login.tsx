import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldIcon,
  LockIcon,
  AlertTriangleIcon,
  PhoneIcon,
  ClockIcon,
  MailIcon
} from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, loginAttempts, isAccountLocked } = useAuth();
  const currentAttempts = loginAttempts[username] || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }

    try {
      const result = await login(username, password);

      if (!result.isSuccess) {
        const msg = result.message;

        if (msg === 'Account does not exist.') {
          setError('The account does not exist.');
        } else if (msg.includes('has been locked')) {
          setError('Your account has been locked due to 3 failed login attempts. Please contact support.');
        } else if (msg === 'Password is incorrect.') {
          const attemptsLeft = 2 - currentAttempts;
          setError(
            `Incorrect password. ${attemptsLeft > 0
              ? `${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left before your account is locked.`
              : 'Your account will be locked on the next failed attempt.'
            }`
          );
        } else {
          setError(msg || 'Login failed.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again later.');
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 py-8 px-4">
      <div className="grid md:grid-cols-2 gap-6 max-w-6xl w-full bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Left Side: Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-10">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-50 p-3 rounded-full mb-4">
              <ShieldIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 text-center mt-2">
              Log in to access your secure banking dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <AlertTriangleIcon className="text-red-500 mr-2" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isAccountLocked}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isAccountLocked}
                />
              </div>
            </div>

            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
              </div>
            </div> */}

            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isAccountLocked
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-800 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockIcon className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                </span>
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-200">
            <div className="flex flex-col items-center text-sm text-gray-500">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-600 hover:underline">Register</a>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Protected by advanced security protocols
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Benefits */}
        <div className="hidden md:block bg-gradient-to-br from-blue-50 via-blue-50 to-white p-8 md:p-10">
          <div className="h-full flex flex-col">
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-6">
                Online Banking Benefits
              </h2>
              <ul className="space-y-6">
                {[
                  { title: "Secure Transactions", desc: "Bank-grade encryption for all your financial activities" },
                  { title: "24/7 Account Access", desc: "Manage your finances anytime, anywhere" },
                  { title: "Real-time Alerts", desc: "Stay informed about account activities instantly" }
                ].map((item, idx) => (
                  <li className="flex items-start" key={idx}>
                    <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-8">
              <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm">
                <h3 className="text-gray-800 font-medium mb-3">Need assistance?</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span>1-800-SECURE-BANK</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MailIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span>support@securebank.com</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span>24/7 Customer Service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
