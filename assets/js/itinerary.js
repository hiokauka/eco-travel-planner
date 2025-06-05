
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


// Store itinerary as an array
let globalDaysDiff = 0;

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

    globalDaysDiff = daysDiff; // 

    // Also update day selects here in case cards are already present
    generateDayOptions(daysDiff);
  } else {
    dayCountDiv.textContent = '';
    globalDaysDiff = 0;
  }
}

startDateInput.addEventListener("change", calculateDays);
endDateInput.addEventListener("change", calculateDays);


function generateDayOptions(daysDiff) {
  const selectElements = document.querySelectorAll('.day-select');

  selectElements.forEach(selectElement => {
    selectElement.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "Select a day";
    selectElement.appendChild(defaultOption);

    for (let i = 1; i <= daysDiff; i++) {
      const option = document.createElement('option');
      option.value = `Day ${i}`;
      option.textContent = `Day ${i}`;
      selectElement.appendChild(option);
    }
  });
}





const placeTypeSelect = document.getElementById("placeTypeSelect");
const seeButton = document.querySelector('[data-target="#availableModal"]');


function validateInputs() {
  const placeType = placeTypeSelect.value.trim();
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (placeType && startDate && endDate) {
    seeButton.disabled = false;
  } else {
    seeButton.disabled = true;
  }
}

// Disable button on load
seeButton.disabled = true;

// Listen to input changes
placeTypeSelect.addEventListener("change", validateInputs);
startDateInput.addEventListener("input", validateInputs);
endDateInput.addEventListener("input", validateInputs);

document.getElementById("see-places-btn").addEventListener("click", () => {
  const placeType = document.getElementById("placeTypeSelect").value;
  const location = document.getElementById("countryInput").value;


  const combinedQuery = `${placeType} in ${location}`; // ✨ Combine both

  searchPlaces(combinedQuery); // ✅ just use 1 param
});

