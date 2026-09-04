const API_KEY = "964104e360ac2eac46f7a30bf25a59d1";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const AUTH_API_URL = "http://localhost:5000/api";
const moviesGrid = document.getElementById("movies-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const favoritesBtn = document.getElementById("favorites-btn");
const sectionTitle = document.getElementById("section-title");
const categoryButtons = document.querySelectorAll(".cat-btn");

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

// Ֆիլմերի / Սերիալների բեռնում
async function fetchMovies(url, title) {
    sectionTitle.innerText = title;
    moviesGrid.innerHTML = "<p style='color: #94a3b8;'>Loading...</p>";
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        displayMovies(data.results);
    } catch (error) {
        moviesGrid.innerHTML = "<p style='color: #e11d48;'>Error loading data.</p>";
    }
}

function displayMovies(movies) {
    moviesGrid.innerHTML = "";
    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = "<p style='color: #94a3b8;'>No results found.</p>";
        return;
    }

    movies.forEach(item => {
        const title = item.title || item.name; // TV series uses 'name'
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? releaseDate.split("-")[0] : "N/A";
        const poster = item.poster_path ? IMG_URL + item.poster_path : "https://via.placeholder.com/500x750?text=No+Image";
        const isTv = !item.title; // Պարզում ենք սերիալ է, թե ֆիլմ

        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
            <img src="${poster}" alt="${title}">
            <div class="movie-info">
                <div class="movie-title">${title}</div>
                <div class="movie-meta">
                    <span>${year}</span>
                    <span class="rating"><i class="fa-solid fa-star"></i> ${(item.vote_average || 0).toFixed(1)}</span>
                </div>
                <a href="movie.html?id=${item.id}&type=${isTv ? 'tv' : 'movie'}" class="watch-btn">
                    <i class="fa-solid fa-play"></i> Watch ${isTv ? 'Series' : 'Movie'}
                </a>
            </div>
        `;
        moviesGrid.appendChild(card);
    });
}

// Category Tabs Click Handling
categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        categoryButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const type = btn.dataset.type;
        const genre = btn.dataset.genre;

        if (type === "trending") {
            fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, "Trending Movies");
        } else if (type === "popular") {
            fetchMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}`, "Popular Movies");
        } else if (type === "top_rated") {
            fetchMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`, "Top Rated Movies");
        } else if (type === "upcoming") {
            fetchMovies(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`, "Upcoming Movies");
        } else if (type === "tv") {
            fetchMovies(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`, "Popular TV Series");
        } else if (genre) {
            const genreName = btn.innerText.trim();
            fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre}`, `${genreName} Movies`);
        }
    });
});

// Search functionality
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    categoryButtons.forEach(b => b.classList.remove("active"));
    fetchMovies(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`, `Search Results for "${query}"`);
});

// Watchlist Button Click
favoritesBtn.addEventListener("click", () => {
    categoryButtons.forEach(b => b.classList.remove("active"));
    sectionTitle.innerText = "My Watchlist";
    displayMovies(watchlist);
});

// Initial Load
fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, "Trending Movies");
