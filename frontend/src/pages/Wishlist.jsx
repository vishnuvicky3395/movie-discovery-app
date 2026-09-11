import { Link } from "react-router-dom";

function Wishlist({ wishlist, onRemove }) {
  return (
    <div className="details-page">
      <Link to="/" className="back-button">
        ← Back to Movies
      </Link>

      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <p>
            {wishlist.length}{" "}
            {wishlist.length === 1 ? "movie" : "movies"} saved
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h2>Your wishlist is empty</h2>
          <p>
            Browse movies and add your favorites to your wishlist.
          </p>

          <Link to="/" className="browse-button">
            Discover Movies
          </Link>
        </div>
      ) : (
        <div className="movie-grid">
          {wishlist.map((movie) => (
            <div className="wishlist-card" key={movie.id}>
              <Link
                to={`/movie/${movie.id}`}
                className="movie-card"
              >
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title || "Movie poster"}
                    loading="lazy"
                  />
                ) : (
                  <div className="no-poster">
                    No Poster
                  </div>
                )}

                <div className="movie-info">
                  <h3>
                    {movie.title || "Untitled Movie"}
                  </h3>

                  <p>
                    {movie.release_date
                      ? movie.release_date.substring(0, 4)
                      : "Unknown year"}
                  </p>

                  <p>
                    ⭐{" "}
                    {typeof movie.vote_average === "number"
                      ? movie.vote_average.toFixed(1)
                      : "N/A"}
                  </p>
                </div>
              </Link>

              <button
                className="remove-wishlist-button"
                onClick={() => onRemove(movie.id)}
              >
                Remove from Wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;