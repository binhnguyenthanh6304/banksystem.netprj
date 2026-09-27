import React from 'react';
import { ShieldIcon, PhoneIcon, MailIcon, ClockIcon } from 'lucide-react';
const Footer: React.FC = () => {
  return <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <ShieldIcon className="mr-2" />
              SecureBank
            </h3>
            <p className="text-gray-300">
              Providing secure and reliable banking services since 1990. Your
              trusted partner for all financial needs.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  Locations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center">
                <PhoneIcon size={16} className="mr-2" />
                1-800-SECURE-BANK
              </p>
              <p className="flex items-center">
                <MailIcon size={16} className="mr-2" />
                support@securebank.com
              </p>
              <p className="flex items-center">
                <ClockIcon size={16} className="mr-2" />
                24/7 Customer Service
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} SecureBank. All rights reserved.</p>
          <p className="mt-2 text-sm">
            SecureBank is a member of FDIC. All deposits are insured up to
            $250,000.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;