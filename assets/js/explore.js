
// ==============================
// API Functions Section
// ==============================

let originalEmail = "";
console.log("Email in localStorage:", localStorage.getItem("userEmail"));
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("userEmail");
  console.log("Email in localStorage on main.html:", email);

  if (email) {
    fetch(`https://teroka-backend.onrender.com/users/profile?email=${encodeURIComponent(email)}`)
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

    fetch("https://teroka-backend.onrender.com/users/update-password", {
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

    fetch(`https://teroka-backend.onrender.com/users/profile?email=${encodeURIComponent(originalEmail)}`, {
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

    fetch(`https://teroka-backend.onrender.com/users/profile?email=${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        showMessageModal(data.message || "Account deleted.");

        localStorage.clear();
        window.location.href = "index.html";
      })
      .catch(err => {
        console.error("Error deleting account:", err);
        showMessageModal("An error occurred while deleting your account.",true);
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



    //===============
    //add to fav part
    //===============




    // Containers where the cards will be added
    const cardContainer = $('#cards-container');
    const favCardContainer = $('#favourite-card-container');

    window.searchPlaces = async function (query) {

        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.innerHTML = `
  <div class="d-flex justify-content-center align-items-center" style="height: 200px; width: 100%;">
    <div class="spinner-border text-success" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>
`;

        try {
            const res = await fetch(`https://teroka-backend.onrender.com/places?query=${encodeURIComponent(query)}`);

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

            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                const favRes = await fetch(`https://teroka-backend.onrender.com/favorites?email=${userEmail}`);
                const favorites = await favRes.json();
                const favNames = favorites.map(f => f.place_name);

                document.querySelectorAll('#cards-container .card').forEach(card => {
                    const name = card.dataset.name;
                    if (favNames.includes(name)) {
                        const btn = card.querySelector('.add-to-favourite');
                        btn.disabled = true;
                        btn.textContent = '❤️';
                    }
                });
            }

        } catch (error) {
            cardsContainer.innerHTML = `<p>Error fetching data</p>`;
            console.error('Fetch failed:', error);
        }
    }


    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const rawQuery = getQueryParam('query');

    if (rawQuery) {
        $('#locationInput').val(rawQuery);
        console.log('Set location input to:', $('#locationInput').val());
        setTimeout(() => {
            $('#searchForm').submit();
        }, 50);
    }
    // } else {
    //     // searchPlaces(`${currentQueryType} in Kuala Lumpur`);
    // }

    $('#searchForm').on('submit', function (e) {
        e.preventDefault();

        const location = $('#locationInput').val().trim();
        $('#locationInput').val(location);
        console.log('Submitting search for:', location);

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
            <div class="card border-success" data-name="${place.name}" data-location="${place.location}" data-desc="${place.desc}" data-tags="${place.tags.join(', ')}" data-img="${place.img}" >
                <img src="${place.img}" class=" card-img-top modal-trigger" alt="${place.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title modal-trigger">${place.name}</h5>
                    <p class="card-text modal-trigger">${place.desc}</p>
                    <p class="text-muted modal-trigger"><i class="bi bi-geo-alt-fill"></i> ${place.location}</p>
                    ${place.tags.map(tag => `<span class="badge badge-success">${tag}</span>`).join(' ')}
                </div>
                <div class="card-footer text-right bg-white">
                    <button class="btn btn-outline-success btn-sm add-to-favourite">Add to favourite</button>
                </div>
            </div>
        </div>
        `;
    }

    document.getElementById('cards-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-trigger')) {
            const card = e.target.closest('.card');

            // Populate modal fields with data from the clicked card
            const name = card.dataset.name || 'No title';
            const location = card.dataset.location || 'No location';
            const desc = card.dataset.desc || 'No description available.';
            const tags = card.dataset.tags || '';
            const img = card.dataset.img || 'https://dummyimage.com/600x400/cccccc/000000&text=No+Image';

            $('#modalPlaceTitle').text(name);
            $('#modalPlaceImage').attr('src', img).attr('alt', name);
            $('#modalPlaceLocation').html('<i class="bi bi-geo-alt-fill"></i> ' + location);
            $('#modalPlaceDesc').text(desc);

            if (tags) {
                const tagArray = tags.split(',').map(tag => `<span class="badge badge-success mr-1">${tag.trim()}</span>`).join('');
                $('#modalPlaceTags').html(tagArray);
            } else {
                $('#modalPlaceTags').html('No tags available.');
            }

            // Show the modal (jQuery way in BS4)
            $('#placeDetailModal').modal('show');
        }
    });


    document.getElementById('favourite-card-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-trigger')) {
            const card = e.target.closest('.card');

            // Populate modal fields with data from the clicked card
            const name = card.dataset.name || 'No title';
            const location = card.dataset.location || 'No location';
            const desc = card.dataset.desc || 'No description available.';
            const tags = card.dataset.tags || '';
            const img = card.dataset.img || 'https://dummyimage.com/600x400/cccccc/000000&text=No+Image';

            $('#modalPlaceTitle').text(name);
            $('#modalPlaceImage').attr('src', img).attr('alt', name);
            $('#modalPlaceLocation').html('<i class="bi bi-geo-alt-fill"></i> ' + location);
            $('#modalPlaceDesc').text(desc);

            if (tags) {
                const tagArray = tags.split(',').map(tag => `<span class="badge badge-success mr-1">${tag.trim()}</span>`).join('');
                $('#modalPlaceTags').html(tagArray);
            } else {
                $('#modalPlaceTags').html('No tags available.');
            }

            // Show the modal (jQuery way in BS4)
            $('#placeDetailModal').modal('show');
        }
    });



    // Function to generate a favourite card
    function createFavCard(place) {
        // Create mapped favPlace object from raw place
        const favPlace = {
            name: place.place_name,
            location: place.place_address,
            desc: `Rating: ⭐ ${place.place_rating || 'No rating'}`,
            tags: place.place_type ? place.place_type.split(',').map(t => t.trim()) : [],
            img: place.place_photo || 'https://via.placeholder.com/300x200?text=No+Image'
        };

        // Use favPlace in the template
        return `
    <div class="col-md-4 mb-4">
        <div class="card content-card"    data-favid="${place.favid}"   data-name="${favPlace.name}"
             data-location="${favPlace.location}"
             data-desc="${favPlace.desc}"
             data-tags="${favPlace.tags.join(', ')}"
             data-img="${favPlace.img}">
            <img src="${favPlace.img}" class=" modal-trigger card-img-top" alt="${favPlace.name}" style="height: 200px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title modal-trigger">${favPlace.name}</h5>
                <p class="card-text modal-trigger">${favPlace.desc}</p>
                <p class="text-muted modal-trigger"><i class="bi bi-geo-alt-fill"></i> ${favPlace.location}</p>
                ${favPlace.tags.map(tag => `<span class="badge badge-success">${tag}</span>`).join(' ')}
            </div>
            <div class="card-footer text-right bg-white">
                <button class="btn btn-outline-danger btn-sm remove-from-favourite">Remove from favourite</button>
            </div>
        </div>
    </div>
    `;
    }






    $('#cards-container').on('click', '.add-to-favourite', async function (e) {
        e.preventDefault();


        const card = $(this).closest('.card')[0];
        if (!card) {
            console.log('No card found for this button');
            return;
        }

        // Define placeData from the card's dataset
        const placeData = {
            name: card.dataset.name,
            location: card.dataset.location,
            desc: card.dataset.desc,
            tags: card.dataset.tags ? card.dataset.tags.split(',').map(t => t.trim()) : [],
            img: card.dataset.img
        };

        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            showMessageModal('Please Log in first!', true);
            return;
        }

        const payload = {
            place_name: placeData.name,
            place_address: placeData.location,
            place_type: placeData.tags.join(', '),
            place_rating: parseFloat(placeData.desc?.match(/[\d.]+/)?.[0]) || null,
            place_photo: placeData.img,
            email: userEmail
        };

        try {
            const response = await fetch('https://teroka-backend.onrender.com/favorites/addtofav', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to add favourite');
            }

            showMessageModal('Added to favourites successfully!');
            $(this).prop('disabled', true).text('❤️');

        } catch (err) {
            console.error(err);
            showMessageModal('Error adding to favourites!');
        }
    });




currentQueryType = "tourist attraction";


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
            favCardContainer.hide(); // Hide favourites 
            favCardContainer.empty();   
            console.log(currentQueryType)
            // Resubmit search based on current location and query type
            $('#searchForm').submit();
            $('#cards-container').show();
        }
    });


    async function updateFavContainer() {
        const favCardContainer = $('#favourite-card-container');
        favCardContainer.empty(); // Clear old favorites

        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            favCardContainer.html('<p class="text-center w-100">Log in to save your favourite places.</p>');
            return; // stop here if not logged in
        }

        try {
            const res = await fetch(`https://teroka-backend.onrender.com/favorites?email=${userEmail}`);
            const favorites = await res.json();


            if (favorites.length === 0) {
                favCardContainer.html('<p class="text-center w-100">No favorites yet.</p>');
                return;
            }

            favorites.forEach(place => {
                const favCardHTML = createFavCard(place);
                favCardContainer.append(favCardHTML); // Add each card to container
            });

        } catch (error) {
            console.error('Failed to load favorites:', error);
            favCardContainer.html('<p class="text-danger">Failed to load favorites.</p>');
        }
    }



    // Remove from favourites functionality (for "Remove from favourite" button)
    $(document).on('click', '.remove-from-favourite', function () {
        const card = $(this).closest('.card');
        const favid = card.data('favid');

        if (!favid) {
            showMessageModal('Please Log in!');
            return;
        }

        // Call backend to delete favourite
        fetch(`https://teroka-backend.onrender.com/favorites/${favid}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    // Remove card from UI
                    card.closest('.col-md-4').remove();

                    // Optional: update any buttons or UI states here
                    console.log(`Favourite with ID ${favid} removed.`);

                    // You may want to update other UI parts like "Add to favourite" buttons if needed
                    // Example: updateAddToFavouriteButton(name, 'empty');
                } else {
                    showMessageModal('Fail to remove from favourite!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error removing favourite');
            });
    });





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

            console.log('Current query type:', currentQueryType);

            // Exit fav mode
            $('.fav-btn').removeClass('active');
            $('#cards-container').show();
            $('#favourite-card-container').hide();

            // Trigger search
            $('#searchForm').submit();
        });
    });




});

//==========
//others
//==========

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
