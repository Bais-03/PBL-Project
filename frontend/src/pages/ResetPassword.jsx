import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axios";
import "../styles/auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [tokenValid, setTokenValid] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`/auth/verify-reset-token/${token}`);
        if (response.data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        setTokenValid(false);
      }
    };
    
    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
    }
  }, [token]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors(validateForm());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ password: true, confirmPassword: true });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await axios.post(`/auth/reset-password/${token}`, { password });
      setSubmitted(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Failed to reset password. Please try again.",
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

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <h2>Invalid Reset Link</h2>
            <p>This password reset link is invalid or has expired</p>
          </div>
          
          <div className="error-message" style={{ marginBottom: "1.5rem" }}>
            <span className="error-icon">!</span>
            The password reset link you clicked is no longer valid. Please request a new one.
          </div>
          
          <Link to="/forgot-password" className="auth-btn" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
            Request New Link
          </Link>
          
          <div className="auth-footer">
            <Link to="/login">← Back to Sign In</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading token verification
  if (tokenValid === null) {
    return (
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="auth-btn loading" style={{ width: "40px", margin: "0 auto" }} />
            <p style={{ marginTop: "1rem", color: "#547792" }}>Verifying reset link...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="success-container">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h3>Password Reset Successfully!</h3>
            <p>Your password has been updated. Redirecting you to login...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="auth-header"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 variants={itemVariants}>Create New Password</motion.h2>
          <motion.p variants={itemVariants}>
            Enter your new password below to reset your account
          </motion.p>
        </motion.div>

        {errors.general && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="error-icon">!</span>
            {errors.general}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Password */}
          <motion.div
            className="form-group"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <label htmlFor="password">New Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                className={
                  touched.password && errors.password
                    ? "error"
                    : touched.password && !errors.password && password
                    ? "success"
                    : ""
                }
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {touched.password && errors.password && (
              <motion.span
                className="field-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.password}
              </motion.span>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            className="form-group"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                className={
                  touched.confirmPassword && errors.confirmPassword
                    ? "error"
                    : touched.confirmPassword && !errors.confirmPassword && confirmPassword
                    ? "success"
                    : ""
                }
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <motion.span
                className="field-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.confirmPassword}
              </motion.span>
            )}
          </motion.div>

          {/* Password strength indicator */}
          {password && password.length > 0 && (
            <motion.div
              className="password-strength"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="strength-bar">
                <div 
                  className={`strength-level ${
                    password.length >= 8 ? "strong" : password.length >= 6 ? "medium" : "weak"
                  }`}
                  style={{ width: `${Math.min((password.length / 12) * 100, 100)}%` }}
                />
              </div>
              <span className="strength-text">
                {password.length >= 8 
                  ? "Strong password ✓" 
                  : password.length >= 6 
                  ? "Medium password" 
                  : "Weak password - use at least 6 characters"}
              </span>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            className={`auth-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </motion.button>

          {/* Back to login */}
          <motion.div
            className="auth-footer"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Link to="/login">← Back to Sign In</Link>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}