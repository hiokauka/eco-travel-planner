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



  const citySelect = document.getElementById('cityInput'); // assuming user types here
  const weatherCity = document.getElementById('weatherCity');
  const weatherTemp = document.getElementById('weatherTemp');
  const weatherHumidity = document.getElementById('weatherHumidity');
  const weatherDesc = document.getElementById('weatherDesc');

  async function fetchForecast(city) {
    try {
      const res = await fetch(`http://localhost:3000/api/weather-forecast?city=${encodeURIComponent(city)}`);
      const data = await res.json();

      const forecastCards = document.getElementById('forecastCards');
      forecastCards.innerHTML = ''; // Clear old forecast

      data.forecast.forEach(day => {
        const card = `
          <div class="col-md-4">
            <div class="card text-center p-3">
              <p class="mb-1">
  <strong>
    ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
  </strong>
</p>
             <div class="d-flex justify-content-center mb-2">
             <img
             src="https://openweathermap.org/img/wn/${day.icon}@2x.png"
             alt="${day.description}"
             style="width: 50px; height: 50px;"
             />
    </div>
              <p class="mb-0">${day.description} ${day.temp_max}°C</p>
            </div>
          </div>
        `;
        forecastCards.innerHTML += card;
      });

    } catch (err) {
      console.error('Error fetching forecast:', err);
      document.getElementById('forecastCards').innerHTML = `<p class="text-danger">Unable to fetch forecast data.</p>`;
    }
  }

  // Example usage when city is selected from autocomplete
  document.getElementById('cityInput').addEventListener('change', (e) => {
    const city = e.target.value.trim();
    if (city.length > 2) {  // Only fetch when input has 3+ chars
      fetchWeather(city);
      fetchForecast(city);
    }
  });


  // Example function to call when a city is selected
  function fetchWeather(city) {

    
    fetch(`http://localhost:3000/api/weather?city=${encodeURIComponent(city)}`)
      .then(response => response.json())
      .then(data => {
        weatherCity.textContent = data.city;
        weatherTemp.textContent = `${data.temperature}°C`;  
        weatherHumidity.textContent = `${data.humidity}%`;
        weatherDesc.textContent = data.description;

        // Set weather icon
        const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
        document.getElementById('weatherIcon').src = iconUrl;
        document.getElementById('weatherIcon').alt = data.description;

        console.log(data);
      })
      .catch(error => {
        console.error('Failed to load weather data:', error);
      });
  }





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



// Example usage when city is selected from autocomplete
document.getElementById('cityInput').addEventListener('change', (e) => {
  const city = e.target.value.trim();
  if (city.length > 2) {  // Only fetch when input has 3+ chars
    fetchWeather(city);
    fetchForecast(city);
  }
});

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

const joinLi = document.getElementById("joinLi");
const profileLi = document.getElementById("profileLi");

if (isLoggedIn) {
  joinLi.style.display = "none";     // Hide Join Us li
  profileLi.style.display = "inline-block"; // Show Profile li
} else {
  joinLi.style.display = "inline-block";
  profileLi.style.display = "none";
}

function logoutUser() {
  // Set login status to false
  localStorage.setItem("isLoggedIn", "false");

  // Optionally clear any user info stored
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  // ... remove other user-related keys if you have any

  // Reload page or redirect to homepage/login page
  location.reload();  // reloads current page
  // or: window.location.href = "Login.html";  // redirect to login page
}

document.addEventListener('DOMContentLoaded', function () {

  // Use JavaScript to control opening and closing of collapse sections
  $('#changePasswordSection,#updateprofileSection, #deleteaccountSection').on('show.bs.collapse', function () {
    // Close all other collapses when one is shown
    $('#changePasswordSection,#updateprofileSection, #deleteaccountSection').not(this).collapse('hide');
  });

  $('#profileModal').on('hidden.bs.modal', function () {
    // Hide all collapsible sections
    $('#changePasswordSection, #updateprofileSection, #deleteaccountSection').collapse('hide');
  });


});


