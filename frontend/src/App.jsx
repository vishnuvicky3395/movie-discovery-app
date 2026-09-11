import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import axios from "axios";

import MovieDetails from "./pages/MovieDetails";
import Wishlist from "./pages/Wishlist";

import "./App.css";

const API_URL = "http://localhost:5000/api/movies";

const genres = [
  { id: "", name: "All Genres" },
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comedy" },
  { id: "80", name: "Crime" },
  { id: "18", name: "Drama" },
  { id: "27", name: "Horror" },
  { id: "878", name: "Science Fiction" }
];

const sortOptions = [
  {
    value: "popularity.desc",
    label: "Most Popular"
  },
  {
    value: "vote_average.desc",
    label: "Top Rated"
  },
  {
    value: "release_date.desc",
    label: "Newest"
  },
  {
    value: "release_date.asc",
    label: "Oldest"
  }
];

function Home() {
  const [movies, setMovies] = useState(() => {
    try {
      const savedMovies =
        sessionStorage.getItem(
          "movieDiscoverResults"
        );

      return savedMovies
        ? JSON.parse(savedMovies)
        : [];
    } catch (error) {
      console.error(
        "Unable to read saved movies:",
        error
      );

      return [];
    }
  });

  const [search, setSearch] = useState(() => {
    return (
      sessionStorage.getItem(
        "movieSearch"
      ) || ""
    );
  });

  const [selectedGenre, setSelectedGenre] =
    useState(() => {
      return (
        sessionStorage.getItem(
          "movieGenre"
        ) || ""
      );
    });

  const [sortBy, setSortBy] = useState(() => {
    return (
      sessionStorage.getItem(
        "movieSort"
      ) || "popularity.desc"
    );
  });

  const [page, setPage] = useState(() => {
    const savedPage =
      sessionStorage.getItem(
        "moviePage"
      );

    return savedPage
      ? Number(savedPage)
      : 1;
  });

  const [totalPages, setTotalPages] =
    useState(() => {
      const savedTotalPages =
        sessionStorage.getItem(
          "movieTotalPages"
        );

      return savedTotalPages
        ? Number(savedTotalPages)
        : 1;
    });

  const [loading, setLoading] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState("");

  const requestController =
    useRef(null);

  // =========================
  // SAVE BROWSE STATE
  // =========================

  useEffect(() => {
    sessionStorage.setItem(
      "movieSearch",
      search
    );

    sessionStorage.setItem(
      "movieGenre",
      selectedGenre
    );

    sessionStorage.setItem(
      "movieSort",
      sortBy
    );

    sessionStorage.setItem(
      "moviePage",
      String(page)
    );

    sessionStorage.setItem(
      "movieTotalPages",
      String(totalPages)
    );

    sessionStorage.setItem(
      "movieDiscoverResults",
      JSON.stringify(movies)
    );
  }, [
    search,
    selectedGenre,
    sortBy,
    page,
    totalPages,
    movies
  ]);

  // =========================
  // DISCOVER MOVIES
  // =========================

  const fetchMovies = async (
    selectedPage = 1,
    append = false
  ) => {
    const controller =
      new AbortController();

    if (requestController.current) {
      requestController.current.abort();
    }

    requestController.current =
      controller;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      const response =
        await axios.get(
          `${API_URL}/discover`,
          {
            params: {
              page: selectedPage,
              sort_by: sortBy,
              with_genres:
                selectedGenre ||
                undefined
            },
            signal:
              controller.signal,
            timeout: 15000
          }
        );

      if (
        requestController.current !==
        controller
      ) {
        return;
      }

      const results =
        response.data.results || [];

      if (append) {
        setMovies(
          (previousMovies) => [
            ...previousMovies,
            ...results
          ]
        );
      } else {
        setMovies(results);
      }

      setPage(selectedPage);

      setTotalPages(
        response.data.total_pages || 1
      );

      setError("");

    } catch (err) {
      if (
        err.code === "ERR_CANCELED" ||
        err.name === "CanceledError"
      ) {
        return;
      }

      if (
        requestController.current !==
        controller
      ) {
        return;
      }

      console.error(
        "Discover movies error:",
        err
      );

      // Keep previously loaded movies
      // instead of showing a blank page
      if (movies.length > 0) {
        setError(
          "Unable to refresh movies. Showing previously loaded results."
        );
      } else {
        setError(
          "Unable to load movies. Please try again."
        );
      }

    } finally {
      if (
        requestController.current ===
        controller
      ) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  // =========================
  // SEARCH MOVIES
  // =========================

  const searchMovies = async (event) => {
    event.preventDefault();

    const searchText =
      search.trim();

    if (!searchText) {
      setSearch("");
      setPage(1);

      fetchMovies(1, false);

      return;
    }

    const controller =
      new AbortController();

    if (requestController.current) {
      requestController.current.abort();
    }

    requestController.current =
      controller;

    try {
      setLoading(true);
      setError("");

      const response =
        await axios.get(
          `${API_URL}/search`,
          {
            params: {
              query: searchText,
              page: 1
            },
            signal:
              controller.signal,
            timeout: 15000
          }
        );

      if (
        requestController.current !==
        controller
      ) {
        return;
      }

      const results =
        response.data.results || [];

      setMovies(results);

      setPage(1);

      setTotalPages(
        response.data.total_pages || 1
      );

      setError("");

    } catch (err) {
      if (
        err.code === "ERR_CANCELED" ||
        err.name === "CanceledError"
      ) {
        return;
      }

      if (
        requestController.current !==
        controller
      ) {
        return;
      }

      console.error(
        "Search movies error:",
        err
      );

      setError(
        "Unable to search movies. Please try again."
      );

    } finally {
      if (
        requestController.current ===
        controller
      ) {
        setLoading(false);
      }
    }
  };

  // =========================
  // GENRE CHANGE
  // =========================

  const handleGenreChange = (
    event
  ) => {
    const genre =
      event.target.value;

    setSelectedGenre(genre);
    setSearch("");
    setPage(1);

    setMovies([]);
    setError("");
  };

  // =========================
  // SORT CHANGE
  // =========================

  const handleSortChange = (
    event
  ) => {
    const sort =
      event.target.value;

    setSortBy(sort);
    setSearch("");
    setPage(1);

    setMovies([]);
    setError("");
  };

  // =========================
  // LOAD MORE
  // =========================

  const loadMoreMovies = async () => {
    if (
      page >= totalPages ||
      loadingMore
    ) {
      return;
    }

    const nextPage =
      page + 1;

    // =========================
    // SEARCH LOAD MORE
    // =========================

    if (search.trim()) {
      const controller =
        new AbortController();

      if (requestController.current) {
        requestController.current.abort();
      }

      requestController.current =
        controller;

      try {
        setLoadingMore(true);
        setError("");

        const response =
          await axios.get(
            `${API_URL}/search`,
            {
              params: {
                query:
                  search.trim(),
                page: nextPage
              },
              signal:
                controller.signal,
              timeout: 15000
            }
          );

        if (
          requestController.current !==
          controller
        ) {
          return;
        }

        const results =
          response.data.results || [];

        setMovies(
          (previousMovies) => [
            ...previousMovies,
            ...results
          ]
        );

        setPage(nextPage);

        setTotalPages(
          response.data.total_pages ||
            1
        );

      } catch (err) {
        if (
          err.code ===
            "ERR_CANCELED" ||
          err.name ===
            "CanceledError"
        ) {
          return;
        }

        console.error(
          "Load more search error:",
          err
        );

        setError(
          "Unable to load more movies. Please try again."
        );

      } finally {
        if (
          requestController.current ===
          controller
        ) {
          setLoadingMore(false);
        }
      }

      return;
    }

    // =========================
    // DISCOVER LOAD MORE
    // =========================

    fetchMovies(
      nextPage,
      true
    );
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    // If we already have movies
    // from the previous Home visit,
    // show them immediately.
    if (movies.length === 0) {
      fetchMovies(1, false);
    }

    return () => {
      if (requestController.current) {
        requestController.current.abort();
      }
    };

  }, []);

  // =========================
  // FILTER LOAD
  // =========================

  useEffect(() => {
    if (
      selectedGenre === "" &&
      sortBy === "popularity.desc"
    ) {
      return;
    }

    fetchMovies(1, false);

    return () => {
      if (requestController.current) {
        requestController.current.abort();
      }
    };
  }, [
    selectedGenre,
    sortBy
  ]);

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

      <header className="header">

        <div className="header-top">

          <h1>
            Movie Discovery
          </h1>

          <Link
            to="/wishlist"
            className="wishlist-nav"
          >
            ♥ Wishlist
          </Link>

        </div>

        <form
          onSubmit={searchMovies}
          className="search-form"
        >

          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <button type="submit">
            Search
          </button>

        </form>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="main">

        <div className="browse-header">

          <div>
            <h2>
              {search.trim()
                ? `Search results for "${search}"`
                : "Discover Movies"}
            </h2>
          </div>

          <div className="filters">

            <select
              value={selectedGenre}
              onChange={
                handleGenreChange
              }
              className="filter-select"
            >

              {genres.map(
                (genre) => (
                  <option
                    key={
                      genre.id ||
                      "all"
                    }
                    value={
                      genre.id
                    }
                  >
                    {genre.name}
                  </option>
                )
              )}

            </select>

            <select
              value={sortBy}
              onChange={
                handleSortChange
              }
              className="filter-select"
            >

              {sortOptions.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading &&
          movies.length === 0 && (
            <p className="message">
              Loading movies...
            </p>
          )}

        {/* =========================
            REFRESH ERROR
        ========================= */}

        {!loading &&
          error && (
            <div className="error-box">

              <p className="error">
                {error}
              </p>

              <button
                className="retry-button"
                onClick={() => {

                  if (
                    search.trim()
                  ) {
                    searchMovies({
                      preventDefault:
                        () => {}
                    });
                  } else {
                    fetchMovies(
                      1,
                      false
                    );
                  }

                }}
              >
                Try Again
              </button>

            </div>
          )}

        {/* =========================
            NO RESULTS
        ========================= */}

        {!loading &&
          !error &&
          movies.length === 0 && (
            <p className="message">
              No movies found.
            </p>
          )}

        {/* =========================
            MOVIE GRID
        ========================= */}

        {movies.length > 0 && (
          <>

            <div className="movie-grid">

              {movies.map(
                (movie) => (

                  <Link
                    to={`/movie/${movie.id}`}
                    className="movie-card"
                    key={movie.id}
                  >

                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={
                          movie.title ||
                          "Movie poster"
                        }
                        loading="lazy"
                      />
                    ) : (
                      <div className="no-poster">
                        No Poster
                      </div>
                    )}

                    <div className="movie-info">

                      <h3>
                        {movie.title ||
                          "Untitled Movie"}
                      </h3>

                      <p>
                        {movie.release_date
                          ? movie.release_date.substring(
                              0,
                              4
                            )
                          : "Unknown year"}
                      </p>

                      <p>
                        ⭐{" "}
                        {typeof movie.vote_average ===
                        "number"
                          ? movie.vote_average.toFixed(
                              1
                            )
                          : "N/A"}
                      </p>

                    </div>

                  </Link>

                )
              )}

            </div>

            {/* =========================
                LOAD MORE
            ========================= */}

            {page <
              totalPages && (

              <div className="load-more-container">

                <button
                  className="load-more-button"
                  onClick={
                    loadMoreMovies
                  }
                  disabled={
                    loadingMore
                  }
                >

                  {loadingMore
                    ? "Loading..."
                    : "Load More Movies"}

                </button>

              </div>

            )}

            {/* =========================
                END
            ========================= */}

            {page >=
              totalPages && (

              <p className="end-message">
                You've reached the end
                of the results.
              </p>

            )}

          </>
        )}

      </main>

      {/* =========================
          TMDB CREDIT
      ========================= */}

      <footer className="tmdb-credit">

        <p>
          This product uses the TMDB API
          but is not endorsed or certified
          by TMDB.
        </p>

        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Data and images provided by TMDB
        </a>

      </footer>

    </div>
  );
}

