const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error("❌ MONGO_URI is not defined in environment variables");
    }
    
    console.log("📡 Connecting to MongoDB...");
    console.log("📡 URI:", uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    
    console.log("✅ MongoDB connected successfully");
    
    // Add connection error handlers
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });
    
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    });
    
  } catch (err) {
    console.error("❌ MongoDB connection FAILED:", err.message);
    console.error("\n🔧 Troubleshooting tips:");
    console.error("1. Make sure MongoDB is installed and running: 'mongod'");
    console.error("2. Check your MONGO_URI in .env file");
    console.error("3. If using MongoDB Atlas, check network whitelist");
    console.error("4. Try using local MongoDB: mongodb://localhost:27017/campus_exchange");
    process.exit(1);
  }
};

module.exports = connectDB;