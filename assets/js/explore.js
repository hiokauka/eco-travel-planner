
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


// ==============================
// other Functions Section
// ==============================


$(document).ready(function () {

    // Use JavaScript to control opening and closing of collapse sections
    $('#changePasswordSection,#updateprofileSection, #deleteaccountSection').on('show.bs.collapse', function () {
        // Close all other collapses when one is shown
        $('#changePasswordSection,#updateprofileSection, #deleteaccountSection').not(this).collapse('hide');
    });

    $('#profileModal').on('hidden.bs.modal', function () {
        // Hide all collapsible sections
        $('#changePasswordSection, #updateprofileSection, #deleteaccountSection').collapse('hide');
    });




    const favArray = [];
    let currentQueryType = 'tourist attractions'; // default fallback

    // Containers where the cards will be added
    const cardContainer = $('#cards-container');
    const favCardContainer = $('#favourite-card-container');

    async function searchPlaces(query) {
        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.innerHTML = ''; // Clear old results

        try {
            const res = await fetch(`http://localhost:3000/places?query=${encodeURIComponent(query)}`);

            if (!res.ok) {
                cardsContainer.innerHTML = `<p>Error fetching places: ${res.status}</p>`;
                console.error('Fetch error:', res.statusText);
                return;
            }

            const data = await res.json();
            console.log('API response:', data);

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

        } catch (error) {
            cardsContainer.innerHTML = `<p>Error fetching data</p>`;
            console.error('Fetch failed:', error);
        }
    }



    $('#searchForm').on('submit', function (e) {
        e.preventDefault();

        const location = $('#locationInput').val().trim();
        if (location) {
            const query = `${currentQueryType} in ${location}`;
            $('#cards-container').empty();
            searchPlaces(query);
        }
    });



    // Function to generate card HTML
    function createCard(place) {
        return `
        <div class="col-md-4 mb-4">
            <div class="card border-success" data-name="${place.name}" data-location="${place.location}" data-desc="${place.desc}" data-tags="${place.tags.join(', ')}" data-img="${place.img}" data-toggle="modal" data-target="#placeDetailModal">
                <img src="${place.img}" class="card-img-top" alt="${place.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${place.name}</h5>
                    <p class="card-text">${place.desc}</p>
                    <p class="text-muted"><i class="bi bi-geo-alt-fill"></i> ${place.location}</p>
                    ${place.tags.map(tag => `<span class="badge badge-success">${tag}</span>`).join(' ')}
                </div>
                <div class="card-footer text-right bg-white">
                    <button class="btn btn-outline-success btn-sm add-to-favourite">Add to favourite</button>
                </div>
            </div>
        </div>
        `;
    }

    // Function to generate a favourite card
    function createFavCard(place) {
        // Ensure tags is always an array
        const tags = Array.isArray(place.tags) ? place.tags : []; // Default to empty array if tags isn't an array

        return `
        <div class="col-md-4 mb-4">
            <div class="card content-card">
                <img src="${place.img}" class="card-img-top" alt="${place.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${place.name}</h5>
                    <p class="card-text">${place.desc}</p>
                    <p class="text-muted"><i class="bi bi-geo-alt-fill"></i> ${place.location}</p>
                    ${tags.map(tag => `<span class="badge badge-success">${tag}</span>`).join(' ')}
                </div>
                <div class="card-footer text-right bg-white">
                    <button class="btn btn-outline-danger btn-sm remove-from-favourite">Remove from favourite</button>
                </div>
            </div>
        </div>
    `;
    }


    // Modal functionality for card click
    $('#placeDetailModal').on('show.bs.modal', function (event) {
        console.log('Modal show event triggered!');
        var card = $(event.relatedTarget); // card that triggered modal
        console.log(card.data()); // to check all data attributes

        // Get data attributes
        var name = card.data('name');
        var location = card.data('location');
        var desc = card.data('desc');
        var tags = card.data('tags');
        var img = card.data('img');

        // Set modal content
        var modal = $(this);
        modal.find('#modalPlaceTitle').text(name || 'No title');
        modal.find('#modalPlaceImage').attr('src', img || 'https://via.placeholder.com/600x400?text=No+Image').attr('alt', name || '');
        modal.find('#modalPlaceDesc').text(desc || 'No description available.');
        modal.find('#modalPlaceLocation').html('<i class="bi bi-geo-alt-fill"></i> ' + (location || 'No location'));

        if (tags) {
            var tagArray = tags.split(',').map(function (tag) {
                return `<span class="badge badge-success mr-1">${tag.trim()}</span>`;
            }).join('');
            modal.find('#modalPlaceTags').html(tagArray);
        } else {
            modal.find('#modalPlaceTags').html('No tags available.');
        }
    });



    // Add/Remove from favourites logic
    $(document).on('click', '.add-to-favourite', function (event) {
        event.stopPropagation();

        const card = $(this).closest('.card');
        const name = card.data('name');
        const location = card.data('location');
        const desc = card.data('desc');
        const tags = card.data('tags');
        const img = card.data('img');

        const index = favArray.findIndex(item => item.name === name);

        if (index === -1) {
            // Not in favourites – add it
            favArray.push({ name, location, desc, tags, img });
            console.log(`${name} added to favourites.`);

            // Change button to filled heart
            $(this).html('<i class="bi bi-heart-fill text-danger"></i>');
        } else {
            // Already in favourites – remove it
            favArray.splice(index, 1);
            console.log(`${name} removed from favourites.`);

            // Change button to "Add to favourite" text
            $(this).html('Add to favourite');
        }

        console.log(favArray); // Debug
    });


    $('.filter-btn').on('click', function () {
        $(this).toggleClass('active');
    })
    // Handle Favourite Button Click
    $('.fav-btn').on('click', function () {
        $(this).toggleClass('active');

        // Deactivate other icon buttons when fav is clicked
        document.querySelectorAll('.icon-btn.active:not(.fav-btn)').forEach(btn => {
            btn.classList.remove('active');
        });

        // If button is active, show favourites only
        if ($(this).hasClass('active')) {
            cardContainer.hide(); // Hide the main card container
            favCardContainer.show(); // Show the favourite card container

            // Clear the favourite container and append fav cards or message
            updateFavContainer();
        } else {
            // If button is not active, show all cards
            cardContainer.show(); // Show the main card container
            favCardContainer.hide(); // Hide the favourite card container
        }
    });



    // Remove from favourites functionality (for "Remove from favourite" button)
    $(document).on('click', '.remove-from-favourite', function () {
        const card = $(this).closest('.card');
        const name = card.find('.card-title').text(); // Get the name directly from the card
        const location = card.find('.text-muted').text().trim(); // Get the location from the card
        const desc = card.find('.card-text').text(); // Get the description from the card
        const tags = card.data('tags'); // Get the tags directly from the card's data
        const img = card.find('img').attr('src'); // Get the image from the card

        const index = favArray.findIndex(item => item.name === name);

        if (index !== -1) {
            // If it's in favourites – remove it
            favArray.splice(index, 1);
            console.log(`${name} removed from favourites.`);

            // Change the button back to "Add to favourite"
            $(this).closest('.card').find('.add-to-favourite').html('Add to favourite');
            updateAddToFavouriteButton(name, 'empty');
        }

        console.log(favArray); // Debug
        updateFavContainer();

    });

    // Function to update the favourite container
    function updateFavContainer() {
        // Clear the fav card container
        favCardContainer.empty();

        // Check if favArray is empty
        if (favArray.length === 0) {
            // Append a "No favourites" message if favArray is empty
            favCardContainer.append('<p>No favourites yet. Add some places to your favourites!</p>');
        } else {
            // Otherwise, append the fav cards
            favArray.forEach(favPlace => {
                const favCardHtml = createFavCard(favPlace);
                favCardContainer.append(favCardHtml);
            });
        }
    }


    function updateAddToFavouriteButton(name, status) {
        // Find the card in the main container
        const card = cardContainer.find(`.card[data-name="${name}"]`);
        const button = card.find('.add-to-favourite');

        if (status === 'filled') {
            button.html('<i class="bi bi-heart-fill text-danger"></i>');
        } else {
            button.html('Add to favourite');
        }
    }


    document.querySelectorAll('.icon-btn:not(.fav-btn)').forEach(btn => {
        btn.addEventListener('click', () => {
            const isActive = btn.classList.contains('active');

            // Remove all other active buttons
            document.querySelectorAll('.icon-btn.active:not(.fav-btn)').forEach(active => {
                active.classList.remove('active');
            });

            if (!isActive) {
                // Activate new button
                btn.classList.add('active');
                currentQueryType = btn.dataset.query; // e.g. 'lodging'
            } else {
                // If clicked again (toggle off)
                currentQueryType = 'tourist attractions';
            }

            // Exit fav mode
            $('.fav-btn').removeClass('active');
            $('#cards-container').show();
            $('#fav-cards-container').hide();

            // Trigger search
            $('#searchForm').submit();
        });
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
});

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


