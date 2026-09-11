import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL =
  "https://movie-discovery-backend.onrender.com/api/movies";

function MovieDetails({ wishlist, onWishlistChange }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setMovie(null);

        console.log("Fetching movie:", id);

        const response = await axios.get(
          `${API_URL}/${id}`,
          {
            timeout: 30000
          }
        );

        console.log(
          "Movie details:",
          response.data
        );

        if (response.data) {
          setMovie(response.data);
        } else {
          setError("Movie not found.");
        }

      } catch (err) {
        console.error(
          "Movie details error:",
          err
        );

        setError(
          "Unable to load movie details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  const isInWishlist = movie
    ? wishlist.some(
        (item) => item.id === movie.id
      )
    : false;

  const handleWishlist = () => {
    if (!movie) {
      return;
    }

    if (isInWishlist) {
      onWishlistChange(
        wishlist.filter(
          (item) => item.id !== movie.id
        )
      );
    } else {
      const wishlistMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average
      };

      onWishlistChange([
        ...wishlist,
        wishlistMovie
      ]);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="details-page">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
        >
          ← Back to Movies
        </button>

        <div className="loading-details">
          <p className="message">
            Loading movie details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="details-page">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
        >
          ← Back to Movies
        </button>

        <div className="error-box">
          <p className="error">
            {error}
          </p>

          <button
            className="retry-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Movie not available after request completed
  if (!movie) {
    return (
      <div className="details-page">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
        >
          ← Back to Movies
        </button>

        <p className="message">
          Movie not found.
        </p>
      </div>
    );
  }

  // Movie details
  return (
    <div className="details-page">

      <button
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Back to Movies
      </button>

      <div className="details-content">

        {/* Poster */}
        <div className="details-poster">
          {movie.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={
                movie.title ||
                "Movie poster"
              }
            />
          ) : (
            <div className="no-poster large">
              No Poster
            </div>
          )}
        </div>

        {/* Information */}
        <div className="details-info">

          <h1>
            {movie.title ||
              "Untitled Movie"}
          </h1>

          {movie.tagline && (
            <p className="tagline">
              {movie.tagline}
            </p>
          )}

          {/* Movie metadata */}
          <div className="movie-meta">

            <span>
              📅{" "}
              {movie.release_date
                ? movie.release_date.substring(
                    0,
                    4
                  )
                : "Unknown"}
            </span>

            <span>
              ⭐{" "}
              {typeof movie.vote_average ===
              "number"
                ? movie.vote_average.toFixed(
                    1
                  )
                : "N/A"}
            </span>

            {movie.runtime && (
              <span>
                ⏱️ {movie.runtime} min
              </span>
            )}

          </div>

          {/* Genres */}
          {movie.genres &&
            movie.genres.length > 0 && (
              <div className="genres">
                {movie.genres.map(
                  (genre) => (
                    <span
                      key={genre.id}
                      className="genre"
                    >
                      {genre.name}
                    </span>
                  )
                )}
              </div>
            )}

          {/* Wishlist */}
          <button
            className={
              isInWishlist
                ? "wishlist-button added"
                : "wishlist-button"
            }
            onClick={handleWishlist}
          >
            {isInWishlist
              ? "♥ Remove from Wishlist"
              : "♡ Add to Wishlist"}
          </button>

          {/* Overview */}
          <h2>
            Overview
          </h2>

          <p className="overview">
            {movie.overview ||
              "No description available."}
          </p>

          {/* Language */}
          {movie.original_language && (
            <p>
              <strong>
                Language:
              </strong>{" "}
              {movie.original_language.toUpperCase()}
            </p>
          )}

          {/* Status */}
          {movie.status && (
            <p>
              <strong>
                Status:
              </strong>{" "}
              {movie.status}
            </p>
          )}

          {/* Official website */}
          {movie.homepage && (
            <a
              href={movie.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="homepage-link"
            >
              Official Website
            </a>
          )}

        </div>
      </div>
    </div>
  );
}

export default MovieDetails;