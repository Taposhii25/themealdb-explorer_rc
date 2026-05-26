import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryMeals, setCategoryMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/search?q=${searchQuery}`);
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const response = await axios.get(`/api/category/${category}`);
      setCategoryMeals(response.data.meals || []);
    } catch (error) {
      console.error('Error fetching category meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealClick = async (mealId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/meal/${mealId}`);
      setSelectedMeal(response.data);
    } catch (error) {
      console.error('Error fetching meal details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomMeal = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/random');
      setSelectedMeal(response.data);
    } catch (error) {
      console.error('Error fetching random meal:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMeal(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🍽️ TheMealDB Explorer</h1>
        <p>Discover delicious recipes from around the world</p>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === 'search' ? 'active' : ''} 
          onClick={() => setActiveTab('search')}
        >
          🔍 Search Recipes
        </button>
        <button 
          className={activeTab === 'categories' ? 'active' : ''} 
          onClick={() => setActiveTab('categories')}
        >
          📂 Browse Categories
        </button>
        <button 
          className={activeTab === 'random' ? 'active' : ''} 
          onClick={() => setActiveTab('random')}
        >
          🎲 I'm Feeling Hungry
        </button>
      </div>

      <div className="content">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="search-tab">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for a meal... (e.g., chicken, pasta, cake)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
            </form>
            
            <div className="meals-grid">
              {searchResults.map(meal => (
                <div key={meal.idMeal} className="meal-card" onClick={() => handleMealClick(meal.idMeal)}>
                  <img src={meal.strMealThumb} alt={meal.strMeal} />
                  <h3>{meal.strMeal}</h3>
                  <p>{meal.strCategory || 'Various'} • {meal.strArea || 'International'}</p>
                </div>
              ))}
            </div>
            {searchResults.length === 0 && !loading && (
              <p className="empty-state">🔍 Start searching for delicious recipes!</p>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="categories-tab">
            <div className="categories-grid">
              {categories.map(cat => (
                <div key={cat.idCategory} className="category-card" onClick={() => handleCategoryClick(cat.strCategory)}>
                  <img src={cat.strCategoryThumb} alt={cat.strCategory} />
                  <h3>{cat.strCategory}</h3>
                  <p>{cat.strCategoryDescription.substring(0, 80)}...</p>
                </div>
              ))}
            </div>
            
            {selectedCategory && (
              <div className="category-meals">
                <h2>{selectedCategory} Recipes</h2>
                <div className="meals-grid">
                  {categoryMeals.map(meal => (
                    <div key={meal.idMeal} className="meal-card" onClick={() => handleMealClick(meal.idMeal)}>
                      <img src={meal.strMealThumb} alt={meal.strMeal} />
                      <h3>{meal.strMeal}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Random Tab */}
        {activeTab === 'random' && (
          <div className="random-tab">
            <button onClick={handleRandomMeal} className="random-btn">
              🎲 Surprise Me!
            </button>
            <p className="random-hint">Click the button to discover a random recipe from around the world</p>
          </div>
        )}
      </div>

      {/* Meal Details Modal */}
      {selectedMeal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>✕</button>
            <div className="modal-body">
              <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} className="modal-img" />
              <h2>{selectedMeal.strMeal}</h2>
              <div className="meal-meta">
                <span className="badge">🌍 {selectedMeal.strArea || 'International'}</span>
                <span className="badge">📂 {selectedMeal.strCategory || 'Various'}</span>
                {selectedMeal.strTags && <span className="badge">🏷️ {selectedMeal.strTags}</span>}
              </div>
              
              <div className="ingredients">
                <h3>🛒 Ingredients</h3>
                <ul>
                  {selectedMeal.ingredients?.map((ing, idx) => (
                    <li key={idx}>
                      <strong>{ing.name}</strong> - {ing.measure}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="instructions">
                <h3>📖 Instructions</h3>
                <p>{selectedMeal.strInstructions}</p>
              </div>
              
              {selectedMeal.strYoutube && (
                <div className="video">
                  <h3>🎥 Video Tutorial</h3>
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedMeal.strYoutube.split('v=')[1]?.split('&')[0]}`}
                    title="YouTube video"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default App;