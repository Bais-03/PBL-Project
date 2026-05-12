const Listing = require("../models/Listing");
const User = require("../models/User");

const seedListings = async () => {
  try {
    const count = await Listing.countDocuments();
    if (count > 0) {
      console.log("✅ Listings already exist, skipping seed");
      return;
    }

    const user = await User.findOne();
    if (!user) {
      console.log("⚠️ No user found, skipping seed");
      return;
    }

    await Listing.insertMany([
      {
        title: "Engineering Mathematics I",
        category: "Textbook",  // ✅ Fixed - valid category
        semester: "1",
        description: "Used for one semester, good condition. Covers calculus, linear algebra, and differential equations.",
        condition: "Good",
        price: 299,
        priceType: "negotiable",
        contactName: user.name,
        contactPhone: user.phone || "9876543210",
        contactEmail: user.email,
        createdBy: user._id,
        status: "available"
      },
      {
        title: "Physics Lab Manual",
        category: "Notes",  // ✅ Fixed - valid category
        semester: "1",
        description: "Complete lab manual with all experiments and observations. Includes viva questions.",
        condition: "Like New",
        price: 150,
        priceType: "fixed",
        contactName: user.name,
        contactPhone: user.phone || "9876543210",
        contactEmail: user.email,
        createdBy: user._id,
        status: "available"
      },
      {
        title: "C Programming Complete Notes",
        category: "Notes",  // ✅ Fixed - valid category
        semester: "2",
        description: "Handwritten notes covering all C programming concepts. Includes examples and practice problems.",
        condition: "Good",
        price: 100,
        priceType: "negotiable",
        contactName: user.name,
        contactPhone: user.phone || "9876543210",
        contactEmail: user.email,
        createdBy: user._id,
        status: "available"
      },
      {
        title: "Scientific Calculator - Casio FX-991ES",
        category: "Electronics",  // ✅ Valid category
        semester: "",
        description: "Perfect for engineering students. Used for 2 semesters, works like new.",
        condition: "Good",
        price: 800,
        priceType: "negotiable",
        contactName: user.name,
        contactPhone: user.phone || "9876543210",
        contactEmail: user.email,
        createdBy: user._id,
        status: "available"
      }
    ]);

    console.log("✅ Dummy listings added successfully");
  } catch (err) {
    console.error("❌ Error seeding listings:", err.message);
    if (err.code === 11000) {
      console.log("Duplicate key error - listings may already exist");
    }
  }
};

module.exports = seedListings;