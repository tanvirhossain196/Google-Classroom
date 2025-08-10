document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");
  const savePreferences = document.getElementById("savePreferences");
  const avatarUpload = document.getElementById("avatarUpload");
  const avatarImg = document.getElementById("avatarImg");
  const avatarText = document.getElementById("avatarText");
  const headerUserInitial = document.getElementById("headerUserInitial");

  // Navigation links
  const navLinks = document.querySelectorAll(".nav-item");

  // User data - Get both keys for compatibility
  const currentUserEmail =
    localStorage.getItem("userEmail") || localStorage.getItem("currentUser");
  const userRole = localStorage.getItem("userRole");

  // Check authentication
  if (!currentUserEmail) {
    window.location.href = "index.html";
    return;
  }

  // Ensure both keys are set for compatibility
  if (!localStorage.getItem("userEmail")) {
    localStorage.setItem("userEmail", currentUserEmail);
  }
  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", currentUserEmail);
  }

  // Initialize page
  initializePage();

  // Event listeners
  menuToggle.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  profileForm.addEventListener("submit", handleProfileSubmit);
  passwordForm.addEventListener("submit", handlePasswordSubmit);
  savePreferences.addEventListener("click", handlePreferencesSubmit);
  avatarUpload.addEventListener("change", handleAvatarUpload);

  // Navigation event listeners - Dashboard style
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const currentPage =
        window.location.pathname.split("/").pop() || "studentProfile.html"; // Updated for studentProfile

      // Only prevent navigation to the same page
      if (
        href === currentPage ||
        (href === "studentProfile.html" && currentPage === "") // Updated for studentProfile
      ) {
        e.preventDefault();
        return;
      }

      // For different pages, allow normal navigation
      // Remove any active class from current page
      navLinks.forEach((l) => l.classList.remove("active"));
      // Add active class to clicked link
      this.classList.add("active");

      // Store current sidebar state before navigation
      const sidebarIsOpen = sidebar.classList.contains("show");
      localStorage.setItem("sidebarState", sidebarIsOpen ? "open" : "closed");

      // Store navigation intent to prevent automatic redirects
      localStorage.setItem("intentionalNavigation", "true");
      localStorage.setItem("targetPage", href);
    });
  });

  // Close sidebar when clicking outside (but don't interfere with navigation)
  document.addEventListener("click", function (e) {
    // Check if click is on a navigation link
    const isNavLink = e.target.closest(".nav-item");

    if (
      !isNavLink &&
      !sidebar.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove("show");
      }
    }
  });

  // Responsive sidebar handling
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024) {
      sidebar.classList.remove("show");
      localStorage.setItem("sidebarState", "closed");
    }
  });

  // Handle page visibility change to preserve sidebar state
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      // Restore sidebar state when page becomes visible again
      const savedSidebarState = localStorage.getItem("sidebarState");
      const intentionalNavigation = localStorage.getItem(
        "intentionalNavigation"
      );

      if (intentionalNavigation === "true" && savedSidebarState === "open") {
        sidebar.classList.add("show");
        if (window.innerWidth > 1024) {
          mainContent.classList.add("collapsed");
        }
        // Clear the navigation flag
        localStorage.removeItem("intentionalNavigation");
      }
    }
  });

  function initializePage() {
    // Set user info
    const userName = currentUserEmail.split("@")[0];
    const userInitial = currentUserEmail.charAt(0).toUpperCase();

    document.getElementById("profileName").textContent = userName;
    document.getElementById("profileEmail").textContent = currentUserEmail;
    document.getElementById("email").value = currentUserEmail;
    headerUserInitial.textContent = userInitial;
    avatarText.textContent = userInitial;

    // Handle sidebar state on page load
    const savedSidebarState = localStorage.getItem("sidebarState");
    const intentionalNavigation = localStorage.getItem("intentionalNavigation");

    // If coming from intentional navigation and sidebar was open, restore it
    if (intentionalNavigation === "true" && savedSidebarState === "open") {
      sidebar.classList.add("show");
      if (window.innerWidth > 1024) {
        mainContent.classList.add("collapsed");
      }
      // Clear the navigation flag
      localStorage.removeItem("intentionalNavigation");
    } else {
      // Default closed state (for refresh or direct access)
      sidebar.classList.remove("show");
      mainContent.classList.remove("collapsed");
      localStorage.setItem("sidebarState", "closed");
    }

    // Load saved data
    loadProfileData();
    loadPreferences();
    loadAvatar();
    updateStats();

    // Add fade-in animation
    document.querySelectorAll(".card").forEach((card) => {
      card.classList.add("fade-in");
    });
  }

  function toggleSidebar() {
    if (window.innerWidth <= 1024) {
      sidebar.classList.toggle("show");
    } else {
      sidebar.classList.toggle("show");
      mainContent.classList.toggle("collapsed");
    }

    // Save sidebar state
    const sidebarIsOpen = sidebar.classList.contains("show");
    localStorage.setItem("sidebarState", sidebarIsOpen ? "open" : "closed");
  }

  function handleLogout() {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userRole");
      window.location.href = "index.html";
    }
  }

  function handleProfileSubmit(e) {
    e.preventDefault();

    const profileData = {
      fullName: document.getElementById("fullName").value,
      phone: document.getElementById("phone").value,
      dateOfBirth: document.getElementById("dateOfBirth").value,
      address: document.getElementById("address").value,
      bio: document.getElementById("bio").value,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `profileData_${currentUserEmail}`,
      JSON.stringify(profileData)
    );

    // Update display name
    if (profileData.fullName) {
      document.getElementById("profileName").textContent = profileData.fullName;
    }

    showNotification("প্রোফাইল সফলভাবে আপডেট হয়েছে!", "success");
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification("সব ফিল্ড পূরণ করুন!", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("নতুন পাসওয়ার্ড মিলছে না!", "error");
      return;
    }

    if (newPassword.length < 6) {
      showNotification("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে!", "error");
      return;
    }

    // Save password
    localStorage.setItem(`userPassword_${currentUserEmail}`, newPassword);
    passwordForm.reset();
    showNotification("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!", "success");
  }

  function handlePreferencesSubmit() {
    const preferences = {
      language: document.getElementById("language").value,
      timezone: document.getElementById("timezone").value,
      emailNotifications: document.getElementById("emailNotifications").checked,
      smsNotifications: document.getElementById("smsNotifications").checked,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `preferences_${currentUserEmail}`,
      JSON.stringify(preferences)
    );
    showNotification("প্রাথমিকতা সংরক্ষণ করা হয়েছে!", "success");
  }

  function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("শুধুমাত্র ছবি ফাইল আপলোড করুন!", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("ফাইল সাইজ ৫ MB এর কম হতে হবে!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;

      // Update avatar display
      avatarImg.src = imageData;
      avatarImg.classList.remove("d-none");
      avatarText.style.display = "none";

      // Save to localStorage
      localStorage.setItem(`userAvatar_${currentUserEmail}`, imageData);

      showNotification("প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!", "success");
    };

    reader.readAsDataURL(file);
  }

  function loadProfileData() {
    const savedProfile = localStorage.getItem(
      `profileData_${currentUserEmail}`
    );
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);

      document.getElementById("fullName").value = profileData.fullName || "";
      document.getElementById("phone").value = profileData.phone || "";
      document.getElementById("dateOfBirth").value =
        profileData.dateOfBirth || "";
      document.getElementById("address").value = profileData.address || "";
      document.getElementById("bio").value = profileData.bio || "";

      // Update display name
      if (profileData.fullName) {
        document.getElementById("profileName").textContent =
          profileData.fullName;
      }
    }
  }

  function loadPreferences() {
    const savedPreferences = localStorage.getItem(
      `preferences_${currentUserEmail}`
    );
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);

      document.getElementById("language").value = preferences.language || "bn";
      document.getElementById("timezone").value =
        preferences.timezone || "Asia/Dhaka";
      document.getElementById("emailNotifications").checked =
        preferences.emailNotifications || false;
      document.getElementById("smsNotifications").checked =
        preferences.smsNotifications || false;
    }
  }

  function loadAvatar() {
    const savedAvatar = localStorage.getItem(`userAvatar_${currentUserEmail}`);
    if (savedAvatar) {
      avatarImg.src = savedAvatar;
      avatarImg.classList.remove("d-none");
      avatarText.style.display = "none";
    }
  }

  function updateStats() {
    // Get courses from dashboard data structure
    const dashboardKey = `dashboard_${currentUserEmail}`;
    const dashboard = JSON.parse(
      localStorage.getItem(dashboardKey) || '{"courses": [], "role": null}'
    );
    const courses = dashboard.courses || [];

    let userCourseCount = courses.length;
    let totalAssignments = 0;
    let totalStudents = 0;

    if (userRole === "teacher") {
      const userCourses = courses.filter(
        (course) => course.teacher === currentUserEmail
      );
      userCourseCount = userCourses.length;
      totalAssignments = userCourses.reduce(
        (sum, course) => sum + (course.assignments || 0),
        0
      );
      totalStudents = userCourses.reduce(
        (sum, course) => sum + (course.students ? course.students.length : 0),
        0
      );
    } else {
      userCourseCount = courses.length;
      totalAssignments = courses.reduce(
        (sum, course) => sum + (course.assignments || 0),
        0
      );
      totalStudents = courses.length; // Student count for student view
    }

    document.getElementById("totalCourses").textContent = userCourseCount;
    document.getElementById("totalAssignments").textContent = totalAssignments;
    document.getElementById("totalStudents").textContent = totalStudents;

    // Update join date
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - 6);
    document.getElementById("joinDate").textContent =
      joinDate.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
      });
  }

  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <i class="material-icons me-2">${
              type === "success" ? "check_circle" : "error"
            }</i>
            ${message}
        `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    // Hide notification
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
});
