// components/BookedItems.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import "../styles/BookedItems.css";

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
  if (priceType === "free") return <span className="booked__price--free">Free</span>;
  if (priceType === "negotiable" || price === null || price === undefined)
    return <span className="booked__price--negotiate">Negotiable</span>;
  if (priceType === "fixed" && price > 0)
    return <span>₹{Number(price).toLocaleString("en-IN")}</span>;
  return <span className="booked__price--free">Free</span>;
}

export default function BookedItems() {
  const [bookedItems, setBookedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookedItems = async () => {
    try {
      const res = await axios.get("/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBookedItems(res.data);
    } catch (error) {
      console.error("Failed to fetch booked items:", error);
      setToast({
        type: "error",
        message: "Failed to load booked items",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedItems();
  }, []);

  const handleCancelBooking = async (listingId) => {
    setCancellingId(listingId);
    try {
      await axios.post(
        "/bookings/cancel",
        { listingId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Remove from booked items
      setBookedItems((prev) => prev.filter((item) => item._id !== listingId));
      setToast({
        type: "success",
        message: "Booking cancelled successfully",
      });

      // Auto-hide toast after 3 seconds
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to cancel booking",
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="booked__loading">
        <div className="booked__spinner" />
        <p>Loading your booked items...</p>
      </div>
    );
  }

  return (
    <div className="booked">
      {/* Toast notification */}
      {toast && (
        <div className={`booked__toast booked__toast--${toast.type}`}>
          {toast.type === "success" && (
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {toast.type === "error" && (
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="booked__header">
        <div className="booked__header-text">
          <h1 className="booked__title">My Booked Items</h1>
          <p className="booked__subtitle">
            {bookedItems.length} item{bookedItems.length !== 1 ? "s" : ""} booked
          </p>
        </div>
        <Link to="/browse" className="booked__browse-btn">
          <svg viewBox="0 0 20 20" fill="currentColor" width="17" height="17">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Browse
        </Link>
      </div>

      {/* Content */}
      {bookedItems.length === 0 ? (
        <div className="booked__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 12H4M12 4v16" />
          </svg>
          <h3>No booked items</h3>
          <p>Items you book will appear here</p>
          <Link to="/browse" className="booked__empty-btn">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="booked__grid">
          {bookedItems.map((item) => {
            const accentColor = CAT_COLORS[item.category] || "#547792";
            const isCancelling = cancellingId === item._id;

            return (
              <div key={item._id} className="booked__card">
                <div
                  className="booked__card-bar"
                  style={{ background: accentColor }}
                />

                <div className="booked__card-content">
                  <div className="booked__card-header">
                    <span
                      className="booked__category"
                      style={{
                        color: accentColor,
                        borderColor: `${accentColor}28`,
                        background: `${accentColor}0d`,
                      }}
                    >
                      {item.category || "Other"}
                    </span>
                    <span className="booked__badge">Booked</span>
                  </div>

                  <h3 className="booked__item-title">{item.title}</h3>
                  <p className="booked__item-desc">{item.description}</p>

                  <div className="booked__details">
                    <div className="booked__detail-row">
                      <span className="booked__detail-label">Price:</span>
                      <span className="booked__detail-value">
                        <PriceDisplay priceType={item.priceType} price={item.price} />
                      </span>
                    </div>

                    {item.semester && (
                      <div className="booked__detail-row">
                        <span className="booked__detail-label">Semester:</span>
                        <span className="booked__detail-value">{item.semester}</span>
                      </div>
                    )}

                    {item.condition && (
                      <div className="booked__detail-row">
                        <span className="booked__detail-label">Condition:</span>
                        <span className="booked__detail-value">{item.condition}</span>
                      </div>
                    )}
                  </div>

                  <div className="booked__seller-section">
                    <h4 className="booked__seller-title">Seller Information</h4>
                    <div className="booked__seller-info">
                      <p className="booked__seller-name">
                        <strong>{item.contactName || "Anonymous"}</strong>
                      </p>
                      {item.availability && (
                        <p className="booked__seller-avail">
                          Available: {item.availability}
                        </p>
                      )}
                      {item.preferMode && (
                        <p className="booked__seller-prefer">
                          Prefers: {item.preferMode}
                        </p>
                      )}
                    </div>

                    {(item.contactPhone || item.contactWhatsapp || item.contactEmail) && (
                      <div className="booked__contact-options">
                        {item.contactPhone && (
                          <a
                            href={`tel:+91${item.contactPhone}`}
                            className="booked__contact-btn booked__contact-btn--phone"
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            Call
                          </a>
                        )}
                        {item.contactWhatsapp && (
                          <a
                            href={`https://wa.me/91${item.contactWhatsapp}`}
                            target="_blank"
                            rel="noreferrer"
                            className="booked__contact-btn booked__contact-btn--wa"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                          </a>
                        )}
                        {item.contactEmail && (
                          <a
                            href={`mailto:${item.contactEmail}`}
                            className="booked__contact-btn booked__contact-btn--email"
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            Email
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="booked__card-footer">
                    <button
                      className="booked__cancel-btn"
                      onClick={() => handleCancelBooking(item._id)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <span className="booked__spinner-small" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Reservation"
                      )}
                    </button>
                    <p className="booked__note">
                      Item will be available to others after cancellation
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}