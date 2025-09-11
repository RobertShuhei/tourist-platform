"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface GuideProfileForm {
  full_name: string;
  city: string;
  spoken_languages: string[];
  guide_experience_years: number | null;
  bio: string;
}

function GuideProfilePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoadingAuth = useAuthStore((s) => s.isLoading);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<GuideProfileForm>({
    full_name: '',
    city: '',
    spoken_languages: [],
    guide_experience_years: null,
    bio: ''
  });
  
  const [languageInput, setLanguageInput] = useState('');
  const [experienceInput, setExperienceInput] = useState('');

  const handleInputChange = (field: keyof GuideProfileForm, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.spoken_languages.includes(languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        spoken_languages: [...prev.spoken_languages, languageInput.trim()]
      }));
      setLanguageInput('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      spoken_languages: prev.spoken_languages.filter(lang => lang !== language)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLanguage();
    }
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExperienceInput(value);
    
    if (value === '') {
      handleInputChange('guide_experience_years', null);
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
        handleInputChange('guide_experience_years', numValue);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!token) throw new Error('Not authenticated');
      const resp = await fetch(`${API_BASE_URL}/profiles/guide/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
        full_name: formData.full_name || null,
        city: formData.city || null,
        spoken_languages: formData.spoken_languages.length > 0 ? formData.spoken_languages : null,
        guide_experience_years: formData.guide_experience_years,
        bio: formData.bio || null
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create profile');
      }

      // Profile created successfully, redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Profile creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Complete Your Guide Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Share your expertise and help tourists discover amazing experiences
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-10 sm:px-12">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Tokyo, Osaka, Kyoto"
                />
              </div>

              {/* Experience Years */}
              <div>
                <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Guide Experience
                </label>
                <input
                  id="experience_years"
                  name="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={experienceInput}
                  onChange={handleExperienceChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 3"
                />
                <p className="mt-1 text-sm text-gray-500">
                  How many years have you been guiding tourists? (0-50 years)
                </p>
              </div>

              {/* Spoken Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages You Speak
                </label>
                
                {/* Language Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Japanese, English, Chinese"
                  />
                  <button
                    type="button"
                    onClick={addLanguage}
                    disabled={!languageInput.trim()}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* Language Tags */}
                {formData.spoken_languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.spoken_languages.map((language, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                      >
                        {language}
                        <button
                          type="button"
                          onClick={() => removeLanguage(language)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-600 hover:bg-orange-200 hover:text-orange-800 focus:outline-none"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  About You (Bio)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={6}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500 resize-none"
                  placeholder="Tell tourists about your background, interests, and what makes your tours special. What unique experiences can you offer? What are your favorite places to show visitors?"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Share your story and passion for guiding (up to 5000 characters)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium text-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-medium text-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Profile...
                    </div>
                  ) : (
                    'Complete Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            You can always update your profile information later in your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

export default GuideProfilePage;
