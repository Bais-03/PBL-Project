import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookedItems, setBookedItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all bookings (for the new system)
  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get('/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
      
      // Separate pending requests where user is seller
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const pending = res.data.filter(b => 
        b.status === 'pending' && b.seller?._id === tokenData.id
      );
      setPendingRequests(pending);
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch booked items (accepted/completed bookings)
  const fetchBookedItems = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get('/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter to get only accepted/completed bookings where user is buyer
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const acceptedBookings = res.data.filter(b => 
        (b.status === 'accepted' || b.status === 'completed') && 
        b.user?._id === tokenData.id
      );
      setBookedItems(acceptedBookings.map(b => b.listing));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch booked items:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a booking request (NEW)
  const createBookingRequest = async (listingId, message = '') => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please login to book items');
    }

    try {
      const res = await axios.post('/bookings/request', 
        { listingId, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchBookings();
      await fetchBookedItems();
      
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Failed to create booking request:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to create booking request' 
      };
    }
  };

  // Accept booking (for sellers)
  const acceptBooking = async (bookingId, responseMessage = '') => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await axios.post('/bookings/accept', 
        { bookingId, responseMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchBookings();
      await fetchBookedItems();
      
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Failed to accept booking:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to accept booking' 
      };
    }
  };

  // Reject booking (for sellers)
  const rejectBooking = async (bookingId, rejectionReason = '') => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await axios.post('/bookings/reject', 
        { bookingId, rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchBookings();
      await fetchBookedItems();
      
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Failed to reject booking:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to reject booking' 
      };
    }
  };

  // Cancel booking (for buyers)
  const cancelBooking = async (bookingId) => {
    const token = localStorage.getItem('token');
    
    try {
      await axios.delete(`/bookings/cancel/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchBookings();
      await fetchBookedItems();
      
      return { success: true };
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to cancel booking' 
      };
    }
  };

  // Complete booking (for sellers)
  const completeBooking = async (bookingId) => {
    const token = localStorage.getItem('token');
    
    try {
      await axios.post(`/bookings/complete/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchBookings();
      await fetchBookedItems();
      
      return { success: true };
    } catch (err) {
      console.error('Failed to complete booking:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to complete booking' 
      };
    }
  };

  // Rate booking (for buyers)
  const rateBooking = async (bookingId, rating, review = '') => {
    const token = localStorage.getItem('token');
    
    try {
      await axios.post(`/bookings/rate/${bookingId}`, 
        { rating, review },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchBookings();
      
      return { success: true };
    } catch (err) {
      console.error('Failed to rate booking:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to submit rating' 
      };
    }
  };

  // Legacy method for backward compatibility (used in Browse.jsx)
  const bookItem = createBookingRequest;

  // Initial fetch
  useEffect(() => {
    fetchBookings();
    fetchBookedItems();
  }, [fetchBookings, fetchBookedItems]);

  const value = {
    // New system exports
    bookings,
    pendingRequests,
    createBookingRequest,
    acceptBooking,
    rejectBooking,
    cancelBooking,
    completeBooking,
    rateBooking,
    fetchBookings,
    
    // Backward compatibility (used in Browse.jsx)
    bookedItems,
    bookItem, // This ensures Browse.jsx works with existing code
    loading,
    error,
    fetchBookedItems
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};