
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


// ==============================
// Others Functions Section
// ==============================

 // Emission factors in kg CO2e per km or per night
    const transportEmissionFactors = {
      flight: 0.15,
      car: 0.12,
      train: 0.05
    };

    const accommodationEmissionFactors = {
      hotel: 20,
      "eco-lodge": 8,
      hostel: 12
    };

document.addEventListener('DOMContentLoaded', function () {



  // Highlight active nav link (your existing code)
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


function showHistory() {
  $('#historyModal').modal('show');
}
function showTips() {
  $('#tipsModal').modal('show');
}

let cities = [];

fetch('assets/data/cities_data.json')
  .then(response => response.json())
  .then(data => {
    cities = data;
    console.log('Loaded cities:', cities);
  })
  .catch(error => console.error('Error loading city data:', error));


// Autocomplete handler - no filtering by country now
function setupAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestionsBox = document.getElementById(suggestionsId);

  input.addEventListener('input', function () {
    const val = this.value.toLowerCase();
    suggestionsBox.innerHTML = '';

    if (!val) return;

    const matches = cities.filter(city => city.city && city.city.toLowerCase().startsWith(val));

    matches.forEach(city => {
      const div = document.createElement('div');
      div.textContent = city.city;
      div.classList.add('autocomplete-suggestion');
      div.addEventListener('click', () => {
        input.value = city.city;
        suggestionsBox.innerHTML = '';
      });
      suggestionsBox.appendChild(div);
    });
  });


  // Close suggestions if clicked outside
  document.addEventListener('click', function (e) {
    if (e.target !== input) {
      suggestionsBox.innerHTML = '';
    }
  });
}

setupAutocomplete('fromInput', 'fromSuggestions');
setupAutocomplete('toInput', 'toSuggestions');

console.log(cities);

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


//------------
//carbon calculator functions
//------------
async function calculateCarbon() {
  const origin = document.getElementById("fromInput").value.trim();
  const destination = document.getElementById("toInput").value.trim();
  const transportType = document.getElementById('transportType').value;
  const accommodation = document.getElementById('accommodation').value;
  const nights = parseInt(document.getElementById('nights').value) || 0;
  const date = new Date().toISOString(); // or get from input if you have one

  // **Get user email from somewhere, e.g. a hidden input, or your auth system**
  const email = localStorage.getItem('userEmail');
  if (!email) {
    showMessageModal('Please Log in.', true);
    return;
  }
  if (!origin || !destination) {
    showMessageModal("Please enter both origin and destination cities.", true);
    return;
  }
  if (!email) {
    showMessageModal('Please try to log in again.', true);
    return;
  }

  try {
    // Call backend API to get real distance
    const response = await fetch(`http://localhost:3000/api/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
    if (!response.ok) {
      showMessageModal('Failed to fetch distance', true);
      throw new Error('Failed to fetch distance');
    }
    const data = await response.json();

    // distanceValue is in meters, convert to km
    const distanceKm = data.distanceValue / 1000;

    // Emission factors in kg CO2e per km or per night
    const transportEmissionFactors = {
      flight: 0.15,
      car: 0.12,
      train: 0.05
    };

    const accommodationEmissionFactors = {
      hotel: 20,
      "eco-lodge": 8,
      hostel: 12
    };

    // Calculate transport emissions
    const transportEmission = distanceKm * transportEmissionFactors[transportType];

    // Calculate accommodation emissions
    const accommodationEmission = nights * accommodationEmissionFactors[accommodation];

    // Total carbon footprint
    const totalEmission = transportEmission + accommodationEmission;

    // Show result in the modal
    const modalBody = document.querySelector('#calculateModal .modal-body');
    modalBody.innerHTML = `
      <p><strong>Estimated Carbon Footprint:</strong></p>
      <ul>
        <li>Transportation (${transportType}): ${transportEmission.toFixed(2)} kg CO2e</li>
        <li>Accommodation (${accommodation} for ${nights} nights): ${accommodationEmission.toFixed(2)} kg CO2e</li>
      </ul>
      <hr>
      <p><strong>Total: ${totalEmission.toFixed(2)} kg CO2e</strong></p>
    `;

    // Show the modal
    $('#calculateModal').modal('show');

    // Now send the carbon data to your backend to save it
    const saveResponse = await fetch('http://localhost:3000/carbonhistory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transportation: transportType,
        distance: distanceKm,
        origin,
        destination,
        accommodation,
        night: nights,
        date,
        email  // send the user email here
      })
    });

    if (!saveResponse.ok) {
      showMessageModal('Failed to save carbon data', true);
      throw new Error('Failed to save carbon data');
    }

    const savedData = await saveResponse.json();
    console.log('Saved carbon history:', savedData);

  } catch (error) {
    showMessageModal('Error calculating or saving carbon data: ' + error.message, true);
    console.error(error);
  }
}


async function showCarbonHistory() {
  console.log('Button clicked - showCarbonHistory called');

  const email = localStorage.getItem('userEmail');
  console.log('Email from localStorage:', email);
  if (!email) {
    showModalMessage('Please Log in.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/carbonhistory?email=${encodeURIComponent(email)}`);
    console.log('Fetch response:', response);

    if (!response.ok) throw new Error('Failed to fetch history');

    const history = await response.json();
    console.log('History data:', history);

    const modalBody = document.querySelector('#historyModal .modal-body');

    if (history.length === 0) {
      modalBody.innerHTML = '<p>No history found.</p>';
    } else {
      let html = `<div class="table-responsive"  style="max-height: 60vh; overflow-y: auto;">
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Origin → Destination</th>
          <th>Transport</th>
          <th>Distance (km)</th>
          <th>Accommodation</th>
          <th>Nights</th>
          <th>Total CO2e (kg)</th>
        </tr>
      </thead>
      <tbody>`;

      history.forEach(entry => {
        const transportEmission = entry.distance * (transportEmissionFactors[entry.transportation] || 0);
        const accommodationEmission = entry.night * (accommodationEmissionFactors[entry.accommodation] || 0);
        const totalEmission = transportEmission + accommodationEmission;

        html += `<tr>
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td>${entry.origin} → ${entry.destination}</td>
      <td>${entry.transportation}</td>
      <td>${entry.distance.toFixed(2)}</td>
      <td>${entry.accommodation || '-'}</td>
      <td>${entry.night || 0}</td>
      <td>${totalEmission.toFixed(2)}</td>
    </tr>`;
      });

      html += '</tbody></table></div>';  // close div.table-responsive
      modalBody.innerHTML = html;
    }


    // Show the modal AFTER updating content
    $('#historyModal').modal('show');
    console.log('Modal shown');

  } catch (error) {
    console.error(error);
    const modalBody = document.querySelector('#historyModal .modal-body');
    modalBody.innerHTML = `<p>Error loading history: ${error.message}</p>`;
  }
}



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



const tipsSets = [
  `- Walk or bike for short distances<br />
   - Use public transportation<br />
   - Offset your carbon footprint with tree planting`,

  `- Choose eco-friendly accommodations<br />
   - Bring a reusable water bottle<br />
   - Avoid single-use plastics`,

  `- Pack light to reduce flight emissions<br />
   - Support local businesses<br />
   - Turn off lights and unplug devices when not in use`
];

// On modal show event
$('#tipsModal').on('show.bs.modal', function () {
  const randomIndex = Math.floor(Math.random() * tipsSets.length);
  const tipsHtml = tipsSets[randomIndex];
  $(this).find('.modal-body').html(tipsHtml);
});