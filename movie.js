const API_KEY = "964104e360ac2eac46f7a30bf25a59d1";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const container = document.getElementById("movie-details-container");

// Ստանում ենք URL-ի ID պարամետրը (?id=12345)
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

async function loadMovieDetails() {
    if (!movieId) {
        container.innerHTML = "<h2>Movie not found.</h2>";
        return;
    }

    const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    const movie = await res.json();

    const isSaved = watchlist.some(m => m.id === movie.id);
    const embedUrl = `https://2embed.cc/embed/${movie.id}`;
    document.title = `${movie.title} — CinePulse`;

    container.innerHTML = `
        <!-- TOP: MOVIE DETAILS -->
        <div class="movie-details-header">
            <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/500x750'}" class="details-poster">
            <div class="details-info">
                <h1>${movie.title}</h1>
                <p class="movie-rating">⭐ ${movie.vote_average.toFixed(1)} / 10 | 📅 ${movie.release_date || 'N/A'}</p>
                <p class="movie-overview">${movie.overview || 'No overview available.'}</p>
                
                <button id="toggle-watchlist" class="nav-btn">
                    <i class="fa-solid ${isSaved ? 'fa-trash' : 'fa-heart'}"></i>
                    ${isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
            </div>
        </div>

        <!-- BOTTOM: VIDEO PLAYER -->
        <div class="player-section">
            <h2><i class="fa-solid fa-circle-play"></i> Watch Movie Now</h2>
            <div class="responsive-player">
                <iframe src="${embedUrl}" allowfullscreen scrolling="no" allow="autoplay; encrypted-media"></iframe>
            </div>
        </div>
    `;

    document.getElementById("toggle-watchlist").addEventListener("click", () => {
        if (watchlist.some(m => m.id === movie.id)) {
            watchlist = watchlist.filter(m => m.id !== movie.id);
        } else {
            watchlist.push(movie);
        }
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        loadMovieDetails();
    });
}

loadMovieDetails();