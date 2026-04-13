const Listing = require("../models/Listing");

// CREATE LISTING
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      semester,
      price,
      priceType,
      contactName,
      contactPhone,
      contactEmail,
      contactWhatsapp,
      preferMode,
      availability,
      image,
      images,  // Add this line to receive images array
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !contactName) {
      return res.status(400).json({ 
        message: "Missing required fields" 
      });
    }

    const listing = new Listing({
      title,
      description,
      category,
      condition: condition || "",
      semester: semester || "",
      price: price || 0,
      priceType: priceType || "negotiable",
      contactName,
      contactPhone: contactPhone || "",
      contactEmail: contactEmail || "",
      contactWhatsapp: contactWhatsapp || "",
      preferMode: preferMode || "",
      availability: availability || "",
      image: image || "",
      images: images || [],  // Add this line to save images array
      createdBy: req.user.id,
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({ 
      message: "Failed to create listing",
      error: error.message 
    });
  }
};

// GET ALL LISTINGS (Browse page)
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error("Fetch listings error:", error);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
};

// GET SINGLE LISTING BY ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    console.error("Fetch listing error:", error);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
};