// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const API_KEY = "964104e360ac2eac46f7a30bf25a59d1";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

// Global Watchlist Array
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const moviesGrid = document.getElementById("movies-grid");
const sectionTitle = document.getElementById("section-title");
const searchInput = document.getElementById("search-input");
const categoryButtons = document.querySelectorAll(".cat-btn");
const watchlistNavBtn = document.getElementById("watchlist-btn");

// Modal Elements
const authModal = document.getElementById("auth-modal");
const modalTitle = document.getElementById("modal-title");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const closeModalBtn = document.querySelector(".close-btn");

// ==========================================
// 3. FETCH MOVIES FROM TMDB API
// ==========================================
async function fetchMovies(endpoint, title = "Trending Movies") {
    if (sectionTitle) sectionTitle.innerText = title;
    moviesGrid.innerHTML = `<div style="color: #aaa; padding: 20px;">Բեռնվում է...</div>`;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            displayMovies(data.results);
        } else {
            moviesGrid.innerHTML = `<p style="color: #aaa; padding: 20px;">Ֆիլմեր չեն գտնվել:</p>`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        moviesGrid.innerHTML = `<p style="color: #e50914; padding: 20px;">Տվյալների բեռնման սխալ: Խնդրում ենք ստուգել ինտերնետ կապը կամ կրկին փորձել:</p>`;
    }
}

// ==========================================
// 4. DISPLAY MOVIES IN GRID
// ==========================================
function displayMovies(movies) {
    moviesGrid.innerHTML = "";

    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        const posterPath = movie.poster_path 
            ? `${IMG_URL}${movie.poster_path}`
            : "https://via.placeholder.com/500x750?text=No+Poster";

        const title = movie.title || movie.name || "Untitled";
        const isSaved = watchlist.some(m => m.id === movie.id);

        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${title}" loading="lazy">
            <div class="movie-info">
                <h3>${title}</h3>
                <div class="card-buttons">
                    <button class="watch-btn" onclick="watchMovie(${movie.id})">
                        <i class="fa-solid fa-play"></i> Դիտել
                    </button>
                    <button class="add-to-watchlist-btn ${isSaved ? 'active' : ''}" onclick="toggleWatchlist(${movie.id}, this)">
                        <i class="fa-solid ${isSaved ? 'fa-bookmark' : 'fa-bookmark'}"></i>
                    </button>
                </div>
            </div>
        `;

        moviesGrid.appendChild(movieCard);
    });
}

// ==========================================
// 5. ACTIONS: WATCH & WATCHLIST
// ==========================================

// Ուղղորդում դեպի movie.html
function watchMovie(movieId) {
    window.location.href = `movie.html?id=${movieId}`;
}

// Watchlist-ի ավելացում/հեռացում LocalStorage-ում
async function toggleWatchlist(movieId, btnElement) {
    const index = watchlist.findIndex(m => m.id === movieId);

    if (index !== -1) {
        // Եթե արդեն կա, հեռացնում ենք
        watchlist.splice(index, 1);
        if (btnElement) btnElement.classList.remove("active");
    } else {
        // Եթե չկա, ավելացնում ենք
        try {
            const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
            const movieData = await res.json();
            watchlist.push(movieData);
            if (btnElement) btnElement.classList.add("active");
        } catch (e) {
            console.error("Error adding to watchlist:", e);
        }
    }

    localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

// Watchlist-ում գտնվող ֆիլմերի ցուցադրում
function displayWatchlist() {
    if (sectionTitle) sectionTitle.innerText = "My Watchlist";
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    if (watchlist.length === 0) {
        moviesGrid.innerHTML = `<p style="color: #aaa; grid-column: 1/-1; padding: 20px;">Ձեր Watchlist-ը դատարկ է:</p>`;
        return;
    }

    displayMovies(watchlist);
}

// ==========================================
// 6. CATEGORIES & SEARCH
// ==========================================

// Կատեգորիաների կոճակների սեղմում
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const category = button.dataset.category;

        switch (category) {
            case "trending":
                fetchMovies(`/trending/movie/week?api_key=${API_KEY}`, "Trending Movies");
                break;
            case "popular":
                fetchMovies(`/movie/popular?api_key=${API_KEY}`, "Popular Movies");
                break;
            case "top_rated":
                fetchMovies(`/movie/top_rated?api_key=${API_KEY}`, "Top Rated Movies");
                break;
            case "upcoming":
                fetchMovies(`/movie/upcoming?api_key=${API_KEY}`, "Upcoming Movies");
                break;
            case "action":
                fetchMovies(`/discover/movie?api_key=${API_KEY}&with_genres=28`, "Action Movies");
                break;
            case "comedy":
                fetchMovies(`/discover/movie?api_key=${API_KEY}&with_genres=35`, "Comedy Movies");
                break;
            default:
                fetchMovies(`/trending/movie/week?api_key=${API_KEY}`, "Trending Movies");
        }
    });
});

// Որոնում (Search)
if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        const query = e.target.value.trim();
        if (query.length > 2) {
            fetchMovies(`/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`, `Որոնման արդյունքներ: "${query}"`);
        } else if (query.length === 0) {
            fetchMovies(`/trending/movie/week?api_key=${API_KEY}`, "Trending Movies");
        }
    });
}

// Watchlist Header Button
if (watchlistNavBtn) {
    watchlistNavBtn.addEventListener("click", () => {
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        displayWatchlist();
    });
}

// ==========================================
// 7. MODALS (LOGIN / REGISTER)
// ==========================================
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        if (modalTitle) modalTitle.innerText = "Մուտք";
        if (authModal) authModal.style.display = "flex";
    });
}

if (registerBtn) {
    registerBtn.addEventListener("click", () => {
        if (modalTitle) modalTitle.innerText = "Գրանցվել";
        if (authModal) authModal.style.display = "flex";
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        if (authModal) authModal.style.display = "none";
    });
}

window.addEventListener("click", (e) => {
    if (e.target === authModal) {
        authModal.style.display = "none";
    }
});

// ==========================================
// 8. INITIAL LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Էջը բացելիս բեռնում է Trending Movies-ը
    fetchMovies(`/trending/movie/week?api_key=${API_KEY}`, "Trending Movies");
});