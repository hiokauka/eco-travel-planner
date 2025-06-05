
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

//-----------------
// other functions
//-----------------

document.addEventListener("DOMContentLoaded", function () {



    // Use JavaScript to control opening and closing of collapse sections
    $('#changePasswordSection,#updateprofileSection, #deleteaccountSection').on('show.bs.collapse', function () {
        // Close all other collapses when one is shown
        $('#changePasswordSection,#updateprofileSection, #deleteaccountSection').not(this).collapse('hide');
    });

    $('#profileModal').on('hidden.bs.modal', function () {
        // Hide all collapsible sections
        $('#changePasswordSection, #updateprofileSection, #deleteaccountSection').collapse('hide');
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

document.getElementById('search-btn').addEventListener('click', (event) => {
  event.preventDefault();
    const query = document.getElementById('place').value.trim();
    console.log(query)
      if (query !== '') {
        // Redirect to explore.html and pass the query as a URL parameter
        window.location.href = `explore.html?query=${encodeURIComponent(query)}`;
      }
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