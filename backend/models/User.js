const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    collegeId: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    phone: { type: String, default: "" },
    college: { type: String, default: "" },
    semester: { type: String, default: "" },
    department: { type: String, default: "" },
    graduationYear: { type: Number, default: null },
    bio: { type: String, default: "" },
    socialLinks: {
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" }
    },
    // Password reset fields
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);