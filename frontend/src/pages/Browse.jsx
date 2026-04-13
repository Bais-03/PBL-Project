import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useBooking } from "../context/BookingContext";
import "../styles/Browse.css";

/* ─── Constants ──────────────────────────────────────────────────── */
const CATEGORIES = ["All", "Textbook", "Notes", "Electronics", "Housing", "Tutoring", "Other"];

/* ─── Sample data ────────────────────────────────────────────────── */
const SAMPLE = [
  {
    _id: "1", title: "Engineering Mathematics — Kreyszig 10th Ed.",
    category: "Textbook", semester: "3",
    description: "Excellent condition. All chapters intact. Minimal highlighting in first two chapters only.",
    priceType: "fixed", price: 280, status: "available", image: null,
    contact: { name: "Arjun Mehta", phone: "9812345678", whatsapp: "9812345678", email: "arjun@bits.ac.in", preferMode: "WhatsApp", availability: "Weekdays after 5 PM" },
  },
  {
    _id: "2", title: "Signals & Systems Handwritten Notes",
    category: "Notes", semester: "4",
    description: "Complete notes covering entire syllabus. Clear handwriting with diagrams.",
    priceType: "negotiable", price: null, status: "available", image: null,
    contact: { name: "Priya Nair", phone: "9876543210", whatsapp: "", email: "priya@vit.ac.in", preferMode: "Phone Call", availability: "Anytime on weekends" },
  },
  {
    _id: "3", title: "Dell Latitude 14 — i5, 8GB RAM, 256GB SSD",
    category: "Electronics", semester: null,
    description: "2 years old. Perfect working condition. Battery replaced last month. Charger included.",
    priceType: "fixed", price: 22000, status: "available", image: null,
    contact: { name: "Rohan Das", phone: "9988776655", whatsapp: "9988776655", email: "", preferMode: "WhatsApp", availability: "Monday to Saturday, 10 AM – 8 PM" },
  },
  {
    _id: "4", title: "Casio FX-991EX Scientific Calculator",
    category: "Electronics", semester: null,
    description: "Used for 2 semesters. All functions working. Cover included.",
    priceType: "negotiable", price: null, status: "available", image: null,
    contact: { name: "Sneha Kulkarni", phone: "9001234567", whatsapp: "9001234567", email: "sneha@iitb.ac.in", preferMode: "In-person only", availability: "Campus only — near Library" },
  },
  {
    _id: "5", title: "Room available near MIT Pune — Fully Furnished",
    category: "Housing", semester: null,
    description: "AC room, 2 km from campus. Separate bathroom. Looking for one roommate. Rent negotiable.",
    priceType: "negotiable", price: null, status: "available", image: null,
    contact: { name: "Vikram Rao", phone: "9123456780", whatsapp: "9123456780", email: "vikram@mitpune.edu.in", preferMode: "WhatsApp", availability: "Evenings after 6 PM" },
  },
  {
    _id: "6", title: "Data Structures Tutoring — 1:1 Sessions",
    category: "Tutoring", semester: "2",
    description: "CGPA 9.2 final-year CSE student. Covers arrays, trees, graphs, DP. Online & offline.",
    priceType: "fixed", price: 200, status: "available", image: null,
    contact: { name: "Ananya Singh", phone: "9345678901", whatsapp: "9345678901", email: "ananya@iiit.ac.in", preferMode: "Email", availability: "Flexible — book a slot" },
  },
];

/* ─── Category colors ────────────────────────────────────────────── */
const CAT_COLORS = {
  Textbook:    "#1A3263",
  Notes:       "#547792",
  Electronics: "#1e6b4a",
  Housing:     "#7b3f00",
  Tutoring:    "#5b21b6",
  Other:       "#374151",
};

/* ─── Price display helper ───────────────────────────────────────── */
function PriceDisplay({ priceType, price }) {
  if (priceType === "free") return <span className="lc__price lc__price--free">Free</span>;
  if (priceType === "negotiable" || price === null || price === undefined)
    return <span className="lc__price lc__price--negotiate">Negotiable</span>;
  if (priceType === "fixed")
    return <span className="lc__price">₹{Number(price).toLocaleString("en-IN")}</span>;
  return <span className="lc__price lc__price--negotiate">Negotiable</span>;
}

