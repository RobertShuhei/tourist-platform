"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface GuideCardProps {
  guide: Guide;
}

function GuideCard({ guide }: GuideCardProps) {
  const truncateBio = (bio: string, maxLength: number = 120) => {
    if (bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength).trim() + '...';
  };

  const formatLocation = (city: string, country: string) => {
    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
    return 'Location not specified';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{guide.guide_name}</h3>
            <p className="text-orange-100 text-sm">{formatLocation(guide.city, guide.country)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <span className="text-white text-sm font-medium">
              {guide.experience_years} {guide.experience_years === 1 ? 'year' : 'years'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Bio */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {guide.bio ? truncateBio(guide.bio) : 'No bio available yet.'}
          </p>
        </div>

        {/* Languages */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Languages</h4>
          <div className="flex flex-wrap gap-1">
            {guide.languages && guide.languages.length > 0 ? (
              guide.languages.map((language) => (
                <span
                  key={language}
                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {language}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-xs">No languages specified</span>
            )}
          </div>
        </div>

        {/* Experience Badge */}
        <div className="mb-4">
          <div className="inline-flex items-center text-xs text-gray-600">
            <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Guide since {new Date(guide.member_since).getFullYear()}</span>
          </div>
        </div>

        {/* Contact Button */}
        <div className="pt-4 border-t border-gray-100">
          <Link 
            href={`/guides/${guide.id}`}
            className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 text-sm font-medium text-center"
          >
            View Profile & Contact
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/guides`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns an array directly
        setGuides(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load guides');
      }
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading our amazing guides...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchGuides}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
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
              <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Browse Guides</h1>
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
                Join as Guide
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Local Guides
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with experienced guides who will show you the real Japan beyond the tourist trails.
            Each guide brings unique expertise and passion for their local area.
          </p>
        </div>

        {/* Guides Grid */}
        {guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No guides available yet</h3>
            <p className="text-gray-500 mb-6">Be the first to join our community of local guides!</p>
            <Link
              href="/signup"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              Become a Guide
            </Link>
          </div>
        )}

        {/* Call to Action */}
        {guides.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to explore Japan with a local guide?
              </h3>
              <p className="text-gray-600 mb-6">
                Join our platform to connect with guides and book unique experiences
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Sign Up as Tourist
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Become a Guide
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
