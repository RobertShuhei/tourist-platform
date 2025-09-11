"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Japan Tours</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.first_name} {user.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
                {user.role === 'tourist' ? (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {user.role === 'tourist' ? 'Welcome, Tourist!' : 'Welcome, Guide!'}
              </h2>
              
              <p className="text-lg text-gray-600 mb-6">
                {user.role === 'tourist' 
                  ? 'Ready to discover amazing places and book unique tours in Japan?'
                  : 'Ready to share your expertise and create memorable experiences for visitors?'
                }
              </p>

              {/* Role-specific content */}
              {user.role === 'tourist' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <Link href="/guides" className="group">
                    <div className="bg-blue-50 p-6 rounded-xl transition-shadow group-hover:shadow-md">
                      <h3 className="font-semibold text-blue-900 mb-2">Discover Tours</h3>
                      <p className="text-blue-700 text-sm">Browse unique tours and experiences offered by local guides</p>
                    </div>
                  </Link>
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-green-900 mb-2">Book Experiences</h3>
                    <p className="text-green-700 text-sm">Reserve your spot on tours that interest you</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-purple-900 mb-2">Rate & Review</h3>
                    <p className="text-purple-700 text-sm">Share your experiences and help other travelers</p>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Guide Profile Action Button */}
                  <div className="text-center mb-8">
                    <button
                      onClick={() => router.push('/dashboard/guide/profile')}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-lg font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Edit Your Guide Profile
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Complete your profile to attract more tourists
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-orange-50 p-6 rounded-xl">
                      <h3 className="font-semibold text-orange-900 mb-2">Create Tours</h3>
                      <p className="text-orange-700 text-sm">Design unique experiences and share your local knowledge</p>
                    </div>
                    <div className="bg-teal-50 p-6 rounded-xl">
                      <h3 className="font-semibold text-teal-900 mb-2">Manage Bookings</h3>
                      <p className="text-teal-700 text-sm">Handle tour reservations and communicate with tourists</p>
                    </div>
                    <div className="bg-pink-50 p-6 rounded-xl">
                      <h3 className="font-semibold text-pink-900 mb-2">Earn Revenue</h3>
                      <p className="text-pink-700 text-sm">Get paid for sharing your passion and expertise</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/dashboard/my-bookings')}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" />
                    </svg>
                    My Bookings
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{user.email}</span>
                  {user.email_verified && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <span className="ml-2 text-gray-600 capitalize">{user.role}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Member since:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Account status:</span>
                  <span className="ml-2">
                    {user.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
