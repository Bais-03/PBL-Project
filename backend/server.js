const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const seedListings = require("./utils/seedListings");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

app.listen(process.env.PORT, async () => {
  console.log(`Server running on port ${process.env.PORT}`);
  await seedListings(); // ✅ AUTO INSERT
});