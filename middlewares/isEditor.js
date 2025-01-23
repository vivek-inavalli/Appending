const isAdmin = (req, res, next) => {
  if (req.user.role !== "Editor") {
    return res.status(403).send({ error: "Access denied" });
  }
  next();
};

module.exports = isEditor;
