require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const borrowRoutes = require("./routes/borrow");
const statsRoutes = require("./routes/stats");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowed", borrowRoutes);
app.use("/api/stats", statsRoutes);

app.get("/", (req, res) => {
  res.send("Bookverse API is running");
});

app.use(errorHandler);

module.exports = app;
