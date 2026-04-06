const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Configure email transporter (Update with your email service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Forgot password - send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that email doesn't exist for security
      return res.status(200).json({ 
        message: "If your email is registered, you will receive a password reset link" 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    // Set token expiry (1 hour)
    const resetPasswordExpires = Date.now() + 3600000;
    
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Email content
    const mailOptions = {
      from: `"Campus Exchange" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request - Campus Exchange",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Campus Exchange</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">Reset Your Password</h2>
            <p style="color: #4b5563;">Hello ${user.name},</p>
            <p style="color: #4b5563;">We received a request to reset your password for your Campus Exchange account.</p>
            <p style="color: #4b5563;">Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #4b5563;">If you didn't request this, please ignore this email.</p>
            <p style="color: #4b5563;">This link will expire in 1 hour.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px;">If the button doesn't work, copy and paste this link:<br>${resetUrl}</p>
          </div>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: "If your email is registered, you will receive a password reset link" 
    });
    
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to process request. Please try again." });
  }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(200).json({ valid: false });
    }
    
    res.status(200).json({ valid: true });
    
  } catch (err) {
    console.error("Verify token error:", err);
    res.status(500).json({ valid: false });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    res.status(200).json({ message: "Password reset successfully" });
    
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
};