const express = require("express");
const app = express();
const { userRouter } = require("./routes/user");
const { blogRoutes } = require("./routes/blogs");
const { commentRoutes } = require("./routes/comments");
require("dotenv").config();

app.use(express.json());
app.use("/user", userRouter);
app.use("/getblogs", blogRoutes);
app.use("/gtcomments", commentRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3000");
});
