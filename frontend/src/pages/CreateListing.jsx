import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/createListing.css";

const CATEGORIES   = ["Textbook", "Notes", "Electronics", "Housing", "Tutoring", "Other"];
const CONDITIONS   = ["Brand New", "Like New", "Good", "Fair", "Poor"];
const PREFER_MODES = ["WhatsApp", "Phone Call", "Email", "In-person only"];
const MAX_IMAGES   = 4;

/* ─── Category icons (SVG) ───────────────────────────────────────── */
const CAT_ICONS = {
  Textbook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  Notes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Electronics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Housing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Tutoring: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Other: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    </svg>
  ),
};

/* ─── Condition colours ──────────────────────────────────────────── */
const COND_COLORS = {
  "Brand New": "#15803d",
  "Like New":  "#0284c7",
  "Good":      "#6366f1",
  "Fair":      "#d97706",
  "Poor":      "#dc2626",
};

/* ─── Main ───────────────────────────────────────────────────────── */
export default function CreateListing() {
  const navigate = useNavigate();

  /* ── Profile data (auto-fetched) ───────────────────────────────── */
  const [profile, setProfile] = useState({ name: "", phone: "", email: "" });
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        // Decode email from JWT
        const tokenData = JSON.parse(atob(token.split(".")[1]));

        try {
          const res = await axios.get("/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfile({
            name:  res.data.name  || tokenData.name  || "",
            phone: res.data.phone || "",
            email: res.data.email || tokenData.email || "",
          });
        } catch {
          // Fallback: use localStorage / token
          const saved = localStorage.getItem("user");
          const u = saved ? JSON.parse(saved) : {};
          setProfile({
            name:  u.name  || tokenData.name  || "",
            phone: u.phone || "",
            email: u.email || tokenData.email || "",
          });
        }
      } catch {
        // silently fail
      } finally {
        setProfileLoaded(true);
      }
    };
    load();
  }, [navigate]);

  /* ── Listing form state ────────────────────────────────────────── */
  const [form, setForm] = useState({
    title: "", category: "", semester: "", condition: "",
    priceType: "negotiable", price: "", description: "",
  });
  const [fTouched, setFTouched] = useState({});
  const [fErrors,  setFErrors]  = useState({});

  /* ── Optional contact override ─────────────────────────────────── */
  const [showContact,  setShowContact]  = useState(false);
  const [extraContact, setExtraContact] = useState({
    phone: "", whatsapp: "", preferMode: "", availability: "",
  });

  /* ── Images (up to MAX_IMAGES) ─────────────────────────────────── */
  const [images,      setImages]      = useState([]);   // array of base64 strings
  const [isDragging,  setIsDragging]  = useState(false);
  const [, setDragTarget] = useState(null);

  /* ── Camera ────────────────────────────────────────────────────── */
  const [showCamera,   setShowCamera]   = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError,  setCameraError]  = useState("");

  /* ── Submit / UI state ─────────────────────────────────────────── */
  const [isLoading, setIsLoading] = useState(false);
  const [genError,  setGenError]  = useState("");
  const [success,   setSuccess]   = useState(false);

  const fileRef   = useRef(null);
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  /* ── Validation ────────────────────────────────────────────────── */
  const validateListing = (f = form) => {
    const e = {};
    if (!f.title.trim())       e.title       = "Title is required";
    if (!f.category)           e.category    = "Select a category";
    // description is optional
    if (f.priceType === "fixed" && !f.price)
      e.price = "Enter your asking price";
    if (f.priceType === "fixed" && f.price && isNaN(Number(f.price)))
      e.price = "Enter a valid number";
    return e;
  };

  const setF = (k, v) => {
    const u = { ...form, [k]: v };
    setForm(u);
    if (fTouched[k]) setFErrors(validateListing(u));
  };
  const blurF = (k) => {
    setFTouched((t) => ({ ...t, [k]: true }));
    setFErrors(validateListing());
  };

  /* ── Image helpers ─────────────────────────────────────────────── */
  const addImages = (files) => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);

    toAdd.forEach((file) => {
      const r = new FileReader();
      r.onload = (ev) =>
        setImages((prev) =>
          prev.length < MAX_IMAGES ? [...prev, ev.target.result] : prev
        );
      r.readAsDataURL(file);
    });
  };

  const removeImage = (idx) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const moveImage = (from, to) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const a = [...prev];
      [a[from], a[to]] = [a[to], a[from]];
      return a;
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragTarget(null);
    addImages(e.dataTransfer.files);
  };

  /* ── Camera ────────────────────────────────────────────────────── */
  const openCamera = async () => {
    setCameraError(""); setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch {
      setCameraError("Camera access denied. Please check browser permissions.");
    }
  };

  const closeCamera = useCallback(() => {
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null); setShowCamera(false); setCameraError("");
  }, [cameraStream]);

  const capturePhoto = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    setImages((prev) => prev.length < MAX_IMAGES ? [...prev, dataUrl] : prev);
    closeCamera();
  };

  /* ── Submit ────────────────────────────────────────────────────── */
  /* ── Submit ────────────────────────────────────────────────────── */
