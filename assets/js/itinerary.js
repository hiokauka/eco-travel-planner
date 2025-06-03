// Store itinerary as an array
let itineraryList = [];

// Search toggle functionality
const searchToggleBtn = document.getElementById('searchToggleBtn');
const searchContainer = document.getElementById('searchContainer');

searchToggleBtn.addEventListener('click', function () {
    searchContainer.style.display = (searchContainer.style.display === 'none' || searchContainer.style.display === '') ? 'block' : 'none';
});

// Calculate trip days
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const dayCountDiv = document.getElementById("day-count");

function calculateDays() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (startDate && endDate && endDate >= startDate) {
        const timeDiff = endDate - startDate;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        dayCountDiv.textContent = `Trip duration: ${daysDiff} day(s)`;

        // Enable day options when dates are valid
        generateDayOptions(daysDiff);
    } else {
        dayCountDiv.textContent = '';
    }
}

startDateInput.addEventListener("change", calculateDays);
endDateInput.addEventListener("change", calculateDays);

// Generate day options dynamically
function generateDayOptions(daysDiff) {
    const dayOptions = document.querySelectorAll('.day-options');

    dayOptions.forEach(optionContainer => {
        const selectElement = optionContainer.querySelector('select');
        selectElement.innerHTML = ''; // Clear previous options

        // Create the default "Select a day" option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = "Select a day";
        selectElement.appendChild(defaultOption);

        // Create and append day options
        for (let i = 1; i <= daysDiff; i++) {
            const option = document.createElement('option');
            option.value = `Day ${i}`;
            option.textContent = `Day ${i}`;
            selectElement.appendChild(option);
        }

        // Reset to default when regenerating
        selectElement.value = "";
    });
}

document.querySelectorAll('.day-select').forEach(daySelect => {
    daySelect.addEventListener('change', function () {
        const card = daySelect.closest('.card');
        const title = card.querySelector('.card-title').textContent.trim();
        const selectedDay = daySelect.value;

        // Check if the destination has already been added for the selected day
        const alreadyAdded = itineraryList.some(item => item.title === title && item.day === selectedDay);

        const button = card.querySelector('.add-to-fave');

        if (alreadyAdded) {
            // If already added, update button text and disable it
            button.textContent = "Added";
            button.disabled = true; // Disable the button for that day
        } else {
            // If not added, reset button to "Add to Itinerary" and enable it
            button.textContent = "Add to Itinerary";
            button.disabled = false; // Enable the button
        }
    });
});


// Listen for all "Add to Itinerary" buttons
document.querySelectorAll('.add-to-fave').forEach(button => {
    button.addEventListener('click', function () {
        const card = button.closest('.card');
        const title = card.querySelector('.card-title').textContent.trim();
        const daySelect = card.querySelector('.day-select');
        const selectedDay = daySelect ? daySelect.value : "";

        if (!selectedDay) {
            alert('Please select a day before adding to itinerary.');
            return;
        }

        // Check if the destination has already been added
        const alreadyAdded = itineraryList.some(item => item.title === title && item.day === selectedDay);
        if (alreadyAdded) {
            // If already added, remove it from itinerary

            button.textContent = "Added";
            button.disabled = true; // Enable the button after removal
        } else {
            // Add to itinerary
            itineraryList.push({ title, day: selectedDay });
            button.textContent = "Added";
            button.disabled = true; // Disable the button for that day
        }

        updateItineraryModal();
    });
});

// Reset modal contents when it opens
$('#availableModal').on('show.bs.modal', function () {
    // Reset each day-select dropdown in the modal to default (Select a day)
    $('.day-select').each(function () {
        $(this).val(''); // Reset to default (empty value, "Select a day")
    });

    // Reset all "Add to Itinerary" buttons to default state (text and enabled)
    $('.add-to-fave').each(function () {
        $(this).text('Add to Itinerary'); // Reset button text
        $(this).prop('disabled', false); // Enable button if it was disabled
    });
});


