"use client";

import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type BookingStatus = 'pending' | 'confirmed' | 'canceled' | 'completed';

export interface Booking {
  id: number;
  user_id: number;
  guide_id: number;
  tour_date: string;
  message?: string | null;
  status: BookingStatus | string;
  created_at: string;
  updated_at: string;
  tourist_name?: string | null;
  tourist_email?: string | null;
  guide_name?: string | null;
  guide_email?: string | null;
}

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (payload: { guide_id: number; tour_date: string; message?: string | null }) => Promise<Booking>;
  updateBookingStatus: (bookingId: number, status: BookingStatus) => Promise<Booking>;
  clear: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  clear: () => set({ bookings: [], loading: false, error: null }),

  fetchBookings: async () => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Not authenticated' });
      return;
    }
    set({ loading: true, error: null });
    try {
      const resp = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to load bookings');
      }
      const data: Booking[] = await resp.json();
      set({ bookings: Array.isArray(data) ? data : [] });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load bookings' });
    } finally {
      set({ loading: false });
    }
  },

  createBooking: async ({ guide_id, tour_date, message }) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('Not authenticated');
    const resp = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ guide_id, tour_date, message: message ?? null }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(data.detail || 'Failed to create booking');
    }
    // Refresh list after creating
    await get().fetchBookings();
    return data as Booking;
  },

  updateBookingStatus: async (bookingId, status) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('Not authenticated');
    const resp = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(data.detail || 'Failed to update booking');
    }
    // Refresh list after update
    await get().fetchBookings();
    return data as Booking;
  },
}));

