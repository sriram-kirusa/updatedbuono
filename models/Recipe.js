const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  Name: { type: String, required: true, trim: true },
  Photo: { type: String },
  "Desc (Kirusa type of writing)": { type: String },
  "Desc (Preparation)": { type: String },
  Ingredients: { type: String },
  Calories: { type: String },
  Fat: { type: String },
  "Saturated Fat": { type: String },
  Cholesterol: { type: String },
  Sodium: { type: String },
  Sugar: { type: String },
  Protein: { type: String },
  Ratings: { type: String },
  Region: { type: String },
  Type: { type: String },
  "Food Type": { type: String },
  "Time of Eating (B)": { type: String },
  "Time of Eating (L)": { type: String },
  "Time of Eating (D)": { type: String },
  "Category (Breakfast/Lunch/Dinner/Snack/Beverages)": { type: String },
  "Category (Muscle Gain)": { type: String },
  "Category (Diabetic/BP)": { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Recipe', recipeSchema);