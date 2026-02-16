const Listing = require("../models/Listing");
const User = require("../models/User");

const seedListings = async () => {
  const count = await Listing.countDocuments();
  if (count > 0) return;

  const user = await User.findOne();
  if (!user) return;

  await Listing.insertMany([
    {
      title: "Engineering Mathematics I",
      category: "Book",
      semester: 1,
      description: "Used for one semester, good condition",
      seller: user._id
    },
    {
      title: "Physics Lab Manual",
      category: "Lab Manual",
      semester: 1,
      description: "All experiments included",
      seller: user._id
    },
    {
      title: "C Programming Notes",
      category: "Notes",
      semester: 2,
      description: "Handwritten, easy to understand",
      seller: user._id
    }
  ]);

  console.log("Dummy listings added");
};

module.exports = seedListings;