// Update itinerary modal to group destinations by day and include remove button
function updateItineraryModal() {
    const container = document.getElementById('itineraryList');
    container.innerHTML = '';

    
    if (itineraryList.length === 0) {
        container.innerHTML = '<p class="text-muted">No destinations added yet.</p>';
        return;
    }

    // Group by day and display them in the modal
    const groupedByDay = itineraryList.reduce((acc, item) => {
        if (!acc[item.day]) {
            acc[item.day] = [];
        }
        acc[item.day].push(item);
        return acc;
    }, {});

    Object.keys(groupedByDay).forEach(day => {
        const daySection = document.createElement('div');
        daySection.classList.add('day-section');
        daySection.innerHTML = `<h6 class="font-weight-bold"> ${day}</h6>`;

        groupedByDay[day].forEach((item, index) => {
            const entry = document.createElement('div');
            entry.className = 'mb-2 d-flex justify-content-between align-items-center';
            entry.innerHTML = `
                <strong>${item.title}</strong>
                <button class="btn btn-sm btn-danger" onclick="removeItinerary(${index}, '${item.day}')">Remove</button>
            `;
            daySection.appendChild(entry);
        });

        container.appendChild(daySection);
    });
}

// Remove item from itinerary
function removeItinerary(index, day) {
    const removedItem = itineraryList.splice(index, 1)[0];  // Get the removed item
    updateItineraryModal();

    // Reset the button back to "Add to Itinerary" after removal
    document.querySelectorAll('.add-to-fave').forEach(button => {
        const card = button.closest('.card');
        const titleInCard = card.querySelector('.card-title').textContent.trim();
        const daySelect = card.querySelector('.day-select');
        const selectedDay = daySelect ? daySelect.value : "";

        if (titleInCard === removedItem.title && selectedDay === removedItem.day) {
            button.textContent = "Add to Itinerary";
            button.disabled = false; // Enable the button after removal
        }
    });
}

// Download itinerary as PDF
document.getElementById("downloadItineraryBtn").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const cloned = document.getElementById("itineraryList").cloneNode(true);
    cloned.querySelectorAll("button").forEach(btn => btn.remove());
    const itineraryContent = cloned.innerText;

    doc.text("Green Itinerary", 10, 10);
    doc.text(itineraryContent, 10, 20);
    doc.save("green-itinerary.pdf");
});

// Add active class to navbar links based on the current page URL
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
});

// search function
document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const cards = document.querySelectorAll('#availableModal .card');

    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        if (title.includes(query)) {
            card.parentElement.style.display = ''; // .col-md-4
        } else {
            card.parentElement.style.display = 'none'; // Hide the whole column
        }
    });
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
      alert("User not logged in.");
      return;
    }

    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmNewPassword = document.getElementById("confirmNewPassword").value.trim();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("New password and confirmation do not match.");
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
        alert(data.message || "Password changed successfully.");
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmNewPassword").value = "";
        $("#changePasswordSection").collapse('hide');
      })
      .catch(err => {
        console.error("Error changing password:", err);
        alert(err.message || "An error occurred while changing password.");
      });

  });



  // Update profile
  document.getElementById("updateProfileForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name || !email || !phone) {
      alert("Please fill in all fields.");
      return;
    }

    fetch(`http://localhost:3000/users/profile?email=${encodeURIComponent(originalEmail)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Profile updated successfully.");

        document.getElementById("profileName").textContent = name;
        document.getElementById("profileEmail").textContent = email;
        document.getElementById("profilePhone").textContent = phone;

        localStorage.setItem("userEmail", email);
        originalEmail = email;

        $("#updateprofileSection").collapse('hide');
      })
      .catch(err => {
        console.error("Error updating profile:", err);
        alert("An error occurred while updating your profile.");
      });
  });

   // Delete account
  document.getElementById("deleteYesButton").addEventListener("click", function () {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      alert("No user email found.");
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
        alert(data.message || "Account deleted.");

        localStorage.clear();
        window.location.href = "home.html";
      })
      .catch(err => {
        console.error("Error deleting account:", err);
        alert("An error occurred while deleting your account.");
      });
  });

  

 
});