// =========================
// MAIN APP
// =========================

function App() {

  const [wishlist, setWishlist] =
    useState(() => {

      try {

        const savedWishlist =
          localStorage.getItem(
            "movieWishlist"
          );

        return savedWishlist
          ? JSON.parse(
              savedWishlist
            )
          : [];

      } catch (error) {

        console.error(
          "Unable to read wishlist:",
          error
        );

        return [];

      }

    });

  // =========================
  // SAVE WISHLIST
  // =========================

  useEffect(() => {

    localStorage.setItem(
      "movieWishlist",
      JSON.stringify(wishlist)
    );

  }, [wishlist]);

  // =========================
  // UPDATE WISHLIST
  // =========================

  const updateWishlist = (
    newWishlist
  ) => {

    setWishlist(
      newWishlist
    );

  };

  // =========================
  // REMOVE FROM WISHLIST
  // =========================

  const removeFromWishlist = (
    movieId
  ) => {

    setWishlist(
      (previousWishlist) =>
        previousWishlist.filter(
          (movie) =>
            movie.id !== movieId
        )
    );

  };

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/movie/:id"
          element={
            <MovieDetails
              wishlist={
                wishlist
              }
              onWishlistChange={
                updateWishlist
              }
            />
          }
        />

        <Route
          path="/wishlist"
          element={
            <Wishlist
              wishlist={
                wishlist
              }
              onRemove={
                removeFromWishlist
              }
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;