import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPortal.css';

function AdminPortal({ setIsAuthenticated }) {
  const [userAddedRecipes, setUserAddedRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ Name: '', Ingredients: '', "Desc (Preparation)": '', Region: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [error, setError] = useState('');
  const [view, setView] = useState('user_added_recipes');
  const [editRecipe, setEditRecipe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/admin-login');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Fetching user-added recipes with token:', token.substring(0, 10) + '...');
        const recipesResponse = await fetch('http://localhost:8000/api/Buono/admin/user-added-recipes', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!recipesResponse.ok) {
          const text = await recipesResponse.text();
          console.error('Recipes fetch failed:', recipesResponse.status, text);
          setError(`Failed to fetch recipes: ${recipesResponse.status} - ${text}`);
          if (recipesResponse.status === 401) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            navigate('/admin-login');
            return;
          }
          return;
        }
        const recipesData = await recipesResponse.json();
        console.log('User-added recipes fetched:', recipesData);
        setUserAddedRecipes(recipesData.recipes || []);
        setFilteredRecipes(recipesData.recipes || []);

        const favResponse = await fetch('http://localhost:8000/api/Buono/favorites', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!favResponse.ok) {
          const favText = await favResponse.text();
          console.error('Favorites fetch failed:', favResponse.status, favText);
        }
        const favData = await favResponse.json();
        setFavorites(favData.recipes || []);
      } catch (err) {
        setError('Error fetching data');
        console.error('Fetch error:', err);
      }
    };

    fetchData();
  }, [navigate, setIsAuthenticated]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = userAddedRecipes.filter((recipe) =>
      recipe.Name.toLowerCase().includes(query) ||
      (recipe.Ingredients && recipe.Ingredients.toLowerCase().includes(query))
    );
    setFilteredRecipes(filtered);
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/Buono/user-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRecipe)
      });
      const result = await response.json();
      if (response.ok) {
        setUserAddedRecipes([...userAddedRecipes, result.recipe]);
        setFilteredRecipes([...userAddedRecipes, result.recipe]);
        setNewRecipe({ Name: '', Ingredients: '', "Desc (Preparation)": '', Region: '' });
        setView('user_added_recipes');
      } else {
        setError(result.message || 'Failed to add recipe');
      }
    } catch (err) {
      setError('Error adding recipe');
      console.error(err);
    }
  };

  const handleLike = async (recipeId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/Buono/like-user-recipe/${recipeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        const likedRecipe = userAddedRecipes.find(r => r._id === recipeId);
        if (likedRecipe) setFavorites([...favorites, likedRecipe]);
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
        setFavorites(favorites.filter(fav => fav && fav._id !== recipeId));
      } else {
        setError(result.message || 'Failed to unlike recipe');
      }
    } catch (err) {
      setError('Error unliking recipe');
      console.error(err);
    }
  };

  const handleAddToMongoDB = async (recipeId) => {
    console.log('Attempting to add recipe to MongoDB:', recipeId);
    try {
      const response = await fetch(`http://localhost:8000/api/admin/add-to-recipes/${recipeId}`, {
        method: 'POST', // No Authorization header needed
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('Add to MongoDB failed:', response.status, text);
        setError(`Failed to add recipe to MongoDB: ${response.status} - ${text}`);
        return;
      }
      const result = await response.json();
      console.log('Add to MongoDB response:', response.status, result);
      setUserAddedRecipes(userAddedRecipes.filter(r => r._id !== recipeId));
      setFilteredRecipes(filteredRecipes.filter(r => r._id !== recipeId));
    } catch (err) {
      setError('Error adding recipe to MongoDB');
      console.error('Add to MongoDB error:', err);
    }
  };

  const handleDelete = async (recipeId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/Buono/admin/user-recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setUserAddedRecipes(userAddedRecipes.filter(r => r._id !== recipeId));
        setFilteredRecipes(filteredRecipes.filter(r => r._id !== recipeId));
      } else {
        setError(result.message || 'Failed to delete recipe');
      }
    } catch (err) {
      setError('Error deleting recipe');
      console.error(err);
    }
  };

  const handleUpdate = async (e, recipeId) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/Buono/admin/user-recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editRecipe)
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}: ${text}`);
      }
      const result = await response.json();
      if (response.ok) {
        setUserAddedRecipes(userAddedRecipes.map(r => r._id === recipeId ? result.recipe : r));
        setFilteredRecipes(filteredRecipes.map(r => r._id === recipeId ? result.recipe : r));
        setEditRecipe(null);
      } else {
        setError(result.message || 'Failed to update recipe');
      }
    } catch (err) {
      setError('Error updating recipe');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="admin-portal-container">
      <div className="sidebar">
        <h2 className="sidebar-logo">BUONO Admin</h2>
        <ul className="menu-list">
          <li onClick={() => { setView('user_added_recipes'); setEditRecipe(null); }}>User Added Recipes</li>
          <li onClick={() => { setView('favorites'); setEditRecipe(null); }}>Favorites</li>
          <li onClick={() => { setView('add_recipe'); setEditRecipe(null); }}>Add Recipe</li>
          <li onClick={() => { setView('add'); setEditRecipe(null); }}>Add</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      <div className="main-content">
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
          {error && <p className="error-message">{error}</p>}
          {view === 'user_added_recipes' && (
            <>
              <h1>User Added Recipes</h1>
              {filteredRecipes.length > 0 ? (
                <ul className="recipe-list">
                  {filteredRecipes.map((recipe) => (
                    <li key={recipe._id} className="recipe-item">
                      {editRecipe && editRecipe._id === recipe._id ? (
                        <form onSubmit={(e) => handleUpdate(e, recipe._id)} className="edit-form">
                          <input
                            type="text"
                            value={editRecipe.Name}
                            onChange={(e) => setEditRecipe({ ...editRecipe, Name: e.target.value })}
                            required
                          />
                          <input
                            type="text"
                            value={editRecipe.Ingredients}
                            onChange={(e) => setEditRecipe({ ...editRecipe, Ingredients: e.target.value })}
                            required
                          />
                          <textarea
                            value={editRecipe["Desc (Preparation)"]}
                            onChange={(e) => setEditRecipe({ ...editRecipe, "Desc (Preparation)": e.target.value })}
                            required
                          />
                          <input
                            type="text"
                            value={editRecipe.Region}
                            onChange={(e) => setEditRecipe({ ...editRecipe, Region: e.target.value })}
                          />
                          <button type="submit" className="submit-btn">Save</button>
                          <button type="button" className="cancel-btn" onClick={() => setEditRecipe(null)}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <h4>{recipe.Name}</h4>
                          <p><strong>Ingredients:</strong> {recipe.Ingredients || 'N/A'}</p>
                          <p><strong>Instructions:</strong> {recipe["Desc (Preparation)"] || 'N/A'}</p>
                          <p><strong>Region:</strong> {recipe.Region || 'N/A'}</p>
                          <p><strong>Added by:</strong> {recipe.username}</p>
                          <p><strong>Added on:</strong> {new Date(recipe.timestamp).toLocaleString()}</p>
                          <button
                            className={favorites.some(fav => fav && fav._id === recipe._id) ? 'unlike-btn' : 'like-btn'}
                            onClick={() => favorites.some(fav => fav && fav._id === recipe._id) ? handleUnlike(recipe._id) : handleLike(recipe._id)}
                          >
                            {favorites.some(fav => fav && fav._id === recipe._id) ? 'Unlike' : 'Like'}
                          </button>
                          <button className="add-to-mongo-btn" onClick={() => handleAddToMongoDB(recipe._id)}>
                            Add to MongoDB
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(recipe._id)}>
                            Delete
                          </button>
                          <button className="update-btn" onClick={() => setEditRecipe(recipe)}>
                            Update
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No user-added recipes found</p>
              )}
            </>
          )}
          {view === 'favorites' && (
            <>
              <h1>Favorites</h1>
              {favorites.length > 0 ? (
                <ul className="recipe-list">
                  {favorites.map((recipe) => recipe && (
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
            </>
          )}
          {view === 'add_recipe' && (
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
            </form>
          )}
          {view === 'add' && (
            <>
              <h1>All User-Added Recipes</h1>
              {userAddedRecipes.length > 0 ? (
                <ul className="recipe-list">
                  {userAddedRecipes.map((recipe) => (
                    <li key={recipe._id} className="recipe-item">
                      {editRecipe && editRecipe._id === recipe._id ? (
                        <form onSubmit={(e) => handleUpdate(e, recipe._id)} className="edit-form">
                          <input
                            type="text"
                            value={editRecipe.Name}
                            onChange={(e) => setEditRecipe({ ...editRecipe, Name: e.target.value })}
                            required
                          />
                          <input
                            type="text"
                            value={editRecipe.Ingredients}
                            onChange={(e) => setEditRecipe({ ...editRecipe, Ingredients: e.target.value })}
                            required
                          />
                          <textarea
                            value={editRecipe["Desc (Preparation)"]}
                            onChange={(e) => setEditRecipe({ ...editRecipe, "Desc (Preparation)": e.target.value })}
                            required
                          />
                          <input
                            type="text"
                            value={editRecipe.Region}
                            onChange={(e) => setEditRecipe({ ...editRecipe, Region: e.target.value })}
                          />
                          <button type="submit" className="submit-btn">Save</button>
                          <button type="button" className="cancel-btn" onClick={() => setEditRecipe(null)}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <h4>{recipe.Name}</h4>
                          <p><strong>Ingredients:</strong> {recipe.Ingredients || 'N/A'}</p>
                          <p><strong>Instructions:</strong> {recipe["Desc (Preparation)"] || 'N/A'}</p>
                          <p><strong>Region:</strong> {recipe.Region || 'N/A'}</p>
                          <p><strong>Added by:</strong> {recipe.username}</p>
                          <p><strong>Added on:</strong> {new Date(recipe.timestamp).toLocaleString()}</p>
                          <button className="add-to-mongo-btn" onClick={() => handleAddToMongoDB(recipe._id)}>
                            Add to MongoDB
                          </button>
                          <button className="update-btn" onClick={() => setEditRecipe(recipe)}>
                            Edit
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No user-added recipes found</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;