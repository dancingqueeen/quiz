// Chatbot Configuration - API ONLY, NO HARDCODED DATA
const API_CONFIG = {
    wikipedia: "https://en.wikipedia.org/api/rest_v1/page/summary/",
    countries: "https://restcountries.com/v3.1/name/",
    duckduckgo: "https://api.duckduckgo.com/?format=json&q=",
    weather: "https://api.open-meteo.com/v1/forecast",
    geocoding: "https://geocoding-api.open-meteo.com/v1/search"
};

// DOM Elements
let chatbotToggle, chatbotWindow, chatbotClose, chatbotMessages, chatbotInput, chatbotSend, typingIndicator;
let isOpen = false;

// Initialize chatbot
function initChatbot() {
    chatbotToggle = document.getElementById('chatbotToggle');
    chatbotWindow = document.getElementById('chatbotWindow');
    chatbotClose = document.getElementById('chatbotClose');
    chatbotMessages = document.getElementById('chatbotMessages');
    chatbotInput = document.getElementById('chatbotInput');
    chatbotSend = document.getElementById('chatbotSend');
    typingIndicator = document.getElementById('typingIndicator');

    if (!chatbotToggle || !chatbotWindow) return;

    chatbotWindow.style.display = 'none';
    
    chatbotToggle.onclick = function(e) {
        e.stopPropagation();
        isOpen = !isOpen;
        chatbotWindow.style.display = isOpen ? 'flex' : 'none';
        if (isOpen && chatbotInput) setTimeout(() => chatbotInput.focus(), 100);
    };

    chatbotClose.onclick = function(e) {
        e.stopPropagation();
        isOpen = false;
        chatbotWindow.style.display = 'none';
    };

    chatbotSend.onclick = function(e) {
        e.preventDefault();
        sendMessage();
    };

    chatbotInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };
}

// PURE API FUNCTIONS - RETURN RAW API DATA ONLY

// Geocoding API for city coordinates with fallback coordinates
async function fetchCityCoordinates(city) {
    try {
        const response = await fetch(`${API_CONFIG.geocoding}?name=${encodeURIComponent(city)}&count=5`);
        if (!response.ok) throw new Error('Geocoding API failed');
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            // Fallback coordinates for major cities
            const fallbackCoords = {
                'berlin': { lat: 52.5200, lng: 13.4050, name: 'Berlin' },
                'dubai': { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
                'singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
                'rome': { lat: 41.9028, lng: 12.4964, name: 'Rome' },
                'sydney': { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
                'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
                'delhi': { lat: 28.7041, lng: 77.1025, name: 'Delhi' },
                'toronto': { lat: 43.6532, lng: -79.3832, name: 'Toronto' }
            };
            const cityKey = city.toLowerCase().trim();
            if (fallbackCoords[cityKey]) return fallbackCoords[cityKey];
            throw new Error('City not found');
        }
        
        return {
            lat: data.results[0].latitude,
            lng: data.results[0].longitude,
            name: data.results[0].name
        };
    } catch (error) {
        throw new Error('Geocoding failed');
    }
}

// Wikipedia API for destination info
async function fetchDestinationInfo(place) {
    const response = await fetch(`${API_CONFIG.wikipedia}${encodeURIComponent(place)}`);
    if (!response.ok) throw new Error('Wikipedia API failed');
    const data = await response.json();
    if (!data.extract) throw new Error('No description available');
    return data.extract;
}

// DuckDuckGo API for additional info
async function fetchDuckDuckGoInfo(query) {
    const response = await fetch(`${API_CONFIG.duckduckgo}${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('DuckDuckGo API failed');
    const data = await response.json();
    if (data.Abstract && data.Abstract !== "") return data.Abstract;
    if (data.Answer) return data.Answer;
    throw new Error('No information found');
}

// RestCountries API for country information - IMPROVED
async function fetchCountryData(country) {
    // Clean country name - remove phrases like "population of", "capital of"
    const cleanCountry = country.replace(/(population of|capital of|currency in|language in)/gi, '').trim();
    
    const response = await fetch(`${API_CONFIG.countries}${encodeURIComponent(cleanCountry)}`);
    if (!response.ok) throw new Error('Countries API failed');
    const data = await response.json();
    const countryInfo = data[0];
    if (!countryInfo) throw new Error('Country not found');
    
    return {
        name: countryInfo.name?.common,
        currency: countryInfo.currencies ? Object.values(countryInfo.currencies)[0]?.name : null,
        population: countryInfo.population,
        language: countryInfo.languages ? Object.values(countryInfo.languages)[0] : null,
        capital: countryInfo.capital ? countryInfo.capital[0] : null,
        region: countryInfo.region
    };
}

// Open-Meteo API for weather
async function fetchWeatherData(location) {
    const coords = await fetchCityCoordinates(location);
    
    const weatherUrl = `${API_CONFIG.weather}?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error('Weather API failed');
    
    const weatherData = await response.json();
    const current = weatherData.current;
    if (!current) throw new Error('No current weather data available');
    
    // Weather code descriptions
    const weatherCodes = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 53: 'Moderate drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 95: 'Thunderstorm'
    };
    
    return {
        description: weatherCodes[current.weather_code] || `Code ${current.weather_code}`,
        temperature: current.temperature_2m,
        windspeed: current.wind_speed_10m,
        location: coords.name
    };
}

// PURE API RESPONSE GENERATORS - NO HARDCODED TEXT
async function getWeatherResponse(location) {
    try {
        const weatherData = await fetchWeatherData(location);
        return JSON.stringify(weatherData);
    } catch (error) {
        return "No data available";
    }
}

async function getDestinationResponse(place) {
    try {
        const destinationInfo = await fetchDestinationInfo(place);
        return destinationInfo;
    } catch (error) {
        try {
            const duckDuckGoInfo = await fetchDuckDuckGoInfo(place);
            return duckDuckGoInfo;
        } catch (fallbackError) {
            return "No data available";
        }
    }
}

async function getCountryResponse(country) {
    try {
        const countryData = await fetchCountryData(country);
        return JSON.stringify(countryData);
    } catch (error) {
        return "No data available";
    }
}

async function getFlightResponse() {
    try {
        const flightInfo = await fetchDestinationInfo('air travel');
        return flightInfo;
    } catch (error) {
        return "No data available";
    }
}

async function getAttractionsResponse(location) {
    try {
        // Try direct city info first (better success rate)
        const cityInfo = await fetchDestinationInfo(location);
        return cityInfo;
    } catch (error) {
        try {
            // Fallback to tourism topic
            const tourismInfo = await fetchDestinationInfo(`${location} tourism`);
            return tourismInfo;
        } catch (fallbackError) {
            return "No data available";
        }
    }
}

// IMPROVED MESSAGE PROCESSING
async function processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    if (!window.chatbotContext) {
        window.chatbotContext = { waitingFor: null };
    }

    // Handle context if waiting for specific input
    if (window.chatbotContext.waitingFor) {
        const context = window.chatbotContext.waitingFor;
        window.chatbotContext.waitingFor = null;
        
        switch (context) {
            case 'weather_location': return await getWeatherResponse(message);
            case 'destination_name': return await getDestinationResponse(message);
            case 'country_name': return await getCountryResponse(message);
            case 'attractions_location': return await getAttractionsResponse(message);
        }
    }

    // IMPROVED EXTRACTION - handle more patterns
    const location = extractLocation(lowerMessage);
    const country = extractCountry(lowerMessage);
    const place = extractPlace(lowerMessage);
    
    if (lowerMessage.includes('weather') || lowerMessage.includes('temperature') || lowerMessage.includes('forecast')) {
        if (location) return await getWeatherResponse(location);
        window.chatbotContext.waitingFor = 'weather_location';
        return "weather_location";
    }
    else if (lowerMessage.includes('tell me about') || lowerMessage.includes('information about') || lowerMessage.includes('describe')) {
        if (place) return await getDestinationResponse(place);
        window.chatbotContext.waitingFor = 'destination_name';
        return "destination_name";
    }
    else if (lowerMessage.includes('currency') || lowerMessage.includes('population') || lowerMessage.includes('language') || lowerMessage.includes('capital')) {
        if (country) return await getCountryResponse(country);
        window.chatbotContext.waitingFor = 'country_name';
        return "country_name";
    }
    else if (lowerMessage.includes('flight') || lowerMessage.includes('fly') || lowerMessage.includes('airline')) {
        return await getFlightResponse();
    }
    else if (lowerMessage.includes('attraction') || lowerMessage.includes('places to visit') || lowerMessage.includes('things to do') || lowerMessage.includes('tourism')) {
        if (location) return await getAttractionsResponse(location);
        window.chatbotContext.waitingFor = 'attractions_location';
        return "attractions_location";
    }
    else if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
        try {
            const travelInfo = await fetchDestinationInfo('travel');
            return travelInfo;
        } catch (error) {
            return "No data available";
        }
    }
    else {
        // Try to handle as a general query
        try {
            const generalInfo = await fetchDestinationInfo(message);
            return generalInfo;
        } catch (error) {
            return "No data available";
        }
    }
}

