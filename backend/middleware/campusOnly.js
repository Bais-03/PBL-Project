const campusOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: "Campus access only" });
  }
  next();
};

module.exports = campusOnly;