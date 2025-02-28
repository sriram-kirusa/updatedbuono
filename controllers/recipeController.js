const Recipe = require("../models/Recipe");

// @desc    Get recipes based on filters
// @route   GET /api/foods/filter
// @access  Public
const getRecipes = async (req, res) => {
    try {
        let query = {};

        // Filtering based on request query parameters
        if (req.query.name) {
            query.Name = { $regex: req.query.name, $options: "i" };
        }
        if (req.query.region) {
            query.Region = { $regex: req.query.region, $options: "i" };
        }
        if (req.query.foodType) {
            query.FoodType = { $regex: req.query.foodType, $options: "i" };
        }
        if (req.query.category) {
            query.Category = { $regex: req.query.category, $options: "i" };
        }

        const recipes = await Recipe.find(query);
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getRecipes };

