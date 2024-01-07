// This is a node backend server that does the following things:
// User authentication using JWT (login and registration)
// CRUD operations for blog posts (create, read, update, delete)
// Authenticated users should be able to create, read, update, and delete blog posts
// Unauthenticated users should be able to read blog posts

// Importing modules
require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");
const roleRoutes = require("./routes/role");
const communityRoutes = require("./routes/community");
const memberRoutes = require("./routes/member");
const cookieParser = require("cookie-parser");
const ensureAuthenticated = require("./middleware/ensureAuthenticated");

// Connecting to MongoDB
const mongoose = require("mongoose");

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongo-tif.i1kbreo.mongodb.net/?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use(cookieParser());
app.use(express.json());
app.use("/v1/auth", authRoutes);
app.use("/v1/", ensureAuthenticated, communityRoutes);
app.use("/v1/", ensureAuthenticated, memberRoutes);
app.use("/v1/", ensureAuthenticated, roleRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
