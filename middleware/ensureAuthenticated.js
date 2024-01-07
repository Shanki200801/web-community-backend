function ensureAuthenticated(req, res, next) {
  // Check if the user's ID is stored in a cookie
  if (req.cookies.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized (middleware)" });
  }
}

module.exports = ensureAuthenticated;
