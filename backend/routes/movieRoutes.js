const express = require("express");
const axios = require("axios");
const https = require("https");

const router = express.Router();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const httpsAgent = new https.Agent({
  keepAlive: false
});

const tmdbConfig = {
  timeout: 20000,
  httpsAgent,
  headers: {
    Accept: "application/json",
    "User-Agent": "Movie-Discovery-App"
  }
};

// --------------------------------------------------
// TMDB request helper
// Automatically retries temporary connection errors
// --------------------------------------------------

const requestTMDB = async (url, params) => {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.get(url, {
        ...tmdbConfig,
        params
      });

      return response.data;

    } catch (error) {
      lastError = error;

      const retryableErrors = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ECONNABORTED",
        "EAI_AGAIN"
      ];

      const shouldRetry =
        retryableErrors.includes(error.code);

      console.error(
        `TMDB request attempt ${attempt} failed:`,
        error.code,
        error.message
      );

      if (!shouldRetry || attempt === 3) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * attempt)
      );
    }
  }

  throw lastError;
};

// --------------------------------------------------
// Discover movies
// GET /api/movies/discover
// --------------------------------------------------

router.get("/discover", async (req, res) => {
  try {
    const {
      page = 1,
      sort_by = "popularity.desc",
      with_genres
    } = req.query;

    const data = await requestTMDB(
      `${TMDB_BASE_URL}/discover/movie`,
      {
        api_key: process.env.TMDB_API_KEY,
        page,
        sort_by,
        with_genres
      }
    );

    res.json(data);

  } catch (error) {
    console.error(
      "TMDB discover error:",
      error.code,
      error.message
    );

    res.status(502).json({
      message:
        "Movie service is temporarily unavailable. Please try again."
    });
  }
});

// --------------------------------------------------
// Search movies
// GET /api/movies/search?query=batman
// --------------------------------------------------

router.get("/search", async (req, res) => {
  try {
    const {
      query,
      page = 1
    } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Search query is required"
      });
    }

    const data = await requestTMDB(
      `${TMDB_BASE_URL}/search/movie`,
      {
        api_key: process.env.TMDB_API_KEY,
        query: query.trim(),
        page
      }
    );

    res.json(data);

  } catch (error) {
    console.error(
      "TMDB search error:",
      error.code,
      error.message
    );

    res.status(502).json({
      message:
        "Movie search service is temporarily unavailable. Please try again."
    });
  }
});

// --------------------------------------------------
// Movie details
// GET /api/movies/:id
// --------------------------------------------------

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await requestTMDB(
      `${TMDB_BASE_URL}/movie/${id}`,
      {
        api_key: process.env.TMDB_API_KEY
      }
    );

    res.json(data);

  } catch (error) {
    console.error(
      "TMDB details error:",
      error.code,
      error.message
    );

    res.status(502).json({
      message:
        "Movie details service is temporarily unavailable. Please try again."
    });
  }
});

module.exports = router;