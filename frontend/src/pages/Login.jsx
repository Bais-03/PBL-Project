import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/auth.css";
import "../styles/form.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [errors, setErrors]             = useState({});
  const [touched, setTouched]           = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors(validateForm());
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await axios.post("/auth/login", { email, password });
      login(res.data.token);
      navigate("/browse");
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Login failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const itemVariants = {
    hidden:  { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
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
          <motion.h2 variants={itemVariants}>Welcome back</motion.h2>
          <motion.p variants={itemVariants}>Sign in to your Campus Exchange account</motion.p>
        </motion.div>

        {/* General error */}
        {errors.general && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="error-icon">!</span>
            {errors.general}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="login-form" noValidate>
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
                onBlur={() => handleBlur("email")}
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
                <span className="input-success-icon">&#10003;</span>
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

          {/* Password */}
          <motion.div
            className="form-group"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
                autoComplete="current-password"
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

          {/* Forgot */}
          <motion.div
            className="forgot-password"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
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
            {isLoading ? "" : "Sign In"}
          </motion.button>

          {/* Footer */}
          <motion.div
            className="login-footer"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            Don&apos;t have an account?<Link to="/register">Create account</Link>
          </motion.div>
        </form>

        {/* Social */}
        <motion.div
          className="social-login"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="divider">
            <span>Or continue with</span>
          </div>
          <div className="social-buttons">
            <button className="social-btn google" disabled={isLoading}>
              <span className="social-icon">G</span>
              Google
            </button>
            <button className="social-btn microsoft" disabled={isLoading}>
              <span className="social-icon">M</span>
              Microsoft
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}