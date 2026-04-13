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

// ✅ FIXED: Simple async/await pre-save middleware
userSchema.pre("save", async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);