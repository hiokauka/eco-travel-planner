document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
       showLoginModal(true, "Login successful!");
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("isLoggedIn", "true");
        console.log("Saved userEmail:", localStorage.getItem("userEmail"));

        setTimeout(() => {
          window.location.href = "index.html";  // redirect after 1.5s
        }, 1500);
      }
      else {
        showLoginModal(false, "Wrong credentials.");
      }

    } catch (error) {
      console.error("Login error:", error);
      showLoginModal(false, "Something went wrong. Please try again.");
    }
  });

  function showLoginModal(success, message) {
  const modalHeader = document.getElementById('loginModalHeader');
  const modalMessage = document.getElementById('loginModalMessage');
  const closeBtn = document.getElementById('loginModalCloseBtn');
  const okBtn = document.getElementById('loginModalOkBtn');

  // Set message
  modalMessage.textContent = message;

  if (success) {
    modalHeader.classList.remove('bg-danger');
    modalHeader.classList.add('bg-success');

    closeBtn.classList.remove('text-danger');
    closeBtn.classList.add('text-white');

    okBtn.classList.remove('btn-outline-danger');
    okBtn.classList.add('btn-outline-success');
  } else {
    modalHeader.classList.remove('bg-success');
    modalHeader.classList.add('bg-danger');

    closeBtn.classList.remove('text-white');
    closeBtn.classList.add('text-danger');

    okBtn.classList.remove('btn-outline-success');
    okBtn.classList.add('btn-outline-danger');
  }

  // Show the modal
  $('#loginModal').modal('show');
}

});
