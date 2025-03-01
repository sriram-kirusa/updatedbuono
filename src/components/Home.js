import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchFilters from './SearchFilters';
import './Home.css';

function Home({ setIsAuthenticated }) {
  const [profileData, setProfileData] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ Name: '', Ingredients: '', "Desc (Preparation)": '', Region: '' });
  const [selectedDish, setSelectedDish] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        const recipeResponse = await fetch('http://localhost:8000/api/foods');
        if (!recipeResponse.ok) {
          const text = await recipeResponse.text();
          console.error('Failed to fetch recipes:', recipeResponse.status, text);
          setError('Failed to fetch recipes');
          return;
        }
        const recipeData = await recipeResponse.json();
        console.log('Fetched recipes:', recipeData.recipes);
        setRecipes(recipeData.recipes || []);
        setFilteredRecipes(recipeData.recipes || []);
      } catch (err) {
        setError('Error fetching recipes');
        console.error('Fetch error:', err);
      }

      if (token) {
        try {
          const profileResponse = await fetch('http://localhost:8000/api/Buono/profile', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const profileData = await profileResponse.json();
          if (profileResponse.ok) {
            setProfileData(profileData);
          } else {
            setError(profileData.message || 'Failed to fetch profile');
          }
        } catch (err) {
          setError('Error fetching profile');
          console.error(err);
        }

        try {
          const favResponse = await fetch('http://localhost:8000/api/Buono/favorites', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const favData = await favResponse.json();
          if (favResponse.ok) {
            setFavorites(favData.recipes || []);
          }
        } catch (err) {
          console.error('Error fetching favorites:', err);
        }
      } else {
        setError('Please sign in to access profile and favorites');
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = recipes.filter((recipe) =>
      recipe.Name.toLowerCase().includes(query) ||
      (recipe.Ingredients && recipe.Ingredients.toLowerCase().includes(query))
    );
    setFilteredRecipes(filtered);
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

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to add recipes');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/Buono/user-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRecipe)
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to add recipe:', response.status, text);
        setError(`Failed to add recipe: ${response.status} - ${text}`);
        return;
      }
      const result = await response.json();
      console.log('Recipe added successfully:', result);
      setRecipes([...recipes, result.recipe]);
      setFilteredRecipes([...recipes, result.recipe]);
      setNewRecipe({ Name: '', Ingredients: '', "Desc (Preparation)": '', Region: '' });
      setShowAddRecipe(false);
    } catch (err) {
      setError('Error adding recipe');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setProfileData(null);
    setFavorites([]);
    setShowProfile(false);
    setShowFavorites(false);
    setShowFilters(false);
    setShowAddRecipe(false);
    setSelectedDish(null);
    navigate('/');
  };

  const handleGoBack = () => {
    setShowFilters(false);
    setShowFavorites(false);
    setShowProfile(false);
    setShowAddRecipe(false);
    setSelectedDish(null);
  };

  const getInitialImage = (name) => {
    if (!name) return null;
    const initial = name[0].toUpperCase();
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d', '#f7d794'];
    const color = colors[initial.charCodeAt(0) % colors.length];
    return (
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 auto'
        }}
      >
        {initial}
      </div>
    );
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="home-container">
      <div className="sidebar">
        <h2 className="sidebar-logo">BUONO</h2>
        <ul className="menu-list">
          <li onClick={() => { setShowFilters(false); setShowFavorites(false); setShowProfile(false); setShowAddRecipe(false); setSelectedDish(null); }}>Home</li>
          <li>My Recipes</li>
          <li onClick={() => { setShowFavorites(true); setShowProfile(false); setShowAddRecipe(false); setSelectedDish(null); }}>Favorites</li>
          <li onClick={() => { setShowProfile(true); setShowFavorites(false); setShowAddRecipe(false); setSelectedDish(null); }}>Profile</li>
          <li onClick={() => { setShowFilters(true); setShowProfile(false); setShowAddRecipe(false); setSelectedDish(null); }}>Search Filters</li>
          <li onClick={isLoggedIn ? handleLogout : () => navigate('/')}>
            {isLoggedIn ? 'Logout' : 'Login'}
          </li>
        </ul>
      </div>
      <div className="main-content">
        {showFilters ? (
          <SearchFilters handleGoBack={handleGoBack} />
        ) : showFavorites ? (
          <div className="content-area">
            <h1>Your Favorites</h1>
            {favorites.length > 0 ? (
              <ul className="recipe-list">
                {favorites.map((recipe) => (
                  <li key={recipe._id} className="recipe-item">
                    <h4>{recipe.Name}</h4>
                    <p><strong>Ingredients:</strong> {recipe.Ingredients || 'N/A'}</p>
                    <p><strong>Instructions:</strong> {recipe["Desc (Preparation)"] || 'N/A'}</p>
                    <p><strong>Region:</strong> {recipe.Region || 'N/A'}</p>
                    <button
                      className="unlike-btn"
                      onClick={() => handleUnlike(recipe._id)}
                    >
                      Unlike
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No favorite recipes yet</p>
            )}
          </div>
        ) : showProfile ? (
          <div className="content-area">
            <h1>Profile</h1>
            {profileData ? (
              <>
                {getInitialImage(profileData.user.fullName)}
                <h2>{profileData.user.fullName}</h2>
                <h3>Favorite Recipes</h3>
                {favorites.length > 0 ? (
                  <ul className="recipe-list">
                    {favorites.map((recipe) => (
                      <li key={recipe._id} className="recipe-item">
                        <h4>{recipe.Name}</h4>
                        <p><strong>Ingredients:</strong> {recipe.Ingredients || 'N/A'}</p>
                        <p><strong>Instructions:</strong> {recipe["Desc (Preparation)"] || 'N/A'}</p>
                        <p><strong>Region:</strong> {recipe.Region || 'N/A'}</p>
                        <button
                          className="unlike-btn"
                          onClick={() => handleUnlike(recipe._id)}
                        >
                          Unlike
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No favorites yet</p>
                )}
                <button className="add-recipe-btn" onClick={() => setShowAddRecipe(true)}>
                  Add Recipe
                </button>
                {showAddRecipe && (
                  <form onSubmit={handleAddRecipe} className="add-recipe-form">
                    <h3>Add New Recipe</h3>
                    <input
                      type="text"
                      placeholder="Recipe Name"
                      value={newRecipe.Name}
                      onChange={(e) => setNewRecipe({ ...newRecipe, Name: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Ingredients (comma-separated)"
                      value={newRecipe.Ingredients}
                      onChange={(e) => setNewRecipe({ ...newRecipe, Ingredients: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Preparation Instructions"
                      value={newRecipe["Desc (Preparation)"]}
                      onChange={(e) => setNewRecipe({ ...newRecipe, "Desc (Preparation)": e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Region"
                      value={newRecipe.Region}
                      onChange={(e) => setNewRecipe({ ...newRecipe, Region: e.target.value })}
                    />
                    <button type="submit" className="submit-btn">Submit</button>
                    <button type="button" className="go-back" onClick={() => setShowAddRecipe(false)}>Cancel</button>
                  </form>
                )}
              </>
            ) : (
              <p>Please sign in to view your profile</p>
            )}
          </div>
        ) : selectedDish ? (
          <div className="content-area recipe-details">
            <h1>{selectedDish.Name}</h1>
            {selectedDish.Photo && (
              <img src={selectedDish.Photo} alt={selectedDish.Name} className="recipe-image" />
            )}
            <p><strong>Desc (Kirusa type of writing):</strong> {selectedDish["Desc (Kirusa type of writing)"] || 'N/A'}</p>
            <p><strong>Desc (Preparation):</strong> {selectedDish["Desc (Preparation)"] || 'N/A'}</p>
            <p><strong>Region:</strong> {selectedDish.Region || 'N/A'}</p>
            <p><strong>Time of Eating (B):</strong> {selectedDish["Time of Eating (B)"] || 'N/A'}</p>
            <p><strong>Time of Eating (L):</strong> {selectedDish["Time of Eating (L)"] || 'N/A'}</p>
            <p><strong>Time of Eating (D):</strong> {selectedDish["Time of Eating (D)"] || 'N/A'}</p>
            <p><strong>Food Type:</strong> {selectedDish["Food Type"] || 'N/A'}</p>
            <p><strong>Ratings:</strong> {selectedDish.Ratings || 'N/A'}</p>
            <p><strong>Ingredients:</strong> {selectedDish.Ingredients || 'N/A'}</p>
            <p><strong>Calories:</strong> {selectedDish.Calories || 'N/A'}</p>
            <p><strong>Fat:</strong> {selectedDish.Fat || 'N/A'}</p>
            <p><strong>Protein:</strong> {selectedDish.Protein || 'N/A'}</p>
            <p><strong>Cholesterol:</strong> {selectedDish.Cholesterol || 'N/A'}</p>
            <p><strong>Sodium:</strong> {selectedDish.Sodium || 'N/A'}</p>
            <p><strong>Saturated Fat:</strong> {selectedDish["Saturated Fat"] || 'N/A'}</p>
            <p><strong>Sugar:</strong> {selectedDish.Sugar || 'N/A'}</p>
            <p><strong>Type:</strong> {selectedDish.Type || 'N/A'}</p>
            <p><strong>Food Type (Veg/Non-Veg/Vegan):</strong> {selectedDish["Food Type (Veg/Non-Veg/Vegan)"] || selectedDish["Food Type"] || 'N/A'}</p>
            <p><strong>Category (Breakfast/Lunch/Dinner/Snack/Beverages):</strong> {selectedDish["Category (Breakfast/Lunch/Dinner/Snack/Beverages)"] || 'N/A'}</p>
            <p><strong>Category (Diabetic/BP):</strong> {selectedDish["Category (Diabetic/BP)"] || 'N/A'}</p>
            <p><strong>Category (Muscle Gain):</strong> {selectedDish["Category (Muscle Gain)"] || 'N/A'}</p>
            {selectedDish.username && (
              <p><strong>Added by:</strong> {selectedDish.username}</p>
            )}
            {selectedDish.timestamp && (
              <p><strong>Added on:</strong> {new Date(selectedDish.timestamp).toLocaleString()}</p>
            )}
            <button className="go-back" onClick={() => setSelectedDish(null)}>Back</button>
          </div>
        ) : (
          <>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search recipes..."
                className="search-input"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="content-area">
              <h1>Welcome to BUONO</h1>
              <p>Your personal recipe finder</p>
              {error && <p className="error-message">{error}</p>}
              {profileData && (
                <div>
                  <h2>{profileData.message}</h2>
                  <p>User: {profileData.user.fullName}</p>
                </div>
              )}
              <h3>All Recipes</h3>
              {filteredRecipes.length > 0 ? (
                <ul className="recipe-list">
                  {filteredRecipes.map((recipe) => (
                    <li key={recipe._id} className="recipe-item" onClick={() => setSelectedDish(recipe)}>
                      <h4>{recipe.Name}</h4>
                      <p><strong>Ingredients:</strong> {recipe.Ingredients || 'N/A'}</p>
                      <p><strong>Instructions:</strong> {recipe["Desc (Preparation)"] || 'N/A'}</p>
                      <p><strong>Region:</strong> {recipe.Region || 'N/A'}</p>
                      <button
                        className={favorites.some(fav => fav._id === recipe._id) ? 'unlike-btn' : 'like-btn'}
                        onClick={(e) => {
                          e.stopPropagation();
                          favorites.some(fav => fav._id === recipe._id) ? handleUnlike(recipe._id) : handleLike(recipe._id);
                        }}
                      >
                        {favorites.some(fav => fav._id === recipe._id) ? 'Unlike' : 'Like'}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recipes match your search</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
