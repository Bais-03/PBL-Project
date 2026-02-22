import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/createListing.css";

const CATEGORIES   = ["Textbook", "Notes", "Electronics", "Housing", "Tutoring", "Other"];
const CONDITIONS   = ["Brand New", "Like New", "Good", "Fair", "Poor"];
const PREFER_MODES = ["WhatsApp", "Phone Call", "Email", "In-person only"];

/* ─── Step bar ──────────────────────────────────────────────────── */
function StepBar({ step, onStep }) {
  const steps = [
    { id: 0, label: "Contact Info" },
    { id: 1, label: "Listing Details" },
  ];
  return (
    <div className="cl__stepbar">
      {steps.map((s, i) => (
        <div key={s.id} className="cl__step-item">
          <button
            type="button"
            className={`cl__step-btn ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}
            onClick={() => step > s.id && onStep(s.id)}
          >
            <span className="cl__step-num">
              {step > s.id ? (
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              ) : s.id + 1}
            </span>
            <span className="cl__step-label">{s.label}</span>
          </button>
          {i < steps.length - 1 && (
            <div className={`cl__step-line ${step > i ? "done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────── */
export default function CreateListing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  /* Contact state */
  const [contact, setContact] = useState({
    name: "", phone: "", whatsapp: "", email: "",
    preferMode: "", availability: "",
  });
  const [cTouched, setCTouched] = useState({});
  const [cErrors,  setCErrors]  = useState({});

  /* Listing state */
  const [form, setForm] = useState({
    title: "", category: "", semester: "", condition: "",
    priceType: "negotiable", // "fixed" | "negotiable" | "free"
    price: "", description: "",
  });
  const [fTouched, setFTouched] = useState({});
  const [fErrors,  setFErrors]  = useState({});

  const [image,       setImage]       = useState(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const [showCamera,  setShowCamera]  = useState(false);
  const [cameraStream,setCameraStream]= useState(null);
  const [cameraError, setCameraError] = useState("");
  const [isLoading,   setIsLoading]   = useState(false);
  const [genError,    setGenError]    = useState("");
  const [success,     setSuccess]     = useState(false);

  const fileRef   = useRef(null);
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  /* ─── Validation ─────────────────────────────────────────────── */
  const validateContact = (c = contact) => {
    const e = {};
    if (!c.name.trim()) e.name = "Your name is required";
    if (!c.phone.trim() && !c.email.trim() && !c.whatsapp.trim())
      e.phone = "Provide at least one contact method";
    if (c.phone && !/^\d{10}$/.test(c.phone.replace(/\D/g, "")))
      e.phone = "Enter a valid 10-digit number";
    if (c.email && !/\S+@\S+\.\S+/.test(c.email))
      e.email = "Enter a valid email";
    return e;
  };

  const validateListing = (f = form) => {
  const e = {};
  if (!f.title.trim()) e.title = "Title is required";
  if (!f.category) e.category = "Select a category"; // This is required!
  if (!f.description.trim()) e.description = "Add a description";
  if (f.priceType === "fixed" && !f.price) {
    e.price = "Price is required for fixed price items";
  } else if (f.priceType === "fixed" && isNaN(Number(f.price))) {
    e.price = "Enter a valid number";
  }
  return e;
};

  /* ─── Contact handlers ───────────────────────────────────────── */
  const setC = (k, v) => {
    const u = { ...contact, [k]: v }; setContact(u);
    if (cTouched[k]) setCErrors(validateContact(u));
  };
  const blurC = (k) => { setCTouched((t) => ({ ...t, [k]: true })); setCErrors(validateContact()); };

  /* ─── Listing handlers ───────────────────────────────────────── */
  const setF = (k, v) => {
    const u = { ...form, [k]: v }; setForm(u);
    if (fTouched[k]) setFErrors(validateListing(u));
  };
  const blurF = (k) => { setFTouched((t) => ({ ...t, [k]: true })); setFErrors(validateListing()); };

  /* ─── Step navigation ────────────────────────────────────────── */
  const next = () => {
    const e = validateContact();
    if (Object.keys(e).length) {
      setCErrors(e);
      setCTouched({ name: true, phone: true, email: true, whatsapp: true });
      return;
    }
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ─── Image / camera ─────────────────────────────────────────── */
  const processFile = (f) => {
    if (!f?.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = (e) => setImage(e.target.result);
    r.readAsDataURL(f);
  };
  const onDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };
  const openCamera = async () => {
    setCameraError(""); setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setCameraStream(stream);
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch { setCameraError("Camera access denied. Please check browser permissions."); }
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
    setImage(c.toDataURL("image/jpeg", 0.9));
    closeCamera();
  };

/* ─── Submit ─────────────────────────────────────────────────── */
const handleSubmit = async (e) => {
  e.preventDefault();
  const le = validateListing();
  if (Object.keys(le).length) {
    setFErrors(le);
    setFTouched({ title: true, category: true, description: true, price: true });
    return;
  }
  
  setIsLoading(true);
  setGenError("");
  
  try {
    // Prepare all the data matching your updated schema
    const listingData = {
      // Listing details (all required)
      title: form.title,
      description: form.description,
      category: form.category, // This is required!
      condition: form.condition || "",
      semester: form.semester || "",
      price: form.priceType === "free" ? 0 : form.priceType === "fixed" ? Number(form.price) : 0,
      priceType: form.priceType,
      
      // Contact info
      contactName: contact.name, // This is required!
      contactPhone: contact.phone || "",
      contactEmail: contact.email || "",
      contactWhatsapp: contact.whatsapp || "",
      preferMode: contact.preferMode || "",
      availability: contact.availability || "",
      
      // Image
      image: image || "",
    };

    console.log("Sending data:", listingData); // For debugging

    await axios.post(
      "http://localhost:5000/api/listings",
      listingData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    setSuccess(true);
    setTimeout(() => navigate("/browse"), 1800);
  } catch (error) {
    console.error("Submission error:", error);
    console.error("Error response:", error.response?.data); // This will show what's missing
    setGenError(
      error.response?.data?.message || 
      "Failed to create listing. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};

  /* ─── Success ────────────────────────────────────────────────── */
  if (success) return (
    <div className="cl">
      <div className="cl__card cl__success-screen">
        <div className="cl__success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h2>Listing Created!</h2>
        <p>Your item is live on the marketplace. Redirecting...</p>
      </div>
    </div>
  );

  /* ─── Render ─────────────────────────────────────────────────── */
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
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
          <p className="cl__subtitle">Add your contact details, then describe your item</p>
        </div>

        {/* Step bar */}
        <StepBar step={step} onStep={(s) => setStep(s)} />

        <form onSubmit={handleSubmit} noValidate>

          {/* ════════════════════════════════════════
              STEP 0 — CONTACT DETAILS
          ════════════════════════════════════════ */}
          {step === 0 && (
            <div className="cl__panel">
              <div className="cl__panel-banner">
                <div className="cl__panel-banner-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div>
                  <strong>How will buyers reach you?</strong>
                  <p>Only verified campus users can see your contact details after expressing interest.</p>
                </div>
              </div>

              {/* Name */}
              <div className="cl__group">
                <label className="cl__label" htmlFor="c-name">Your Name</label>
                <input id="c-name" type="text" placeholder="Full name"
                  className={`cl__input ${cTouched.name && cErrors.name ? "cl__input--error" : cTouched.name && !cErrors.name && contact.name ? "cl__input--ok" : ""}`}
                  value={contact.name}
                  onChange={(e) => setC("name", e.target.value)}
                  onBlur={() => blurC("name")}
                />
                {cTouched.name && cErrors.name && <span className="cl__field-err">{cErrors.name}</span>}
              </div>

              {/* Phone + WhatsApp */}
              <div className="cl__row">
                <div className="cl__group">
                  <label className="cl__label" htmlFor="c-phone">Phone Number</label>
                  <div className="cl__phone-wrap">
                    <span className="cl__phone-prefix">+91</span>
                    <input id="c-phone" type="tel" placeholder="10-digit number" maxLength={10}
                      className={`cl__input cl__input--indented ${cTouched.phone && cErrors.phone ? "cl__input--error" : cTouched.phone && !cErrors.phone && contact.phone ? "cl__input--ok" : ""}`}
                      value={contact.phone}
                      onChange={(e) => setC("phone", e.target.value.replace(/\D/g, ""))}
                      onBlur={() => blurC("phone")}
                    />
                  </div>
                  {cTouched.phone && cErrors.phone && <span className="cl__field-err">{cErrors.phone}</span>}
                </div>

                <div className="cl__group">
                  <label className="cl__label" htmlFor="c-wa">
                    WhatsApp
                    <span className="cl__label-opt">optional</span>
                  </label>
                  <div className="cl__phone-wrap">
                    <span className="cl__phone-prefix cl__phone-prefix--wa">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </span>
                    <input id="c-wa" type="tel" placeholder="Same or different" maxLength={10}
                      className="cl__input cl__input--indented"
                      value={contact.whatsapp}
                      onChange={(e) => setC("whatsapp", e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="cl__group">
                <label className="cl__label" htmlFor="c-email">
                  Email Address
                  <span className="cl__label-opt">optional</span>
                </label>
                <input id="c-email" type="email" placeholder="your.name@college.edu"
                  className={`cl__input ${cTouched.email && cErrors.email ? "cl__input--error" : cTouched.email && !cErrors.email && contact.email ? "cl__input--ok" : ""}`}
                  value={contact.email}
                  onChange={(e) => setC("email", e.target.value)}
                  onBlur={() => blurC("email")}
                />
                {cTouched.email && cErrors.email && <span className="cl__field-err">{cErrors.email}</span>}
              </div>

              {/* Preferred mode + availability */}
              <div className="cl__row">
                <div className="cl__group">
                  <label className="cl__label" htmlFor="c-mode">Preferred Contact Mode</label>
                  <select id="c-mode" className="cl__select"
                    value={contact.preferMode}
                    onChange={(e) => setC("preferMode", e.target.value)}
                  >
                    <option value="">Any method is fine</option>
                    {PREFER_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="cl__group">
                  <label className="cl__label" htmlFor="c-avail">
                    Availability
                    <span className="cl__label-opt">optional</span>
                  </label>
                  <input id="c-avail" type="text" placeholder="e.g. Weekdays after 5 PM"
                    className="cl__input"
                    value={contact.availability}
                    onChange={(e) => setC("availability", e.target.value)}
                  />
                </div>
              </div>

              <div className="cl__privacy-note">
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                Contact info is only revealed to verified users who express interest in your listing.
              </div>

              <div className="cl__form-actions cl__form-actions--end">
                <button type="button" className="cl__btn cl__btn--secondary" onClick={() => navigate("/browse")}>Cancel</button>
                <button type="button" className="cl__btn cl__btn--primary" onClick={next}>
                  Next: Listing Details
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              STEP 1 — LISTING DETAILS
          ════════════════════════════════════════ */}
          {step === 1 && (
            <div className="cl__panel">
              {genError && (
                <div className="cl__error-banner">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {genError}
                </div>
              )}

              {/* Image */}
              <div className="cl__section">
                <label className="cl__section-label">
                  Item Photo
                  <span className="cl__label-opt" style={{ marginLeft: "0.5rem" }}>optional</span>
                </label>
                {image ? (
                  <div className="cl__preview">
                    <img src={image} alt="Preview" className="cl__preview-img" />
                    <div className="cl__preview-actions">
                      <button type="button" className="cl__preview-btn" onClick={() => fileRef.current.click()}>
                        <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                        Change
                      </button>
                      <button type="button" className="cl__preview-btn cl__preview-btn--remove" onClick={() => setImage(null)}>
                        <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`cl__upload-zone ${isDragging ? "cl__upload-zone--drag" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                  >
                    <div className="cl__upload-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                        <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <p className="cl__upload-title">Drag & drop your photo here</p>
                    <div className="cl__upload-btns">
                      <button type="button" className="cl__upload-btn" onClick={() => fileRef.current.click()}>
                        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                        Upload from device
                      </button>
                      <button type="button" className="cl__upload-btn cl__upload-btn--cam" onClick={openCamera}>
                        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>
                        Use camera
                      </button>
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => processFile(e.target.files[0])} style={{ display: "none" }} />
              </div>

              {/* Title */}
              <div className="cl__group">
                <label className="cl__label" htmlFor="f-title">Title</label>
                <input id="f-title" type="text" placeholder="e.g. Engineering Mathematics — Kreyszig 10th Ed."
                  className={`cl__input ${fTouched.title && fErrors.title ? "cl__input--error" : fTouched.title && !fErrors.title ? "cl__input--ok" : ""}`}
                  value={form.title}
                  onChange={(e) => setF("title", e.target.value)}
                  onBlur={() => blurF("title")}
                />
                {fTouched.title && fErrors.title && <span className="cl__field-err">{fErrors.title}</span>}
              </div>

              {/* Category + Condition */}
              <div className="cl__row">
                <div className="cl__group">
                  <label className="cl__label" htmlFor="f-cat">Category</label>
                  <select id="f-cat"
                    className={`cl__select ${fTouched.category && fErrors.category ? "cl__input--error" : ""}`}
                    value={form.category}
                    onChange={(e) => setF("category", e.target.value)}
                    onBlur={() => blurF("category")}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {fTouched.category && fErrors.category && <span className="cl__field-err">{fErrors.category}</span>}
                </div>
                <div className="cl__group">
                  <label className="cl__label" htmlFor="f-cond">Condition</label>
                  <select id="f-cond" className="cl__select"
                    value={form.condition}
                    onChange={(e) => setF("condition", e.target.value)}
                  >
                    <option value="">Select condition</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Semester */}
              <div className="cl__group cl__group--half">
                <label className="cl__label" htmlFor="f-sem">
                  Semester
                  <span className="cl__label-opt">optional</span>
                </label>
                <input id="f-sem" type="number" min="1" max="8" placeholder="e.g. 3"
                  className="cl__input"
                  value={form.semester}
                  onChange={(e) => setF("semester", e.target.value)}
                />
              </div>

              {/* Pricing — 3-way toggle */}
              <div className="cl__group">
                <label className="cl__label">Pricing</label>
                <div className="cl__price-toggle">
                  {[
                    { v: "negotiable", label: "Open to bargain", sub: "Discuss price with buyer" },
                    { v: "fixed",      label: "Set a price",     sub: "I have a number in mind" },
                    { v: "free",       label: "Giving for free", sub: "No payment needed" },
                  ].map((opt) => (
                    <button
                      key={opt.v} type="button"
                      className={`cl__price-opt ${form.priceType === opt.v ? "cl__price-opt--on" : ""}`}
                      onClick={() => setF("priceType", opt.v)}
                    >
                      <span className="cl__price-opt-label">{opt.label}</span>
                      <span className="cl__price-opt-sub">{opt.sub}</span>
                    </button>
                  ))}
                </div>

                {form.priceType === "fixed" && (
                  <div className="cl__price-input-wrap">
                    <span className="cl__price-rupee">₹</span>
                    <input type="number" min="0" placeholder="Your asking price"
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
                    Buyers will contact you to negotiate a price. No amount will be shown on the listing.
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
                  Description
                  <span className="cl__label-hint">{form.description.length}/300</span>
                </label>
                <textarea id="f-desc" rows={4} maxLength={300}
                  placeholder="Describe the condition, what's included, any known issues..."
                  className={`cl__textarea ${fTouched.description && fErrors.description ? "cl__input--error" : fTouched.description && !fErrors.description ? "cl__input--ok" : ""}`}
                  value={form.description}
                  onChange={(e) => setF("description", e.target.value)}
                  onBlur={() => blurF("description")}
                />
                {fTouched.description && fErrors.description && <span className="cl__field-err">{fErrors.description}</span>}
              </div>

              <div className="cl__form-actions">
                <button type="button" className="cl__btn cl__btn--secondary" onClick={() => setStep(0)}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                  </svg>
                  Back
                </button>
                <button type="submit" className={`cl__btn cl__btn--primary ${isLoading ? "cl__btn--loading" : ""}`} disabled={isLoading}>
                  {isLoading ? "" : "Post Listing"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}