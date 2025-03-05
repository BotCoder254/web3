import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">TokenEstate</h3>
            <p className="text-gray-600">
              Revolutionizing real estate investment through blockchain technology
              and fractional ownership.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/properties" className="text-gray-600 hover:text-primary">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-600 hover:text-primary">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-primary">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-600 hover:text-primary">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <FaDiscord size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} TokenEstate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 