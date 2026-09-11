const mapMovie = (movie) => {
  return {
    id: movie.id,
    title: movie.title || "Untitled Movie",
    overview: movie.overview || "",
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path || null,
    release_date: movie.release_date || null,
    vote_average:
      typeof movie.vote_average === "number"
        ? movie.vote_average
        : null,
    original_language: movie.original_language || null
  };
};

const mapMovieDetails = (movie) => {
  return {
    id: movie.id,
    title: movie.title || "Untitled Movie",
    overview: movie.overview || "",
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path || null,
    release_date: movie.release_date || null,
    vote_average:
      typeof movie.vote_average === "number"
        ? movie.vote_average
        : null,
    original_language: movie.original_language || null,
    tagline: movie.tagline || "",
    runtime: movie.runtime || null,
    status: movie.status || null,
    homepage: movie.homepage || null,
    genres: Array.isArray(movie.genres)
      ? movie.genres.map((genre) => ({
          id: genre.id,
          name: genre.name
        }))
      : []
  };
};

module.exports = {
  mapMovie,
  mapMovieDetails
};