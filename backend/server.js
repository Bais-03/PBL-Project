const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const seedListings = require("./utils/seedListings");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for images

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
// ADD THIS LINE
app.use("/api/users", require("./routes/userRoutes"));

app.listen(process.env.PORT, async () => {
  console.log(`Server running on port ${process.env.PORT}`);
  await seedListings(); // ✅ AUTO INSERT
});