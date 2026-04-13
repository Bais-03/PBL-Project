import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useBooking } from "../context/BookingContext";
import "../styles/ListingDetail.css";

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
  if (priceType === "free") return <span className="detail__price--free">Free</span>;
  if (priceType === "negotiable" || price === null || price === undefined)
    return <span className="detail__price--negotiate">Negotiable</span>;
  if (priceType === "fixed" && price > 0)
    return <span>₹{Number(price).toLocaleString("en-IN")}</span>;
  return <span className="detail__price--free">Free</span>;
}

/* ─── Image Gallery Component with Horizontal Scroll ────────────── */
function ImageGallery({ images, title }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const thumbnailsRef = useRef(null);

  // Ensure images is always an array
  const imageList = Array.isArray(images) && images.length > 0 ? images : [];
  const hasImages = imageList.length > 0;

  // Scroll thumbnail into view when selected changes
  useEffect(() => {
    if (thumbnailsRef.current && imageList.length > 1) {
      const activeThumb = thumbnailsRef.current.children[selectedImage];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedImage, imageList.length]);

  if (!hasImages) {
    return (
      <div className="gallery__placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="2.18" />
          <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
        </svg>
        <p>No image available</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      {/* Main Image */}
      <div 
        className="gallery__main" 
        onClick={() => setIsModalOpen(true)}
      >
        <img 
          src={imageList[selectedImage]} 
          alt={`${title} - ${selectedImage + 1}`} 
        />
        <button className="gallery__zoom-btn">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.34-1.42 1.42-5.34-5.35zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
            <path d="M8 4v8M4 8h8" />
          </svg>
        </button>
      </div>

      {/* Thumbnail Strip - Horizontal Scrollable */}
      {imageList.length > 1 && (
        <div className="gallery__thumbs-wrapper">
          <div className="gallery__thumbs" ref={thumbnailsRef}>
            {imageList.map((img, idx) => (
              <button
                key={idx}
                className={`gallery__thumb ${selectedImage === idx ? "gallery__thumb--active" : ""}`}
                onClick={() => setSelectedImage(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} />
                {imageList.length > 4 && (
                  <span className="gallery__thumb-number">{idx + 1}</span>
                )}
              </button>
            ))}
          </div>
          {/* Scroll buttons for desktop */}
          {imageList.length > 4 && (
            <>
              <button 
                className="gallery__scroll-btn gallery__scroll-btn--left"
                onClick={() => {
                  if (thumbnailsRef.current) {
                    thumbnailsRef.current.scrollBy({ left: -120, behavior: 'smooth' });
                  }
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
              <button 
                className="gallery__scroll-btn gallery__scroll-btn--right"
                onClick={() => {
                  if (thumbnailsRef.current) {
                    thumbnailsRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                  }
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Image Counter */}
      {imageList.length > 1 && (
        <div className="gallery__counter">
          <span>{selectedImage + 1}</span> / <span>{imageList.length}</span>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div className="gallery__modal" onClick={() => setIsModalOpen(false)}>
          <div className="gallery__modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery__modal-close" onClick={() => setIsModalOpen(false)}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
            <img src={imageList[selectedImage]} alt={title} />
            
            {imageList.length > 1 && (
              <div className="gallery__modal-nav">
                <button 
                  className="gallery__modal-nav-btn"
                  onClick={() => setSelectedImage(prev => prev === 0 ? imageList.length - 1 : prev - 1)}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </button>
                <span className="gallery__modal-counter">{selectedImage + 1} / {imageList.length}</span>
                <button 
                  className="gallery__modal-nav-btn"
                  onClick={() => setSelectedImage(prev => prev === imageList.length - 1 ? 0 : prev + 1)}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Contact Info Component ─────────────────────────────────────── */
function ContactInfo({ listing }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contacts = [
    { label: "Phone", value: listing.contactPhone, icon: "phone", action: "call" },
    { label: "WhatsApp", value: listing.contactWhatsapp, icon: "whatsapp", action: "whatsapp" },
    { label: "Email", value: listing.contactEmail, icon: "email", action: "email" },
  ].filter(c => c.value);

  if (contacts.length === 0) return null;

  return (
    <div className="detail__contact">
      <h3>Contact Seller</h3>
      <div className="contact__cards">
        {contacts.map((contact, idx) => (
          <div key={idx} className="contact__card">
            <div className={`contact__icon contact__icon--${contact.icon}`}>
              {contact.icon === "phone" && (
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              )}
              {contact.icon === "whatsapp" && (
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              )}
              {contact.icon === "email" && (
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              )}
            </div>
            <div className="contact__info">
              <span className="contact__label">{contact.label}</span>
              <span className="contact__value">{contact.value}</span>
            </div>
            <div className="contact__actions">
              {contact.action === "call" && (
                <a href={`tel:${contact.value}`} className="contact__btn contact__btn--call">
                  Call
                </a>
              )}
              {contact.action === "whatsapp" && (
                <a href={`https://wa.me/91${contact.value}`} target="_blank" rel="noreferrer" className="contact__btn contact__btn--wa">
                  WhatsApp
                </a>
              )}
              {contact.action === "email" && (
                <a href={`mailto:${contact.value}`} className="contact__btn contact__btn--email">
                  Email
                </a>
              )}
              <button className="contact__btn contact__btn--copy" onClick={() => copyToClipboard(contact.value)}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {listing.preferMode && (
        <div className="contact__prefer">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          Prefers contact via <strong>{listing.preferMode}</strong>
          {listing.availability && ` • Available: ${listing.availability}`}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createBookingRequest } = useBooking();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookMessage, setBookMessage] = useState("");
  const [toast, setToast] = useState(null);

  const accentColor = listing ? CAT_COLORS[listing.category] || "#547792" : "#547792";

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/listings/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setListing(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch listing:", err);
        setError(err.response?.data?.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBook = async () => {
    setBookingInProgress(true);
    const result = await createBookingRequest(id, bookMessage);
    setBookingInProgress(false);
    setShowBookModal(false);
    setBookMessage("");
    
    if (result.success) {
      showToast("Booking request sent! The seller will review your request.", "success");
    } else {
      showToast(result.error || "Failed to send booking request", "error");
    }
  };

  if (loading) {
    return (
      <div className="detail__loading">
        <div className="detail__spinner" />
        <p>Loading listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="detail__error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2>Listing Not Found</h2>
        <p>{error || "The listing you're looking for doesn't exist or has been removed."}</p>
        <button className="detail__back-btn" onClick={() => navigate("/browse")}>
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="listing-detail">
      {/* Toast */}
      {toast && (
        <div className={`detail__toast detail__toast--${toast.type}`}>
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
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="detail__header">
        <button className="detail__back" onClick={() => navigate("/browse")}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Back to Marketplace
        </button>
      </div>

      {/* Main Content */}
      <div className="detail__container">
        <div className="detail__grid">
          {/* Left Column - Images */}
          <div className="detail__gallery">
            <ImageGallery images={listing.images || [listing.image]} title={listing.title} />
          </div>

          {/* Right Column - Info */}
          <div className="detail__info">
            <div className="detail__badges">
              <span 
                className="detail__category"
                style={{
                  color: accentColor,
                  borderColor: `${accentColor}28`,
                  background: `${accentColor}0d`,
                }}
              >
                {listing.category || "Other"}
              </span>
              <span className={`detail__status status--${listing.status || "available"}`}>
                {listing.status === "available" ? "Available" : 
                 listing.status === "pending" ? "Pending" : 
                 listing.status === "booked" ? "Booked" : "Sold"}
              </span>
            </div>

            <h1 className="detail__title">{listing.title}</h1>
            
            <div className="detail__price">
              <PriceDisplay priceType={listing.priceType} price={listing.price} />
            </div>

            <div className="detail__seller">
              <div className="seller__avatar">
                {listing.createdBy?.name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="seller__info">
                <strong>{listing.createdBy?.name || "Anonymous Seller"}</strong>
                <span>Member since {new Date(listing.createdAt).getFullYear()}</span>
              </div>
            </div>

            {listing.condition && (
              <div className="detail__condition">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                Condition: <strong>{listing.condition}</strong>
              </div>
            )}

            {listing.semester && (
              <div className="detail__semester">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Semester: <strong>{listing.semester}</strong>
              </div>
            )}

            <div className="detail__description">
              <h3>Description</h3>
              <p>{listing.description || "No description provided."}</p>
            </div>

            {listing.status === "available" && (
              <div className="detail__actions">
                <button 
                  className="detail__book-btn"
                  onClick={() => setShowBookModal(true)}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                  </svg>
                  Book This Item
                </button>
              </div>
            )}

            {listing.status !== "available" && (
              <div className="detail__unavailable">
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <p>This item is no longer available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="detail__contact-section">
          <ContactInfo listing={listing} />
        </div>
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="book-modal" onClick={(e) => e.stopPropagation()}>
            <div className="book-modal__header">
              <h3>Book Item</h3>
              <button className="book-modal__close" onClick={() => setShowBookModal(false)}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
            <div className="book-modal__body">
              <h4>{listing.title}</h4>
              <PriceDisplay priceType={listing.priceType} price={listing.price} />
              
              <div className="book-modal__message">
                <label>Message to seller (optional)</label>
                <textarea
                  placeholder="e.g., I'd like to know more about the condition..."
                  value={bookMessage}
                  onChange={(e) => setBookMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <div className="book-modal__footer">
              <button className="book-modal__cancel" onClick={() => setShowBookModal(false)}>
                Cancel
              </button>
              <button 
                className="book-modal__confirm" 
                onClick={handleBook}
                disabled={bookingInProgress}
              >
                {bookingInProgress ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}