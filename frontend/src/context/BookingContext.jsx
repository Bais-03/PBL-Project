// BookingContext.jsx - Updated version
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Helper to get user ID from token
  const getUserIdFromToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.id;
    } catch (err) {
      console.error('Failed to parse token:', err);
      return null;
    }
  }, []);

  // Fetch all bookings with retry logic
  const fetchBookings = useCallback(async (retryCount = 0) => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (isMounted.current) {
        setBookings([]);
        setPendingRequests([]);
      }
      return;
    }

    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const res = await axios.get('/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000 // 30 second timeout for this specific request
      });
      
      if (isMounted.current) {
        setBookings(res.data);
        
        // Separate pending requests where user is seller
        const userId = getUserIdFromToken();
        if (userId) {
          const pending = res.data.filter(b => 
            b.status === 'pending' && b.seller?._id === userId
          );
          setPendingRequests(pending);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      
      // Retry logic for timeout errors (max 2 retries)
      if ((err.code === 'ECONNABORTED' || err.message?.includes('timeout')) && retryCount < 2) {
        console.log(`Retrying fetchBookings (attempt ${retryCount + 2})...`);
        setTimeout(() => {
          if (isMounted.current) {
            fetchBookings(retryCount + 1);
          }
        }, 2000);
        return;
      }
      
      if (isMounted.current) {
        if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Please check your connection and try again.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch bookings');
        }
        setBookings([]);
        setPendingRequests([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [getUserIdFromToken]);

  // Fetch booked items with retry logic
  const fetchBookedItems = useCallback(async (retryCount = 0) => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (isMounted.current) {
        setBookedItems([]);
      }
      return;
    }

    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const res = await axios.get('/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000 // 30 second timeout for this specific request
      });
      
      if (isMounted.current) {
        // Filter to get only accepted/completed bookings where user is buyer
        const userId = getUserIdFromToken();
        if (userId) {
          const acceptedBookings = res.data.filter(b => 
            (b.status === 'accepted' || b.status === 'completed') && 
            b.user?._id === userId
          );
          setBookedItems(acceptedBookings.map(b => b.listing).filter(item => item !== null));
        } else {
          setBookedItems([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch booked items:', err);
      
      // Retry logic for timeout errors (max 2 retries)
      if ((err.code === 'ECONNABORTED' || err.message?.includes('timeout')) && retryCount < 2) {
        console.log(`Retrying fetchBookedItems (attempt ${retryCount + 2})...`);
        setTimeout(() => {
          if (isMounted.current) {
            fetchBookedItems(retryCount + 1);
          }
        }, 2000);
        return;
      }
      
      if (isMounted.current) {
        if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Please check your connection and try again.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch bookings');
        }
        setBookedItems([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [getUserIdFromToken]);

  // Create a booking request
  const createBookingRequest = async (listingId, message = '') => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please login to book items');
    }

    try {
      const res = await axios.post('/bookings/request', 
        { listingId, message },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        }
      );
      
      await Promise.all([fetchBookings(), fetchBookedItems()]);
      
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
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        }
      );
      
      await Promise.all([fetchBookings(), fetchBookedItems()]);
      
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
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        }
      );
      
      await Promise.all([fetchBookings(), fetchBookedItems()]);
      
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
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
      });
      
      await Promise.all([fetchBookings(), fetchBookedItems()]);
      
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
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
      });
      
      await Promise.all([fetchBookings(), fetchBookedItems()]);
      
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
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        }
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

  // Legacy method for backward compatibility
  const bookItem = createBookingRequest;

  // Initial fetch with delay to avoid overwhelming the server
  useEffect(() => {
    let mounted = true;
    
    const initializeData = async () => {
      // Add a small delay to ensure token is properly set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (mounted) {
        await Promise.all([fetchBookings(), fetchBookedItems()]);
      }
    };
    
    initializeData();
    
    return () => {
      mounted = false;
    };
  }, [fetchBookings, fetchBookedItems]);

  const value = {
    bookings,
    pendingRequests,
    createBookingRequest,
    acceptBooking,
    rejectBooking,
    cancelBooking,
    completeBooking,
    rateBooking,
    fetchBookings,
    
    // Backward compatibility
    bookedItems,
    bookItem,
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