// API Key de TMDB (The Movie Database)
const API_KEY = 'api_key=1cf50e6248dc270629e802686245c2c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;

// Elementos del DOM
const trendingMoviesEl = document.getElementById('trending-movies');
const popularMoviesEl = document.getElementById('popular-movies');
const topRatedMoviesEl = document.getElementById('top-rated-movies');
const upcomingMoviesEl = document.getElementById('upcoming-movies');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchModal = document.getElementById('search-modal');
const movieModal = document.getElementById('movie-modal');
const modalSearchInput = document.getElementById('modal-search-input');
const modalSearchButton = document.getElementById('modal-search-button');
const modalSearchResults = document.getElementById('modal-search-results');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');
const closeMobileMenu = document.querySelector('.close-mobile-menu');

// Variables globales
let currentPage = 1;
let totalPages = 0;

// Event listeners
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Abrir modal de búsqueda
searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.style.overflow = 'hidden';
    searchModal.classList.add('active');
    modalSearchInput.focus();
});

// Cerrar modales
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.style.overflow = 'auto';
        searchModal.classList.remove('active');
        movieModal.classList.remove('active');
    });
});

// Buscar películas desde el modal
modalSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
        searchMovies(query);
    } else {
        modalSearchResults.innerHTML = '<div class="no-results">Escribe al menos 3 caracteres para buscar</div>';
    }
});

modalSearchButton.addEventListener('click', (e) => {
    e.preventDefault();
    const query = modalSearchInput.value.trim();
    if (query.length > 2) {
        searchMovies(query);
    } else {
        modalSearchResults.innerHTML = '<div class="no-results">Escribe al menos 3 caracteres para buscar</div>';
    }
});

