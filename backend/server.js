
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./Middleware/errorHandler");

const app = express();

// Connect database
connectDB();

// Middleware
app.use(cors({
  origin: "https://saarthi-kappa-umber.vercel.app",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/doctors", require("./routes/doctor"));
app.use("/api/patients", require("./routes/patient"));

// Test Route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Error Handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
