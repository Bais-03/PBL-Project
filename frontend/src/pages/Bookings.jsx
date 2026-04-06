import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import "../styles/Bookings.css";

/* ─── Category colors ────────────────────────────────────────────── */
const CAT_COLORS = {
  Textbook: "#1A3263",
  Notes: "#547792",
  Electronics: "#1e6b4a",
  Housing: "#7b3f00",
  Tutoring: "#5b21b6",
  Other: "#374151",
};

/* ─── Price display helper ───────────────────────────────────────── */
function PriceDisplay({ priceType, price }) {
  if (priceType === "free") return <span className="bookings__price--free">Free</span>;
  if (priceType === "negotiable" || price === null || price === undefined)
    return <span className="bookings__price--negotiate">Negotiable</span>;
  if (priceType === "fixed" && price > 0)
    return <span>₹{Number(price).toLocaleString("en-IN")}</span>;
  return <span className="bookings__price--free">Free</span>;
}

export default function Bookings() {
  const { 
    bookings, 
    pendingRequests,
    cancelBooking, 
    acceptBooking,
    rejectBooking,
    completeBooking,
    rateBooking,
    loading, 
    fetchBookings 
  } = useBooking();
  
  const [actionInProgress, setActionInProgress] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("my-bookings");

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAcceptBooking = async (bookingId) => {
    setActionInProgress(bookingId);
    const responseMessage = prompt("Optional: Add a message to the buyer:");
    const result = await acceptBooking(bookingId, responseMessage);
    setActionInProgress(null);
    
    if (result.success) {
      showToast("Booking accepted successfully!", "success");
    } else {
      showToast(result.error || "Failed to accept booking", "error");
    }
  };

  const handleRejectBooking = async (bookingId) => {
    setActionInProgress(bookingId);
    const rejectionReason = prompt("Reason for rejection (optional):");
    const result = await rejectBooking(bookingId, rejectionReason);
    setActionInProgress(null);
    
    if (result.success) {
      showToast("Booking rejected", "info");
    } else {
      showToast(result.error || "Failed to reject booking", "error");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    setActionInProgress(bookingId);
    const result = await cancelBooking(bookingId);
    setActionInProgress(null);
    
    if (result.success) {
      showToast("Booking cancelled successfully", "success");
    } else {
      showToast(result.error || "Failed to cancel booking", "error");
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm("Mark this transaction as completed?")) return;
    
    setActionInProgress(bookingId);
    const result = await completeBooking(bookingId);
    setActionInProgress(null);
    
    if (result.success) {
      showToast("Transaction marked as completed!", "success");
      // Ask for rating
      setTimeout(() => {
        const rating = prompt("Please rate this transaction (1-5 stars):", "5");
        if (rating && rating >= 1 && rating <= 5) {
          const review = prompt("Leave a review (optional):");
          rateBooking(bookingId, parseInt(rating), review);
        }
      }, 500);
    } else {
      showToast(result.error || "Failed to complete booking", "error");
    }
  };

  if (loading) {
    return (
      <div className="bookings__loading">
        <div className="bookings__spinner" />
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="bookings">
      {/* Toast notification */}
      {toast && (
        <div className={`bookings__toast bookings__toast--${toast.type}`}>
          {toast.type === "success" && (
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          )}
          {toast.type === "error" && (
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bookings__header">
        <div className="bookings__header-text">
          <h1 className="bookings__title">My Bookings</h1>
          <p className="bookings__subtitle">
            Manage your transactions
          </p>
        </div>
        <Link to="/browse" className="bookings__browse-btn">
          <svg viewBox="0 0 20 20" fill="currentColor" width="17" height="17">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Browse More Items
        </Link>
      </div>

      {/* Tabs */}
      <div className="bookings__tabs">
        <button
          className={`bookings__tab ${activeTab === "my-bookings" ? "bookings__tab--active" : ""}`}
          onClick={() => setActiveTab("my-bookings")}
        >
          My Bookings ({bookings.filter(b => b.user?._id === b.seller?._id ? false : true).length})
        </button>
        <button
          className={`bookings__tab ${activeTab === "requests" ? "bookings__tab--active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Pending Requests ({pendingRequests.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "requests" && pendingRequests.length > 0 && (
        <div className="bookings__section">
          <h3>Requests from Buyers</h3>
          <div className="bookings__grid">
            {pendingRequests.map((booking) => (
              <div key={booking._id} className="bookings__card bookings__card--pending">
                <div className="bookings__card-header">
                  <span className="bookings__badge bookings__badge--pending">Pending</span>
                </div>
                <h3 className="bookings__item-title">{booking.listing?.title}</h3>
                {booking.message && (
                  <p className="bookings__message"><strong>Buyer's message:</strong> {booking.message}</p>
                )}
                <div className="bookings__buyer-info">
                  <strong>Buyer:</strong> {booking.user?.name}
                </div>
                <div className="bookings__card-actions">
                  <button
                    className="bookings__accept-btn"
                    onClick={() => handleAcceptBooking(booking._id)}
                    disabled={actionInProgress === booking._id}
                  >
                    {actionInProgress === booking._id ? "Processing..." : "Accept"}
                  </button>
                  <button
                    className="bookings__reject-btn"
                    onClick={() => handleRejectBooking(booking._id)}
                    disabled={actionInProgress === booking._id}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "my-bookings" && (
        <div className="bookings__section">
          {bookings.filter(b => b.status !== "pending" || b.user?._id === b.seller?._id).length === 0 ? (
            <div className="bookings__empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 12H4M12 4v16" />
              </svg>
              <h3>No bookings yet</h3>
              <p>Items you book will appear here</p>
              <Link to="/browse" className="bookings__empty-btn">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="bookings__grid">
              {bookings
                .filter(b => b.status !== "pending" || b.user?._id === b.seller?._id)
                .map((booking) => {
                  const item = booking.listing;
                  if (!item) return null;
                  
                  const accentColor = CAT_COLORS[item.category] || "#547792";
                  const isBuyer = booking.user?._id === JSON.parse(atob(localStorage.getItem("token").split('.')[1])).id;
                  const isSeller = booking.seller?._id === JSON.parse(atob(localStorage.getItem("token").split('.')[1])).id;
                  
                  const statusColors = {
                    pending: "#f59e0b",
                    accepted: "#10b981",
                    rejected: "#ef4444",
                    completed: "#8b5cf6",
                    cancelled: "#6b7280"
                  };

                  return (
                    <div key={booking._id} className="bookings__card">
                      <div className="bookings__card-bar" style={{ background: accentColor }} />
                      
                      <div className="bookings__card-content">
                        <div className="bookings__card-header">
                          <span
                            className="bookings__category"
                            style={{
                              color: accentColor,
                              borderColor: `${accentColor}28`,
                              background: `${accentColor}0d`,
                            }}
                          >
                            {item.category || "Other"}
                          </span>
                          <span 
                            className="bookings__badge"
                            style={{ background: statusColors[booking.status], color: "white" }}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </div>

                        <h3 className="bookings__item-title">{item.title}</h3>
                        <p className="bookings__item-desc">{item.description}</p>

                        <div className="bookings__details">
                          <div className="bookings__detail-row">
                            <span className="bookings__detail-label">Price:</span>
                            <span className="bookings__detail-value">
                              <PriceDisplay priceType={item.priceType} price={item.price} />
                            </span>
                          </div>
                          <div className="bookings__detail-row">
                            <span className="bookings__detail-label">{isBuyer ? "Seller:" : "Buyer:"}</span>
                            <span className="bookings__detail-value">
                              {isBuyer ? booking.seller?.name : booking.user?.name}
                            </span>
                          </div>
                        </div>

                        {booking.sellerResponse && (
                          <div className="bookings__response">
                            <strong>Seller's response:</strong> {booking.sellerResponse}
                          </div>
                        )}

                        <div className="bookings__card-footer">
                          {booking.status === "accepted" && isSeller && (
                            <button
                              className="bookings__complete-btn"
                              onClick={() => handleCompleteBooking(booking._id)}
                              disabled={actionInProgress === booking._id}
                            >
                              {actionInProgress === booking._id ? "Processing..." : "Mark as Completed"}
                            </button>
                          )}
                          
                          {(booking.status === "pending" || booking.status === "accepted") && isBuyer && (
                            <button
                              className="bookings__cancel-btn"
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={actionInProgress === booking._id}
                            >
                              {actionInProgress === booking._id ? "Cancelling..." : "Cancel Booking"}
                            </button>
                          )}
                          
                          {booking.status === "completed" && isBuyer && !booking.rating?.score && (
                            <button
                              className="bookings__rate-btn"
                              onClick={() => {
                                const rating = prompt("Rate this transaction (1-5 stars):", "5");
                                if (rating && rating >= 1 && rating <= 5) {
                                  const review = prompt("Leave a review (optional):");
                                  rateBooking(booking._id, parseInt(rating), review);
                                }
                              }}
                            >
                              Rate Transaction
                            </button>
                          )}
                          
                          {booking.rating?.score && (
                            <div className="bookings__rating">
                              ⭐ {booking.rating.score}/5
                              {booking.rating.review && <p className="bookings__review">"{booking.rating.review}"</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}