/* ─── Category icon ──────────────────────────────────────────────── */
function CategoryIcon({ category, color }) {
  const icons = {
    Textbook: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="34" height="34"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    Notes:    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="34" height="34"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    Electronics: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="34" height="34"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>,
    Housing: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="34" height="34"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    Tutoring: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="34" height="34"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  };
  return icons[category] || <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="34" height="34"><circle cx="12" cy="12" r="10"/></svg>;
}

/* ─── Contact modal ──────────────────────────────────────────────── */
function ContactModal({ item, onClose }) {
  // Handle multiple possible data structures
  const contactInfo = {
    name: item.contact?.name || item.contactName || item.seller?.name || "Anonymous",
    phone: item.contact?.phone || item.contactPhone || "",
    whatsapp: item.contact?.whatsapp || item.contactWhatsapp || "",
    email: item.contact?.email || item.contactEmail || "",
    preferMode: item.contact?.preferMode || item.preferMode || "",
    availability: item.contact?.availability || item.availability || ""
  };

  const [copiedField, setCopiedField] = useState(null);

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const hasContactInfo = contactInfo.phone || contactInfo.whatsapp || contactInfo.email;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <p className="modal__label">Contact Seller</p>
            <h3 className="modal__title">{item.title}</h3>
          </div>
          <button className="modal__close" onClick={onClose} type="button">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        <div className="modal__seller">
          <div className="modal__avatar">
            {contactInfo.name ? contactInfo.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <p className="modal__seller-name">{contactInfo.name}</p>
            {contactInfo.availability && (
              <p className="modal__avail">
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style={{ display: "inline", marginRight: "4px" }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                Available: {contactInfo.availability}
              </p>
            )}
          </div>
        </div>

        {contactInfo.preferMode && (
          <div className="modal__preferred">
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            Prefers contact via <strong>{contactInfo.preferMode}</strong>
          </div>
        )}

        <div className="modal__contacts">
          {contactInfo.phone && (
            <div className="modal__contact-row">
              <div className="modal__contact-icon modal__contact-icon--phone">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </div>
              <div className="modal__contact-info">
                <span className="modal__contact-type">Phone</span>
                <span className="modal__contact-val">+91 {contactInfo.phone}</span>
              </div>
              <div className="modal__contact-actions">
                <a href={`tel:+91${contactInfo.phone}`} className="modal__action-btn modal__action-btn--call">
                  Call
                </a>
                <button className="modal__action-btn modal__action-btn--copy" onClick={() => copyText(contactInfo.phone, "phone")}>
                  {copiedField === "phone" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {contactInfo.whatsapp && (
            <div className="modal__contact-row">
              <div className="modal__contact-icon modal__contact-icon--wa">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="modal__contact-info">
                <span className="modal__contact-type">WhatsApp</span>
                <span className="modal__contact-val">+91 {contactInfo.whatsapp}</span>
              </div>
              <div className="modal__contact-actions">
                <a href={`https://wa.me/91${contactInfo.whatsapp}`} target="_blank" rel="noreferrer" className="modal__action-btn modal__action-btn--wa">
                  Open
                </a>
                <button className="modal__action-btn modal__action-btn--copy" onClick={() => copyText(contactInfo.whatsapp, "wa")}>
                  {copiedField === "wa" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {contactInfo.email && (
            <div className="modal__contact-row">
              <div className="modal__contact-icon modal__contact-icon--email">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
              <div className="modal__contact-info">
                <span className="modal__contact-type">Email</span>
                <span className="modal__contact-val">{contactInfo.email}</span>
              </div>
              <div className="modal__contact-actions">
                <a href={`mailto:${contactInfo.email}`} className="modal__action-btn modal__action-btn--call">
                  Mail
                </a>
                <button className="modal__action-btn modal__action-btn--copy" onClick={() => copyText(contactInfo.email, "email")}>
                  {copiedField === "email" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {!hasContactInfo && (
            <div className="modal__no-contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="32" height="32" style={{ marginBottom: "0.5rem" }}>
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <p>No contact details provided.</p>
              <p style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
                Try booking this item to notify the seller.
              </p>
            </div>
          )}
        </div>

        <div className="modal__price-context">
          {(item.priceType === "negotiable" || item.price === null || item.price === 0) && (
            <p>
              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              Price is open — feel free to discuss a fair deal with the seller.
            </p>
          )}
          {item.priceType === "fixed" && item.price > 0 && (
            <p>
              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
              Listed price: <strong>₹{Number(item.price).toLocaleString("en-IN")}</strong>
            </p>
          )}
        </div>

        <button className="modal__dismiss" onClick={onClose} type="button">
          Close
        </button>
      </div>
    </div>
  );
}


/* ─── Book with message modal ────────────────────────────────────── */
function BookMessageModal({ item, onClose, onConfirm, isLoading }) {
  const [message, setMessage] = useState("");

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--book" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <p className="modal__label">Book Item</p>
            <h3 className="modal__title">{item.title}</h3>
          </div>
          <button className="modal__close" onClick={onClose} type="button">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        <div className="modal__book-price">
          <PriceDisplay priceType={item.priceType} price={item.price} />
          {item.category && (
            <span className="modal__book-cat">{item.category}</span>
          )}
        </div>

        <div className="modal__book-msg-wrap">
          <label className="modal__book-label" htmlFor="book-msg">
            Message to seller
            <span className="modal__book-opt">optional</span>
          </label>
          <textarea
            id="book-msg"
            className="modal__book-textarea"
            placeholder="e.g. I can pick it up on Tuesday evening near the library"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={300}
          />
          <span className="modal__book-charcount">{message.length}/300</span>
        </div>

        <div className="modal__book-actions">
          <button className="modal__dismiss" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </button>
          <button
            className="modal__book-confirm"
            onClick={() => onConfirm(message)}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <span className="modal__book-spinner" />
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Send Booking Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Listing card ───────────────────────────────────────────────── */
function ListingCard({ item, onBook, onContact, isBooked, bookingInProgress }) {
  const navigate = useNavigate();
  const status = item.status || "available";
  const accentColor = CAT_COLORS[item.category] || "#547792";

  const statusMap = {
    available: { label: "Available", cls: "status--available" },
    booked:    { label: "Booked",    cls: "status--pending" },
    sold:      { label: "Sold",      cls: "status--sold" },
  };

  const handleCardClick = () => {
    navigate(`/listing/${item._id}`);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    onBook(item._id);
  };

  const handleContactClick = (e) => {
    e.stopPropagation();
    onContact(item);
  };

  // Only show available items (booked items are filtered out)
  if (status !== "available") {
    return null;
  }

  return (
    <div className={`lc ${isBooked ? "lc--booked" : ""} ${status === "sold" ? "lc--sold" : ""}`} onClick={handleCardClick}>
      <div className="lc__bar" style={{ background: accentColor }} />

      <div className="lc__img-wrap">
        {item.image ? (
          <img src={item.image} alt={item.title} className="lc__img" />
        ) : (
          <div className="lc__img-placeholder" style={{ background: `${accentColor}14` }}>
            <CategoryIcon category={item.category} color={accentColor} />
          </div>
        )}
      </div>

      <div className="lc__body">
        <div className="lc__meta">
          <span className="lc__category" style={{ color: accentColor, borderColor: `${accentColor}28`, background: `${accentColor}0d` }}>
            {item.category || "Other"}
          </span>
          {item.semester && <span className="lc__semester">Sem {item.semester}</span>}
          {item.condition && <span className="lc__semester">{item.condition}</span>}
        </div>

        <h3 className="lc__title">{item.title}</h3>
        <p className="lc__desc">{item.description}</p>

        <div className="lc__footer">
          <div className="lc__price-wrap">
            <PriceDisplay priceType={item.priceType} price={item.price} />
            <span className={`lc__status ${statusMap[status]?.cls}`}>
              {statusMap[status]?.label}
            </span>
          </div>
        </div>

        <div className="lc__actions">
          <button 
            className="lc__btn lc__btn--book" 
            onClick={handleBookClick}
            disabled={bookingInProgress}
          >
            {bookingInProgress ? "Booking..." : "Book Now"}
          </button>
          <button className="lc__btn lc__btn--contact" onClick={handleContactClick}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Browse page ────────────────────────────────────────────────── */
export default function Browse() {
  const navigate = useNavigate();
  const { bookedItems, fetchBookedItems, createBookingRequest } = useBooking();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [contactItem, setContactItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(null);
  const [bookModalItem, setBookModalItem] = useState(null);
  const toastRef = useRef(null);
  const sidebarRef = useRef(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/listings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Filter out items that are booked by anyone (status === "booked")
      // Only show available items
      const availableListings = res.data.filter(item => item.status === "available");
      setListings(availableListings);
    } catch {
      // For sample data, only show available items
      const availableSamples = SAMPLE.filter(item => item.status === "available");
      setListings(availableSamples);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchBookedItems();
  }, [fetchBookedItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  const handleBook = (id) => {
    // Find the item and open the booking modal
    const item = listings.find(l => l._id === id) || null;
    setBookModalItem(item || { _id: id });
  };

  const handleConfirmBook = async (message) => {
    if (!bookModalItem) return;
    const id = bookModalItem._id;
    setBookingInProgress(id);
    const result = await createBookingRequest(id, message || "");
    setBookingInProgress(null);
    setBookModalItem(null);
    if (result.success) {
      showToast("Booking request sent! The seller will review your request.", "success");
      await fetchListings();
    } else {
      showToast(result.error || "Failed to send booking request", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    showToast("Logged out successfully", "info");
    setSidebarOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setSidebarOpen(false);
  };

  const handleBookings = () => {
    navigate("/bookings");
    setSidebarOpen(false);
  };

  // Track which items are booked by current user (these will not appear in browse)
  const bookedItemIds = new Set(bookedItems.map(item => item._id));

  const filtered = listings
    .filter((l) => {
      // Only show items that are available and not booked by current user
      const matchCat = category === "All" || l.category === category;
      const q = search.toLowerCase();
      const matchQ = !q || l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q);
      // Also filter out items that are booked by current user (should already be filtered but double-check)
      const notBookedByMe = !bookedItemIds.has(l._id);
      return matchCat && matchQ && notBookedByMe;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      return 0;
    });

  return (
    <div className="browse">
      {contactItem && <ContactModal item={contactItem} onClose={() => setContactItem(null)} />}
      {bookModalItem && (
        <BookMessageModal
          item={bookModalItem}
          onClose={() => setBookModalItem(null)}
          onConfirm={handleConfirmBook}
          isLoading={bookingInProgress === bookModalItem._id}
        />
      )}

      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.type === "success" && (
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      <div className="browse__header">
        <div className="browse__header-left">
          <button 
            className="browse__hamburger" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="browse__header-text">
            <h1 className="browse__title">Campus Marketplace</h1>
            <p className="browse__subtitle">{filtered.length} listing{filtered.length !== 1 ? "s" : ""} available</p>
          </div>
        </div>
        <div className="browse__header-actions">
          <Link to="/create" className="browse__create-btn">
            <svg viewBox="0 0 20 20" fill="currentColor" width="17" height="17">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Add Listing
          </Link>
        </div>
      </div>

      <div className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`} ref={sidebarRef}>
        <div className="sidebar__header">
          <h3 className="sidebar__title">Menu</h3>
          <button className="sidebar__close" onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        <div className="sidebar__content">
          <button onClick={handleProfile} className="sidebar__item">
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Profile</span>
          </button>
          <button onClick={handleBookings} className="sidebar__item">
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
            <span>My Bookings ({bookedItems.length})</span>
          </button>
          <button onClick={handleLogout} className="sidebar__item sidebar__item--logout">
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {sidebarOpen && <div className="sidebar__overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="browse__controls">
        <div className="browse__search-wrap">
          <svg className="browse__search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
            <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
          </svg>
          <input
            className="browse__search"
            type="text"
            placeholder="Search textbooks, notes, electronics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="browse__search-clear" onClick={() => setSearch("")}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          )}
        </div>
        <select className="browse__sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>

      <div className="browse__chips">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`browse__chip ${category === c ? "browse__chip--active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="browse__loading">
          <div className="browse__spinner" />
          <p>Loading listings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="browse__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="44" height="44">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h3>No listings found</h3>
          <p>Try adjusting your search or category filter.</p>
          <button className="browse__chip browse__chip--active" onClick={() => { setSearch(""); setCategory("All"); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="browse__grid">
          {filtered.map((item) => (
            <div key={item._id}>
              <ListingCard
                item={item}
                onBook={handleBook}
                onContact={setContactItem}
                isBooked={bookedItemIds.has(item._id)}
                bookingInProgress={bookingInProgress === item._id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}