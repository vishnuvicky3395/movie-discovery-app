# Movie Discovery App

A full-stack movie discovery application built with React and Node.js using the TMDB API.

## Features

- Browse and discover movies
- Search movies
- Filter movies by genre
- Sort movies
- Load more movies
- View movie details
- Add and remove movies from wishlist
- Wishlist persists after closing and reopening the browser
- Responsive design for different screen sizes
- Loading states
- Empty-result handling
- Error handling and retry support
- Backend abstraction for TMDB API requests
- Request cancellation to avoid unnecessary outdated requests
- Normalized movie data from the backend

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express.js
- Axios
- dotenv
- CORS

### External API

- TMDB API

### Persistence

The wishlist is stored in browser localStorage.

## Project Structure

```text
movie-discovery-app/
│
├── backend/
│   ├── routes/
│   │   └── movieRoutes.js
│   ├── utils/
│   │   └── movieMapper.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MovieDetails.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
└── README.md