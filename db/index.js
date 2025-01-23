const mongoose = require("mongoose");
require("dotenv").config();

const connection = () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.log(`Connection error: ${error}`);
  }
};

connection();

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Editor", "User"], default: "User" },
  verified: { type: Boolean, required: true, default: false },
});

// Blog Schema
const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  editor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

// Comment Schema
const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Blog = mongoose.model("Blog", BlogSchema);
const Comment = mongoose.model("Comment", CommentSchema);

module.exports = { User, Blog, Comment };