searchPlaces = async function (query) {

  const cardsContainer = document.getElementById('cards-container');
  cardsContainer.innerHTML = `
  <div class="d-flex justify-content-center align-items-center" style="height: 200px; width: 100%;">
    <div class="spinner-border text-success" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>
`;
  try {
    const res = await fetch(`http://localhost:3000/places?query=${encodeURIComponent(query)}`);

    if (!res.ok) {
      cardsContainer.innerHTML = `<p>Error fetching places: ${res.status}</p>`;
      console.error('Fetch error:', res.statusText);
      return;
    }

    const data = await res.json();
    console.log('API response:', data);
    cardsContainer.innerHTML = ''; // clear before adding new cards


    if (!data.places || !Array.isArray(data.places) || data.places.length === 0) {
      cardsContainer.innerHTML = '<p>No results found.</p>';
      return;
    }

    data.places.forEach(place => {
      const cardHTML = createCard({
        name: place.name,
        location: place.address || 'N/A',
        desc: `Rating: ⭐ ${place.rating || 'No rating'}`, // or a custom desc
        tags: place.types || [],
        img: place.photo || 'https://via.placeholder.com/300x200?text=No+Image'
      });

      cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
    generateDayOptions(globalDaysDiff);



  } catch (error) {
    cardsContainer.innerHTML = `<p>Error fetching data</p>`;
    console.error('Fetch failed:', error);
  }
}




function createCard({ name, location, desc, tags, img }) {
  const tagBadges = tags.map(tag => `<span class="badge badge-info mr-1">${tag}</span>`).join('');

  return `
    <div class="col-md-4 mb-4">
      <div class="card shadow-sm h-100" data-name="${name}">
        <img src="${img}" class="card-img-top" alt="${name}" style="height: 200px; object-fit: cover;">
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
          <p class="card-text">${desc}</p>
          <p class="text-muted"><i class="bi bi-geo-alt-fill"></i> ${location}</p>
          <div class="tags">${tagBadges}</div>
        </div>
        <div class="card-footer text-right bg-white">
          <button class="btn btn-outline-success btn-sm add-to-itinerary">Add to Itinerary</button>
          <div class="day-options mt-3">
            <select class="form-control day-select">
             
           
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}

const container = document.getElementById('cards-container');

container.addEventListener('click', async (e) => {
  if (e.target.classList.contains('add-to-itinerary')) {
    const card = e.target.closest('.card');
    const placeName = card.getAttribute('data-name');
    const daySelect = card.querySelector('.day-select');
    const selectedDay = parseInt(daySelect.value);

    // Make sure start and end date are selected
    const startDateInput = document.getElementById('start-date').value;
    const endDateInput = document.getElementById('end-date').value;

    if (!startDateInput || !endDateInput) {
      showMessageModal("Please select start and end date first.", true);
      return;
    }

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      showMessageModal('Please Log in first!', true);
      return;
    }

    const dayValue = daySelect.value; // e.g. "day 1"
    const selectedDayNum = parseInt(dayValue.replace(/\D/g, ''), 10); // remove non-digit chars

    if (isNaN(selectedDayNum)) {
      alert("Invalid day selected");
      return;
    }

    const tagElements = card.querySelectorAll('.tags .badge'); // adjust selector as per your actual HTML
    const placeTags = Array.from(tagElements).map(tagEl => tagEl.textContent.trim());

    // POST to backend
    try {
      const response = await fetch('http://localhost:3000/itineraries/add-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          startDate: startDateInput,
          endDate: endDateInput,
          dayNumber: selectedDayNum,
          place: { name: placeName, tags: placeTags }
        })
      });

      if (response.ok) {
        const data = await response.json();
        showMessageModal("Place added to itinerary");

      } else {
        const error = await response.json();
        showMessageModal(error.message, true);
      }
    } catch (err) {
      showMessageModal("Network error: " + err.message, true);
    }
  }
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


//========================
// See itinerary function
//========================

$('#greenItineraryModal').on('show.bs.modal', async function () {
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    showMessageModal('Please Log in first!', true);
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/itineraries?userEmail=${encodeURIComponent(userEmail)}`);
    if (!res.ok) throw new Error("Itinerary not found");

    const itinerary = await res.json();
    const itineraryList = document.getElementById("itineraryList");

    itineraryList.innerHTML = "";

    if (!itinerary.days || itinerary.days.length === 0) {
      itineraryList.innerHTML = `<p class="text-muted">No destinations added yet.</p>`;
      return;
    }

    // Check if ALL days have no places
    const allDaysEmpty = itinerary.days.every(day => !day.places || day.places.length === 0);

    if (allDaysEmpty) {
      itineraryList.innerHTML = `<p class="text-muted">No destinations added yet.</p>`;
      return;
    }

    // Filter days that have at least one place
    const daysWithPlaces = itinerary.days.filter(day => day.places && day.places.length > 0);

    if (daysWithPlaces.length === 0) {
      itineraryList.innerHTML = `<p class="text-muted">No destinations added yet.</p>`;
      return;
    }

    

    // Render itinerary
    daysWithPlaces.forEach(day => {
      const dayHeader = document.createElement("h6");
      const date = day.date ? new Date(day.date).toLocaleDateString() : "";
      dayHeader.textContent = `Day ${day.day} ${date}`;
      dayHeader.className = "mt-3 text-success";
      itineraryList.appendChild(dayHeader);

      if (day.places.length === 0) {
        const noPlace = document.createElement("p");
        noPlace.className = "text-muted";
        noPlace.textContent = "No places added.";
        itineraryList.appendChild(noPlace);
      } else {
        day.places.forEach(place => {
          const placeItem = document.createElement("p");
          placeItem.classList.add("d-flex", "justify-content-between", "align-items-center", "mb-2");

          placeItem.innerHTML = `
            <div>
              <strong>${place.name}</strong>
              ${place.tags?.length ? `<span class="text-muted">(${place.tags.join(', ')})</span>` : ""}
            </div>
            <button class="btn btn-sm btn-outline-danger delete-place" data-day="${day.day}" data-place="${place.name}">
              <i class="fas fa-trash"></i>
            </button>
          `;

          itineraryList.appendChild(placeItem);
        });
      }
    });

    // Add click event listener to delete buttons inside the modal
    itineraryList.querySelectorAll('.delete-place').forEach(button => {
      button.addEventListener('click', async (e) => {
        const dayNumber = Number(button.dataset.day);
        const placeName = button.dataset.place;

        if (!confirm(`Delete "${placeName}" from Day ${dayNumber}?`)) return;

        try {
          const deleteRes = await fetch('http://localhost:3000/itineraries/remove-place', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail, dayNumber, placeName })
          });

          const deleteData = await deleteRes.json();
          if (!deleteRes.ok) throw new Error(deleteData.message || 'Failed to delete place');

          // Remove place from UI
          button.parentElement.remove();

          // Optional: show success message or refresh itinerary modal
          alert(`Deleted "${placeName}" from Day ${dayNumber}`);

        } catch (err) {
          alert(`Error deleting place: ${err.message}`);
        }
      });
    });

  } catch (err) {
    console.error("Error:", err);
    document.getElementById("itineraryList").innerHTML =
      `<p class="text-danger">Error loading itinerary.</p>`;
  }
});


document.getElementById('downloadItineraryBtn').addEventListener('click', async () => {
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    alert("Please Log in first!");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/itineraries?userEmail=${encodeURIComponent(userEmail)}`);
    if (!res.ok) throw new Error("Itinerary not found");
    const itinerary = await res.json();

    if (!itinerary.days || itinerary.days.length === 0) {
      alert("No itinerary data to download.");
      return;
    }

    // Prepare jsPDF and autotable
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Your Travel Itinerary", 14, 20);

    let startY = 30;

    itinerary.days.forEach(day => {
      doc.setFontSize(14);
      const dateStr = day.date ? new Date(day.date).toLocaleDateString() : "";
      doc.text(`Day ${day.day} ${dateStr}`, 14, startY);
      startY += 8;

      if (!day.places || day.places.length === 0) {
        doc.setFontSize(12);
        doc.text("No places added.", 14, startY);
        startY += 10;
      } else {
        // Build table rows
        const rows = day.places.map(place => [
          place.name,
          place.tags && place.tags.length ? place.tags.join(", ") : "-"
        ]);

        // Add autotable
        doc.autoTable({
          startY,
          head: [['Place', 'Tags']],
          body: rows,
          theme: 'striped',
          headStyles: { fillColor: [40, 180, 99] }, // green header
          styles: { fontSize: 11 },
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => {
            startY = data.cursor.y + 10;  // update startY for next day table
          }
        });
      }
    });

    doc.save('itinerary.pdf');
  } catch (err) {
    alert(`Error generating PDF: ${err.message}`);
  }
});




//=================
// General Function
//=================


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



















// ==============================
// PROFILE Functions Section
// ==============================

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
