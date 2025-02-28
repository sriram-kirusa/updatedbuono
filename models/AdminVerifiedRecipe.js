const mongoose = require('mongoose');

const adminVerifiedRecipeSchema = new mongoose.Schema({
  Name: { type: String, required: true, trim: true },
  Ingredients: { type: String, required: true },
  "Desc (Preparation)": { type: String, required: true },
  Region: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminVerifiedRecipe', adminVerifiedRecipeSchema);