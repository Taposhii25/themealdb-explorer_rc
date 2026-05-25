const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = 5000;

// Cache setup with 5 minute expiry and max 100 items
const cache = new NodeCache({ stdTTL: 300, maxKeys: 100 });

// Middleware
app.use(cors());
app.use(express.json());

// API Base URL
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Search meals by name
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search term required' });
  
  const cacheKey = `search:${q}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ results: cached, count: cached.length });
  
  try {
    const response = await axios.get(`${BASE_URL}/search.php?s=${encodeURIComponent(q)}`);
    const meals = response.data.meals || [];
    cache.set(cacheKey, meals);
    res.json({ results: meals, count: meals.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search meals' });
  }
});

// Get meal by ID with formatted ingredients
app.get('/api/meal/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `meal:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);
  
  try {
    const response = await axios.get(`${BASE_URL}/lookup.php?i=${id}`);
    const meal = response.data.meals ? response.data.meals[0] : null;
    
    if (meal) {
      // Format ingredients list
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
          ingredients.push({ name: ingredient, measure: measure || '' });
        }
      }
      const mealWithIngredients = { ...meal, ingredients };
      cache.set(cacheKey, mealWithIngredients);
      res.json(mealWithIngredients);
    } else {
      res.status(404).json({ error: 'Meal not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meal details' });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  const cached = cache.get('categories:all');
  if (cached) return res.json(cached);
  
  try {
    const response = await axios.get(`${BASE_URL}/categories.php`);
    const categories = response.data.categories || [];
    cache.set('categories:all', categories);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get meals by category
app.get('/api/category/:category', async (req, res) => {
  const { category } = req.params;
  const cacheKey = `category:${category}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ meals: cached, count: cached.length });
  
  try {
    const response = await axios.get(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    const meals = response.data.meals || [];
    cache.set(cacheKey, meals);
    res.json({ meals, count: meals.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meals by category' });
  }
});

// Get random meal (no cache for random)
app.get('/api/random', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/random.php`);
    const meal = response.data.meals ? response.data.meals[0] : null;
    res.json(meal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random meal' });
  }
});

// Cache stats endpoint for monitoring
app.get('/api/cache/stats', (req, res) => {
  res.json({
    keys: cache.keys(),
    size: cache.keys().length,
    maxKeys: 100,
    ttl: 300
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📦 Cache: ${cache.keys().length}/100 items, TTL: 300 seconds`);
});