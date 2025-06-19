fetchPosts();


document.addEventListener('DOMContentLoaded', () => {
    const newPostForm = document.getElementById('newPostForm');

    newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = localStorage.getItem('userEmail');
        if (!email) {
            showMessageModal('No user email found. Please log in first.', true);
            return;
        }

        const text = document.getElementById('postText').value.trim();
        const imageInput = document.getElementById('postImage');
        const imageFile = imageInput.files.length > 0 ? imageInput.files[0] : null;

        if (!text && !imageFile) {
            showMessageModal('Please enter some text or upload an image.', true);
            return;
        }

        await createPost(email, text, imageFile);
    });
});



// Navbar active link handler
const navLinks = document.querySelectorAll('.navbar .custom-nav-link');
const currentUrl = window.location.href;
navLinks.forEach(function (link) {
    const linkUrl = link.getAttribute('href');
    if (currentUrl.includes(linkUrl)) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});




async function createPost(email, text, imageFile) {
    try {
        let imageUrl = "";

        // If image exists, upload to Cloudinary first
        if (imageFile) {
            const cloudData = new FormData();
            cloudData.append('file', imageFile);
            cloudData.append('upload_preset', 'teroka_upload'); // Replace with your Cloudinary preset

            const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/ddzxa4egy/image/upload', {
                method: 'POST',
                body: cloudData
            });

            if (!cloudinaryRes.ok) {
                throw new Error('Failed to upload image to Cloudinary');
            }

            const cloudinaryResult = await cloudinaryRes.json();
            imageUrl = cloudinaryResult.secure_url; // This is the permanent public URL
        }

        // Now send post data to your backend
        const response = await fetch('https://teroka-backend.onrender.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                post: text,
                imageUrl // Only URL, no file
            })
        });

        if (response.ok) {
            showMessageModal('Post created successfully!', true);
            window.location.reload();
        } else if (response.status === 404) {
            alert('Email not found or not verified!');
        } else {
            alert('Failed to create post.');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post.');
    }
}



async function fetchPosts() {
    try {
        const response = await fetch('https://teroka-backend.onrender.com/posts');
        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
        } else {
            console.error('Failed to fetch posts.');
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    posts.forEach((post, index) => {
        const postCard = document.createElement('div');
        postCard.classList.add('post-card');


        const postText = document.createElement('p');
        postText.textContent = post.post;

        postCard.appendChild(postText);

        if (post.imageUrl) {
            const postImage = document.createElement('img');
            postImage.src = post.imageUrl;
            postImage.alt = 'Post Image';
            postCard.appendChild(postImage);
        }

        postsContainer.appendChild(postCard);

        // Smooth entry animation
        setTimeout(() => {
            postCard.classList.add('show');
        }, 100 * index); // Stagger animation by 100ms each
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


//===================
//profile 
//===================

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
            showMessageModal("User not logged in.", true);
            return;
        }

        const currentPassword = document.getElementById("currentPassword").value.trim();
        const newPassword = document.getElementById("newPassword").value.trim();
        const confirmNewPassword = document.getElementById("confirmNewPassword").value.trim();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showMessageModal("Please fill in all password fields.", true);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showMessageModal("New password and confirmation do not match.", true);
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
                showMessageModal(err.message || "An error occurred while changing password.", true);
            });

    });



    // Update profile
    document.getElementById("updateProfileForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        if (!name || !email || !phone) {
            showMessageModal("Please fill in all fields.", true);
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
                showMessageModal("An error occurred while updating your profile.", true);
            });
    });

    // Delete account
    document.getElementById("deleteYesButton").addEventListener("click", function () {
        const email = localStorage.getItem("userEmail");
        if (!email) {
            showMessageModal("No user email found.", true);
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
                showMessageModal("An error occurred while deleting your account.", true);
            });
    });




});

function showMessageModal(message, isError = false) {
    // Close other open modals
    $('.modal.show').modal('hide');

    setTimeout(() => {
        // Set the message text
        $('#messageModalBody').text(message);

        // Get modal header and OK button
        const header = $('#messageModal .modal-header');
        const okButton = $('#messageModalOkButton');

        // Reset colors
        header.removeClass('bg-success bg-danger');
        okButton.removeClass('btn-success btn-danger');

        // Apply colors based on isError
        if (isError) {
            header.addClass('bg-danger');
            okButton.addClass('btn-danger');
        } else {
            header.addClass('bg-success');
            okButton.addClass('btn-success');
        }

        // Show the modal
        $('#messageModal').modal('show');
    }, 300); // Delay to ensure other modals fully close
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