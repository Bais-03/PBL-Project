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

/* ─── Star Rating Component ───────────────────────────────────────── */
function StarRating({ rating, onRate, readonly = false, size = "md" }) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleClick = (value) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };
  
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  const starSize = sizeMap[size];
  
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${!readonly ? 'interactive' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          disabled={readonly}
        >
          <svg 
            viewBox="0 0 24 24" 
            width={starSize} 
            height={starSize}
            fill={star <= (hoverRating || rating) ? "#FAB95B" : "#E5E7EB"}
            className="star-icon"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ─── Rating Modal Component ─────────────────────────────────────── */
function RatingModal({ isOpen, onClose, onSubmit, bookingTitle }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setRatingError("Please select a star rating to continue");
      return;
    }
    setRatingError("");
    setSubmitting(true);
    await onSubmit(rating, review);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="#FAB95B">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>
        <h3>Rate Your Experience</h3>
        <p className="modal-subtitle">How was your transaction for "{bookingTitle?.substring(0, 50)}..."?</p>
        
        <div className="modal-rating">
          <StarRating rating={rating} onRate={setRating} size="lg" />
          <span className="rating-label">
            {rating === 0 ? "Select rating" : 
             rating === 1 ? "Poor" :
             rating === 2 ? "Fair" :
             rating === 3 ? "Good" :
             rating === 4 ? "Very Good" : "Excellent"}
          </span>
        </div>
        {ratingError && <p className="rating-error">{ratingError}</p>}
        
        <textarea
          className="modal-review"
          placeholder="Share your experience (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
        />
        
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirmation Modal Component ───────────────────────────────── */
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, action }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon confirm-icon--${action}`}>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
            {action === "cancel" ? (
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : action === "complete" ? (
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onClose}>No, Go Back</button>
          <button className={`confirm-confirm confirm-confirm--${action}`} onClick={onConfirm}>
            Yes, {action === "cancel" ? "Cancel" : action === "complete" ? "Complete" : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Seller Response Modal ──────────────────────────────────────── */
function SellerResponseModal({ isOpen, onClose, onSubmit, actionType }) {
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(message);
    setMessage("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="response-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className={`response-icon response-icon--${actionType}`}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
            {actionType === "accept" ? (
              <path d="M5 13l4 4L19 7" />
            ) : (
              <path d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
        </div>
        <h3>{actionType === "accept" ? "Accept Booking Request" : "Reject Booking Request"}</h3>
        <p className="modal-subtitle">
          {actionType === "accept" 
            ? "Add a message to the buyer (optional)"
            : "Let the buyer know why you're rejecting this request (optional)"}
        </p>
        <textarea
          className="response-textarea"
          placeholder={`Type your ${actionType === "accept" ? "acceptance" : "rejection"} message here...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className={`modal-submit modal-submit--${actionType}`} onClick={handleSubmit}>
            {actionType === "accept" ? "Accept Request" : "Reject Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Price display helper ───────────────────────────────────────── */
function PriceDisplay({ priceType, price }) {
  if (priceType === "free") return <span className="bookings__price--free">Free</span>;
  if (priceType === "negotiable" || price === null || price === undefined)
    return <span className="bookings__price--negotiate">Negotiable</span>;
  if (priceType === "fixed")
    return <span>₹{Number(price).toLocaleString("en-IN")}</span>;
  return <span className="bookings__price--negotiate">Negotiable</span>;
}

/* ─── Status Badge Component ─────────────────────────────────────── */
function StatusBadge({ status }) {
  const config = {
    pending: { label: "Pending", class: "pending" },
    accepted: { label: "Accepted", class: "accepted" },
    rejected: { label: "Rejected", class: "rejected" },
    completed: { label: "Completed", class: "completed" },
    cancelled: { label: "Cancelled", class: "cancelled" }
  };
  
  const { label, class: className } = config[status] || config.pending;
  
  return (
    <span className={`status-badge status-badge--${className}`}>
      {label}
    </span>
  );
}

/* ─── Filter Pills Component ─────────────────────────────────────── */
function FilterPills({ filters, activeFilter, onFilterChange, counts }) {
  return (
    <div className="filter-pills">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`filter-pill ${activeFilter === filter.value ? "filter-pill--active" : ""}`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
          {counts[filter.value] !== undefined && (
            <span className="filter-pill-count">{counts[filter.value]}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function Bookings() {
  const { 
    bookings, 
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

  // Filter states
  const [myBookingsFilter, setMyBookingsFilter] = useState("all");
  const [requestsFilter, setRequestsFilter] = useState("all");
  
  // Modal states
  const [ratingModal, setRatingModal] = useState({ isOpen: false, bookingId: null, bookingTitle: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, bookingId: null });
  const [responseModal, setResponseModal] = useState({ isOpen: false, type: null, bookingId: null });

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ─── Get current user ID ──────────────────────────────────────── */
  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])).id;
    } catch(e) {
      return null;
    }
  };

  /* ─── Derived data ─────────────────────────────────────────────── */
  const currentUserId = getCurrentUserId();

  // My Bookings: items I (as buyer) have booked — ALL statuses shown
  const myBookings = bookings.filter(b => b.user?._id === currentUserId && b.listing);

  // All Requests: bookings on my listings where I am the seller
  const allRequests = bookings.filter(b => b.seller?._id === currentUserId && b.listing);

  /* ─── Filter counts ────────────────────────────────────────────── */
  const myBookingCounts = {
    all: myBookings.length,
    pending: myBookings.filter(b => b.status === "pending").length,
    accepted: myBookings.filter(b => b.status === "accepted").length,
    completed: myBookings.filter(b => b.status === "completed").length,
    cancelled: myBookings.filter(b => b.status === "cancelled").length,
    rejected: myBookings.filter(b => b.status === "rejected").length,
  };

  const requestCounts = {
    all: allRequests.length,
    pending: allRequests.filter(b => b.status === "pending").length,
    accepted: allRequests.filter(b => b.status === "accepted").length,
    completed: allRequests.filter(b => b.status === "completed").length,
    rejected: allRequests.filter(b => b.status === "rejected").length,
  };

  /* ─── Filtered lists ───────────────────────────────────────────── */
  const filteredMyBookings = myBookingsFilter === "all"
    ? myBookings
    : myBookings.filter(b => b.status === myBookingsFilter);

  const filteredRequests = requestsFilter === "all"
    ? allRequests
    : allRequests.filter(b => b.status === requestsFilter);

  /* ─── Handlers ─────────────────────────────────────────────────── */
  const handleAcceptClick = (bookingId) => {
    setResponseModal({ isOpen: true, type: "accept", bookingId });
  };

  const handleAcceptBooking = async (bookingId, responseMessage) => {
    setActionInProgress(bookingId);
    const result = await acceptBooking(bookingId, responseMessage);
    setActionInProgress(null);
    if (result.success) {
      showToast("Booking accepted successfully!", "success");
    } else {
      showToast(result.error || "Failed to accept booking", "error");
    }
  };

  const handleRejectClick = (bookingId) => {
    setResponseModal({ isOpen: true, type: "reject", bookingId });
  };

  const handleRejectBooking = async (bookingId, rejectionReason) => {
    setActionInProgress(bookingId);
    const result = await rejectBooking(bookingId, rejectionReason);
    setActionInProgress(null);
    if (result.success) {
      showToast("Booking rejected", "info");
    } else {
      showToast(result.error || "Failed to reject booking", "error");
    }
  };

  const handleCancelClick = (bookingId) => {
    setConfirmModal({ isOpen: true, type: "cancel", bookingId });
  };

  const handleCancelBooking = async (bookingId) => {
    setActionInProgress(bookingId);
    const result = await cancelBooking(bookingId);
    setActionInProgress(null);
    setConfirmModal({ isOpen: false, type: null, bookingId: null });
    if (result.success) {
      showToast("Booking cancelled successfully", "success");
    } else {
      showToast(result.error || "Failed to cancel booking", "error");
    }
  };

  const handleCompleteClick = (bookingId) => {
    setConfirmModal({ isOpen: true, type: "complete", bookingId });
  };

  const handleCompleteBooking = async (bookingId) => {
    setActionInProgress(bookingId);
    const result = await completeBooking(bookingId);
    setActionInProgress(null);
    setConfirmModal({ isOpen: false, type: null, bookingId: null });
    if (result.success) {
      showToast("Transaction marked as completed!", "success");
    } else {
      showToast(result.error || "Failed to complete booking", "error");
    }
  };

  const handleRateClick = (bookingId, bookingTitle) => {
    setRatingModal({ isOpen: true, bookingId, bookingTitle });
  };

  const handleRateBooking = async (bookingId, rating, review) => {
    const result = await rateBooking(bookingId, rating, review);
    if (result.success) {
      showToast("Thank you for your rating!", "success");
    } else {
      showToast(result.error || "Failed to submit rating", "error");
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

  /* ─── Booking Card (reusable) ──────────────────────────────────── */
  const renderBookingCard = (booking, role = "buyer") => {
    const item = booking.listing;
    if (!item) return null;

    const accentColor = CAT_COLORS[item.category] || "#547792";
    const isBuyer = role === "buyer";
    const isSeller = role === "seller";
    
    // Get the other party's contact info
    const otherParty = isBuyer ? booking.seller : booking.user;

    return (
      <div key={booking._id} className="bookings__card">
        <div className="bookings__card-bar" style={{ background: accentColor }} />

        {(item.image || (item.images && item.images[0])) && (
          <div className="bookings__card-img-wrap">
            <img
              src={item.image || item.images[0]}
              alt={item.title}
              className="bookings__card-img"
            />
          </div>
        )}
        
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
            <StatusBadge status={booking.status} />
          </div>

          <h3 className="bookings__item-title">{item.title}</h3>
          {item.description?.trim() && <p className="bookings__item-desc">{item.description.substring(0, 120)}{item.description.length > 120 ? "…" : ""}</p>}

          <div className="bookings__details">
            <div className="detail-item">
              <span className="detail-label">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 7H7a3 3 0 000 6h10a3 3 0 010 6H7" />
                </svg>
                Price
              </span>
              <span className="detail-value">
                <PriceDisplay priceType={item.priceType} price={item.price} />
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {isBuyer ? "Seller" : "Buyer"}
              </span>
              <span className="detail-value">
                {isBuyer ? booking.seller?.name : booking.user?.name}
              </span>
            </div>
            {/* Contact Information - Shows phone number */}
            {otherParty && (otherParty.phone || otherParty.phoneNumber || otherParty.mobile) && (
              <div className="detail-item contact-detail-item">
                <span className="detail-label">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  Contact
                </span>
                <div className="detail-value contact-value">
                  <span>{otherParty.phone || otherParty.phoneNumber || otherParty.mobile}</span>
                  <div className="contact-actions">
                    <a 
                      href={`tel:${otherParty.phone || otherParty.phoneNumber || otherParty.mobile}`} 
                      className="contact-action-btn"
                      title="Call"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    </a>
                    <button 
                      className="contact-action-btn"
                      onClick={() => {
                        const phone = otherParty.phone || otherParty.phoneNumber || otherParty.mobile;
                        navigator.clipboard.writeText(phone);
                        showToast("Phone number copied!", "success");
                      }}
                      title="Copy"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {booking.createdAt && (
              <div className="detail-item">
                <span className="detail-label">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Booked on
                </span>
                <span className="detail-value">
                  {new Date(booking.createdAt).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            )}
          </div>

          {booking.sellerResponse && (
            <div className="bookings__response">
              <div className="response-label">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Seller's response:
              </div>
              <p>{booking.sellerResponse}</p>
            </div>
          )}

          <div className="bookings__card-footer">
            {/* Seller: mark complete when accepted */}
            {booking.status === "accepted" && isSeller && (
              <button
                className="footer-btn footer-btn--complete"
                onClick={() => handleCompleteClick(booking._id)}
                disabled={actionInProgress === booking._id}
              >
                {actionInProgress === booking._id ? (
                  <span className="btn-spinner"></span>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Mark as Completed
                  </>
                )}
              </button>
            )}
            
            {/* Buyer: cancel ONLY if pending (cannot cancel after accepted) */}
            {booking.status === "pending" && isBuyer && (
              <button
                className="footer-btn footer-btn--cancel"
                onClick={() => handleCancelClick(booking._id)}
                disabled={actionInProgress === booking._id}
              >
                {actionInProgress === booking._id ? (
                  <span className="btn-spinner"></span>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Cancel Booking
                  </>
                )}
              </button>
            )}

            {/* Info note for accepted bookings (cannot cancel) */}
            {booking.status === "accepted" && isBuyer && (
              <div className="bookings__info-note">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <span>This booking has been accepted. Please coordinate with the seller for pickup/delivery. You cannot cancel at this stage.</span>
              </div>
            )}
            
            {/* Buyer: rate after completed */}
            {booking.status === "completed" && isBuyer && !booking.rating?.score && (
              <button
                className="footer-btn footer-btn--rate"
                onClick={() => handleRateClick(booking._id, item.title)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                Rate Transaction
              </button>
            )}
            
            {booking.rating?.score && (
              <div className="rating-display">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`rating-star ${star <= booking.rating.score ? 'filled' : ''}`}>
                      ★
                    </span>
                  ))}
                </div>
                {booking.rating.review && (
                  <p className="rating-review">"{booking.rating.review}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ─── Request Card with Enhanced Contact Info ───────────────────── */
  const renderRequestCard = (booking) => {
    // Try multiple possible phone field names
    const userPhone = booking.user?.phone || 
                      booking.user?.phoneNumber || 
                      booking.user?.mobile || 
                      booking.user?.contactNumber ||
                      booking.user?.contact ||
                      booking.user?.whatsapp;
    
    return (
      <div key={booking._id} className={`bookings__card bookings__card--request ${booking.status !== "pending" ? "bookings__card--request-resolved" : ""}`}>
        {booking.status === "pending" && (
          <div className="card-header-ribbon">
            <span className="request-badge">New Request</span>
          </div>
        )}
        <div className="bookings__card-content">
          <div className="request-header">
            <h3 className="bookings__item-title">{booking.listing?.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
              <StatusBadge status={booking.status} />
              <span className="request-date">
                {new Date(booking.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {booking.message && (
            <div className="bookings__message">
              <div className="message-label">Buyer's message:</div>
              <p>"{booking.message}"</p>
            </div>
          )}

          <div className="bookings__buyer-info">
            <div className="buyer-avatar">
              {booking.user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="buyer-details">
              <strong>{booking.user?.name || "Unknown User"}</strong>
              <span>
                {booking.status === "pending" ? "Requested this item" :
                 booking.status === "accepted" ? "Request accepted" :
                 booking.status === "rejected" ? "Request declined" :
                 booking.status === "completed" ? "Transaction completed" :
                 "Request cancelled"}
              </span>
              
              {/* Contact Information Section - Always visible for accepted/completed */}
              {(booking.status === "accepted" || booking.status === "completed") && (
                <div className="buyer-contact-section">
                  <div className="buyer-contact-label">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    Contact Details:
                  </div>
                  
                  {userPhone ? (
                    <div className="buyer-contact-phone">
                      <span className="phone-number">{userPhone}</span>
                      <div className="contact-actions-small">
                        <a 
                          href={`tel:${userPhone}`} 
                          className="contact-small-btn call-btn"
                          title="Call"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                          </svg>
                          Call
                        </a>
                        <button 
                          className="contact-small-btn copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(userPhone);
                            showToast("Phone number copied!", "success");
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="buyer-contact-missing">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                      <span>No phone number provided</span>
                    </div>
                  )}
                  
                  {booking.user?.email && (
                    <div className="buyer-contact-email">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>{booking.user.email}</span>
                      <button 
                        className="copy-email-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(booking.user.email);
                          showToast("Email copied!", "success");
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Accept / Reject only for pending */}
          {booking.status === "pending" && (
            <div className="bookings__card-actions">
              <button
                className="action-btn action-btn--accept"
                onClick={() => handleAcceptClick(booking._id)}
                disabled={actionInProgress === booking._id}
              >
                {actionInProgress === booking._id ? (
                  <span className="btn-spinner"></span>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Accept
                  </>
                )}
              </button>
              <button
                className="action-btn action-btn--reject"
                onClick={() => handleRejectClick(booking._id)}
                disabled={actionInProgress === booking._id}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Decline
              </button>
            </div>
          )}

          {/* Mark complete for accepted requests */}
          {booking.status === "accepted" && (
            <div className="bookings__card-footer">
              <button
                className="footer-btn footer-btn--complete"
                onClick={() => handleCompleteClick(booking._id)}
                disabled={actionInProgress === booking._id}
              >
                {actionInProgress === booking._id ? (
                  <span className="btn-spinner"></span>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Mark as Completed
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bookings">
      {/* Modals */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, bookingId: null, bookingTitle: null })}
        onSubmit={(rating, review) => handleRateBooking(ratingModal.bookingId, rating, review)}
        bookingTitle={ratingModal.bookingTitle}
      />
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, bookingId: null })}
        onConfirm={() => {
          if (confirmModal.type === "cancel") {
            handleCancelBooking(confirmModal.bookingId);
          } else if (confirmModal.type === "complete") {
            handleCompleteBooking(confirmModal.bookingId);
          }
        }}
        title={confirmModal.type === "cancel" ? "Cancel Booking" : "Complete Transaction"}
        message={confirmModal.type === "cancel" 
          ? "Are you sure you want to cancel this booking? Once cancelled, you'll need to request again. This action cannot be undone."
          : "Mark this transaction as completed? This will finalize the exchange. Once completed, you'll be able to rate the seller."}
        action={confirmModal.type}
      />
      
      <SellerResponseModal
        isOpen={responseModal.isOpen}
        onClose={() => setResponseModal({ isOpen: false, type: null, bookingId: null })}
        onSubmit={(message) => {
          if (responseModal.type === "accept") {
            handleAcceptBooking(responseModal.bookingId, message);
          } else if (responseModal.type === "reject") {
            handleRejectBooking(responseModal.bookingId, message);
          }
        }}
        actionType={responseModal.type}
      />

      {/* Toast notification */}
      {toast && (
        <div className={`bookings__toast bookings__toast--${toast.type}`}>
          <div className="toast-content">
            {toast.type === "success" && (
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            )}
            {toast.type === "error" && (
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            )}
            {toast.type === "info" && (
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            )}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bookings__header">
        <div className="bookings__header-text">
          <h1 className="bookings__title">My Bookings</h1>
          <p className="bookings__subtitle">
            Track and manage all your marketplace transactions
          </p>
        </div>
        <Link to="/browse" className="bookings__browse-btn">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Browse Marketplace
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="bookings__stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 7h-4.18A3 3 0 0016 5.18V4a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 5v4h4" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{myBookings.length}</span>
            <span className="stat-label">My Bookings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{requestCounts.pending}</span>
            <span className="stat-label">Pending Requests</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{myBookings.filter(b => b.status === "completed").length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bookings__tabs">
        <button
          className={`bookings__tab ${activeTab === "my-bookings" ? "bookings__tab--active" : ""}`}
          onClick={() => setActiveTab("my-bookings")}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
          </svg>
          My Bookings
          <span className="tab-count">{myBookings.length}</span>
        </button>
        <button
          className={`bookings__tab ${activeTab === "requests" ? "bookings__tab--active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Requests
          <span className="tab-count">{allRequests.length}</span>
          {requestCounts.pending > 0 && (
            <span className="tab-badge">{requestCounts.pending}</span>
          )}
        </button>
      </div>

      {/* ── MY BOOKINGS TAB ─────────────────────────────────────────── */}
      {activeTab === "my-bookings" && (
        <div className="bookings__section">
          {myBookings.length === 0 ? (
            <div className="bookings__empty">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h3>No bookings yet</h3>
              <p>Items you book from the marketplace will appear here with their status</p>
              <Link to="/browse" className="bookings__empty-btn">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Status filter pills */}
              <FilterPills
                filters={[
                  { value: "all", label: "All" },
                  { value: "pending", label: "Pending" },
                  { value: "accepted", label: "Accepted" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                  { value: "rejected", label: "Rejected" },
                ]}
                activeFilter={myBookingsFilter}
                onFilterChange={setMyBookingsFilter}
                counts={myBookingCounts}
              />

              {filteredMyBookings.length === 0 ? (
                <div className="bookings__empty bookings__empty--sm">
                  <p>No {myBookingsFilter} bookings found.</p>
                </div>
              ) : (
                <div className="bookings__grid">
                  {filteredMyBookings.map((booking) => renderBookingCard(booking, "buyer"))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── REQUESTS TAB ────────────────────────────────────────────── */}
      {activeTab === "requests" && (
        <div className="bookings__section">
          {allRequests.length === 0 ? (
            <div className="bookings__empty">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>No requests yet</h3>
              <p>When buyers book your listed items, their requests will appear here</p>
            </div>
          ) : (
            <>
              {/* Status filter pills */}
              <FilterPills
                filters={[
                  { value: "all", label: "All" },
                  { value: "pending", label: "Pending" },
                  { value: "accepted", label: "Accepted" },
                  { value: "completed", label: "Completed" },
                  { value: "rejected", label: "Rejected" },
                ]}
                activeFilter={requestsFilter}
                onFilterChange={setRequestsFilter}
                counts={requestCounts}
              />

              {filteredRequests.length === 0 ? (
                <div className="bookings__empty bookings__empty--sm">
                  <p>No {requestsFilter} requests found.</p>
                </div>
              ) : (
                <div className="bookings__grid">
                  {filteredRequests.map((booking) => renderRequestCard(booking))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}