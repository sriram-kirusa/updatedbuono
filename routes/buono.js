const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');
const UserAddedRecipe = require('../models/UserAddedRecipe');

const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};
// Profile route (protected)
router.get('/profile', (req, res) => {
  res.json({ message: 'Welcome to your profile', user: req.user });
});

// User-specific recipes (protected)
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find({ createdBy: req.user._id })
      .populate('createdBy', 'fullName email');
    res.json({
      message: 'Protected recipes endpoint',
      user: req.user.fullName,
      recipes: recipes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user recipes' });
  }
});

// Like a recipe (protected)
router.post('/like/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;

    const existingFavorite = await Favorite.findOne({ userId, recipeId });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Recipe already liked' });
    }

    const favorite = new Favorite({ userId, recipeId });
    await favorite.save();

    res.json({ message: 'Recipe liked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error liking recipe' });
  }
});

// Unlike a recipe (protected)
router.delete('/unlike/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;

    const result = await Favorite.deleteOne({ userId, recipeId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Recipe unliked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error unliking recipe' });
  }
});

// Get user’s favorite recipes (protected)
router.get('/favorites', async (req, res) => {
  try {
    const userId = req.user._id;
    const favorites = await Favorite.find({ userId }).populate('recipeId');
    const validFavorites = favorites.filter(fav => fav.recipeId !== null);
    const favoriteRecipes = validFavorites.map(fav => fav.recipeId);
    res.json({
      message: 'User favorites',
      recipes: favoriteRecipes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
});



// Add a new user recipe (protected)
router.post('/user-recipes', async (req, res) => {
  try {
    const { Name, Ingredients, "Desc (Preparation)": instructions, Region } = req.body;
    const userId = req.user._id;
    const username = req.user.fullName;

    const recipe = new UserAddedRecipe({
      Name,
      Ingredients,
      "Desc (Preparation)": instructions,
      Region,
      createdBy: userId,
      username
    });
    await recipe.save();

    res.json({ message: 'Recipe added successfully', recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding recipe' });
  }
});

// ... other routes ...



// Get all user-added recipes (admin only)
router.get('/admin/user-added-recipes', isAdmin, async (req, res) => {
  try {
    const recipes = await UserAddedRecipe.find().populate('createdBy', 'fullName email');
    console.log('Fetched user-added recipes:', recipes);
    res.json({ message: 'All user-added recipes', recipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user-added recipes' });
  }
});

// Add user-added recipe to main recipes collection (admin only)
// router.post('/admin/add-to-recipes/:recipeId', isAdmin, async (req, res) => {
//   try {
//     const { recipeId } = req.params;
//     console.log('Admin adding recipe to recipes:', recipeId);
//     const userRecipe = await UserAddedRecipe.findById(recipeId);
//     if (!userRecipe) {
//       console.log('User-added recipe not found:', recipeId);
//       return res.status(404).json({ message: 'User-added recipe not found' });
//     }

//     const newRecipe = new Recipe({
//       Name: userRecipe.Name,
//       Ingredients: userRecipe.Ingredients,
//       "Desc (Preparation)": userRecipe["Desc (Preparation)"],
//       Region: userRecipe.Region,
//       createdBy: userRecipe.createdBy
//     });
//     await newRecipe.save();
//     console.log('Recipe added to recipes:', newRecipe._id);

//     await UserAddedRecipe.deleteOne({ _id: recipeId });
//     console.log('Recipe removed from user_added_recipes:', recipeId);

//     res.json({ message: 'Recipe added to main collection', recipe: newRecipe });
//   } catch (error) {
//     console.error('Error adding recipe to main collection:', error);
//     res.status(500).json({ message: 'Server error adding recipe to main collection', error: error.message });
//   }
// });

// Delete user-added recipe (admin only)
router.delete('/admin/user-recipes/:recipeId', isAdmin, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const result = await UserAddedRecipe.deleteOne({ _id: recipeId });
    if (result.deletedCount === 0) {
      console.log(`Recipe not found for deletion: ${recipeId}`);
      return res.status(404).json({ message: 'Recipe not found' });
    }
    console.log(`Recipe deleted: ${recipeId}`);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting recipe' });
  }
});

// Update user-added recipe (admin only)
router.put('/admin/user-recipes/:recipeId', isAdmin, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const updates = req.body;

    const recipe = await UserAddedRecipe.findByIdAndUpdate(recipeId, updates, { new: true });
    if (!recipe) {
      console.log(`Recipe not found for update: ${recipeId}`);
      return res.status(404).json({ message: 'Recipe not found' });
    }
    console.log(`Recipe updated: ${recipeId}`);
    res.json({ message: 'Recipe updated successfully', recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating recipe' });
  }
});

// Like a user-added recipe (protected)
router.post('/like-user-recipe/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;

    const userRecipe = await UserAddedRecipe.findById(recipeId);
    if (!userRecipe) {
      return res.status(404).json({ message: 'User-added recipe not found' });
    }

    const existingFavorite = await Favorite.findOne({ userId, recipeId });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Recipe already liked' });
    }

    const favorite = new Favorite({ userId, recipeId });
    await favorite.save();

    res.json({ message: 'User-added recipe liked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error liking user-added recipe' });
  }
});

module.exports = router;