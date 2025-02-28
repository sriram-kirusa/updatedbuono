import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SearchFilters.css";

const SearchFilters = ({ handleGoBack }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8000/api/Buono/favorites', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setFavorites(data.recipes || []))
        .catch(err => console.error('Error fetching favorites:', err));
    }
  }, []);

  const handleSearch = async () => {
    if (!name.trim() && !category && !region && !type) {
      setError("Please enter at least one filter.");
      return;
    }

    setError("");

    try {
      let query = `http://localhost:8000/api/foods/filter?`;
      if (name.trim()) query += `name=${encodeURIComponent(name)}&`;
      if (category) query += `category=${encodeURIComponent(category)}&`;
      if (region) query += `region=${encodeURIComponent(region)}&`;
      if (type) query += `Type=${encodeURIComponent(type)}&`;
      query = query.endsWith('&') ? query.slice(0, -1) : query;

      const response = await axios.get(query);
      console.log("API Response:", response.data);

      if (response.data.length > 0) {
        setRecipes(response.data);
      } else {
        setError("No recipes found.");
        setRecipes([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("No recipes found or server error.");
      setRecipes([]);
    }
  };

  const handleLike = async (recipeId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to like recipes');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/Buono/like/${recipeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setFavorites([...favorites, recipes.find(r => r._id === recipeId)]);
      } else {
        setError(result.message || 'Failed to like recipe');
      }
    } catch (err) {
      setError('Error liking recipe');
      console.error(err);
    }
  };

  const handleUnlike = async (recipeId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/Buono/unlike/${recipeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setFavorites(favorites.filter(fav => fav._id !== recipeId));
      } else {
        setError(result.message || 'Failed to unlike recipe');
      }
    } catch (err) {
      setError('Error unliking recipe');
      console.error(err);
    }
  };

  return (
    <div className="search-container">
      <h2>Search Filters</h2>

      <label>Name:</label>
      <input
        type="text"
        placeholder="Enter Recipe Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    
      <label>Type:</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Select Dietary Preference</option>
        <option value="Vegetarian Dish">Vegetarian Dish</option>
        <option value="Non-Vegetarian Dish">Non-Vegetarian Dish</option>
      </select>

      <label>Category:</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select Meal Type</option>
        <option value="Breakfast">Breakfast</option>
        <option value="Lunch">Lunch</option>
        <option value="Dinner">Dinner</option>
        <option value="Snack">Snack</option>
      </select>

      <label>Region:</label>
      <select value={region} onChange={(e) => setRegion(e.target.value)}>
        <option value="">Select Region</option>
        <option value="South Indian">South Indian</option>
        <option value="North Indian">North Indian</option>
        <option value="Chinese">Chinese</option>
        <option value="Japanese">Japanese</option>
        <option value="American">American</option>
        <option value="Italian">Italian</option>
        <option value="German">German</option>
      </select>

      <button className="submit-btn" onClick={handleSearch}>Submit</button>

      <div className="search-results">
        {error && <p className="error-message">{error}</p>}
        {recipes.length > 0 && !selectedRecipe && (
          <div className="recipe-container">
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-card">
                <h3>{recipe.Name}</h3>
                {recipe.Photo && (
                  <img
                    src={recipe.Photo}
                    alt={recipe.Name}
                    className="recipe-image"
                    onClick={() => setSelectedRecipe(recipe)}
                  />
                )}
                <button
                  className={favorites.some(fav => fav._id === recipe._id) ? 'unlike-btn' : 'like-btn'}
                  onClick={() => favorites.some(fav => fav._id === recipe._id) ? handleUnlike(recipe._id) : handleLike(recipe._id)}
                >
                  {favorites.some(fav => fav._id === recipe._id) ? 'Unlike' : 'Like'}
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedRecipe && (
          <div className="recipe-details">
            <h3>{selectedRecipe.Name}</h3>
            {selectedRecipe.Photo && <img src={selectedRecipe.Photo} alt={selectedRecipe.Name} className="recipe-image" />}
            
            <p><b>Description:</b> {selectedRecipe["Desc (Kirusa type of writing)"] || "No description available."}</p>
            <p><b>Preparation Steps:</b></p>
            <p>{selectedRecipe["Desc (Preparation)"] || "No preparation steps available."}</p>

            <p><b>Ingredients:</b> {selectedRecipe.Ingredients || "No ingredients available."}</p>
            <p><b>Calories:</b> {selectedRecipe.Calories || "N/A"}</p>
            <p><b>Fat:</b> {selectedRecipe.Fat || "N/A"}</p>
            <p><b>Saturated Fat:</b> {selectedRecipe["Saturated Fat"] || "N/A"}</p>
            <p><b>Cholesterol:</b> {selectedRecipe.Cholesterol || "N/A"}</p>
            <p><b>Sodium:</b> {selectedRecipe.Sodium || "N/A"}</p>
            <p><b>Sugar:</b> {selectedRecipe.Sugar || "N/A"}</p>
            <p><b>Protein:</b> {selectedRecipe.Protein || "N/A"}</p>

            <p><b>Ratings:</b> {selectedRecipe.Ratings || "N/A"}</p>
            <p><b>Region:</b> {selectedRecipe.Region || "N/A"}</p>
            <p><b>Type:</b> {selectedRecipe.Type || "N/A"}</p>
            <p><b>Food Type:</b> {selectedRecipe["Food Type"] || "N/A"}</p>
            <p><b>Time of Eating:</b> 
              {selectedRecipe["Time of Eating (B)"] === "Yes" ? "Breakfast " : ""} 
              {selectedRecipe["Time of Eating (L)"] === "Yes" ? "Lunch " : ""} 
              {selectedRecipe["Time of Eating (D)"] === "Yes" ? "Dinner" : ""}
            </p>
            <p><b>Category:</b> {selectedRecipe["Category (Breakfast/Lunch/Dinner/Snack/Beverages)"] || "N/A"}</p>
            <p><b>Muscle Gain Friendly:</b> {selectedRecipe["Category (Muscle Gain)"] || "N/A"}</p>
            <p><b>Diabetic/BP Friendly:</b> {selectedRecipe["Category (Diabetic/BP)"] || "N/A"}</p>

            <button className="go-back" onClick={() => setSelectedRecipe(null)}>Back</button>
          </div>
        )}
      </div>

      <button className="go-back" onClick={handleGoBack}>Go Back</button>
    </div>
  );
};

export default SearchFilters;