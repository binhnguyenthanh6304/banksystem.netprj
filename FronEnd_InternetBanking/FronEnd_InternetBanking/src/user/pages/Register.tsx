import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    ShieldIcon,
    LockIcon,
    AlertTriangleIcon,
    ClockIcon,
    MailIcon,
    PhoneIcon,
    CreditCardIcon,
    BarChartIcon,
    ShieldCheckIcon,
} from 'lucide-react';

interface ServerUser {
    Id?: string;
    Email?: string;
    id?: string;
    email?: string;
}

const Register: React.FC = () => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        province: '',
        district: '',
        addressDetail: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const { register, getUsers } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);

    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/?depth=1')
            .then(res => res.json())
            .then(data => {
                const provincesData = data.map((p: any) => ({
                    code: p.code,
                    name: p.name,
                }));
                setProvinces(provincesData);
            })
            .catch(() => setProvinces([]));
    }, []);

    useEffect(() => {
        if (form.province) {
            const selectedProvince = provinces.find(p => p.name === form.province);
            if (selectedProvince) {
                fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
                    .then(res => res.json())
                    .then(data => {
                        const districtNames = data.districts.map((d: any) => d.name);
                        setDistricts(districtNames);
                    })
                    .catch(() => setDistricts([]));
            } else {
                setDistricts([]);
            }
        } else {
            setDistricts([]);
        }
        setForm(prev => ({ ...prev, district: '' }));
    }, [form.province, provinces]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    const checkEmailExists = async (email: string, excludeUserId?: string): Promise<boolean> => {
        try {
            const response = await getUsers();
            if (response.isSuccess && Array.isArray(response.data)) {
                return response.data.some((user: ServerUser) => {
                    const userEmail = user.Email || user.email || '';
                    const userId = user.Id || user.id || '';
                    return userEmail.toLowerCase() === email.toLowerCase() && (!excludeUserId || userId !== excludeUserId);
                });
            }
            return false;
        } catch (error) {
            console.error('Error checking email:', error);
            setError('Không thể kiểm tra email. Vui lòng thử lại.');
            return true;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        const errors: { [key: string]: string } = {};

        const nameRegex = /\d/;
        if (nameRegex.test(form.firstName) || nameRegex.test(form.lastName)) {
            errors.inputName = 'Name cannot contain numbers!';
        } else if (!form.firstName && !form.lastName) {
            errors.inputName = 'FirstName and LastName is required.';
        } else if (!form.firstName) {
            errors.inputName = 'FirstName is required.';
        } else if (!form.lastName) {
            errors.inputName = 'LastName is required.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|yahoo|vn)$/;
        if (!emailRegex.test(form.email)) {
            errors.email = "Invalid email format! (Email must have '.com', '.yahoo', or '.vn' extensions)";
        }

        if (!form.email) {
            errors.email = 'Email is required.';
        } else if (await checkEmailExists) {
            errors.email = 'Email đã tồn tại!';
        }

        if (!form.province) {
            errors.province = 'Province/City is required.';
        }

        if (!form.district) {
            errors.district = 'District is required.';
        }

        if (!form.addressDetail) {
            errors.addressDetail = 'Address is required.';
        }

        const phoneRegex = /^(\+84|0)(3|5|7|8|9)\d{8}$/;
        if (!phoneRegex.test(form.phone)) {
            errors.phone = 'Invalid Vietnam phone number! Must start with 03/05/07/08/09 and be 10 digits.';
        }

        if (!form.phone) {
            errors.phone = 'Phone is required.';
        }

        const specialCharRegex = /[^a-zA-Z0-9\_]/;
        if (specialCharRegex.test(form.username)) {
            errors.username = "Special characters are not allowed! (only '_' are allowed)";
        }

        if (!form.username) {
            errors.username = 'Username is required.';
        }


        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(form.password)) {
            errors.password = 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long.';
        }

        if (!form.password) {
            errors.password = 'Password is required.';
        }


        if (form.password !== form.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match!';
        }

        if (!form.confirmPassword) {
            errors.confirmPassword = 'Confirm Password is required.';
        }


        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setIsSubmitting(false);
            return;
        }

        setFieldErrors({});
        const payload = {
            username: form.username,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            addressDetail: form.addressDetail,
            district: form.district,
            city: form.province,
            country: 'Vietnam',
            role: 'User'
        };

        console.log("Gửi payload:", payload);
        try {
            const result = await register(payload);
            if (isMounted.current) {
                if (result.isSuccess) {
                    setSuccess('Tạo tài khoản thành công. Đang chuyển hướng đến trang đăng nhập...');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError(result.message);
                }
            }
        } catch (err: any) {
            if (isMounted.current) {
                console.error("Lỗi khi đăng ký:", err);
                setError(err.response?.data?.message || 'Đã xảy ra lỗi không mong muốn.');
            }
        } finally {
            if (isMounted.current) setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 py-8 px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex flex-col justify-center p-8 md:p-10">
                    <div className="text-center mb-6">
                        <div className="flex justify-center">
                            <ShieldIcon className="h-12 w-12 text-blue-800" />
                        </div>
                        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                            Create an Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign up to access SecureBank
                        </p>
                    </div>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                            <div className="flex items-center">
                                <AlertTriangleIcon className="text-red-500 mr-2" size={20} />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                    {success && (
                        <div className="bg-blue-50 border-l-4 border-green-500 p-4 rounded mb-6">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    )}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                name="firstName"
                                type="text"
                                placeholder="First Name"
                                value={form.firstName}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                                name="lastName"
                                type="text"
                                placeholder="Last Name"
                                value={form.lastName}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        {fieldErrors.inputName && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.inputName}</p>
                        )}
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.email && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
                        )}
                        <select
                            name="province"
                            value={form.province}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        >
                            <option value="">-- Select Province/City --</option>
                            {provinces.map((province) => (
                                <option key={province.code} value={province.name}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.province && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.province}</p>
                        )}
                        <select
                            name="district"
                            value={form.district}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                            disabled={!form.province}
                        >
                            <option value="">-- Select District --</option>
                            {districts.map((district) => (
                                <option key={district} value={district}>
                                    {district}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.district && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.district}</p>
                        )}
                        <input
                            name="addressDetail"
                            type="text"
                            placeholder="Enter Address (e.g., House Number, Street)"
                            value={form.addressDetail}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.addressDetail && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.addressDetail}</p>
                        )}
                        <input
                            name="phone"
                            type="tel"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.phone && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>
                        )}
                        <input
                            name="username"
                            type="text"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.username && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.username}</p>
                        )}
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.password && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
                        )}
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        {fieldErrors.confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                        )}
                        <button
                            type="submit"
                            className="relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <LockIcon className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                            </span>
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Already have an account?{' '}
                            <a href="/login" className="text-blue-600 hover:text-blue-500">
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
                <div className="hidden md:block bg-gradient-to-br from-blue-50 via-blue-50 to-white p-8 md:p-10">
                    <div className="h-full flex flex-col">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-800 mb-6">
                                Why Register with SecureBank?
                            </h2>
                            <ul className="space-y-6">
                                <li className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                                        <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-lg">
                                            Secure Banking
                                        </h3>
                                        <p className="text-gray-600">
                                            Industry-leading encryption and security protocols to
                                            protect your financial data
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                                        <CreditCardIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-lg">
                                            Easy Account Management
                                        </h3>
                                        <p className="text-gray-600">
                                            Access your accounts, make transfers, and pay bills from
                                            anywhere, anytime
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                                        <BarChartIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-lg">
                                            Financial Insights
                                        </h3>
                                        <p className="text-gray-600">
                                            Get personalized reports and advice to help you reach your
                                            financial goals
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-auto pt-8">
                            <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm">
                                <h3 className="text-gray-800 font-medium mb-3">
                                    Need assistance?
                                </h3>
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

export default Register;