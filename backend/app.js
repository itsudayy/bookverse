require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const borrowRoutes = require("./routes/borrow");
const statsRoutes = require("./routes/stats");
const communityRoutes = require("./routes/community");
const pointsRoutes = require("./routes/points");
const reviewRoutes = require("./routes/reviews");
const notificationRoutes = require("./routes/notifications");
const wishlistRoutes = require("./routes/wishlist");
const storeRoutes = require("./routes/store");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");
const adminRoutes = require("./routes/admin");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowed", borrowRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Bookverse API is running");
});

app.use(errorHandler);

module.exports = app;
