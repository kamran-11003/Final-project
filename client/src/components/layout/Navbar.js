import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  BriefcaseIcon,
  HomeIcon,
  MagnifyingGlassIcon
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
    <nav className="bg-white shadow-soft border-b border-gray-200">
      <div className="container-responsive">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BriefcaseIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">JobPortal</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-1" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Search, Auth */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button
              onClick={() => navigate('/jobs')}
              className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Auth buttons or user menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 p-1"
                >
                  {user.profile?.avatar ? (
                    <img
                      className="w-8 h-8 rounded-full object-cover"
                      src={user.profile.avatar}
                      alt={user.fullName}
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  )}
                  <span className="hidden md:block text-gray-700 font-medium">
                    {user.firstName}
                  </span>
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="dropdown">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-gray-500 capitalize">{user.role}</p>
                      </div>
                      
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                      
                      <button
                        onClick={handleLogout}
                        className="dropdown-item w-full text-left"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="btn-outline btn-sm"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary btn-sm"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </div>
              </Link>
            ))}
            
            {user && (
              <>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-4">
                    {user.profile?.avatar ? (
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={user.profile.avatar}
                        alt={user.fullName}
                      />
                    ) : (
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    )}
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.fullName}
                      </div>
                      <div className="text-sm font-medium text-gray-500 capitalize">
                        {user.role}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
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
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
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
