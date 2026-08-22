const API_KEY = "964104e360ac2eac46f7a30bf25a59d1";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const moviesGrid = document.getElementById("movies-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const modal = document.getElementById("movie-modal");
const closeModal = document.getElementById("close-modal");
const modalBody = document.getElementById("modal-body");
const favoritesBtn = document.getElementById("favorites-btn");
const sectionTitle = document.getElementById("section-title");

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];


async function getTrendingMovies() {
    sectionTitle.innerText = "Trending Movies";
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
    const data = await res.json();
    displayMovies(data.results);
}


function displayMovies(movies) {
    moviesGrid.innerHTML = "";
    movies.forEach(movie => {
        const { id, title, poster_path, vote_average, release_date } = movie;
        const year = release_date ? release_date.split("-")[0] : "N/A";
        const poster = poster_path ? IMG_URL + poster_path : "https://via.placeholder.com/500x750?text=No+Image";

        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
            <img src="${poster}" alt="${title}">
            <div class="movie-info">
                <div class="movie-title">${title}</div>
                <div class="movie-meta">
                    <span>${year}</span>
                    <span class="rating"><i class="fa-solid fa-star"></i> ${vote_average.toFixed(1)}</span>
                </div>
            </div>
        `;

        card.addEventListener("click", () => openMovieDetails(id));
        moviesGrid.appendChild(card);
    });
}


searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    sectionTitle.innerText = `Search Results for "${query}"`;
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    displayMovies(data.results);
});


async function openMovieDetails(movieId) {
    const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    const movie = await res.json();

    const isSaved = watchlist.some(m => m.id === movie.id);

    modalBody.innerHTML = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <img src="${IMG_URL + movie.poster_path}" style="width: 160px; border-radius: 12px; object-fit: cover;">
            <div style="flex: 1;">
                <h2 style="font-size: 22px; margin-bottom: 8px;">${movie.title}</h2>
                <p style="color: #f59e0b; font-weight: 700; margin-bottom: 12px;">⭐ ${movie.vote_average.toFixed(1)} / 10</p>
                <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">${movie.overview}</p>
                <button id="toggle-watchlist" style="margin-top: 15px;" class="nav-btn">
                    <i class="fa-solid ${isSaved ? 'fa-trash' : 'fa-heart'}"></i>
                    ${isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
            </div>
        </div>
    `;

    modal.classList.remove("hidden");

    document.getElementById("toggle-watchlist").addEventListener("click", () => {
        if (isSaved) {
            watchlist = watchlist.filter(m => m.id !== movie.id);
        } else {
            watchlist.push(movie);
        }
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        openMovieDetails(movieId);
    });
}

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
window.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });


favoritesBtn.addEventListener("click", () => {
    sectionTitle.innerText = "My Watchlist";
    displayMovies(watchlist);
});

getTrendingMovies();