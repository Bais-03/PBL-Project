import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../styles/Dashboard.css";

/* ─── Animated counter hook ─────────────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ─── Intersection observer hook ────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Data ──────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home",       href: "#home" },
  { label: "About",      href: "#about" },
  { label: "How It Works", href: "#how" },
  { label: "Categories", href: "#categories" },
  { label: "Contact",    href: "#contact" },
];

const STATS = [
  { value: 1200, suffix: "+", label: "Active Students" },
  { value: 3400, suffix: "+", label: "Listings Posted" },
  { value: 98,   suffix: "%", label: "Satisfaction Rate" },
  { value: 24,   suffix: "/7", label: "Platform Uptime" },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Textbooks & Notes",
    desc: "Buy or sell course textbooks, handwritten notes, and study guides at fair campus prices.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
      </svg>
    ),
    title: "Electronics & Gadgets",
    desc: "Laptops, calculators, lab equipment — find verified campus-grade tech at student prices.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: "Tutoring & Services",
    desc: "Offer or request tutoring, project help, and academic services from verified peers.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "Housing & Roommates",
    desc: "Find sublets, roommate listings, and off-campus housing trusted within your college network.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
    title: "Clubs & Events",
    desc: "Promote campus events, sell tickets, and discover what's happening in your college community.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Verified & Safe",
    desc: "Every user is verified with a college email. Trade confidently within your campus network.",
  },
];

const HOW_STEPS = [
  { num: "01", title: "Create Your Account", desc: "Sign up with your official college email to join your campus marketplace instantly." },
  { num: "02", title: "Browse or Post", desc: "Explore thousands of listings or post your own in under two minutes — no fees, no friction." },
  { num: "03", title: "Connect & Trade", desc: "Chat with verified peers, agree on terms, and complete the exchange safely on campus." },
];

const TESTIMONIALS = [
  {
    quote: "Sold my entire first-year textbook stack within 48 hours. Zero hassle, trusted buyers.",
    name: "Arjun Mehta",
    role: "B.Tech CSE, Batch 2024",
    initials: "AM",
  },
  {
    quote: "Found a roommate through Campus Exchange and saved ₹8,000 a month on rent. Genuinely life-changing.",
    name: "Priya Nair",
    role: "MBA Finance, Batch 2025",
    initials: "PN",
  },
  {
    quote: "The platform feels professional. Knowing everyone is college-verified makes you actually trust the listings.",
    name: "Rohan Das",
    role: "M.Sc Physics, Batch 2024",
    initials: "RD",
  },
];

/* ─── Components ────────────────────────────────────────────────── */

