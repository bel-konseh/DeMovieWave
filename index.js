

import {TMDB_API_KEY, TMDB_ACCESS_TOKEN } from "./config.js";


const movieBox = document.getElementById('moviesRow');
let searchInput = document.getElementById('searchInput');
let searchInputBtn = document.getElementById('searchInputBtn');
const searchForm = document.getElementById('searchForm');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const movieSection = document.getElementById('moviesSection');

 
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` 
  }
};

const fetchPopularMovies = async () => {
    try {
        fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options)
  .then(res => res.json())
  .then(res => {
        console.log(res)
        res.results.forEach((movie) => {

        const movieCard = document.createElement('div');
        movieCard.classList.add('p-0', 'col-md-3', 'mx-4', 'card', 'bg-dark', 'text-white', 'movie-card');
        movieCard.style.cursor = 'pointer';
        movieCard.dataset.movieId = movie.id;

        const movieBackdrop = document.createElement('img');

        movieBackdrop.classList.add('card-img');
        movieBackdrop.src = `https://image.tmdb.org/t/p/w500/${movie.backdrop_path}`;
        movieBackdrop.alt = movie.original_title;

        const movieTitle = document.createElement('h4');
        movieTitle.classList.add('card-title');
        movieTitle.textContent = movie.original_title;

        movieCard.appendChild(movieBackdrop);
        movieCard.appendChild(movieTitle);

        movieBox.appendChild(movieCard);


        })

})
  .then(() => {
    // Initialize card click events after movies are loaded
    setTimeout(() => {
      if (window.movieDetails) {
        window.movieDetails.attachCardEventListeners();
      }
    }, 100);
  })
  .catch(err => console.error(err));

    } catch (error) {
        movieBox.innerHTML = `<h3>failed to load popular movies</h3>`
    }
}

const searchMovie = async (e)=>{
    e.preventDefault()
    console.log(searchInput.value)
    try {
        const searchQuery = searchInput.value.trim();
        if(! (searchQuery === '')){
           const results =await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${searchQuery}`,options);
           const data = await results.json();
           console.log(data)
                showSearchResults(data.results);
           if(data.results.length ==0){
                showNoResultsMessage(searchQuery);
           }
        }else{
            
        }
    } catch (error) {
        console.log("message: "+error)
    }
}

// function to execute when a search yields no results
function showNoResultsMessage(query) {
    const message = document.createElement("small");
    message.textContent = `No movie found with title "${query}"`;
    message.classList.add("text-danger");
  
    
    // Insert message above or before movieBox
    searchForm.parentNode.insertBefore(message, toggleModeBtn);
}


const showSearchResults = (data) => {

    
    const searchResults = document.createElement('div');
    searchResults.classList.add('mt-4','row', 'gap-2', 'row-cols-1', 'row-cols-sm-2', 'row-cols-md-3', 'row-cols-lg-4');
    const searchHeaderText = document.createElement('p');
    searchHeaderText.textContent = `Search results for "${searchInput.value}"`;
    searchResults.classList.add('row');
    searchResults.appendChild(searchHeaderText);
    data.forEach((movie) => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('p-0', 'col-md-3', 'mx-4', 'card', 'bg-dark', 'text-white', 'movie-card');
        movieCard.style.cursor = 'pointer';
        movieCard.dataset.movieId = movie.id;

        const movieBackdrop = document.createElement('img');

        movieBackdrop.classList.add('card-img');
        movieBackdrop.src = `https://image.tmdb.org/t/p/w500/${movie.backdrop_path}`;
        movieBackdrop.alt = movie.original_title;

        const movieTitle = document.createElement('h4');
        movieTitle.classList.add('card-title');
        movieTitle.textContent = movie.original_title;

        movieCard.appendChild(movieBackdrop);
        movieCard.appendChild(movieTitle);
        searchResults.appendChild(movieCard);
        
      
        

       
    })

       movieSection.appendChild(searchResults);
console.log("search results appended");

// Initialize card click events for search results
setTimeout(() => {
  if (window.movieDetails) {
    window.movieDetails.attachCardEventListeners();
  }
}, 100);

}

searchInputBtn.addEventListener('click', searchMovie)


fetchPopularMovies();
// Initialize card click events after movies are loaded
const initializeCardEvents = () => {
    if (window.movieDetails) {
        window.movieDetails.attachCardEventListeners();
    }
};

// Call this after fetchPopularMovies and showSearchResults
// Modify your existing functions to call this: