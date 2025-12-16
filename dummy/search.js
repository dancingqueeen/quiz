// Search functionality for Travelya website using Wikipedia API
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchPopup = document.getElementById('searchPopup');
    const searchResults = document.getElementById('searchResults');
    const closeSearchPopup = document.getElementById('closeSearchPopup');
    const searchQueryDisplay = document.getElementById('searchQueryDisplay');
    
    // Wikipedia API configuration
    const WIKIPEDIA_API = {
        baseUrl: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
        searchUrl: 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=',
        format: '&format=json&origin=*'
    };

    // Travel-related keywords for better filtering
    const TRAVEL_KEYWORDS = [
        'city', 'country', 'beach', 'mountain', 'tourism', 'travel', 
        'destination', 'attraction', 'landmark', 'culture', 'heritage',
        'adventure', 'vacation', 'holiday', 'tour', 'trip'
    ];

    // Event Listeners
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    closeSearchPopup.addEventListener('click', closePopup);

    // Close popup when clicking outside
    searchPopup.addEventListener('click', function(e) {
        if (e.target === searchPopup) {
            closePopup();
        }
    });

    // Main search function
    async function performSearch() {
        const query = searchInput.value.trim();
        
        if (!query) {
            showError('Please enter a search term');
            return;
        }

        showLoading();
        openPopup();

        try {
            const results = await searchWikipedia(query);
            displayResults(results, query);
        } catch (error) {
            showError('Failed to fetch search results. Please try again.');
        }
    }

    // Search Wikipedia API
    async function searchWikipedia(query) {
        // First, try to get direct page summary
        try {
            const directResponse = await fetch(`${WIKIPEDIA_API.baseUrl}${encodeURIComponent(query)}`);
            
            if (directResponse.ok) {
                const data = await directResponse.json();
                
                // Check if it's a travel-related topic
                if (isTravelRelated(data.extract)) {
                    return [{
                        title: data.title,
                        extract: data.extract,
                        thumbnail: data.thumbnail?.source || getDefaultImage(data.title),
                        url: data.content_urls?.desktop?.page,
                        type: classifyContent(data.title, data.extract)
                    }];
                }
            }
        } catch (error) {
            // Continue to search API if direct fails
        }

        // If direct search fails or not travel-related, use search API
        const searchResponse = await fetch(
            `${WIKIPEDIA_API.searchUrl}${encodeURIComponent(query + ' travel tourism')}${WIKIPEDIA_API.format}`
        );
        
        if (!searchResponse.ok) {
            throw new Error('Wikipedia API request failed');
        }

        const searchData = await searchResponse.json();
        const results = [];

        // Process search results
        for (const item of searchData.query.search.slice(0, 5)) {
            try {
                const pageResponse = await fetch(`${WIKIPEDIA_API.baseUrl}${encodeURIComponent(item.title)}`);
                
                if (pageResponse.ok) {
                    const pageData = await pageResponse.json();
                    
                    if (isTravelRelated(pageData.extract)) {
                        results.push({
                            title: pageData.title,
                            extract: pageData.extract,
                            thumbnail: pageData.thumbnail?.source || getDefaultImage(pageData.title),
                            url: pageData.content_urls?.desktop?.page,
                            type: classifyContent(pageData.title, pageData.extract)
                        });
                    }
                }
            } catch (error) {
                // Skip this result if fetching details fails
            }
        }

        return results;
    }

    // Check if content is travel-related
    function isTravelRelated(text) {
        if (!text) return false;
        
        const lowerText = text.toLowerCase();
        return TRAVEL_KEYWORDS.some(keyword => lowerText.includes(keyword));
    }

    // Classify content type
    function classifyContent(title, extract) {
        const text = (title + ' ' + extract).toLowerCase();
        
        if (text.includes('city') || text.includes('capital')) return 'City';
        if (text.includes('country') || text.includes('nation')) return 'Country';
        if (text.includes('beach') || text.includes('coast')) return 'Beach';
        if (text.includes('mountain') || text.includes('peak')) return 'Mountain';
        if (text.includes('heritage') || text.includes('unesco')) return 'Heritage Site';
        if (text.includes('island')) return 'Island';
        
        return 'Destination';
    }

    // Get default image based on content type
    function getDefaultImage(title) {
        const type = classifyContent(title, '');
        const defaultImages = {
            'City': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&w=400',
            'Country': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&w=400',
            'Beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&w=400',
            'Mountain': 'https://images.unsplash.com/photo-1464822759844-4c9a?ixlib=rb-4.0.3&w=400',
            'Heritage Site': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&w=400',
            'Island': 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&w=400',
            'Destination': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&w=400'
        };
        return defaultImages[type] || defaultImages['Destination'];
    }

    // Display search results
    function displayResults(results, query) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fa fa-search" style="font-size: 48px; margin-bottom: 15px; color: #ccc;"></i>
                    <h3>No travel destinations found</h3>
                    <p>No travel-related information found for "${query}". Try searching for cities, countries, or popular destinations.</p>
                    <div class="suggestions">
                        <p><strong>Try these searches:</strong></p>
                        <div class="suggestion-tags">
                            <span class="suggestion-tag" onclick="setSearchQuery('Paris')">Paris</span>
                            <span class="suggestion-tag" onclick="setSearchQuery('Japan')">Japan</span>
                            <span class="suggestion-tag" onclick="setSearchQuery('Bali')">Bali</span>
                            <span class="suggestion-tag" onclick="setSearchQuery('New York')">New York</span>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        // In the displayResults function, change this part:
        const resultsHTML = results.map(result => `
            <div class="search-result-item">
                <div class="search-result-image">
                    <img src="${result.thumbnail}" alt="${result.title}" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&w=400'">
                </div>
                <div class="search-result-details">
                    <div class="search-result-title">
                        ${result.title}
                        <span class="search-result-type">${result.type}</span>
                    </div>
                    <div class="search-result-description">
                        ${result.extract.length > 200 ? result.extract.substring(0, 200) + '...' : result.extract}
                    </div>
                    <div class="search-result-meta">
                        <span><i class="fa fa-globe"></i> Wikipedia</span>
                        <span><i class="fa fa-clock-o"></i> ${getReadingTime(result.extract)}</span>
                    </div>
                    <div class="search-result-actions">
                        <button class="btn-read-more" onclick="window.open('${result.url}', '_blank')">
                            <i class="fa fa-external-link"></i> Read More
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        searchResults.innerHTML = resultsHTML;
    }

    // Calculate reading time
    function getReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
    }

    // Show loading state
    function showLoading() {
        searchResults.innerHTML = `
            <div class="search-loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Searching travel destinations...</p>
            </div>
        `;
    }

    // Show error message
    function showError(message) {
        searchResults.innerHTML = `
            <div class="search-error">
                <i class="fa fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                <h3>Search Error</h3>
                <p>${message}</p>
                <button class="btn-try-again" onclick="performSearch()">
                    <i class="fa fa-refresh"></i> Try Again
                </button>
            </div>
        `;
    }

    // Open popup
    function openPopup() {
        searchPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Close popup
    function closePopup() {
        searchPopup.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Save search result (localStorage)
    function saveSearchResult(title) {
        const savedSearches = JSON.parse(localStorage.getItem('travelya_saved_searches') || '[]');
        
        if (!savedSearches.includes(title)) {
            savedSearches.push(title);
            localStorage.setItem('travelya_saved_searches', JSON.stringify(savedSearches));
            showToast(`"${title}" saved to your travel list!`);
        } else {
            showToast(`"${title}" is already in your travel list!`);
        }
    }

    // Show toast notification
    function showToast(message) {
        const existingToast = document.querySelector('.search-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'search-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Set search query from suggestions
    window.setSearchQuery = function(query) {
        searchInput.value = query;
        performSearch();
    };

    // Global function to perform search (for suggestions)
    window.performSearch = performSearch;
});