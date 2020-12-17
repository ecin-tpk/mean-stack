const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");
const path = require("path");

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://read-and-write:lQ0QxeXIznr3idqj@cluster0.acqq9.mongodb.net/mean-stack?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log("Connected to database");
  })
  .catch(() => {
    console.log("Connection failed");
  });

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static images
app.use("/images", express.static(path.join("backend/images")));

// Set CORS policy
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

// CRUD endpoints of Post
app.use("/api/posts", postsRoutes);

// Authentication routes
app.use("/api/user", userRoutes);

module.exports = app;
