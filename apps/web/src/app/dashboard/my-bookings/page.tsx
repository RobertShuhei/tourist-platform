"use client";

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useRouter } from 'next/navigation';

type BookingStatus = 'pending' | 'confirmed' | 'canceled' | 'completed' | string;

interface Booking {
  id: number;
  user_id: number;
  guide_id: number;
  tour_date: string;
  message?: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  tourist_name?: string | null;
  tourist_email?: string | null;
  guide_name?: string | null;
  guide_email?: string | null;
}

function MyBookingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const fetchBookingsAction = useBookingStore((s) => s.fetchBookings);
  const updateStatusAction = useBookingStore((s) => s.updateBookingStatus);
  const bookings = useBookingStore((s) => s.bookings);
  const loading = useBookingStore((s) => s.loading);
  const error = useBookingStore((s) => s.error);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isGuide = user?.role === 'guide';

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookingsAction();
    } else if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, fetchBookingsAction, router]);

  const fetchBookings = async () => {
    await fetchBookingsAction();
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  const normalizeStatus = (status: string) => status?.toUpperCase?.() || status;

  const rows = useMemo(() => {
    return bookings.map((b) => {
      const otherName = isGuide ? (b.tourist_name || b.tourist_email || 'Tourist')
                                : (b.guide_name || b.guide_email || 'Guide');
      return {
        id: b.id,
        otherName,
        tourDate: formatDateTime(b.tour_date),
        status: normalizeStatus(b.status as string),
        raw: b,
      };
    });
  }, [bookings, isGuide]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (bookingId: number, newStatus: 'confirmed' | 'canceled') => {
    try {
      setActioningId(bookingId);
      await updateStatusAction(bookingId, newStatus);
      showToast('success', `Booking ${newStatus === 'confirmed' ? 'confirmed' : 'canceled'} successfully.`);
      await fetchBookingsAction();
    } catch (err) {
      console.error('Failed to update booking status:', err);
      showToast('error', err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">My Bookings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-8">
            {toast && (
              <div className={`mb-6 p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {toast.text}
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your bookings...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{error}</h2>
                <p className="text-gray-600 mb-6">We couldn't load your bookings. Please try again.</p>
                <button
                  onClick={fetchBookings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500">Your bookings will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isGuide ? 'Tourist' : 'Guide'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {isGuide && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.otherName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.tourDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={
                            `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              row.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              row.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`
                          }>
                            {row.status}
                          </span>
                        </td>
                        {isGuide && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {row.status === 'PENDING' ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateStatus(row.id, 'confirmed')}
                                  disabled={actioningId === row.id}
                                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                  {actioningId === row.id ? 'Working...' : 'Confirm'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateStatus(row.id, 'canceled')}
                                  disabled={actioningId === row.id}
                                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                  {actioningId === row.id ? 'Working...' : 'Cancel'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBookingsPage;
