document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");

  function showModal(message, isSuccess = false) {
    const modalMessage = document.getElementById("modalMessage");
    const modalFooterBtn = document.getElementById("modalFooterBtn");
    const modalHeader = document.getElementById("modalHeader");
    const modalTitle = document.getElementById("messageModalLabel");

    // Reset message
    modalMessage.textContent = "";

    // Icon based on status
    const icon = document.createElement("span");
    icon.className = isSuccess ? "text-success mr-2" : "text-danger mr-2";
    icon.innerHTML = isSuccess ? "✅" : "❌";

    modalMessage.appendChild(icon);
    modalMessage.appendChild(document.createTextNode(message));

    // Update title and header background
    modalTitle.textContent = isSuccess ? "Success" : "Error";
    modalHeader.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da"; // green/red
    modalHeader.style.borderBottom = "none";

    // Update button style
    if (modalFooterBtn) {
      modalFooterBtn.className = "btn"; // reset
      modalFooterBtn.classList.add(isSuccess ? "btn-success" : "btn-danger");
    }

    $('#messageModal').modal('show');
  }

  function validatePassword(password) {
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 6 characters.";
    }
    if (!hasUppercase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowercase) {
      return "Password must contain at least one lowercase letter.";
    }

    return null; // Password is valid
  }


  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showModal("Passwords do not match!");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showModal(passwordError);
      return;
    }

    try {
      const response = await fetch("https://teroka-backend.onrender.com/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        showModal("Account created successfully!", true); // true = success

        $('#messageModal').on('hidden.bs.modal', function () {
          window.location.href = "Login.html";
        });
      } else {
        showModal(data.message || "Registration failed.");
      }

    } catch (error) {
      console.error("Error:", error);
      showModal("Something went wrong.");
    }
  });
});
