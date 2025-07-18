document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const roleCards = document.querySelectorAll(".role-card");
  const forgotPassword = document.getElementById("forgotPassword");

  let selectedRole = null;

  // Role selection
  roleCards.forEach((card) => {
    card.addEventListener("click", function () {
      roleCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      selectedRole = this.dataset.role;
    });
  });

  // Login form submission
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!selectedRole) {
      alert("অনুগ্রহ করে একটি ভূমিকা নির্বাচন করুন");
      return;
    }

    // Simple validation
    if (email && password) {
      // Store user data in localStorage
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", selectedRole);

      // Redirect based on role
      if (selectedRole === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } else {
      alert("অনুগ্রহ করে সব ফিল্ড পূরণ করুন");
    }
  });

  // Forgot password
  forgotPassword.addEventListener("click", function (e) {
    e.preventDefault();
    alert("পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হবে");
  });
});
