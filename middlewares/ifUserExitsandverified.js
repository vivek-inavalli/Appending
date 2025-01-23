const { User } = require("../db");
const bcrypt = require("bcryptjs");

const ifUserExitsandverified = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("email and password are required.");
  }

  try {
    const getUser = await User.findOne({ email });

    if (!getUser) {
      return res.status(404).send("User does not exist.");
    }

    const isPasswordCorrect = await bcrypt.compare(password, getUser.password);

    if (!isPasswordCorrect) {
      return res.status(401).send("Invalid password.");
    }

    if (!getUser.verified) {
      return res
        .status(403)
        .send("User is not verified. Please verify your email.");
    }

    next();
  } catch (error) {
    console.error("Error in ifUserExitsandVerified middleware:", error);
    res.status(500).send("Internal server error.");
  }
};

module.exports = ifUserExitsandverified;
