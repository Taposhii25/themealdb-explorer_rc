@'
# TheMealDB Explorer

A full-stack web application that explores recipes from TheMealDB API. Built with Node.js/Express backend and React frontend.

## Features

### Backend API (Node.js + Express)
- RESTful API endpoints for recipe search, categories, and random meals
- In-memory caching with 5-minute TTL and 100 item max
- CORS enabled for frontend communication
- Error handling and response formatting

### Frontend UI (React)
- **Recipe Search**: Search meals by name with real-time results
- **Category Browser**: Browse meals by categories (Chicken, Vegetarian, etc.)
- **Random Meal**: "I'm feeling hungry" button for random recipe discovery
- **Recipe Details**: Modal view showing:
  - Ingredients list with measurements
  - Step-by-step instructions
  - YouTube video embed (when available)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Backend
- Node.js
- Express.js
- Axios (API calls)
- Node-Cache (in-memory caching)
- CORS

### Frontend
- React 19
- Axios (API client)
- CSS3 (responsive design)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup Instructions

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd themealdb-explorer