const handleSubmit = async (e) => {
  e.preventDefault();
  const le = validateListing();
  if (Object.keys(le).length) {
    setFErrors(le);
    setFTouched({ title: true, category: true, price: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  setIsLoading(true);
  setGenError("");

  try {
    const listingData = {
      title:       form.title,
      description: form.description.trim() || " ",
      category:    form.category,
      condition:   form.condition  || "",
      semester:    form.semester   || "",
      price:       form.priceType === "fixed" ? parseFloat(form.price) || 0 : null,
      priceType:   form.priceType,

      // Contact — always use profile; override only if user explicitly added extra info
      contactName:     profile.name,
      contactPhone:    showContact && extraContact.phone
                         ? extraContact.phone
                         : profile.phone || "",
      contactEmail:    profile.email || "",
      contactWhatsapp: showContact ? extraContact.whatsapp || "" : "",
      preferMode:      showContact ? extraContact.preferMode   || "" : "",
      availability:    showContact ? extraContact.availability || "" : "",

      // Images — send ALL images in the images array
      images: images,  // Send all images
      image:  images[0] || "",  // First image as cover
    };

    console.log("Submitting images:", images.length); // Debug log

    await axios.post(
  "/listings",  // Just /listings - baseURL already has /api
  listingData,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

    setSuccess(true);
    setTimeout(() => navigate("/browse"), 1800);
  } catch (error) {
    console.error("Submission error:", error.response?.data);
    setGenError(
      error.response?.data?.message || "Failed to create listing. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};

  /* ── Success screen ────────────────────────────────────────────── */
  if (success)
    return (
      <div className="cl">
        <div className="cl__card cl__success-screen">
          <div className="cl__success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="40" height="40">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2>Listing Created!</h2>
          <p>Your item is live on the marketplace. Redirecting…</p>
        </div>
      </div>
    );

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className="cl">
      {/* Camera overlay */}
      {showCamera && (
        <div className="cl__camera-overlay">
          <div className="cl__camera-modal">
            <div className="cl__camera-header">
              <h3>Take a Photo</h3>
              <button type="button" className="cl__camera-close" onClick={closeCamera}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
            {cameraError ? (
              <div className="cl__camera-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="36" height="36">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{cameraError}</p>
                <button type="button" className="cl__btn cl__btn--secondary" onClick={closeCamera}>Close</button>
              </div>
            ) : (
              <>
                <div className="cl__camera-viewfinder">
                  <video ref={videoRef} playsInline muted autoPlay className="cl__camera-video" />
                  <div className="cl__camera-frame" />
                </div>
                <div className="cl__camera-actions">
                  <button type="button" className="cl__btn cl__btn--secondary" onClick={closeCamera}>Cancel</button>
                  <button type="button" className="cl__camera-shutter" onClick={capturePhoto} aria-label="Capture"><span /></button>
                  <div style={{ width: 88 }} />
                </div>
              </>
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        </div>
      )}

      <div className="cl__card">
        {/* Header */}
        <div className="cl__header">
          <h1 className="cl__title">Create a Listing</h1>
          <p className="cl__subtitle">List your item and let campus buyers find it</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Error banner ──────────────────────────────────────── */}
          {genError && (
            <div className="cl__error-banner">
              <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {genError}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              SECTION 1 — PHOTOS
          ════════════════════════════════════════════════════════ */}
          <div className="cl__section">
            <div className="cl__section-head">
              <span className="cl__section-num">1</span>
              <div>
                <h2 className="cl__section-title">Item Photos</h2>
                <p className="cl__section-sub">Add up to {MAX_IMAGES} photos · First photo is the cover</p>
              </div>
            </div>

            {/* Image grid */}
            <div className="cl__img-grid">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className={`cl__img-thumb ${idx === 0 ? "cl__img-thumb--cover" : ""}`}
                >
                  <img src={src} alt={`Item ${idx + 1}`} />
                  {idx === 0 && <span className="cl__img-cover-badge">Cover</span>}
                  <div className="cl__img-actions">
                    {idx > 0 && (
                      <button type="button" className="cl__img-action" title="Move left" onClick={() => moveImage(idx, idx - 1)}>
                        <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    )}
                    <button type="button" className="cl__img-action cl__img-action--remove" title="Remove" onClick={() => removeImage(idx)}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </button>
                    {idx < images.length - 1 && (
                      <button type="button" className="cl__img-action" title="Move right" onClick={() => moveImage(idx, idx + 1)}>
                        <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add slot */}
              {images.length < MAX_IMAGES && (
                <div
                  className={`cl__upload-zone ${isDragging ? "cl__upload-zone--drag" : ""} ${images.length === 0 ? "cl__upload-zone--primary" : "cl__upload-zone--mini"}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                >
                  {images.length === 0 ? (
                    <>
                      <div className="cl__upload-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                          <rect x="3" y="3" width="18" height="18" rx="3"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <p className="cl__upload-title">Drag & drop photos here</p>
                      <p className="cl__upload-hint">JPG, PNG, WEBP · up to {MAX_IMAGES} photos</p>
                      <div className="cl__upload-btns">
                        <button type="button" className="cl__upload-btn" onClick={() => fileRef.current.click()}>
                          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                          </svg>
                          Upload photos
                        </button>
                        <button type="button" className="cl__upload-btn cl__upload-btn--cam" onClick={openCamera}>
                          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                          </svg>
                          Take photo
                        </button>
                      </div>
                    </>
                  ) : (
                    <button type="button" className="cl__upload-add" onClick={() => fileRef.current.click()}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/>
                      </svg>
                      <span>Add photo</span>
                      <span className="cl__upload-counter">{images.length}/{MAX_IMAGES}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addImages(e.target.files)}
              style={{ display: "none" }}
            />
            {images.length > 0 && images.length < MAX_IMAGES && (
              <p className="cl__img-hint">
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                You can add {MAX_IMAGES - images.length} more photo{MAX_IMAGES - images.length !== 1 ? "s" : ""}. Drag to reorder — first is the cover.
              </p>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════
              SECTION 2 — LISTING DETAILS
          ════════════════════════════════════════════════════════ */}
          <div className="cl__section">
            <div className="cl__section-head">
              <span className="cl__section-num">2</span>
              <div>
                <h2 className="cl__section-title">Listing Details</h2>
                <p className="cl__section-sub">Tell buyers what you're selling</p>
              </div>
            </div>

            {/* Title */}
            <div className="cl__group">
              <label className="cl__label" htmlFor="f-title">
                Title <span className="cl__label-req">*</span>
              </label>
              <input
                id="f-title" type="text"
                placeholder="e.g. Engineering Maths — Kreyszig 10th Ed."
                className={`cl__input ${fTouched.title && fErrors.title ? "cl__input--error" : fTouched.title && !fErrors.title ? "cl__input--ok" : ""}`}
                value={form.title}
                onChange={(e) => setF("title", e.target.value)}
                onBlur={() => blurF("title")}
              />
              {fTouched.title && fErrors.title && <span className="cl__field-err">{fErrors.title}</span>}
            </div>

            {/* Category — visual card grid */}
            <div className="cl__group">
              <label className="cl__label">
                Category <span className="cl__label-req">*</span>
              </label>
              <div className="cl__cat-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat} type="button"
                    className={`cl__cat-btn ${form.category === cat ? "cl__cat-btn--on" : ""}`}
                    onClick={() => setF("category", cat)}
                  >
                    <span className="cl__cat-icon">{CAT_ICONS[cat]}</span>
                    <span className="cl__cat-label">{cat}</span>
                  </button>
                ))}
              </div>
              {fTouched.category && fErrors.category && <span className="cl__field-err">{fErrors.category}</span>}
            </div>

            {/* Condition — pill row */}
            <div className="cl__group">
              <label className="cl__label">
                Condition
                <span className="cl__label-opt">optional</span>
              </label>
              <div className="cl__cond-row">
                {CONDITIONS.map((c) => (
                  <button
                    key={c} type="button"
                    className={`cl__cond-pill ${form.condition === c ? "cl__cond-pill--on" : ""}`}
                    style={form.condition === c ? { borderColor: COND_COLORS[c], color: COND_COLORS[c], background: `${COND_COLORS[c]}14` } : {}}
                    onClick={() => setF("condition", form.condition === c ? "" : c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Semester */}
            <div className="cl__group cl__group--half">
              <label className="cl__label" htmlFor="f-sem">
                Semester
                <span className="cl__label-opt">optional</span>
              </label>
              <input
                id="f-sem" type="number" min="1" max="8" placeholder="e.g. 3"
                className="cl__input"
                value={form.semester}
                onChange={(e) => setF("semester", e.target.value)}
              />
            </div>

            {/* Pricing */}
            <div className="cl__group">
              <label className="cl__label">Pricing</label>
              <div className="cl__price-toggle">
                {[
                  { v: "negotiable", label: "Open to bargain", sub: "Discuss price with buyer", icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  )},
                  { v: "fixed", label: "Set a price", sub: "I have a number in mind", icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  )},
                  { v: "free", label: "Giving for free", sub: "No payment needed", icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
                  )},
                ].map((opt) => (
                  <button
                    key={opt.v} type="button"
                    className={`cl__price-opt ${form.priceType === opt.v ? "cl__price-opt--on" : ""}`}
                    onClick={() => setF("priceType", opt.v)}
                  >
                    <span className="cl__price-opt-icon">{opt.icon}</span>
                    <span className="cl__price-opt-label">{opt.label}</span>
                    <span className="cl__price-opt-sub">{opt.sub}</span>
                  </button>
                ))}
              </div>

              {form.priceType === "fixed" && (
                <div className="cl__price-input-wrap">
                  <span className="cl__price-rupee">₹</span>
                  <input
                    type="text" inputMode="numeric" placeholder="Your asking price"
                    className={`cl__input cl__input--rupee ${fTouched.price && fErrors.price ? "cl__input--error" : ""}`}
                    value={form.price}
                    onChange={(e) => setF("price", e.target.value)}
                    onBlur={() => blurF("price")}
                  />
                  {fTouched.price && fErrors.price && <span className="cl__field-err">{fErrors.price}</span>}
                </div>
              )}

              {form.priceType === "negotiable" && (
                <div className="cl__price-note cl__price-note--negotiate">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  Buyers will contact you to negotiate. No amount shown on listing.
                </div>
              )}
              {form.priceType === "free" && (
                <div className="cl__price-note cl__price-note--free">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                  This item is free. Buyers can contact you to arrange collection.
                </div>
              )}
            </div>

            {/* Description */}
            <div className="cl__group">
              <label className="cl__label" htmlFor="f-desc">
                Description <span className="cl__label-opt">optional</span>
                <span className="cl__label-hint">{form.description.length}/300</span>
              </label>
              <textarea
                id="f-desc" rows={4} maxLength={300}
                placeholder="Describe the condition, what's included, any known issues, edition, author…"
                className="cl__textarea"
                value={form.description}
                onChange={(e) => setF("description", e.target.value)}
                onBlur={() => {}}
              />

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════
              SECTION 3 — CONTACT (auto + optional override)
          ════════════════════════════════════════════════════════ */}
          <div className="cl__section">
            <div className="cl__section-head">
              <span className="cl__section-num">3</span>
              <div>
                <h2 className="cl__section-title">Contact Info</h2>
                <p className="cl__section-sub">Fetched from your profile — buyers see this after expressing interest</p>
              </div>
            </div>

            {/* Profile card — read-only preview */}
            {profileLoaded ? (
              <div className="cl__profile-card">
                <div className="cl__profile-avatar">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="cl__profile-info">
                  <p className="cl__profile-name">{profile.name || "—"}</p>
                  <div className="cl__profile-details">
                    {profile.phone && (
                      <span>
                        <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        +91 {profile.phone}
                      </span>
                    )}
                    {profile.email && (
                      <span>
                        <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                        {profile.email}
                      </span>
                    )}
                  </div>
                  {!profile.phone && !profile.email && (
                    <p className="cl__profile-missing">
                      No contact details in profile.{" "}
                      <button type="button" className="cl__link" onClick={() => navigate("/profile")}>
                        Update profile →
                      </button>
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="cl__profile-edit"
                  onClick={() => navigate("/profile")}
                  title="Edit profile"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="cl__profile-card cl__profile-card--loading">
                <div className="cl__profile-skeleton" />
              </div>
            )}

            {/* Optional extra contact toggle */}
            <button
              type="button"
              className={`cl__contact-toggle ${showContact ? "cl__contact-toggle--open" : ""}`}
              onClick={() => setShowContact((v) => !v)}
            >
              <div className="cl__contact-toggle-left">
                <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span>
                  <strong>Add extra contact details</strong>
                  <small>Optional — add a different number, WhatsApp, or preferred contact time</small>
                </span>
              </div>
              <svg
                viewBox="0 0 20 20" fill="currentColor" width="16" height="16"
                className={`cl__toggle-arrow ${showContact ? "cl__toggle-arrow--open" : ""}`}
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {showContact && (
              <div className="cl__contact-extra">
                <div className="cl__row">
                  <div className="cl__group">
                    <label className="cl__label" htmlFor="ec-phone">
                      Listing Phone Number
                      <span className="cl__label-opt">optional</span>
                    </label>
                    <div className="cl__phone-wrap">
                      <span className="cl__phone-prefix">+91</span>
                      <input
                        id="ec-phone" type="tel" placeholder="Different number to display" maxLength={10}
                        className="cl__input cl__input--indented"
                        value={extraContact.phone}
                        onChange={(e) => setExtraContact((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                      />
                    </div>
                  </div>
                  <div className="cl__group">
                    <label className="cl__label" htmlFor="ec-wa">
                      WhatsApp
                      <span className="cl__label-opt">optional</span>
                    </label>
                    <div className="cl__phone-wrap">
                      <span className="cl__phone-prefix cl__phone-prefix--wa">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </span>
                      <input
                        id="ec-wa" type="tel" placeholder="WhatsApp number" maxLength={10}
                        className="cl__input cl__input--indented"
                        value={extraContact.whatsapp}
                        onChange={(e) => setExtraContact((p) => ({ ...p, whatsapp: e.target.value.replace(/\D/g, "") }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="cl__row">
                  <div className="cl__group">
                    <label className="cl__label" htmlFor="ec-mode">Preferred Contact Method</label>
                    <select
                      id="ec-mode" className="cl__select"
                      value={extraContact.preferMode}
                      onChange={(e) => setExtraContact((p) => ({ ...p, preferMode: e.target.value }))}
                    >
                      <option value="">Any method is fine</option>
                      {PREFER_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="cl__group">
                    <label className="cl__label" htmlFor="ec-avail">
                      Availability
                      <span className="cl__label-opt">optional</span>
                    </label>
                    <input
                      id="ec-avail" type="text" placeholder="e.g. Weekdays after 5 PM"
                      className="cl__input"
                      value={extraContact.availability}
                      onChange={(e) => setExtraContact((p) => ({ ...p, availability: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="cl__privacy-note">
              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              Contact details are only shown to verified campus users who express interest in your listing.
            </div>
          </div>

          {/* ── Submit actions ─────────────────────────────────────── */}
          <div className="cl__form-actions cl__form-actions--end">
            <button type="button" className="cl__btn cl__btn--secondary" onClick={() => navigate("/browse")}>
              Cancel
            </button>
            <button
              type="submit"
              className={`cl__btn cl__btn--primary ${isLoading ? "cl__btn--loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "" : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Post Listing
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}