const Listing = require("../models/Listing");

exports.getListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate(
      "seller",
      "name email"
    );
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch listings" });
  }
};

exports.createListing = async (req, res) => {
  try {
    const { title, category, semester, description } = req.body;

    if (!title || !category || !semester) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const listing = await Listing.create({
      title,
      category,
      semester,
      description,
      seller: req.user.id
    });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to create listing" });
  }
};