const { Router } = require("express");
const router = Router();
const authmiddleware = require("../middlewares/authmiddleware");
const isAdmin = require("../middlewares/isAdmin");
const { Blog, User } = require("../db");

router.post("/blogs", authmiddleware, isAdmin, async (req, res) => {
  try {
    const blog = new Blog({
      ...req.body,
      author: req.user._id,
    });

    await blog.save();
    res.status(201).send(blog);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Assign Blog to Editor (Admin Only)
router.post("/blogs/:id/assign", authmiddleware, isAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send();
    }

    // Check if blog is already assigned to an editor
    if (blog.editor) {
      return res
        .status(400)
        .send({ error: "Blog already assigned to an editor" });
    }

    const editor = await User.findById(req.body.editorId);

    if (!editor || editor.role !== "Editor") {
      return res.status(400).send({ error: "Invalid editor" });
    }

    blog.editor = editor._id;
    await blog.save();

    res.send(blog);
  } catch (error) {
    res.status(400).send(`blogs: ${error}`);
  }
});

// Edit Blog (Admin or Assigned Editor)
router.put("/blogs/:id", authmiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send();
    }

    // Admin can edit any blog
    if (req.user.role === "Admin") {
      Object.assign(blog, req.body);
      await blog.save();
      return res.send(blog);
    }

    // Editor can only edit assigned blogs
    if (
      req.user.role === "Editor" &&
      blog.editor.toString() === req.user._id.toString()
    ) {
      Object.assign(blog, req.body);
      await blog.save();
      return res.send(blog);
    }

    res.status(403).send({ error: "Not authorized to edit this blog" });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = { blogRoutes: router };
