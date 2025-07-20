document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const forgotPassword = document.getElementById("forgotPassword");
  const roleCards = document.querySelectorAll(".role-card");

  let selectedRole = null;

  // Check if user is already logged in
  if (localStorage.getItem("currentUser")) {
    window.location.href = "dashboard.html";
    return;
  }

  // Role selection
  roleCards.forEach((card) => {
    card.addEventListener("click", function () {
      roleCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      selectedRole = this.dataset.role;
    });
  });

  // Forgot password link
  forgotPassword.addEventListener("click", function (e) {
    e.preventDefault();
    alert("পাসওয়ার্ড রিসেট ফিচার শীঘ্রই যোগ করা হবে");
  });

  // Login form submission
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validation
    if (!email || !password) {
      showAlert("অনুগ্রহ করে সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    if (!selectedRole) {
      showAlert("অনুগ্রহ করে একটি ভূমিকা নির্বাচন করুন", "error");
      return;
    }

    // Handle login
    handleLogin(email, password, selectedRole);
  });

  function handleLogin(email, password, role) {
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
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            background: ${type === "success" ? "#4CAF50" : "#f44336"};
        `;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    // Auto remove after 3 seconds
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }

  // Initialize default credentials on page load
  initializeDefaultCredentials();

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
  }
});
