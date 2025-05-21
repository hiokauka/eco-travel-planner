document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.navbar .nav-link');
    const currentUrl = window.location.href;

    navLinks.forEach(function (link) {
        const linkUrl = link.getAttribute('href');
        if (currentUrl.includes(linkUrl)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    //   // Dummy weather data
    //   const weatherData = {
    //     kuala_lumpur: {
    //       city: 'Kuala Lumpur',
    //       temp: '31°C',
    //       humidity: '70%',
    //       description: 'Partly Cloudy',
    //       forecast: ['🌧️ 30°C', '⛅ 31°C', '☀️ 32°C'],
    //       days: ['Mon', 'Tue', 'Wed']
    //     },
    //     penang: {
    //       city: 'Penang',
    //       temp: '29°C',
    //       humidity: '75%',
    //       description: 'Showers',
    //       forecast: ['🌧️ 28°C', '🌧️ 27°C', '⛅ 29°C'],
    //       days: ['Mon', 'Tue', 'Wed']
    //     },
    //     melaka: {
    //       city: 'Melaka',
    //       temp: '32°C',
    //       humidity: '68%',
    //       description: 'Sunny',
    //       forecast: ['☀️ 32°C', '☀️ 33°C', '⛅ 31°C'],
    //       days: ['Mon', 'Tue', 'Wed']
    //     }
    //   };

    const citySelect = document.getElementById('cityInput'); // assuming user types here
    const weatherCity = document.getElementById('weatherCity');
    const weatherTemp = document.getElementById('weatherTemp');
    const weatherHumidity = document.getElementById('weatherHumidity');
    const weatherDesc = document.getElementById('weatherDesc');


    // Example function to call when a city is selected
    function fetchWeather(city) {
        fetch(`http://localhost:3000/api/weather?city=${encodeURIComponent(city)}`)
            .then(response => response.json())
            .then(data => {
                weatherCity.textContent = data.city;
                weatherTemp.textContent = `${data.temperature}°C`;
                weatherHumidity.textContent = `${data.humidity}%`;
                weatherDesc.textContent = data.description;
                console.log(data);


            })
            .catch(error => {
                console.error('Failed to load weather data:', error);
            });
    }

    // Example usage when city is selected from autocomplete
    document.getElementById('cityInput').addEventListener('change', (e) => {
        const city = e.target.value.trim();
        if (city.length > 2) {  // Only fetch when input has 3+ chars
            fetchWeather(city);
        }
    });


    // Trigger change once to load initial data
    citySelect.dispatchEvent(new Event('change'));
});

let cities = [];

fetch('assets/data/cities_data.json')
    .then(response => response.json())
    .then(data => {
        cities = data;

        const countries = [...new Set(cities.map(item => item.country))];

        // Setup country autocomplete
        setupAutocomplete('countryInput', 'countrySuggestions', countries);

        // Setup city autocomplete, filtered by selected country
        setupCityAutocomplete('cityInput', 'citySuggestions');
    })
    .catch(error => console.error('Error loading city data:', error));


function setupAutocomplete(inputId, suggestionsId, list) {
    const input = document.getElementById(inputId);
    const suggestionsBox = document.getElementById(suggestionsId);

    input.addEventListener('input', function () {
        const val = this.value.toLowerCase();
        suggestionsBox.innerHTML = '';

        if (!val) return;

        const matches = list.filter(item => item.toLowerCase().startsWith(val));

        matches.forEach(match => {
            const div = document.createElement('div');
            div.textContent = match;
            div.classList.add('autocomplete-suggestion');
            div.addEventListener('click', () => {
                input.value = match;
                suggestionsBox.innerHTML = '';
            });
            suggestionsBox.appendChild(div);
        });
    });

    document.addEventListener('click', function (e) {
        if (e.target !== input) {
            suggestionsBox.innerHTML = '';
        }
    });
}

function setupCityAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestionsBox = document.getElementById(suggestionsId);
    const countryInput = document.getElementById('countryInput');
    const weatherCity = document.getElementById('weatherCity');

    input.addEventListener('input', function () {
        const val = this.value.toLowerCase();
        suggestionsBox.innerHTML = '';

        const selectedCountry = countryInput.value;

        if (!val || !selectedCountry) return;

        const filteredCities = cities
            .filter(item => item.country.toLowerCase() === selectedCountry.toLowerCase())
            .map(item => item.city);

        const matches = filteredCities.filter(city => city.toLowerCase().startsWith(val));

        matches.forEach(match => {
            const div = document.createElement('div');
            div.textContent = match;
            div.classList.add('autocomplete-suggestion');
            div.addEventListener('click', () => {
                input.value = match;
                suggestionsBox.innerHTML = '';
                weatherCity.textContent = match;

                 input.dispatchEvent(new Event('change'));
            });
            suggestionsBox.appendChild(div);
        });
    });

    document.addEventListener('click', function (e) {
        if (e.target !== input) {
            suggestionsBox.innerHTML = '';
        }
    });
}

