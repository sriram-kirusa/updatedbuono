const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectMongoDB = require("./config/dbr");
const recipeRoutes = require("./routes/recipeRoutes");
const authRoutes = require("./routes/authRoutes");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Allow React frontend
  credentials: true
}));

connectMongoDB();

const PORT = process.env.PORT || 8000;

app.use("/api/foods", recipeRoutes);
app.use("/api", authRoutes); // Add authentication routes

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});