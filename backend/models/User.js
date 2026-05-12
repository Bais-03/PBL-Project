const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    collegeId: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: "",
    },
    college: {
      type: String,
      default: "",
    },
    semester: {
      type: Number,
      default: null,
    },
    department: {
      type: String,
      default: "",
    },
    graduationYear: {
      type: Number,
      default: null,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    socialLinks: {
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ❌ REMOVED the problematic pre-save middleware
// We'll hash passwords in the controller instead

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);