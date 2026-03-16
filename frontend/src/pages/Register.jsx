import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axios";
import "../styles/auth.css";
import "../styles/form.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    collegeId: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [errors, setErrors]             = useState({});
  const [touched, setTouched]           = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.collegeId.trim()) {
      newErrors.collegeId = "College ID is required";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors(validateForm());
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (touched[field]) {
      setErrors(validateForm());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ name: true, email: true, collegeId: true, password: true });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await axios.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const itemVariants = {
    hidden:  { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const isSuccess = (field) =>
    touched[field] && !errors[field] && form[field];

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

        <form onSubmit={handleSubmit} className="login-form" noValidate>
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
              {isSuccess("name") && <span className="input-success-icon">&#10003;</span>}
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
              {isSuccess("email") && <span className="input-success-icon">&#10003;</span>}
            </div>
            {touched.email && errors.email && (
              <motion.span className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {errors.email}
              </motion.span>
            )}
          </motion.div>

          {/* College ID */}
          <motion.div className="form-group" variants={itemVariants} initial="hidden" animate="visible">
            <label htmlFor="collegeId">College ID</label>
            <div className="input-wrapper">
              <input
                id="collegeId"
                type="text"
                placeholder="e.g. CS21B1042"
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
              {isSuccess("collegeId") && <span className="input-success-icon">&#10003;</span>}
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
          </motion.div>

          {/* Submit */}
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
            {isLoading ? "" : "Create Account"}
          </motion.button>

          {/* Footer */}
          <motion.div
            className="login-footer"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            Already have an account?<Link to="/login">Sign in</Link>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}