function Navbar({ scrolled, mobileOpen, setMobileOpen }) {
  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        {/* Brand */}
        <a href="#home" className="navbar__brand" onClick={(e) => { e.preventDefault(); scrollTo("#home"); }}>
          <div className="navbar__logo">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#FAB95B"/>
              <path d="M6 22L16 8l10 14H6z" fill="#1A3263"/>
              <circle cx="16" cy="11" r="3" fill="#FAB95B"/>
            </svg>
          </div>
          <span className="navbar__name">Campus<strong>Exchange</strong></span>
        </a>

        {/* Desktop links */}
        <ul className="navbar__links">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="navbar__cta">
          <Link to="/login" className="navbar__link-btn">Sign In</Link>
          <Link to="/register" className="navbar__solid-btn">Get Started</Link>
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${mobileOpen ? "navbar__mobile--open" : ""}`}>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}>
            {l.label}
          </a>
        ))}
        <div className="navbar__mobile-cta">
          <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link to="/register" onClick={() => setMobileOpen(false)} className="solid">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

function StatCard({ value, suffix, label, animate }) {
  const count = useCountUp(value, 1600, animate);
  return (
    <div className="stat-card">
      <span className="stat-number">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const [statsRef, statsInView]         = useInView(0.3);
  const [aboutRef, aboutInView]         = useInView(0.2);
  const [howRef, howInView]             = useInView(0.2);
  const [featRef, featInView]           = useInView(0.1);
  const [testimonialsRef, testimonialsInView] = useInView(0.2);
  const [contactRef, contactInView]     = useInView(0.2);

  const [contactForm, setContactForm]   = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleContact = (e) => {
    e.preventDefault();
    setContactSent(true);
  };

  return (
    <div className="page">
      <Navbar scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
     <div className="hero-stats-wrapper">
       <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__grid" />
        </div>
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section id="home" className="hero">

          <div className="hero__content">
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              Trusted by 1,200+ students across India
            </div>

            <h1 className="hero__title">
              The Campus<br />
              <span className="hero__title-accent">Marketplace</span><br />
              Built for Students
            </h1>

            <p className="hero__desc">
              Buy, sell, and connect within your verified college network.
              Textbooks, electronics, housing, tutoring — everything a student needs,
              in one trusted place.
            </p>

            <div className="hero__actions">
              <Link to="/register" className="btn btn--primary">
                Start for Free
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </Link>
              <a
                href="#how"
                className="btn btn--ghost"
                onClick={(e) => { e.preventDefault(); document.querySelector("#how").scrollIntoView({ behavior: "smooth" }); }}
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="hero-visual">
            {/* Card 1 — back — Textbook listing */}
            <div className="visual-card card-1">
              <div className="vc-header vc-header--navy">
                <div className="vc-header-eyebrow">Textbooks</div>
                <div className="vc-header-title">Engineering Mathematics II</div>
                <div className="vc-header-sub">3rd Sem · Pune University</div>
              </div>
              <div className="vc-body">
                <div className="vc-seller-row">
                  <div className="vc-avatar vc-avatar--navy">RS</div>
                  <div>
                    <div className="vc-name">Rahul Sharma</div>
                    <div className="vc-meta">PICT · 4.8 ★ seller</div>
                  </div>
                  <div className="vc-price-chip">₹320</div>
                </div>
                <div className="vc-divider" />
                <div className="vc-label">Condition</div>
                <div className="vc-condition-bar">
                  <div className="vc-cond-dot vc-cond-dot--on" />
                  <div className="vc-cond-dot vc-cond-dot--on" />
                  <div className="vc-cond-dot vc-cond-dot--on" />
                  <div className="vc-cond-dot vc-cond-dot--on" />
                  <div className="vc-cond-dot" />
                  <span className="vc-cond-label">Like New</span>
                </div>
                <div className="vc-tag-row">
                  <span className="vc-tag">Calculus</span>
                  <span className="vc-tag">Verified</span>
                  <span className="vc-tag">Pickup only</span>
                </div>
              </div>
            </div>

            {/* Card 2 — middle — Tutor profile */}
            <div className="visual-card card-2">
              <div className="vc-header vc-header--gold">
                <div className="vc-header-eyebrow">Notes</div>
                <div className="vc-header-title">Data Structures & Algorithms</div>
                <div className="vc-header-sub">Online · Flexible timings</div>
              </div>
              <div className="vc-body">
                <div className="vc-seller-row">
                  <div className="vc-avatar vc-avatar--gold">AK</div>
                  <div>
                    <div className="vc-name">Arjun Kamat</div>
                    <div className="vc-meta">PICT · 4.9 ★</div>
                  </div>
                  <div className="vc-price-chip">₹200<span>/hr</span></div>
                </div>
                <div className="vc-divider" />
                <div className="vc-label">Availability this week</div>
                <div className="vc-slots-grid">
                  <div className="vc-slot vc-slot--taken">Mon</div>
                  <div className="vc-slot vc-slot--taken">Tue</div>
                  <div className="vc-slot vc-slot--free">Wed</div>
                  <div className="vc-slot vc-slot--free">Thu</div>
                  <div className="vc-slot vc-slot--free">Sat</div>
                </div>
                <div className="vc-tag-row">
                  <span className="vc-tag">Python</span>
                  <span className="vc-tag">DSA</span>
                  <span className="vc-tag">ML basics</span>
                </div>
              </div>
            </div>

            {/* Card 3 — front — Electronics listing */}
            <div className="visual-card card-3">
              <div className="vc-header vc-header--slate">
                <div className="vc-header-eyebrow">Electronics</div>
                <div className="vc-header-title">HP Scientific Calculator fx-991</div>
                <div className="vc-header-sub">Barely used · Includes original cover</div>
              </div>
              <div className="vc-body">
                <div className="vc-stat-strip">
                  <div className="vc-stat">
                    <div className="vc-stat-val">₹800</div>
                    <div className="vc-stat-lbl">Price</div>
                  </div>
                  <div className="vc-stat-sep" />
                  <div className="vc-stat">
                    <div className="vc-stat-val">PICT</div>
                    <div className="vc-stat-lbl">Campus</div>
                  </div>
                  <div className="vc-stat-sep" />
                  <div className="vc-stat">
                    <div className="vc-stat-val">2h</div>
                    <div className="vc-stat-lbl">Listed</div>
                  </div>
                </div>
                <div className="vc-divider" />
                <div className="vc-seller-row">
                  <div className="vc-avatar vc-avatar--slate">NP</div>
                  <div>
                    <div className="vc-name">Neha Patil</div>
                    <div className="vc-meta">PICT · Verified student</div>
                  </div>
                </div>
                <div className="vc-cta">View Listing →</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────────────── */}
        <section className="stats-section" ref={statsRef}>
          <div className="container">
            <div className="stats-grid">
              {STATS.map((s) => (
                <StatCard key={s.label} {...s} animate={statsInView} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── ABOUT ─────────────────────────────────────────────────── */}
      <section id="about" className="about-section" ref={aboutRef}>
        <div className="container">
          <div className={`about-grid ${aboutInView ? "reveal" : ""}`}>
            <div className="about-text">
              <p className="section-eyebrow">About Us</p>
              <h2 className="section-title">A marketplace<br />made for campus life</h2>
              <p className="section-body">
                Campus Exchange was built because student-to-student trade deserved better than
                WhatsApp groups and notice boards. We created a verified, structured marketplace
                where every transaction happens between real, college-authenticated peers.
              </p>
              <p className="section-body">
                Our platform connects students across departments and batches, making it easy to
                trade resources you no longer need with people who genuinely need them — at prices
                that make sense for a student budget.
              </p>
              <div className="about-pillars">
                <div className="pillar">
                  <div className="pillar__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Verified community</strong>
                    <p>College email required. Every user is authenticated.</p>
                  </div>
                </div>
                <div className="pillar">
                  <div className="pillar__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Zero listing fees</strong>
                    <p>Post anything, anytime, completely free of charge.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-visual">
              <div className="about-card about-card--1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                <strong>1,200+ Students</strong>
                <p>Across 14 colleges</p>
              </div>
              <div className="about-card about-card--2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <strong>98% Satisfaction</strong>
                <p>Based on user reviews</p>
              </div>
              <div className="about-card about-card--3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <strong>Zero Fees</strong>
                <p>List for free, always</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how" className="how-section" ref={howRef}>
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">How It Works</p>
            <h2 className="section-title">Three steps to your<br />first trade</h2>
          </div>
          <div className={`how-steps ${howInView ? "reveal" : ""}`}>
            {HOW_STEPS.map((step, i) => (
              <div className="how-step" key={step.num} style={{ "--delay": `${i * 0.15}s` }}>
                <div className="how-step__num">{step.num}</div>
                <div className="how-step__connector" />
                <h3 className="how-step__title">{step.title}</h3>
                <p className="how-step__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES / FEATURES ─────────────────────────────────── */}
      <section id="categories" className="features-section" ref={featRef}>
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">Categories</p>
            <h2 className="section-title">Everything a student<br />could need</h2>
          </div>
          <div className={`features-grid ${featInView ? "reveal" : ""}`}>
            {FEATURES.map((f, i) => (
              <div className="feature-card" key={f.title} style={{ "--delay": `${i * 0.08}s` }}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="testimonials-section" ref={testimonialsRef}>
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">Student Stories</p>
            <h2 className="section-title">Trusted by peers<br />across campuses</h2>
          </div>
          <div className={`testimonials-grid ${testimonialsInView ? "reveal" : ""}`}>
            {TESTIMONIALS.map((t, i) => (
              <div className="testimonial-card" key={t.name} style={{ "--delay": `${i * 0.12}s` }}>
                <div className="testimonial-card__quote">
                  <svg viewBox="0 0 32 24" fill="currentColor" width="32" height="24">
                    <path d="M0 24V14.4C0 6.453 4.8 1.6 14.4 0l1.92 2.88C11.84 4.16 9.28 6.507 8.64 10.08H14.4V24H0zm17.6 0V14.4C17.6 6.453 22.4 1.6 32 0l1.92 2.88c-4.48 1.28-7.04 3.627-7.68 7.2H32V24H17.6z"/>
                  </svg>
                </div>
                <p className="testimonial-card__text">{t.quote}</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">{t.initials}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-box__text">
              <h2>Ready to trade smarter?</h2>
              <p>Join thousands of students already on Campus Exchange. It takes 60 seconds to sign up.</p>
            </div>
            <div className="cta-box__actions">
              <Link to="/register" className="btn btn--primary">Create Free Account</Link>
              <Link to="/login" className="btn btn--outline-light">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────── */}
      <section id="contact" className="contact-section" ref={contactRef}>
        <div className="container">
          <div className={`contact-grid ${contactInView ? "reveal" : ""}`}>
            <div className="contact-info">
              <p className="section-eyebrow">Contact Us</p>
              <h2 className="section-title">Get in touch</h2>
              <p className="section-body">
                Have a question, feedback, or want to bring Campus Exchange to your college?
                We'd love to hear from you.
              </p>
              <div className="contact-details">
                <div className="contact-detail">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>support@campusexchange.in</span>
                </div>
                <div className="contact-detail">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Pune, Maharashtra, India</span>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleContact}>
              {contactSent ? (
                <div className="contact-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  <h3>Message sent!</h3>
                  <p>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div className="form-row">
                    <div className="cf-group">
                      <label htmlFor="cf-name">Full Name</label>
                      <input
                        id="cf-name"
                        type="text"
                        placeholder="Your name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="cf-group">
                      <label htmlFor="cf-email">Email</label>
                      <input
                        id="cf-email"
                        type="email"
                        placeholder="your@email.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="cf-group">
                    <label htmlFor="cf-message">Message</label>
                    <textarea
                      id="cf-message"
                      rows={5}
                      placeholder="Tell us what's on your mind..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn--primary" style={{ width: "100%" }}>
                    Send Message
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer__top">
            <div className="footer__brand">
              <div className="navbar__logo">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#FAB95B"/>
                  <path d="M6 22L16 8l10 14H6z" fill="#1A3263"/>
                  <circle cx="16" cy="11" r="3" fill="#FAB95B"/>
                </svg>
              </div>
              <span className="navbar__name" style={{ color: "#E8E2DB" }}>Campus<strong>Exchange</strong></span>
              <p>India's trusted marketplace<br />for college students.</p>
            </div>
            <div className="footer__links">
              <div className="footer__col">
                <strong>Platform</strong>
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#how">How It Works</a>
                <a href="#categories">Categories</a>
              </div>
              <div className="footer__col">
                <strong>Account</strong>
                <Link to="/login">Sign In</Link>
                <Link to="/register">Register</Link>
                <Link to="/browse">Browse Listings</Link>
              </div>
              <div className="footer__col">
                <strong>Support</strong>
                <a href="#contact">Contact Us</a>
                <a href="#contact">Report Issue</a>
                <a href="#contact">Partner with Us</a>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <p>&copy; {new Date().getFullYear()} Campus Exchange. All rights reserved.</p>
            <div className="footer__legal">
              <a href="#home">Privacy Policy</a>
              <a href="#home">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}