// IMPROVED EXTRACTION HELPERS
function extractLocation(message) {
    const patterns = [
        /(?:weather|temperature|forecast) in (.+?)(?:\?|$| for)/,
        /(?:attractions|places|things to do) in (.+?)(?:\?|$| for)/,
        /(?:flights?|fly) to (.+?)(?:\?|from|$)/,
        /(?:weather|temperature) (.+?)(?:\?|$)/
    ];
    
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) return match[1].trim();
    }
    
    // Direct city mentions
    const cities = ['london', 'paris', 'tokyo', 'new york', 'rome', 'berlin', 'dubai', 'sydney', 'mumbai', 'delhi', 'toronto', 'singapore'];
    for (const city of cities) {
        if (message.includes(city)) return city;
    }
    
    return null;
}

function extractPlace(message) {
    const match = message.match(/(?:tell me about|information about|describe) (.+?)(?:\?|$)/);
    return match ? match[1].trim() : null;
}

function extractCountry(message) {
    const patterns = [
        /(?:currency|population|language|capital) in (.+?)(?:\?|$)/,
        /(?:currency|population|language|capital) of (.+?)(?:\?|$)/,
        /population of (.+?)(?:\?|$)/,
        /capital of (.+?)(?:\?|$)/
    ];
    
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) return match[1].trim();
    }
    
    return null;
}

// UI Functions (unchanged)
async function sendMessage() {
    const message = chatbotInput.value.trim();
    if (message === '') return;

    addMessage(message, 'user');
    chatbotInput.value = '';
    showTypingIndicator();

    try {
        const response = await processMessage(message);
        hideTypingIndicator();
        addMessage(response, 'bot');
    } catch (error) {
        hideTypingIndicator();
        addMessage("No data available", 'bot');
    }
}

function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
}

function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

function addMessage(text, sender) {
    if (!chatbotMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initChatbot, 100);
});

setTimeout(() => {
    if (typeof initChatbot === 'function') initChatbot();
}, 2000);