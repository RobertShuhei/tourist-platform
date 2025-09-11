"use client";

import { create } from 'zustand';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type UserRole = 'tourist' | 'guide' | 'business' | 'admin';

export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  initialize: async () => {
    if (get().isLoading) return; // prevent duplicate inits
    set({ isLoading: true });
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('access_token');
        if (stored) {
          set({ token: stored, isAuthenticated: true });
          await get().fetchCurrentUser();
        }
      }
    } catch (e) {
      // Reset on failure
      if (typeof window !== 'undefined') localStorage.removeItem('access_token');
      set({ token: null, user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    const token = get().token;
    if (!token) throw new Error('Not authenticated');
    const resp = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!resp.ok) {
      throw new Error('Failed to fetch user');
    }
    const data: User = await resp.json();
    set({ user: data, isAuthenticated: true });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const form = new URLSearchParams();
      form.append('username', email);
      form.append('password', password);
      const resp = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Login failed');
      }
      const tokenData = await resp.json();
      const accessToken: string = tokenData.access_token;
      if (typeof window !== 'undefined') localStorage.setItem('access_token', accessToken);
      set({ token: accessToken, isAuthenticated: true });
      await get().fetchCurrentUser();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('access_token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

