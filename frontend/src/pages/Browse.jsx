import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/Browse.css";

/* ─── Constants ──────────────────────────────────────────────────── */
const BOOKING_DURATION_MS = 5 * 60 * 1000; // Changed from 15 to 5 minutes
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
    priceType: "negotiable", price: null, status: "pending", image: null,
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
  if (priceType === "fixed" && price > 0)
    return <span className="lc__price">₹{Number(price).toLocaleString("en-IN")}</span>;
  return <span className="lc__price lc__price--free">Free</span>;
}

/* ─── Booking timer ──────────────────────────────────────────────── */
function BookingTimer({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState(expiresAt - Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      const r = expiresAt - Date.now();
      if (r <= 0) { clearInterval(id); onExpire(); } else setRemaining(r);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);
  const m   = Math.floor(remaining / 60000);
  const s   = Math.floor((remaining % 60000) / 1000);
  const pct = ((remaining / BOOKING_DURATION_MS) * 100).toFixed(1);
  return (
    <div className="booking-timer">
      <svg viewBox="0 0 36 36" className="timer-ring">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(26,50,99,0.1)" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FAB95B" strokeWidth="3"
          strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset="25" strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s linear" }}
        />
      </svg>
      <span className="timer-text">{m}:{String(s).padStart(2, "0")}</span>
    </div>
  );
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
  // Handle both data structures
  const contactInfo = item.contact || {
    name: item.contactName,
    phone: item.contactPhone,
    whatsapp: item.contactWhatsapp,
    email: item.contactEmail,
    preferMode: item.preferMode,
    availability: item.availability
  };

  const [copiedField, setCopiedField] = useState(null);

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
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

        {/* Seller name */}
        <div className="modal__seller">
          <div className="modal__avatar">{contactInfo.name ? contactInfo.name.charAt(0).toUpperCase() : "?"}</div>
          <div>
            <p className="modal__seller-name">{contactInfo.name || "Anonymous"}</p>
            {contactInfo.availability && <p className="modal__avail">Available: {contactInfo.availability}</p>}
          </div>
        </div>

        {/* Preferred mode */}
        {contactInfo.preferMode && (
          <div className="modal__preferred">
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            Prefers contact via <strong>{contactInfo.preferMode}</strong>
          </div>
        )}

        {/* Contact options */}
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
                <a href={`tel:+91${contactInfo.phone}`} className="modal__action-btn modal__action-btn--call">Call</a>
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
                <a href={`mailto:${contactInfo.email}`} className="modal__action-btn modal__action-btn--call">Mail</a>
                <button className="modal__action-btn modal__action-btn--copy" onClick={() => copyText(contactInfo.email, "email")}>
                  {copiedField === "email" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {!contactInfo.phone && !contactInfo.whatsapp && !contactInfo.email && (
            <p className="modal__no-contact">No contact details provided. Try booking this item to notify the seller.</p>
          )}
        </div>

        {/* Price context */}
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

        <button className="modal__dismiss" onClick={onClose} type="button">Close</button>
      </div>
    </div>
  );
}

/* ─── Listing card ───────────────────────────────────────────────── */
function ListingCard({ item, onBook, onCancelBook, onContact, bookingState }) {
  const isBooked = bookingState?.id === item._id;
  // Removed isBookedOther variable and its blocking logic
  const status = item.status || "available";
  const accentColor = CAT_COLORS[item.category] || "#547792";

  const statusMap = {
    available: { label: "Available", cls: "status--available" },
    pending:   { label: "Pending",   cls: "status--pending"   },
    sold:      { label: "Sold",      cls: "status--sold"      },
  };

  return (
    <div className={`lc ${isBooked ? "lc--booked" : ""} ${status === "sold" ? "lc--sold" : ""}`}>
      <div className="lc__bar" style={{ background: accentColor }} />

      {/* Image */}
      <div className="lc__img-wrap">
        {item.image ? (
          <img src={item.image} alt={item.title} className="lc__img" />
        ) : (
          <div className="lc__img-placeholder" style={{ background: `${accentColor}14` }}>
            <CategoryIcon category={item.category} color={accentColor} />
          </div>
        )}
        {isBooked && (
          <div className="lc__booked-badge">
            <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Reserved by you
          </div>
        )}
      </div>

      {/* Body */}
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
              {isBooked ? "Reserved by you" : statusMap[status]?.label}
            </span>
          </div>
          {isBooked && (
            <BookingTimer expiresAt={bookingState.expiresAt} onExpire={() => onCancelBook(item._id)} />
          )}
        </div>

        {/* Actions - Removed !isBookedOther condition to allow browsing all items */}
        {status !== "sold" && (
          <div className="lc__actions">
            {isBooked ? (
              <button className="lc__btn lc__btn--cancel" onClick={() => onCancelBook(item._id)}>
                Cancel Reservation
              </button>
            ) : (
              <button className="lc__btn lc__btn--book" onClick={() => onBook(item._id)} disabled={status === "pending"}>
                {status === "pending" ? "Pending" : "Book Now"}
              </button>
            )}
            <button className="lc__btn lc__btn--contact" onClick={() => onContact(item)}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              Contact Seller
            </button>
          </div>
        )}
        {/* Removed the isBookedOther notice block */}
      </div>
    </div>
  );
}

/* ─── Browse page ────────────────────────────────────────────────── */
export default function Browse() {
  const navigate = useNavigate();
  const [listings,     setListings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("All");
  const [sortBy,       setSortBy]       = useState("newest");
  const [bookingState, setBookingState] = useState(null);
  const [contactItem,  setContactItem]  = useState(null);
  const [toast,        setToast]        = useState(null);
  const toastRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/listings", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setListings(res.data);
      } catch { setListings(SAMPLE); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  const handleBook = (id) => {
    setBookingState({ id, expiresAt: Date.now() + BOOKING_DURATION_MS });
    showToast("Item reserved! You have 5 minutes to complete the transaction.", "success");
  };

  const handleCancelBook = () => {
    setBookingState(null);
    showToast("Reservation cancelled.", "info");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    showToast("Logged out successfully", "info");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const filtered = listings
    .filter((l) => {
      const matchCat = category === "All" || l.category === category;
      const q = search.toLowerCase();
      const matchQ = !q || l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q);
      return matchCat && matchQ;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      return 0;
    });

  return (
    <div className="browse">
      {/* Contact modal */}
      {contactItem && <ContactModal item={contactItem} onClose={() => setContactItem(null)} />}

      {/* Toast */}
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

      {/* Header with user actions */}
      <div className="browse__header">
        <div className="browse__header-text">
          <h1 className="browse__title">Campus Marketplace</h1>
          <p className="browse__subtitle">{filtered.length} listing{filtered.length !== 1 ? "s" : ""} available</p>
        </div>
        <div className="browse__header-actions">
          <button onClick={handleProfile} className="browse__icon-btn" title="Profile">
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
          <button onClick={handleLogout} className="browse__icon-btn" title="Logout">
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-4 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
          <Link to="/create" className="browse__create-btn">
            <svg viewBox="0 0 20 20" fill="currentColor" width="17" height="17">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Add Listing
          </Link>
        </div>
      </div>

      {/* Search + sort */}
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

      {/* Category chips */}
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

      {/* Grid */}
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
          {filtered.map((item, i) => (
            <div key={item._id} style={{ "--i": i }}>
              <ListingCard
                item={item}
                onBook={handleBook}
                onCancelBook={handleCancelBook}
                onContact={setContactItem}
                bookingState={bookingState}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}