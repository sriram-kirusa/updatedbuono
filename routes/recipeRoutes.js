const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const AdminVerifiedRecipe = require('../models/AdminVerifiedRecipe');

router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    const adminVerifiedRecipes = await AdminVerifiedRecipe.find();
    const allRecipes = [
      ...recipes.map(recipe => ({ ...recipe.toObject(), source: 'recipes' })),
      ...adminVerifiedRecipes.map(recipe => ({ ...recipe.toObject(), source: 'admin_verified_recipes' }))
    ];
    console.log('Fetched all recipes:', allRecipes.length);
    res.json({ message: 'Recipes endpoint', recipes: allRecipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Server error fetching recipes' });
  }
});

module.exports = router;