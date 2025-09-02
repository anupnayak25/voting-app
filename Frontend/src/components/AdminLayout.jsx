import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/samca2k25-admin', label: 'Settings', exact: true },
    { path: '/samca2k25-admin/registrations', label: 'Registrations' },
    { path: '/samca2k25-admin/analytics', label: 'Analytics' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Student Election Portal</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {navItems.map((item) => {
                const isActive = item.exact 
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path) && item.path !== '/samca2k25-admin';
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
