document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const forgotPassword = document.getElementById("forgotPassword"); // This element is not in index.html, but kept for safety
  const roleCards = document.querySelectorAll(".role-card");
  const loginBtn = document.querySelector(".login-btn");

  let selectedRole = null;

  // Check if user is already logged in
  if (localStorage.getItem("currentUser")) {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "admin") {
      window.location.href = "admin.html";
    } else if (userRole === "teacher") {
      window.location.href = "teacher.html";
    } else if (userRole === "student") {
      window.location.href = "student.html";
    }
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
      showAlert("Password reset feature will be added soon", "error");
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
      showAlert("Please fill in all fields", "error");
      return;
    }

    if (!selectedRole) {
      showAlert("Please select a role", "error");
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
      console.log("Admin login attempt");
      // Check multiple admin credentials
      const isValidAdmin =
        (email === "tanvir479@gmail.com" && password === "111111") ||
        (email === "admin@classroom.com" && password === "admin123");

      console.log("Admin validation result:", isValidAdmin);

      if (isValidAdmin) {
        console.log("Admin login successful, redirecting to admin.html");
        // Admin login successful
        localStorage.setItem("currentUser", email);
        localStorage.setItem("userRole", "admin");

        showAlert("Successfully logged in as administrator!", "success");

        setTimeout(() => {
          console.log("Redirecting to admin.html now...");
          try {
            window.location.href = "admin.html";
          } catch (error) {
            console.error("Redirect error:", error);
            // Fallback redirect method
            window.location.replace("admin.html");
          }
        }, 1500);
        return;
      } else {
        console.log("Invalid admin credentials");
        showAlert(
          "Correct email and password are required for admin login",
          "error"
        );
        resetButton();
        return;
      }
    }

    // For student and teacher login
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const user = registeredUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // User found, check if role matches
      if (user.role === role) {
        localStorage.setItem("currentUser", email);
        localStorage.setItem("userRole", role);

        // Initialize user dashboard if doesn't exist
        initializeUserDashboard(email, role);

        showAlert("Successfully logged in!", "success");

        setTimeout(() => {
          if (role === "teacher") {
            window.location.href = "teacher.html";
          } else if (role === "student") {
            window.location.href = "student.html";
          }
        }, 1500);
      } else {
        showAlert(
          `This email is registered as a ${user.role}. Please select the correct role.`,
          "error"
        );
        resetButton();
      }
    } else {
      // User not found, register new user with selected role
      registerNewUser(email, password, role);
    }
  }

  function registerNewUser(email, password, role) {
    console.log("Registering new user:", email, "with role:", role);

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    // Create new user
    const newUser = {
      name: email.split("@")[0], // Use email prefix as name
      email: email,
      password: password,
      role: role, // Assign the selected role
      registeredAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    // Initialize dashboard for the new user
    initializeUserDashboard(email, role);

    // Login the new user
    localStorage.setItem("currentUser", email);
    localStorage.setItem("userRole", role);

    showAlert("New account created and login successful!", "success");

    setTimeout(() => {
      if (role === "teacher") {
        window.location.href = "teacher.html";
      } else if (role === "student") {
        window.location.href = "student.html";
      }
    }, 1500);
  }

  function initializeUserDashboard(email, role) {
    const dashboardKey = `dashboard_${email}`;
    if (!localStorage.getItem(dashboardKey)) {
      const emptyDashboard = {
        courses: [],
        createdAt: new Date().toISOString(),
        role: role, // Set the role in the dashboard data
      };
      localStorage.setItem(dashboardKey, JSON.stringify(emptyDashboard));
    } else {
      // If dashboard exists, ensure role is set/updated
      const dashboard = JSON.parse(localStorage.getItem(dashboardKey));
      if (dashboard.role !== role) {
        dashboard.role = role;
        localStorage.setItem(dashboardKey, JSON.stringify(dashboard));
      }
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

    // Add demo teacher if not exists
    const demoTeacherExists = registeredUsers.find(
      (u) => u.email === "teacher@example.com"
    );
    if (!demoTeacherExists) {
      registeredUsers.push({
        name: "Demo Teacher",
        email: "teacher@example.com",
        password: "teacher123",
        role: "teacher",
        registeredAt: new Date().toISOString(),
      });
      initializeUserDashboard("teacher@example.com", "teacher");
    }

    // Add demo student if not exists
    const demoStudentExists = registeredUsers.find(
      (u) => u.email === "student@example.com"
    );
    if (!demoStudentExists) {
      registeredUsers.push({
        name: "Demo Student",
        email: "student@example.com",
        password: "student123",
        role: "student",
        registeredAt: new Date().toISOString(),
      });
      initializeUserDashboard("student@example.com", "student");
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