// Menú móvil
hamburgerMenu.addEventListener('click', (e) => {
    e.preventDefault();
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeMobileMenu.addEventListener('click', (e) => {
    e.preventDefault();
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Cerrar modales al hacer clic fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === searchModal || e.target === movieModal || e.target === mobileMenu) {
        document.body.style.overflow = 'auto';
        searchModal.classList.remove('active');
        movieModal.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
});

// Función para obtener películas
async function getMovies(url, element) {
    try {
        showLoading(element);
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            showMovies(data.results, element);
        } else {
            showNoResults(element);
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        showError(element);
    }
}

// Mostrar estado de carga
function showLoading(element) {
    element.innerHTML = '<div class="loading">Cargando...</div>';
}

// Mostrar mensaje de error
function showError(element) {
    element.innerHTML = '<div class="error">Error al cargar las películas</div>';
}

// Mostrar mensaje sin resultados
function showNoResults(element) {
    element.innerHTML = '<div class="no-results">No se encontraron películas</div>';
}

// Función para mostrar películas
function showMovies(movies, element) {
    element.innerHTML = '';
    
    movies.forEach(movie => {
        const { title, poster_path, overview, id } = movie;
        
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${poster_path ? IMG_URL + poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" alt="${title}" loading="lazy">
            <div class="movie-info">
                <h3 class="movie-title">${title}</h3>
                <p class="movie-overview">${overview || 'Descripción no disponible'}</p>
            </div>
        `;
        
        movieCard.addEventListener('click', () => {
            showMovieDetails(movie);
        });
        
        element.appendChild(movieCard);
    });
}

// Función para buscar películas
async function searchMovies(query) {
    modalSearchResults.innerHTML = '<div class="loading">Buscando...</div>';
    
    try {
        const response = await fetch(searchURL + '&query=' + encodeURIComponent(query));
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            modalSearchResults.innerHTML = '';
            
            data.results.forEach(movie => {
                const { title, poster_path, overview, id, release_date, vote_average } = movie;
                
                const resultCard = document.createElement('div');
                resultCard.classList.add('search-result-card');
                resultCard.innerHTML = `
                    <img src="${poster_path ? IMG_URL + poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" alt="${title}" loading="lazy">
                    <div class="search-result-info">
                        <h3 class="search-result-title">${title}</h3>
                        <div class="search-result-meta">
                            ${release_date ? `<span>${release_date.split('-')[0]}</span>` : ''}
                            ${vote_average ? `<span>⭐ ${vote_average.toFixed(1)}</span>` : ''}
                        </div>
                        <p class="search-result-overview">${overview || 'Descripción no disponible'}</p>
                    </div>
                `;
                
                resultCard.addEventListener('click', () => {
                    showMovieDetails(movie);
                    searchModal.classList.remove('active');
                    document.body.style.overflow = 'hidden';
                });
                
                modalSearchResults.appendChild(resultCard);
            });
        } else {
            modalSearchResults.innerHTML = '<div class="no-results">No se encontraron resultados</div>';
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        modalSearchResults.innerHTML = '<div class="error">Error al buscar películas</div>';
    }
}

// Función para mostrar detalles de la película
async function showMovieDetails(movie) {
    document.body.style.overflow = 'hidden';
    
    try {
        // Mostrar estado de carga en el modal
        movieModal.querySelector('.movie-modal-content').innerHTML = `
            <div class="loading-modal">
                <div class="spinner"></div>
                <p>Cargando detalles...</p>
            </div>
        `;
        movieModal.classList.add('active');
        
        // Obtener detalles adicionales de la película
        const response = await fetch(`${BASE_URL}/movie/${movie.id}?${API_KEY}&append_to_response=videos,credits`);
        const data = await response.json();
        
        // Formatear la duración
        const runtime = data.runtime ? 
            `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : 
            'Duración no disponible';
        
        // Rellenar el modal con la información
        const modalContent = `
            <span class="close-modal">&times;</span>
            <div class="movie-modal-poster">
                <img id="modal-movie-poster" 
                     src="${data.backdrop_path ? IMG_URL + data.backdrop_path : 
                          data.poster_path ? IMG_URL + data.poster_path : 
                          'https://via.placeholder.com/500x750?text=No+Image'}" 
                     alt="${data.title}" 
                     loading="lazy">
            </div>
            <div class="movie-modal-info">
                <h2 id="modal-movie-title">${data.title || 'Título no disponible'}</h2>
                <div class="movie-meta">
                    ${data.release_date ? `<span id="modal-movie-year">${data.release_date.split('-')[0]}</span>` : ''}
                    ${data.vote_average ? `<span id="modal-movie-rating">⭐ ${data.vote_average.toFixed(1)}/10</span>` : ''}
                    <span id="modal-movie-runtime">${runtime}</span>
                </div>
                <p id="modal-movie-overview">${data.overview || 'Descripción no disponible'}</p>
                
                ${data.genres && data.genres.length > 0 ? `
                <div class="movie-genres" id="modal-movie-genres">
                    ${data.genres.map(genre => `<span class="movie-genre">${genre.name}</span>`).join('')}
                </div>
                ` : ''}
                
                <div class="movie-modal-buttons">
                    <button class="play-button">
                        <i class="fas fa-play"></i> Reproducir
                    </button>
                    <button class="add-to-list">
                        <i class="fas fa-plus"></i> Mi lista
                    </button>
                </div>
            </div>
        `;
        
        movieModal.querySelector('.movie-modal-content').innerHTML = modalContent;
        
        // Agregar evento de cierre al nuevo botón
        movieModal.querySelector('.close-modal').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.body.style.overflow = 'auto';
            movieModal.classList.remove('active');
        });
        
    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieModal.querySelector('.movie-modal-content').innerHTML = `
            <span class="close-modal">&times;</span>
            <div class="error-modal">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error al cargar los detalles de la película</p>
                <button class="retry-button" onclick="showMovieDetails(${JSON.stringify(movie)})">
                    Reintentar
                </button>
            </div>
        `;
        
        movieModal.querySelector('.close-modal').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.body.style.overflow = 'auto';
            movieModal.classList.remove('active');
        });
    }
}

// Cargar diferentes categorías de películas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    // Películas en tendencia
    getMovies(BASE_URL + '/trending/movie/week?' + API_KEY, trendingMoviesEl);
    
    // Películas populares
    getMovies(BASE_URL + '/movie/popular?' + API_KEY + '&page=1', popularMoviesEl);
    
    // Películas mejor valoradas
    getMovies(BASE_URL + '/movie/top_rated?' + API_KEY + '&page=1', topRatedMoviesEl);
    
    // Próximos estrenos
    getMovies(BASE_URL + '/movie/upcoming?' + API_KEY + '&page=1', upcomingMoviesEl);
    
    // Configurar búsqueda en el header
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.classList.toggle('active');
        if (searchInput.classList.contains('active')) {
            searchInput.focus();
        }
    });
    
    // Manejar la tecla Enter en la búsqueda
    modalSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = modalSearchInput.value.trim();
            if (query.length > 2) {
                searchMovies(query);
            }
        }
    });
});