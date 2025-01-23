const Router = require("express");
const router = Router();
const authMiddleware = require("../middlewares/authmiddleware");
const { Blog } = require("../db");
const { Comment } = require("../db");

router.post("/blogs/:id/comments", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send();
    }

    const comment = new Comment({
      content: req.body.content,
      blog: Blog._id,
      user: req.user._id,
    });

    await comment.save();
    blog.comments.push(comment._id);
    await blog.save();

    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete Own Comment
router.delete("/comments/:id", authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).send();
    }

    // User can only delete their own comments
    if (comment.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .send({ error: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();

    // Remove comment reference from blog
    await Blog.findByIdAndUpdate(comment.blog, {
      $pull: { comments: comment._id },
    });

    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = { commentRoutes: router };
