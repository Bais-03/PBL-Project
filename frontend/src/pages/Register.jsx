import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axios";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    collegeId: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (!form.email.includes("@") || !form.email.includes(".")) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }

    // College ID validation
    if (!form.collegeId.trim()) {
      newErrors.collegeId = "College ID is required";
    } else if (form.collegeId.trim().length < 3) {
      newErrors.collegeId = "College ID must be at least 3 characters";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors(validateForm());
  };

  const handleChange = (field, value) => {
    // For phone, only allow numbers and limit to 10 digits
    if (field === "phone") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length <= 10) {
        setForm({ ...form, [field]: cleaned });
      }
    } else {
      setForm({ ...form, [field]: value });
    }
    
    if (touched[field]) {
      setErrors(validateForm());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ 
        name: true, 
        email: true, 
        phone: true,
        collegeId: true, 
        password: true,
        confirmPassword: true 
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Only send required fields to backend
      const registrationData = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        phone: form.phone,
        collegeId: form.collegeId.trim(),
        password: form.password,
      };
      
      await axios.post("/auth/register", registrationData);
      navigate("/login", { state: { message: "Registration successful! Please login." } });
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = form.password;
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength === 0) return "";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const getStrengthClass = () => {
    const strength = getPasswordStrength();
    if (strength <= 1) return "weak";
    if (strength === 2) return "medium";
    return "strong";
  };

  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const isSuccess = (field) =>
    touched[field] && !errors[field] && form[field];

  return (
    <div className="auth-container">
      <div className="orb-secondary"></div>
      <motion.div
        className="auth-card"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* Header */}
        <motion.div
          className="auth-header"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 variants={itemVariants}>Create an account</motion.h2>
          <motion.p variants={itemVariants}>Join Campus Exchange with your college credentials</motion.p>
        </motion.div>

        {/* General error */}
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
          {/* Name */}
          <motion.div className="form-group" variants={itemVariants} initial="hidden" animate="visible">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={
                  touched.name && errors.name
                    ? "error"
                    : isSuccess("name")
                    ? "success"
                    : ""
                }
                disabled={isLoading}
                autoComplete="name"
              />
              {isSuccess("name") && <span className="input-success-icon">✓</span>}
            </div>
            {touched.name && errors.name && (
              <motion.span className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {errors.name}
              </motion.span>
            )}
          </motion.div>

          {/* Email */}
          <motion.div className="form-group" variants={itemVariants} initial="hidden" animate="visible">
            <label htmlFor="email">College Email</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="your.name@college.edu"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={
                  touched.email && errors.email
                    ? "error"
                    : isSuccess("email")
                    ? "success"
                    : ""
                }
                disabled={isLoading}
                autoComplete="email"
              />
              {isSuccess("email") && <span className="input-success-icon">✓</span>}
            </div>
            {touched.email && errors.email && (
              <motion.span className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {errors.email}
              </motion.span>
            )}
          </motion.div>

          {/* Phone Number */}
          <motion.div className="form-group" variants={itemVariants} initial="hidden" animate="visible">
            <label htmlFor="phone">Mobile Number</label>
            <div className="input-wrapper">
              <input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                onBlur={() => handleBlur("phone")}
                className={
                  touched.phone && errors.phone
                    ? "error"
                    : isSuccess("phone")
                    ? "success"
                    : ""
                }
                disabled={isLoading}
                autoComplete="tel"
                maxLength={10}
              />
              {isSuccess("phone") && <span className="input-success-icon">✓</span>}
            </div>
            {touched.phone && errors.phone && (
              <motion.span className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {errors.phone}
              </motion.span>
            )}
            <span className="input-hint">Enter a 10-digit mobile number</span>
          </motion.div>

          {/* College ID */}
          <motion.div className="form-group" variants={itemVariants} initial="hidden" animate="visible">
            <label htmlFor="collegeId">College ID / Roll Number</label>
            <div className="input-wrapper">
              <input
                id="collegeId"
                type="text"
                placeholder="e.g., CS21B1042"
                value={form.collegeId}
                onChange={(e) => handleChange("collegeId", e.target.value)}
                onBlur={() => handleBlur("collegeId")}
                className={
                  touched.collegeId && errors.collegeId
                    ? "error"
                    : isSuccess("collegeId")
                    ? "success"
                    : ""
                }
                disabled={isLoading}
              />
              {isSuccess("collegeId") && <span className="input-success-icon">✓</span>}
            </div>
            {touched.collegeId && errors.collegeId && (
              <motion.span className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {errors.collegeId}
              </motion.span>
            )}
          </motion.div>

          {/* Password */}
          <motion.div className="form-group" variants={itemVariants} initial="hidden" animate="visible">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                className={
                  touched.password && errors.password
                    ? "error"
                    : isSuccess("password")
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
              <motion.span className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {errors.password}
              </motion.span>
            )}
            
            {/* Password strength indicator */}
            {form.password && form.password.length > 0 && (
              <motion.div
                className="password-strength"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="strength-bar">
                  <div 
                    className={`strength-level ${getStrengthClass()}`}
                    style={{ width: `${(getPasswordStrength() / 4) * 100}%` }}
                  />
                </div>
                <span className="strength-text">
                  Password strength: {getStrengthText()}
                  {getStrengthText() === "Strong" && " ✓"}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div className="form-group" variants={itemVariants} initial="hidden" animate="visible">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                className={
                  touched.confirmPassword && errors.confirmPassword
                    ? "error"
                    : isSuccess("confirmPassword")
                    ? "success"
                    : ""
                }
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <motion.span className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {errors.confirmPassword}
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
            <span>Use your college email and ID for verification. Your phone number will be shared with sellers when you book items.</span>
          </motion.div>

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
            {isLoading ? "Creating Account..." : "Create Account"}
          </motion.button>

          {/* Footer */}
          <motion.div
            className="auth-footer"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            Already have an account? <Link to="/login">Sign in</Link>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}