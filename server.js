const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const connectMongoDB = require("./config/dbr");
const { authenticate } = require("./middleware/authMiddle");

const recipeRoutes = require("./routes/recipeRoutes");
const buonoRoutes = require("./routes/buono");
const authRoutes = require("./routes/auth");
const Recipe = require("./models/Recipe");
const UserAddedRecipe = require("./models/UserAddedRecipe");
const AdminVerifiedRecipe = require("./models/AdminVerifiedRecipe"); // New import

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

connectMongoDB();

const PORT = process.env.PORT || 8000;

// Admin route to add to admin_verified_recipes (no authentication)
app.post('/api/admin/add-to-recipes/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    console.log('Admin adding recipe to admin_verified_recipes:', recipeId);
    const userRecipe = await UserAddedRecipe.findById(recipeId);
    if (!userRecipe) {
      console.log('User-added recipe not found:', recipeId);
      return res.status(404).json({ message: 'User-added recipe not found' });
    }

    const newRecipe = new AdminVerifiedRecipe({
      Name: userRecipe.Name,
      Ingredients: userRecipe.Ingredients,
      "Desc (Preparation)": userRecipe["Desc (Preparation)"],
      Region: userRecipe.Region,
      createdBy: userRecipe.createdBy,
      username: userRecipe.username
    });
    await newRecipe.save();
    console.log('Recipe added to admin_verified_recipes:', newRecipe._id);

    await UserAddedRecipe.deleteOne({ _id: recipeId });
    console.log('Recipe removed from user_added_recipes:', recipeId);

    res.json({ message: 'Recipe added to admin verified collection', recipe: newRecipe });
  } catch (error) {
    console.error('Error adding recipe to admin verified collection:', error);
    res.status(500).json({ message: 'Server error adding recipe to admin verified collection', error: error.message });
  }
});

app.use("/api/foods", recipeRoutes);
app.use("/api/Buono", authenticate, buonoRoutes);
app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;