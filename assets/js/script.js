const apiKey = '0059f9889ee293f5c6b41d8425101d06';
const cityForm = document.getElementById('search-form'); 
const cityInput = document.getElementById('city-input');
const currentWeatherEl = document.getElementById('current-weather');
const forecastEl = document.getElementById('forecast');
const searchHistoryEl = document.getElementById('search-history');

document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = document.getElementById('city-input').value;
    if (city) {
        const coords = await fetchCoordinates(city);
        if (coords) {
            await loadWeatherData(coords.lat, coords.lon);
            updateHistory(city);
            renderHistory();
        }
    }
});

// Fetch coordinates for a given city
const fetchCoordinates = async (city) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
        const data = await response.json();
        return { lat: data.coord.lat, lon: data.coord.lon };
    } catch (error) {
        console.error('Failed to get coordinates:', error);
    }
};

// Fetch weather data using latitude and longitude
const loadWeatherData = async (lat, lon) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        showCurrentWeather(data);
        showForecast(data);
    } catch (error) {
        console.error('Failed to get weather data:', error);
    }
};

// Display the current weather information
const showCurrentWeather = (data) => {
    const current = data.list[0];
    const weatherHTML = `
        <h3>${data.city.name} (${new Date(current.dt * 1000).toLocaleDateString()})</h3>
        <img src="http://openweathermap.org/img/wn/${current.weather[0].icon}.png" alt="${current.weather[0].description}">
        <p>Temperature: ${current.main.temp} °C</p>
        <p>Humidity: ${current.main.humidity}%</p>
        <p>Wind Speed: ${current.wind.speed} m/s</p>
    `;
    document.getElementById('current-weather-details').innerHTML = weatherHTML;
};

// Display the 5-day weather forecast
const showForecast = (data) => {
    let forecastHTML = '';
    for (let i = 1; i < data.list.length; i += 8) { // 8 data points per day
        const day = data.list[i];
        forecastHTML += `
            <div class="forecast-day">
                <h4>${new Date(day.dt * 1000).toLocaleDateString()}</h4>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                <p>Temperature: ${day.main.temp} °C</p>
                <p>Humidity: ${day.main.humidity}%</p>
                <p>Wind Speed: ${day.wind.speed} m/s</p>
            </div>
        `;
    }
    document.getElementById('forecast-details').innerHTML = forecastHTML;
};

// Save the searched city to the local storage
const updateHistory = (city) => {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }
};

// Render the search history and add event listeners to the history buttons
const renderHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const historyContainer = document.getElementById('search-history');
    historyContainer.innerHTML = '';
    history.forEach(city => {
        const button = document.createElement('button');
        button.textContent = city;
        button.addEventListener('click', async () => {
            const coords = await fetchCoordinates(city);
            if (coords) {
                await loadWeatherData(coords.lat, coords.lon);
            }
        });
        historyContainer.appendChild(button);
    });
};

renderHistory();