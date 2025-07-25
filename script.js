document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const forgotPassword = document.getElementById("forgotPassword");
  const roleCards = document.querySelectorAll(".role-card");
  const loginBtn = document.querySelector(".login-btn");

  let selectedRole = null;

  // Check if user is already logged in
  if (localStorage.getItem("currentUser")) {
    window.location.href = "dashboard.html";
    return;
  }

  // Initialize default credentials on page load
  initializeDefaultCredentials();

  // Role selection
  roleCards.forEach((card) => {
    card.addEventListener("click", function () {
      roleCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      selectedRole = this.dataset.role;
      console.log("Selected role:", selectedRole);
    });
  });

  // Forgot password link
  if (forgotPassword) {
    forgotPassword.addEventListener("click", function (e) {
      e.preventDefault();
      showAlert("পাসওয়ার্ড রিসেট ফিচার শীঘ্রই যোগ করা হবে", "error");
    });
  }

  // Login form submission
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    console.log("Form submitted:", { email, password, selectedRole });

    // Validation
    if (!email || !password) {
      showAlert("অনুগ্রহ করে সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    if (!selectedRole) {
      showAlert("অনুগ্রহ করে একটি ভূমিকা নির্বাচন করুন", "error");
      return;
    }

    // Add loading state
    loginBtn.classList.add("btn-loading");
    loginBtn.disabled = true;

    // Simulate loading delay for better UX
    setTimeout(() => {
      handleLogin(email, password, selectedRole);
    }, 1500);
  });

  function handleLogin(email, password, role) {
    console.log("Handling login:", { email, role });

    // Check for admin login
    if (role === "admin") {
      if (email === "admin@classroom.com" && password === "admin123") {
        // Admin login successful
        localStorage.setItem("currentUser", email);
        localStorage.setItem("userRole", "admin");

        showAlert("প্রশাসক হিসেবে সফলভাবে লগইন হয়েছে!", "success");

        setTimeout(() => {
          window.location.href = "admin.html";
        }, 1500);
        return;
      } else {
        showAlert(
          "প্রশাসক লগইনের জন্য সঠিক ইমেইল এবং পাসওয়ার্ড প্রয়োজন",
          "error"
        );
        resetButton();
        return;
      }
    }

    // For user login
    if (role === "user") {
      // Check if user exists in registered users
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const user = registeredUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // User found, login successful
        localStorage.setItem("currentUser", email);
        localStorage.setItem("userRole", "user");

        // Initialize user dashboard if doesn't exist
        initializeUserDashboard(email);

        showAlert("সফলভাবে লগইন হয়েছে!", "success");

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        // User not found, register new user
        registerNewUser(email, password);
      }
    }
  }

  function registerNewUser(email, password) {
    console.log("Registering new user:", email);

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    // Create new user
    const newUser = {
      name: email.split("@")[0], // Use email prefix as name
      email: email,
      password: password,
      role: "user",
      registeredAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    // Initialize dashboard
    initializeUserDashboard(email);

    // Login the new user
    localStorage.setItem("currentUser", email);
    localStorage.setItem("userRole", "user");

    showAlert("নতুন অ্যাকাউন্ট তৈরি করে লগইন সম্পন্ন হয়েছে!", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  }

  function initializeUserDashboard(email) {
    const dashboardKey = `dashboard_${email}`;
    if (!localStorage.getItem(dashboardKey)) {
      const emptyDashboard = {
        courses: [],
        createdAt: new Date().toISOString(),
        role: null,
      };
      localStorage.setItem(dashboardKey, JSON.stringify(emptyDashboard));
    }
  }

  function resetButton() {
    loginBtn.classList.remove("btn-loading");
    loginBtn.disabled = false;
  }

  function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll(".alert");
    existingAlerts.forEach((alert) => alert.remove());

    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            border: none;
            background: ${
              type === "success"
                ? "linear-gradient(145deg, #10b981, #059669)"
                : "linear-gradient(145deg, #ef4444, #dc2626)"
            };
            animation: slideIn 0.3s ease-out;
        `;

    // Add close button
    alertDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 10px;">
                ×
            </button>
        </div>
    `;

    document.body.appendChild(alertDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);

    // Reset button on error
    if (type === "error") {
      resetButton();
    }
  }

  function initializeDefaultCredentials() {
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    // Add admin user if not exists
    const adminExists = registeredUsers.find(
      (u) => u.email === "admin@classroom.com"
    );
    if (!adminExists) {
      registeredUsers.push({
        name: "System Administrator",
        email: "admin@classroom.com",
        password: "admin123",
        role: "admin",
        registeredAt: new Date().toISOString(),
      });
    }

    // Add demo user if not exists
    const demoUserExists = registeredUsers.find(
      (u) => u.email === "user@example.com"
    );
    if (!demoUserExists) {
      registeredUsers.push({
        name: "Demo User",
        email: "user@example.com",
        password: "user123",
        role: "user",
        registeredAt: new Date().toISOString(),
      });

      // Initialize demo user dashboard
      initializeUserDashboard("user@example.com");
    }

    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
    console.log("Default credentials initialized");
  }

  // Add CSS animation for alerts
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
});
