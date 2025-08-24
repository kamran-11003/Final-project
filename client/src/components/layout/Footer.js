import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigation = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'Jobs', href: '/jobs' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'FAQ', href: '/faq' },
    ],
    employers: [
      { name: 'Post a Job', href: '/jobs/post' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Employer Resources', href: '/employer-resources' },
    ],
    jobseekers: [
      { name: 'Browse Jobs', href: '/jobs' },
      { name: 'Career Advice', href: '/career-advice' },
      { name: 'Resume Builder', href: '/resume-builder' },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container-responsive">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BriefcaseIcon className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  JobPortal
                </span>
              </div>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Connecting talented professionals with amazing opportunities. 
                Find your dream job or hire the perfect candidate.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                  <EnvelopeIcon className="w-5 h-5 mr-3 text-blue-400" />
                  <a href="mailto:contact@jobportal.com" className="hover:text-blue-400 transition-colors duration-200">
                    contact@jobportal.com
                  </a>
                </div>
                <div className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                  <PhoneIcon className="w-5 h-5 mr-3 text-blue-400" />
                  <a href="tel:+1234567890" className="hover:text-blue-400 transition-colors duration-200">
                    +1 (234) 567-890
                  </a>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPinIcon className="w-5 h-5 mr-3 text-blue-400" />
                  <span>123 Job Street, Career City, CC 12345</span>
                </div>
              </div>
            </div>

            {/* For Job Seekers */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
                For Job Seekers
              </h3>
              <ul className="space-y-4">
                {navigation.jobseekers.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRightIcon className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </span>
                For Employers
              </h3>
              <ul className="space-y-4">
                {navigation.employers.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRightIcon className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                  </svg>
                </span>
                Support & Legal
              </h3>
              <ul className="space-y-4">
                {navigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRightIcon className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-8">
              <p className="text-gray-300">
                © {currentYear} JobPortal. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
