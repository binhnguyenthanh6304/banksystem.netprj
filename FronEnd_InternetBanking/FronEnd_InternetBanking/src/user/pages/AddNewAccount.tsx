import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldIcon, LockIcon, AlertTriangleIcon } from 'lucide-react';

export const AddNewAccount: React.FC = () => {
    const [form, setForm] = useState({
        numberAccount: '',
        accountName: '',
        transactionPassword: '',
        confirmPassword: '',
    });

    const [fieldErrors, setFieldErrors] = useState({
        numberAccount: '',
        accountName: '',
        transactionPassword: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { addAccount } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const numberAccountRegex = /^\d{10}$/;
        const accountNameRegex = /^[a-zA-Z0-9 ]+$/;
        const passwordRegex = /^\d{6}$/;

        const newErrors = {
            numberAccount: '',
            accountName: '',
            transactionPassword: '',
            confirmPassword: '',
        };

        let hasError = false;

        if (!numberAccountRegex.test(form.numberAccount)) {
            newErrors.numberAccount = 'Account number must be exactly 10 digits.';
            hasError = true;
        }

        if (!form.numberAccount) {
            newErrors.numberAccount = 'Account number is required.';
        }

        if (!accountNameRegex.test(form.accountName)) {
            newErrors.accountName = 'Account name must not contain special characters.';
            hasError = true;
        }

        if (!form.accountName) {
            newErrors.accountName = 'Account name is required.';
        }

        if (!passwordRegex.test(form.transactionPassword)) {
            newErrors.transactionPassword = 'Password must be exactly 6 digits.';
            hasError = true;
        }

        if (!form.transactionPassword) {
            newErrors.transactionPassword = 'Transaction password is required.';
        }

        if (form.transactionPassword !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
            hasError = true;
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required.';
        }

        setFieldErrors(newErrors);

        if (hasError) return;

        const result = await addAccount(form);
        if (result) {
            setSuccess('Account created successfully. Redirecting...');
            setTimeout(() => navigate('/account'), 2000);
        } else {
            setError(result);
        }

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center">
                        <ShieldIcon className="h-12 w-12 text-blue-800" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create an Account</h2>
                    <p className="mt-2 text-sm text-gray-600">Sign up to create an account</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex items-center">
                            <AlertTriangleIcon className="text-red-500 mr-2" size={20} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm text-blue-700">{success}</p>
                    </div>
                )}

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <input
                            name="numberAccount"
                            type="tel"
                            placeholder="Number Account"
                            value={form.numberAccount}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.numberAccount && (
                            <p className="text-red-600 text-xs mt-1">{fieldErrors.numberAccount}</p>
                        )}
                    </div>

                    <div>
                        <input
                            name="accountName"
                            type="text"
                            placeholder="Username"
                            value={form.accountName}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.accountName && (
                            <p className="text-red-600 text-xs mt-1">{fieldErrors.accountName}</p>
                        )}
                    </div>

                    <div>
                        <input
                            name="transactionPassword"
                            type="password"
                            placeholder="Transaction password"
                            value={form.transactionPassword}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.transactionPassword && (
                            <p className="text-red-600 text-xs mt-1">{fieldErrors.transactionPassword}</p>
                        )}
                    </div>

                    <div>
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm transaction password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.confirmPassword && (
                            <p className="text-red-600 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <LockIcon className="h-5 w-5 mr-2" />
                        Add
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddNewAccount;
