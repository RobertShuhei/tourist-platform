"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface GuideProfile {
  id?: number;
  user_id?: number;
  bio: string;
  experience_years: number | null;
  city: string;
  country: string;
  languages: string[];
  created_at?: string;
  updated_at?: string;
}

export default function GuideProfilePage() {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoadingAuth = useAuthStore((s) => s.isLoading);
  const [profile, setProfile] = useState<GuideProfile>({
    bio: '',
    experience_years: null,
    city: '',
    country: '',
    languages: []
  });
  const [existingProfile, setExistingProfile] = useState<GuideProfile | null>(null);
  const [languageInput, setLanguageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoadingAuth) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingAuth, isAuthenticated]);

  const fetchProfile = async () => {
    try {
      if (!token) throw new Error('Not authenticated');
      const resp = await fetch(`${API_BASE_URL}/profiles/guide/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.status === 404) {
        setExistingProfile(null);
        return;
      }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to load profile');
      }
      const data: GuideProfile = await resp.json();
      if (data) {
        setExistingProfile(data);
        setProfile({
          bio: data.bio || '',
          experience_years: data.experience_years,
          city: data.city || '',
          country: data.country || '',
          languages: data.languages || []
        });
      }
    } catch (error) {
      // If profile not found, allow creating a new one
      const msg = error instanceof Error ? error.message : '';
      if (msg.toLowerCase().includes('not found')) {
        setExistingProfile(null);
      } else if (msg.includes('GUIDE role required')) {
        setMessage({ type: 'error', text: 'Access denied. This page is only available to guides.' });
      } else {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof GuideProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !profile.languages.includes(languageInput.trim())) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()]
      }));
      setLanguageInput('');
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        bio: profile.bio || null,
        experience_years: profile.experience_years || null,
        city: profile.city || null,
        country: profile.country || null,
        languages: profile.languages.length > 0 ? profile.languages : null,
      };

      if (!token) throw new Error('Not authenticated');
      if (existingProfile) {
        const resp = await fetch(`${API_BASE_URL}/profiles/guide/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const updated = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(updated.detail || 'Failed to update profile');
        setExistingProfile(updated);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const resp = await fetch(`${API_BASE_URL}/profiles/guide`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const created = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(created.detail || 'Failed to create profile');
        setExistingProfile(created);
        setMessage({ type: 'success', text: 'Profile created successfully!' });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Network error. Please try again.';
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
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
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Guide Profile</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            {/* Page Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {existingProfile ? 'Edit Your Guide Profile' : 'Create Your Guide Profile'}
              </h2>
              <p className="text-lg text-gray-600">
                Tell potential tourists about your expertise and services
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Tell visitors about yourself, your passion for Japan, and what makes your tours special..."
                />
              </div>

              {/* Experience Years */}
              <div>
                <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={profile.experience_years || ''}
                  onChange={(e) => handleInputChange('experience_years', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="How many years have you been guiding?"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={profile.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Tokyo, Kyoto, Osaka"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={profile.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Japan"
                  />
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <div className="space-y-3">
                  {/* Language Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Add a language (e.g., English, Japanese, Spanish)"
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Language Tags */}
                  {profile.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language) => (
                        <span
                          key={language}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => removeLanguage(language)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium text-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {existingProfile ? 'Updating Profile...' : 'Creating Profile...'}
                    </div>
                  ) : (
                    existingProfile ? 'Update Profile' : 'Create Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
