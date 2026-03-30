// ForgotPassword.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axios";
import "../styles/auth.css";
import "../styles/form.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    return newErrors;
  };

  const handleBlur = () => {
    setTouched({ email: true });
    setErrors(validateForm());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ email: true });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // API call to request password reset
      await axios.post("/auth/forgot-password", { email });
      setSubmitted(true);
      // Start resend cooldown timer
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Unable to process request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Failed to resend. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* Header */}
        <motion.div
          className="login-header"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 variants={itemVariants}>Forgot Password?</motion.h2>
          <motion.p variants={itemVariants}>
            {!submitted 
              ? "Enter your college email and we'll send you a reset link"
              : "Check your email for the reset link"}
          </motion.p>
        </motion.div>

        {/* General error */}
        {errors.general && !submitted && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="error-icon">!</span>
            {errors.general}
          </motion.div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Email */}
            <motion.div
              className="form-group"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <label htmlFor="email">College Email</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="your.name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur}
                  className={
                    touched.email && errors.email
                      ? "error"
                      : touched.email && !errors.email && email
                      ? "success"
                      : ""
                  }
                  disabled={isLoading}
                  autoComplete="email"
                />
                {touched.email && !errors.email && email && (
                  <span className="input-success-icon">✓</span>
                )}
              </div>
              {touched.email && errors.email && (
                <motion.span
                  className="field-error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.email}
                </motion.span>
              )}
            </motion.div>

            {/* Info note */}
            <motion.div
              className="info-note"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <span>We'll send a password reset link to your registered email address.</span>
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="submit"
              className={`login-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </motion.button>

            {/* Back to login */}
            <motion.div
              className="login-footer"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link to="/login">← Back to Sign In</Link>
            </motion.div>
          </form>
        ) : (
          <div className="success-container">
            <motion.div
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Check Your Email
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              We've sent a password reset link to <strong>{email}</strong>
            </motion.p>
            
            <motion.div
              className="email-tips"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="tip-item">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path d="M10 0a10 10 0 100 20 10 10 0 000-20zM8 4a1 1 0 112 0v4a1 1 0 11-2 0V4zm2 12a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
                <span>Check your spam folder if you don't see it in your inbox</span>
              </div>
              <div className="tip-item">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
                <span>The link expires in 1 hour for security</span>
              </div>
            </motion.div>
            
            <motion.div
              className="resend-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p>Didn't receive the email?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || isLoading}
                className={`resend-btn ${resendTimer > 0 ? "resend-btn--disabled" : ""}`}
              >
                {resendTimer > 0 
                  ? `Resend in ${resendTimer}s` 
                  : isLoading 
                  ? "Sending..." 
                  : "Resend Email"}
              </button>
            </motion.div>
            
            <motion.div
              className="login-footer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/login">← Back to Sign In</Link>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}