// ==============================
// API Functions Section
// ==============================

let originalEmail = "";
console.log("Email in localStorage:", localStorage.getItem("userEmail"));
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("userEmail");
  console.log("Email in localStorage on main.html:", email);

  if (email) {
    fetch(`http://localhost:3000/users/profile?email=${encodeURIComponent(email)}`)
      .then(response => {
        if (!response.ok) throw new Error('Network response not ok');
        return response.json();
      })
      .then(userData => {
        console.log("User data received:", userData);

        // Update UI
        document.getElementById('profileName').textContent = userData.name || "No name found";
        document.getElementById('profileEmail').textContent = userData.email || "No email found";
        document.getElementById('profilePhone').textContent = userData.phone || "No phone found";

        // Pre-fill form
        document.getElementById("name").value = userData.name || "";
        document.getElementById("email").value = userData.email || "";
        document.getElementById("phone").value = userData.phone || "";

        originalEmail = userData.email;
      })
      .catch(error => console.error('Error fetching user data:', error));
  } else {
    console.log("User not logged in");
  }


  // change password
  document.getElementById("changePasswordForm").addEventListener("submit", e => {
    e.preventDefault();

    const email = localStorage.getItem("userEmail");
    if (!email) {
      showMessageModal("User not logged in.",true);
      return;
    }

    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmNewPassword = document.getElementById("confirmNewPassword").value.trim();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showMessageModal("Please fill in all password fields.",true);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showMessageModal("New password and confirmation do not match.",true);
      return;
    }

    fetch("http://localhost:3000/users/update-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, oldPassword: currentPassword, newPassword }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.message || 'Failed to change password');
          });
        }
        return res.json();
      })
      .then(data => {
          showMessageModal(data.message || "Password changed successfully.");
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmNewPassword").value = "";
        $("#changePasswordSection").collapse('hide');
      })
      .catch(err => {
        console.error("Error changing password:", err);
        showMessageModal(err.message || "An error occurred while changing password.",true);
      });

  });



  // Update profile
  document.getElementById("updateProfileForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name || !email || !phone) {
    showMessageModal("Please fill in all fields.",true);
      return;
    }

    fetch(`http://localhost:3000/users/profile?email=${encodeURIComponent(originalEmail)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone })
    })
      .then(res => res.json())
      .then(data => {
        showMessageModal(data.message || "Profile updated successfully.");

        document.getElementById("profileName").textContent = name;
        document.getElementById("profileEmail").textContent = email;
        document.getElementById("profilePhone").textContent = phone;

        localStorage.setItem("userEmail", email);
        originalEmail = email;

        $("#updateprofileSection").collapse('hide');
      })
      .catch(err => {
        console.error("Error updating profile:", err);
        showMessageModal("An error occurred while updating your profile.",true);
      });
  });

  // Delete account
  document.getElementById("deleteYesButton").addEventListener("click", function () {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      showMessageModal("No user email found.",true);
      return;
    }

    if (!confirm("This will permanently delete your account. Are you sure?")) return;

    fetch(`http://localhost:3000/users/profile?email=${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        showMessageModal(data.message || "Account deleted.");

        localStorage.clear();
        window.location.href = "home.html";
      })
      .catch(err => {
        console.error("Error deleting account:", err);
        showMessageModal("An error occurred while deleting your account.",true);
      });
  });




});

function showMessageModal(message, isError = false) {
  // Set the message text
  $('#messageModalBody').text(message);

  // Get the modal header
  const header = $('#messageModal .modal-header');

  // Remove both bg-success and bg-danger first
  header.removeClass('bg-success bg-danger');

  // Apply the correct class based on the isError flag
  if (isError) {
    header.addClass('bg-danger');
  } else {
    header.addClass('bg-success');
  }

  // Show the modal
  $('#messageModal').modal('show');
}