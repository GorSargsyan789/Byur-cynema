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

let isLoginMode = true;

// ------------------- AUTH & MODAL FUNCTIONALITY -------------------
document.addEventListener("DOMContentLoaded", () => {
    const authModal = document.getElementById("auth-modal");
    const openLoginBtn = document.getElementById("open-login-btn");
    const openRegisterBtn = document.getElementById("open-register-btn");
    const closeModalBtn = document.getElementById("close-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalSubmitBtn = document.getElementById("modal-submit-btn");
    const authForm = document.getElementById("auth-form");

    if (openLoginBtn) {
        openLoginBtn.onclick = () => {
            isLoginMode = true;
            if (modalTitle) modalTitle.textContent = "Մուտք";
            if (modalSubmitBtn) modalSubmitBtn.textContent = "Մուտք գործել";
            if (authModal) authModal.style.display = "flex";
        };
    }

    if (openRegisterBtn) {
        openRegisterBtn.onclick = () => {
            isLoginMode = false;
            if (modalTitle) modalTitle.textContent = "Գրանցում";
            if (modalSubmitBtn) modalSubmitBtn.textContent = "Գրանցվել";
            if (authModal) authModal.style.display = "flex";
        };
    }

    if (closeModalBtn) {
        closeModalBtn.onclick = () => {
            if (authModal) authModal.style.display = "none";
        };
    }

    window.onclick = (e) => {
        if (e.target === authModal) {
            authModal.style.display = "none";
        }
    };

    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const endpoint = isLoginMode ? "/login" : "/register";

            try {
                const response = await fetch(`${AUTH_API_URL}${endpoint}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    if (isLoginMode && data.user) {
                        localStorage.setItem("user_id", data.user.id);
                        localStorage.setItem("byur_username", username);
                        if (data.token) localStorage.setItem("byur_token", data.token);
                        
                        if (authModal) authModal.style.display = "none";
                        updateAuthUI();
                    } else if (!isLoginMode) {
                        if (openLoginBtn) openLoginBtn.click();
                    }
                } else {
                    alert(`Սխալ: ${data.message}`);
                }
            } catch (err) {
                console.error(err);
                alert("Backend-ի հետ կապ չկա:");
            }
        };
    }

    updateAuthUI();
    // Initial Load
    fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, "Trending Movies");
});

function updateAuthUI() {
    const authButtons = document.getElementById("auth-buttons");
    const username = localStorage.getItem("byur_username");

    if (authButtons && username) {
        authButtons.innerHTML = `
            <span style="color: white; margin-right: 15px; font-weight: bold;">
                <i class="fa-solid fa-user"></i> ${username}
            </span>
            <button onclick="logout()" style="padding: 8px 15px; background: #333; color: white; border: 1px solid #555; border-radius: 4px; cursor: pointer;">
                Դուրս գալ
            </button>
        `;
    }
}

function logout() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("byur_token");
    localStorage.removeItem("byur_username");
    location.reload();
}

// ------------------- MOVIES & TV FUNCTIONALITY -------------------
async function fetchMovies(url, title) {
    if (sectionTitle) sectionTitle.innerText = title;
    if (moviesGrid) moviesGrid.innerHTML = "<p style='color: #94a3b8;'>Loading...</p>";
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        displayMovies(data.results);
    } catch (error) {
        if (moviesGrid) moviesGrid.innerHTML = "<p style='color: #e11d48;'>Error loading data.</p>";
    }
}

function displayMovies(movies, isWatchlistSection = false) {
    if (!moviesGrid) return;
    moviesGrid.innerHTML = "";
    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = "<p style='color: #94a3b8;'>Ցուցակը դատարկ է:</p>";
        return;
    }

    movies.forEach(item => {
        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? releaseDate.split("-")[0] : "N/A";
        
        // poster URL-ի ստուգում
        const poster = item.poster_path 
            ? (item.poster_path.startsWith("http") ? item.poster_path : IMG_URL + item.poster_path)
            : "https://via.placeholder.com/500x750?text=No+Image";

        const movieId = item.movie_id || item.id;

        const card = document.createElement("div");
        card.className = "movie-card";

        const actionButton = isWatchlistSection ? `
            <button class="add-to-watchlist-btn" onclick="removeFromWatchlist('${movieId}')" style="background-color: #e50914;">
                <i class="fa-solid fa-trash"></i> Հեռացնել
            </button>
        ` : `
            <button class="add-to-watchlist-btn" onclick="addToWatchlist('${movieId}', '${title.replace(/'/g, "\\'")}', '${poster}')">
                <i class="fa-solid fa-plus"></i> Watchlist
            </button>
        `;

        card.innerHTML = `
            <img src="${poster}" alt="${title}">
            <div class="movie-info">
                <h3>${title} ${year !== "N/A" ? `(${year})` : ""}</h3>
                ${actionButton}
            </div>
        `;
        moviesGrid.appendChild(card);
    });
}

// ------------------- WATCHLIST BACKEND INTEGRATION -------------------
async function addToWatchlist(movieId, title, posterPath) {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Ֆիլմ ավելացնելու համար նախ մուտք գործեք համակարգ:");
        return;
    }

    try {
        const res = await fetch(`${AUTH_API_URL}/watchlist/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                movie_id: movieId,
                title: title,
                poster_path: posterPath
            })
        });

        const data = await res.json();
        alert(data.message);
    } catch (error) {
        console.error("Սխալ ավելացնելիս:", error);
        alert("Սերվերի սխալ:");
    }
}

async function loadUserWatchlist() {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Խնդրում ենք նախ մուտք գործել համակարգ:");
        return;
    }

    try {
        const res = await fetch(`${AUTH_API_URL}/watchlist/${userId}`);
        const movies = await res.json();
        displayMovies(movies, true);
    } catch (error) {
        console.error("Սխալ բեռնելիս:", error);
    }
}

async function removeFromWatchlist(movieId) {
    const userId = localStorage.getItem("user_id");

    try {
        const res = await fetch(`${AUTH_API_URL}/watchlist/remove`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                movie_id: movieId
            })
        });

        const data = await res.json();
        alert(data.message);
        loadUserWatchlist(); // Թարմացնում ենք ցուցակը
    } catch (error) {
        console.error("Սխալ ջնջելիս:", error);
    }
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
if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput ? searchInput.value.trim() : "";
        if (!query) return;

        categoryButtons.forEach(b => b.classList.remove("active"));
        fetchMovies(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`, `Search Results for "${query}"`);
    });
}

// Watchlist Button Click
if (favoritesBtn) {
    favoritesBtn.addEventListener("click", () => {
        categoryButtons.forEach(b => b.classList.remove("active"));
        if (sectionTitle) sectionTitle.innerText = "My Watchlist";
        loadUserWatchlist();
    });
}