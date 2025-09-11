"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Guide {
  id: number;
  user_id: number;
  bio: string;
  experience_years: number;
  city: string;
  country: string;
  languages: string[];
  guide_name: string;
  guide_email: string;
  member_since: string;
  created_at: string;
  updated_at: string;
}

export default function GuideDetailPage() {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    tour_date: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [bookingMessage, setBookingMessage] = useState('');
  const params = useParams();
  const router = useRouter();
  const profileId = params.profileId as string;
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (profileId) {
      fetchGuide();
    }
  }, [profileId]);

  const fetchGuide = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/guide/profile/${profileId}`, {
        method: 'GET',
      });

      if (response.status === 404) {
        setError('Guide not found');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setGuide(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load guide profile');
      }
    } catch (err) {
      console.error('Error fetching guide:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLocation = (city: string, country: string) => {
    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
    return 'Location not specified';
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guide || !bookingForm.tour_date) {
      setBookingStatus('error');
      setBookingMessage('Please select a tour date');
      return;
    }

    setIsSubmitting(true);
    setBookingStatus('idle');

    try {
      if (!token) {
        setBookingStatus('error');
        setBookingMessage('Please log in to book a tour');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          guide_id: guide.user_id,
          tour_date: new Date(bookingForm.tour_date).toISOString(),
          message: bookingForm.message.trim() || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setBookingStatus('success');
        setBookingMessage('Booking request sent successfully! The guide will review your request.');
        setBookingForm({ tour_date: '', message: '' });
        setTimeout(() => {
          setIsBookingModalOpen(false);
          setBookingStatus('idle');
          setBookingMessage('');
        }, 3000);
      } else {
        setBookingStatus('error');
        setBookingMessage(data.detail || 'Failed to send booking request');
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      setBookingStatus('error');
      setBookingMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openBookingModal = () => {
    setIsBookingModalOpen(true);
    setBookingStatus('idle');
    setBookingMessage('');
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingForm({ tour_date: '', message: '' });
    setBookingStatus('idle');
    setBookingMessage('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guide profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">The guide profile you're looking for could not be found.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <Link
              href="/guides"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Browse All Guides
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Guide Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Platform
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guide Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 rounded-full mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{guide.guide_name}</h1>
              <p className="text-xl text-orange-100 mb-4">{formatLocation(guide.city, guide.country)}</p>
              <div className="inline-flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-medium">
                  {guide.experience_years} {guide.experience_years === 1 ? 'year' : 'years'} experience
                </span>
              </div>
            </div>
          </div>

          {/* Guide Information */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bio Section */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {guide.bio || 'This guide hasn\'t added a bio yet, but they\'re ready to share amazing experiences with you!'}
                  </p>
                </div>

                {/* Languages */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages && guide.languages.length > 0 ? (
                      guide.languages.map((language) => (
                        <span
                          key={language}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          {language}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">Languages not specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Contact Card */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Book a Tour</h3>
                  <button 
                    onClick={openBookingModal}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 font-medium mb-3"
                  >
                    Book Now
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 font-medium">
                    Save to Favorites
                  </button>
                </div>

                {/* Quick Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700">
                        <span className="font-medium">Location:</span> {formatLocation(guide.city, guide.country)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 1v8m-6 0V9a6 6 0 1112 0v6" />
                      </svg>
                      <span className="text-gray-700">
                        <span className="font-medium">Experience:</span> {guide.experience_years} {guide.experience_years === 1 ? 'year' : 'years'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 1v8m-6 0V9a6 6 0 1112 0v6" />
                      </svg>
                      <span className="text-gray-700">
                        <span className="font-medium">Guide since:</span> {formatMemberSince(guide.member_since)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Browse More Guides */}
        <div className="text-center">
          <Link
            href="/guides"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Browse All Guides
          </Link>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Book a Tour</h2>
                <button
                  onClick={closeBookingModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-orange-100 mt-1">Book a tour with {guide?.guide_name}</p>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleBookingSubmit} className="p-6">
              {/* Tour Date */}
              <div className="mb-4">
                <label htmlFor="tour_date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tour Date *
                </label>
                <input
                  type="datetime-local"
                  id="tour_date"
                  value={bookingForm.tour_date}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, tour_date: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Message */}
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message to Guide
                </label>
                <textarea
                  id="message"
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell the guide about your interests, preferences, or any special requests..."
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{bookingForm.message.length}/1000 characters</p>
              </div>

              {/* Status Message */}
              {bookingMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  bookingStatus === 'success' 
                    ? 'bg-green-100 border border-green-200 text-green-700' 
                    : 'bg-red-100 border border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {bookingStatus === 'success' ? (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm">{bookingMessage}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !bookingForm.tour_date}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Booking Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
