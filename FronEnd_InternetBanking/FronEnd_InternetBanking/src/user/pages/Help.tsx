import React, { useState, useEffect } from 'react';
import {
  HelpCircleIcon,
  PhoneIcon,
  MailIcon,
  MessageSquareIcon,
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { useBank } from '../../context/BankContext';
import { FaqItem, Category, CommonResponse } from '../../context/types';

const Help: React.FC = () => {
  const { user } = useBank();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [faqCategories, setFaqCategories] = useState<Category[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>('');

  const fetchHelpData = async () => {
    setLoading(true);
    try {
      const [categoriesResponse, faqsResponse] = await Promise.all([
        API.get<CommonResponse<Category[]>>('/Help/categories'),
        API.get<CommonResponse<any[]>>('/Help/questions'),
      ]);

      console.log('Categories Response:', categoriesResponse.data);
      console.log('FAQs Response:', faqsResponse.data);

      // Xử lý danh mục
      if (categoriesResponse.data.status === 'success' || categoriesResponse.data.isSuccess) {
        const categories = (categoriesResponse.data.data || []).map((cat: any) => ({
          categoryId: cat.CategoryId, // Ánh xạ CategoryId → categoryId
          categoryName: cat.CategoryName, // Ánh xạ CategoryName → categoryName
        }));
        setFaqCategories(categories);
        console.log('Set FaqCategories:', categories);
      } else {
        setError('Không thể tải danh mục FAQ: ' + (categoriesResponse.data.message || 'Lỗi không xác định'));
      }

      // Xử lý FAQ
      if (faqsResponse.data.status === 'success' || faqsResponse.data.isSuccess) {
        const mappedFaqs: FaqItem[] = (faqsResponse.data.data || []).map((faq: any) => ({
          id: faq.Id || 0,
          question: faq.Question || 'Không có câu hỏi',
          answer: faq.Answer || 'Không có câu trả lời',
          categoryId: faq.CategoryId || 0,
          category: faq.Category?.CategoryName || 'Không xác định',
        }));
        console.log('Mapped FAQs:', mappedFaqs);
        setFaqs(mappedFaqs);
      } else {
        setError('Không thể tải FAQ: ' + (faqsResponse.data.message || 'Lỗi không xác định'));
      }
    } catch (err: any) {
      console.error('API Error:', err.response?.data || err.message);
      setError('Lỗi khi tải dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpData();
  }, []);

  const toggleQuestion = (question: string) => {
    setExpandedQuestions((prev: string[]) =>
      prev.includes(question) ? prev.filter((q: string) => q !== question) : [...prev, question]
    );
  };

  const toggleCategory = (categoryId: number) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleNavigateToService = (serviceType: 'chequeBook' | 'addressChange') => {
    navigate('/service-requests', { state: { activeService: serviceType } });
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      alert('Vui lòng nhập câu hỏi của bạn.');
      return;
    }
    if (!user) {
      alert('Vui lòng đăng nhập để gửi câu hỏi.');
      return;
    }

    try {
      const payload = {
        UserId: parseInt(user.id),
        Email: user.email,
        Question: question,
      };
      console.log('Submitting question with payload:', payload);
      const response = await API.post('/Support', payload);
      console.log('Support API response:', response.data);

      if (response.data.status === 'success' || response.data.isSuccess) {
        alert('Gửi câu hỏi thành công!');
        setQuestion('');
      } else {
        alert('Lỗi khi gửi câu hỏi: ' + (response.data.message || 'Lỗi không xác định'));
      }
    } catch (err: any) {
      console.error('Question Submit Error:', err.response?.data || err.message);
      alert('Lỗi khi gửi câu hỏi: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredFaqs = searchTerm
    ? faqs.filter((faq: FaqItem) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : activeCategory
      ? faqs.filter((faq: FaqItem) => faq.categoryId === activeCategory)
      : faqs;

  console.log('Rendering FaqCategories:', faqCategories);

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Trợ giúp & Hỗ trợ</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {user ? `Chào ${user.fullname || user.username}, ` : ''}Tìm câu trả lời cho các câu hỏi thường gặp hoặc liên hệ với đội ngũ hỗ trợ của chúng tôi.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm chủ đề trợ giúp..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-800 text-white p-4">
              <h2 className="font-semibold">Danh mục trợ giúp</h2>
            </div>
            <div className="p-0">
              <button
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${activeCategory === null ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-800' : ''
                  }`}
                onClick={() => setActiveCategory(null)}
              >
                Tất cả danh mục
              </button>
              {faqCategories.length > 0 ? (
                faqCategories.map((category: Category) => (
                  <button
                    key={category.categoryId}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${activeCategory === category.categoryId
                        ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-800'
                        : ''
                      }`}
                    onClick={() => toggleCategory(category.categoryId)}
                  >
                    {category.categoryName}
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-gray-600">Không có danh mục</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
            <div className="bg-blue-800 text-white p-4">
              <h2 className="font-semibold">Liên hệ chúng tôi</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center">
                <PhoneIcon className="text-blue-800 mr-3" size={18} />
                <div>
                  <p className="text-sm font-medium">Hỗ trợ khách hàng</p>
                  <p className="text-sm text-gray-600">1-800-SECURE-BANK</p>
                </div>
              </div>
              <div className="flex items-center">
                <MailIcon className="text-blue-800 mr-3" size={18} />
                <div>
                  <p className="text-sm font-medium">Hỗ trợ qua email</p>
                  <p className="text-sm text-gray-600">support@securebank.com</p>
                </div>
              </div>
              <div className="flex items-center">
                <MessageSquareIcon className="text-blue-800 mr-3" size={18} />
                <div>
                  <p className="text-sm font-medium">Chat trực tiếp</p>
                  <button className="text-sm text-blue-800 hover:underline">Bắt đầu phiên chat</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-800 text-white p-6">
              <div className="flex items-center">
                <HelpCircleIcon className="mr-2" size={24} />
                <h2 className="text-xl font-semibold">
                  {searchTerm
                    ? `Kết quả tìm kiếm cho "${searchTerm}"`
                    : activeCategory
                      ? `${faqCategories.find((cat: Category) => cat.categoryId === activeCategory)?.categoryName
                      } FAQ`
                      : 'Câu hỏi thường gặp'}
                </h2>
              </div>
            </div>
            <div className="p-6">
              {filteredFaqs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFaqs.map((faq: FaqItem) => (
                    <div key={faq.id} className="border border-gray-200 rounded-md overflow-hidden">
                      <button
                        className="w-full flex justify-between items-center p-4 text-left bg-gray-50 hover:bg-gray-100"
                        onClick={() => toggleQuestion(faq.question)}
                      >
                        <span className="font-medium text-gray-800">{faq.question}</span>
                        {expandedQuestions.includes(faq.question) ? (
                          <ChevronUpIcon size={18} />
                        ) : (
                          <ChevronDownIcon size={18} />
                        )}
                      </button>
                      {expandedQuestions.includes(faq.question) && (
                        <div className="p-4 bg-white">
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircleIcon className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy kết quả</h3>
                  <p className="text-gray-600">
                    Chúng tôi không tìm thấy FAQ nào phù hợp với tìm kiếm của bạn. Vui lòng thử từ khóa khác hoặc liên hệ đội ngũ hỗ trợ.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Vẫn cần trợ giúp?</h3>
            <p className="text-gray-700 mb-4">
              Nếu bạn không tìm thấy câu trả lời, đội ngũ hỗ trợ của chúng tôi sẵn sàng 24/7.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
              <button
                onClick={() => handleNavigateToService('chequeBook')}
                className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700"
              >
                <HelpCircleIcon size={16} className="mr-2" /> Yêu cầu sổ séc
              </button>
              <button
                onClick={() => handleNavigateToService('addressChange')}
                className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-600"
              >
                <MailIcon size={16} className="mr-2" /> Yêu cầu thay đổi địa chỉ
              </button>
            </div>
            <form onSubmit={handleQuestionSubmit}>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Gửi câu hỏi của bạn
              </label>
              <textarea
                id="question"
                name="question"
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập câu hỏi của bạn tại đây..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div className="mt-4">
                <button
                  type="submit"
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Gửi câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;