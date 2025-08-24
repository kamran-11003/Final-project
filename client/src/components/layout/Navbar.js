import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  BriefcaseIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Profile', href: '/profile' },
    { name: 'Applications', href: '/applications' },
    ...(user?.role === 'employer' ? [{ name: 'Post Job', href: '/jobs/post' }] : []),
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  JobPortal
                </span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Search, Auth */}
          <div className="flex items-center space-x-3">
            {/* Search button */}
            <button
              onClick={() => navigate('/jobs')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Notification button for logged in users */}
            {user && (
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 relative">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* Auth buttons or user menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 hover:bg-gray-50 transition-all duration-200"
                >
                  {user.profile?.avatar ? (
                    <img
                      className="w-8 h-8 rounded-xl object-cover border-2 border-gray-200"
                      src={user.profile.avatar}
                      alt={user.fullName}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <span className="hidden md:block text-gray-700 font-medium">
                    {user.firstName}
                  </span>
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
                    <div className="py-2">
                      <div className="px-4 py-3 text-sm border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user.fullName}</p>
                        <p className="text-gray-500 capitalize">{user.role}</p>
                      </div>
                      
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                      
                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl font-medium transition-colors duration-200 hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-3 text-base font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-4 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            ))}
            
            {user && (
              <>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-4 mb-4">
                    {user.profile?.avatar ? (
                      <img
                        className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200"
                        src={user.profile.avatar}
                        alt={user.fullName}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <UserCircleIcon className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="ml-3">
                      <div className="text-base font-semibold text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-sm font-medium text-gray-500 capitalize">
                        {user.role}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
