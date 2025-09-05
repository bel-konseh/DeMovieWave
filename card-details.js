import {TMDB_API_KEY, TMDB_ACCESS_TOKEN } from "./config.js";

class MovieDetails {
    constructor() {
        this.options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
            }
        };
        this.modal = new bootstrap.Modal(document.getElementById('movieDetailModal'));
        this.currentMovieId = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Trailer button event listener
        document.getElementById('trailerBtn').addEventListener('click', () => {
            this.playTrailer();
        });

        // Watchlist button event listener
        document.getElementById('modalWatchlistBtn').addEventListener('click', () => {
            this.addToWatchlist();
        });
    }

    // Add click event listeners to movie cards
    attachCardEventListeners() {
        const movieCards = document.querySelectorAll('.movie-card');
        movieCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const movieId = card.dataset.movieId;
                if (movieId) {
                    this.showMovieDetails(movieId);
                }
            });
        });
    }

    // Fetch and display movie details
    async showMovieDetails(movieId) {
        try {
            this.currentMovieId = movieId;
            
            // Show loading state
            this.showLoadingState();
            
            // Fetch movie details, credits, and videos in parallel
            const [movieDetails, movieCredits, movieVideos, similarMovies] = await Promise.all([
                this.fetchMovieDetails(movieId),
                this.fetchMovieCredits(movieId),
                this.fetchMovieVideos(movieId),
                this.fetchSimilarMovies(movieId)
            ]);

            // Populate modal with movie details
            this.populateModal(movieDetails, movieCredits, movieVideos, similarMovies);
            
            // Show modal
            this.modal.show();

        } catch (error) {
            console.error('Error fetching movie details:', error);
            this.showErrorState();
        }
    }

    // Fetch detailed movie information
    async fetchMovieDetails(movieId) {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
            this.options
        );
        return await response.json();
    }

    // Fetch movie cast and crew
    async fetchMovieCredits(movieId) {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`,
            this.options
        );
        return await response.json();
    }

    // Fetch movie videos (trailers)
    async fetchMovieVideos(movieId) {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
            this.options
        );
        return await response.json();
    }

    // Fetch similar movies
    async fetchSimilarMovies(movieId) {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/similar?language=en-US&page=1`,
            this.options
        );
        return await response.json();
    }

    // Populate modal with fetched data
    populateModal(movieDetails, movieCredits, movieVideos, similarMovies) {
        // Movie title
        document.getElementById('movieDetailLabel').textContent = movieDetails.title;

        // Movie poster
        const modalPoster = document.getElementById('modalPoster');
        modalPoster.src = movieDetails.poster_path 
            ? `https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';
        modalPoster.alt = movieDetails.title;

        // Movie overview
        document.getElementById('modalOverview').textContent = 
            movieDetails.overview || 'No description available.';

        // Release date
        document.getElementById('modalRelease').textContent = 
            movieDetails.release_date ? new Date(movieDetails.release_date).toLocaleDateString() : 'Unknown';

        // Rating
        document.getElementById('modalRating').textContent = 
            movieDetails.vote_average ? `${movieDetails.vote_average.toFixed(1)}/10` : 'Not rated';

        // Cast (top 5 actors)
        this.populateActors(movieCredits.cast);

        // Store trailer information
        this.storeTrailerInfo(movieVideos.results);

        // Similar movies
        this.populateSimilarMovies(similarMovies.results);
    }

    // Populate actors section
    populateActors(cast) {
        const actorsContainer = document.getElementById('modalActors');
        actorsContainer.innerHTML = '';

        const topActors = cast.slice(0, 5);
        
        if (topActors.length > 0) {
            topActors.forEach(actor => {
                const actorBadge = document.createElement('span');
                actorBadge.className = 'badge bg-warning text-dark me-1 mb-1';
                actorBadge.textContent = actor.name;
                actorsContainer.appendChild(actorBadge);
            });
        } else {
            actorsContainer.innerHTML = '<span class="text-muted">Cast information not available</span>';
        }
    }

    // Store trailer information for later use
    storeTrailerInfo(videos) {
        // Find the first trailer or teaser
        this.currentTrailer = videos.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        ) || videos.find(video => 
            video.type === 'Teaser' && video.site === 'YouTube'
        );

        // Update trailer button state
        const trailerBtn = document.getElementById('trailerBtn');
        if (this.currentTrailer) {
            trailerBtn.disabled = false;
            trailerBtn.innerHTML = '<i class="bi bi-play-circle"></i> Play Trailer';
        } else {
            trailerBtn.disabled = true;
            trailerBtn.innerHTML = '<i class="bi bi-play-circle"></i> No Trailer Available';
        }
    }

    // Play trailer functionality
    playTrailer() {
        if (this.currentTrailer) {
            const trailerUrl = `https://www.youtube.com/watch?v=${this.currentTrailer.key}`;
            window.open(trailerUrl, '_blank');
        }
    }

    // Populate similar movies
    populateSimilarMovies(similarMovies) {
        const similarContainer = document.getElementById('modalSimilar');
        similarContainer.innerHTML = '';

        const limitedSimilar = similarMovies.slice(0, 6);

        if (limitedSimilar.length > 0) {
            limitedSimilar.forEach(movie => {
                const movieElement = document.createElement('div');
                movieElement.className = 'similar-movie-item';
                movieElement.style.cursor = 'pointer';
                movieElement.innerHTML = `
                    <div class="text-center">
                        <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w200/${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}" 
                             alt="${movie.title}" 
                             style="width: 60px; height: 90px; object-fit: cover; border-radius: 4px;display: flex-wrap">
                        <small class="d-block mt-1 text-truncate" style="max-width: 60px;">${movie.title}</small>
                    </div>
                `;
                
                // Add click event to similar movie
                movieElement.addEventListener('click', () => {
                    this.showMovieDetails(movie.id);
                });

                similarContainer.appendChild(movieElement);
            });
        } else {
            similarContainer.innerHTML = '<span class="text-muted">No similar movies found</span>';
        }
    }

    // Add to watchlist functionality
    addToWatchlist() {
        if (this.currentMovieId) {
            // Get existing watchlist from localStorage
            let watchlist = JSON.parse(localStorage.getItem('movieWatchlist') || '[]');
            
            // Check if movie is already in watchlist
            const isAlreadyInWatchlist = watchlist.some(movie => movie.id === this.currentMovieId);
            
            if (!isAlreadyInWatchlist) {
                // Get current movie details
                const movieTitle = document.getElementById('movieDetailLabel').textContent;
                const moviePoster = document.getElementById('modalPoster').src;
                
                // Add to watchlist
                watchlist.push({
                    id: this.currentMovieId,
                    title: movieTitle,
                    poster: moviePoster,
                    addedDate: new Date().toISOString()
                });
                
                // Save to localStorage
                localStorage.setItem('movieWatchlist', JSON.stringify(watchlist));
                
                // Update button
                const watchlistBtn = document.getElementById('modalWatchlistBtn');
                watchlistBtn.innerHTML = '<i class="bi bi-check-circle"></i> Added to Watchlist';
                watchlistBtn.disabled = true;
                
                // Show success message
                this.showSuccessMessage('Movie added to watchlist!');
            } else {
                this.showSuccessMessage('Movie is already in your watchlist!');
            }
        }
    }

    // Show loading state
    showLoadingState() {
        document.getElementById('movieDetailLabel').textContent = 'Loading...';
        document.getElementById('modalOverview').textContent = 'Loading movie details...';
        document.getElementById('modalRelease').textContent = '...';
        document.getElementById('modalRating').textContent = '...';
        document.getElementById('modalActors').innerHTML = '<span class="text-muted">Loading cast...</span>';
    }

    // Show error state
    showErrorState() {
        document.getElementById('movieDetailLabel').textContent = 'Error';
        document.getElementById('modalOverview').textContent = 'Failed to load movie details. Please try again.';
    }

    // Show success message
    showSuccessMessage(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'position-fixed top-0 end-0 p-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="toast show" role="alert">
                <div class="toast-body bg-success text-white rounded">
                    <i class="bi bi-check-circle me-2"></i>${message}
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize MovieDetails when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.movieDetails = new MovieDetails();
});

// Export for use in other modules
export default MovieDetails;