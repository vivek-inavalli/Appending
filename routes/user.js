const { Router } = require("express");
const router = Router();
const { User } = require("../db");
const bcrpyt = require("bcryptjs");
const { sendVerificationEmail } = require("../middlewares/Email.config");
const jwt = require("jsonwebtoken");
const ifUserExitsandverified = require("../middlewares/ifUserExitsandverified");

//this router is used for user signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.send({ error: "All fields are required" }).status(400);
    }
    const userexits = await User.findOne({ email });
    if (userexits) {
      res.send({ error: "User already exits" }).status(400);
    }
    const hashedPassword = await bcrpyt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      verified: false,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });
    sendVerificationEmail(newUser, token);

    res.send("user created, verify ur email").status(200);
  } catch (error) {
    console.log(`error: ${error}`);
  }
});

//this router is for verifying the link
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send("Invalid token.");
    }

    user.verified = true;
    await user.save();

    res.status(200).send("Email successfully verified.");
  } catch (error) {
    res.status(400).send("Invalid or expired token.");
  }
});

//this router is for user login
router.post("/login", ifUserExitsandverified, async (req, res) => {
  const { email, password } = req.body;
  try {
    const getUser = await User.findOne({ email });
    if (!getUser) {
      res.send({ error: "Login Failed" }).status(401);
    }
    const passwordMatched = await bcrpyt.compare(password, getUser.password);
    if (!passwordMatched) {
      res.send({ error: "Login Failed" }).status(401);
    }
    const token = await jwt.sign({ id: getUser._id }, process.env.JWT_SECRET, {
      expiresIn: 30,
    });
    res.send({ token }).status(200);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

module.exports = { userRouter: router };
