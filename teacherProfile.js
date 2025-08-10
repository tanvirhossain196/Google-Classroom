document.addEventListener("DOMContentLoaded", function () {
  // Elements (updated to match teacher.html)
  const menuIcon = document.getElementById("menuIcon");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInitial = document.getElementById("userInitial"); // From teacher.html header
  const currentUserEmail = document.getElementById("currentUserEmail"); // From teacher.html header
  const userRoleBadge = document.getElementById("userRoleBadge"); // From teacher.html header

  // Original teacherProfile.html elements
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");
  const savePreferences = document.getElementById("savePreferences");
  const avatarUpload = document.getElementById("avatarUpload");
  const avatarImg = document.getElementById("avatarImg");
  const avatarText = document.getElementById("avatarText");

  // Navigation links (updated to match teacher.html)
  const navLinks = document.querySelectorAll("[data-nav-link]");

  // Enrolled Classes Dropdown elements (from teacher.js)
  const enrolledClassesDropdownToggle = document.getElementById(
    "enrolledClassesDropdownToggle"
  );
  const enrolledClassesDropdown = document.getElementById(
    "enrolledClassesDropdown"
  );
  const dropdownArrowIcon = enrolledClassesDropdownToggle.querySelector(
    ".dropdown-arrow-icon"
  );

  // User data - Get both keys for compatibility
  const currentLoggedInUserEmail =
    localStorage.getItem("userEmail") || localStorage.getItem("currentUser");
  const userRole = localStorage.getItem("userRole");

  // Check authentication
  if (!currentLoggedInUserEmail || userRole !== "teacher") {
    window.location.href = "index.html";
    return;
  }

  // Ensure both keys are set for compatibility
  if (!localStorage.getItem("userEmail")) {
    localStorage.setItem("userEmail", currentLoggedInUserEmail);
  }
  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", currentLoggedInUserEmail);
  }

  // Initialize page
  initializePage();

  // Event listeners
  menuIcon.addEventListener("click", toggleSidebar); // Updated ID
  logoutBtn.addEventListener("click", handleLogout);
  profileForm.addEventListener("submit", handleProfileSubmit);
  passwordForm.addEventListener("submit", handlePasswordSubmit);
  savePreferences.addEventListener("click", handlePreferencesSubmit);
  avatarUpload.addEventListener("change", handleAvatarUpload);

  // Enrolled Classes Dropdown Toggle (from teacher.js)
  enrolledClassesDropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent sidebar from closing if clicked inside
    enrolledClassesDropdown.classList.toggle("show");
    this.querySelector(".dropdown-arrow").classList.toggle("rotate"); // Rotate arrow
    renderEnrolledClasses(); // Re-render to ensure up-to-date list
  });

  // Navigation event listeners - Complete navigation fix (from teacher.js)
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const currentPage =
        window.location.pathname.split("/").pop() || "teacher.html";

      // Prevent default behavior and handle navigation manually
      e.preventDefault();
      e.stopPropagation();

      // If clicking on same page, do nothing
      if (
        href === currentPage ||
        (href === "teacherProfile.html" && currentPage === "")
      ) {
        return;
      }

      // Update active states
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      // Store navigation intent to prevent automatic redirects
      localStorage.setItem("intentionalNavigation", "true");
      localStorage.setItem("targetPage", href);

      // Use window.location.href for proper navigation
      setTimeout(() => {
        window.location.href = href;
      }, 100);
    });
  });

  // Close sidebar when clicking outside (from teacher.js)
  document.addEventListener("click", function (e) {
    // Check if click is on a navigation link
    const isNavLink = e.target.closest("[data-nav-link]");

    if (
      !isNavLink &&
      !sidebar.contains(e.target) &&
      !menuIcon.contains(e.target)
    ) {
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
      // Ensure dropdown arrow is hidden when sidebar closes
      if (dropdownArrowIcon) {
        dropdownArrowIcon.style.display = "none";
      }
    }
  });

  function initializePage() {
    // Set user info for header
    currentUserEmail.textContent = currentLoggedInUserEmail;
    userInitial.textContent = currentLoggedInUserEmail.charAt(0).toUpperCase();

    // Set user info for profile card
    const userName = currentLoggedInUserEmail.split("@")[0];
    document.getElementById("profileName").textContent = userName;
    document.getElementById("profileEmail").textContent =
      currentLoggedInUserEmail;
    document.getElementById("email").value = currentLoggedInUserEmail;
    avatarText.textContent = currentLoggedInUserEmail.charAt(0).toUpperCase();

    // Handle sidebar state on page load (from teacher.js)
    const savedSidebarState = localStorage.getItem("sidebarState");
    const intentionalNavigation = localStorage.getItem("intentionalNavigation");

    // If coming from intentional navigation and sidebar was open, restore it
    if (intentionalNavigation === "true" && savedSidebarState === "open") {
      sidebar.classList.add("open");
      mainContent.classList.add("sidebar-open");
      // Show dropdown arrow if sidebar is open
      if (dropdownArrowIcon) {
        dropdownArrowIcon.style.display = "block";
      }
      // Clear the navigation flag
      localStorage.removeItem("intentionalNavigation");
    } else {
      // Default closed state (for refresh or direct access)
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
      // Hide dropdown arrow if sidebar is closed
      if (dropdownArrowIcon) {
        dropdownArrowIcon.style.display = "none";
      }
    }

    updateUIForRole(); // Set role badge
    loadProfileData();
    loadPreferences();
    loadAvatar();
    updateStats();
    renderEnrolledClasses(); // Initial render of enrolled classes

    // Add fade-in animation
    document.querySelectorAll(".card").forEach((card) => {
      card.classList.add("fade-in");
    });
  }

  // Function to get user dashboard (from teacher.js)
  function getUserDashboard() {
    const dashboardKey = `dashboard_${currentLoggedInUserEmail}`;
    const dashboard = JSON.parse(
      localStorage.getItem(dashboardKey) || '{"courses": [], "role": "teacher"}'
    );
    if (!dashboard.courses) {
      dashboard.courses = [];
    }
    return dashboard;
  }

  // Function to save user dashboard (from teacher.js)
  function saveUserDashboard(dashboard) {
    const dashboardKey = `dashboard_${currentLoggedInUserEmail}`;
    localStorage.setItem(dashboardKey, JSON.stringify(dashboard));
  }

  // Update UI for role (from teacher.js)
  function updateUIForRole() {
    userRoleBadge.textContent = "Teacher";
    userRoleBadge.className = "role-badge teacher";
  }

  // Toggle sidebar (from teacher.js)
  function toggleSidebar() {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");

    // Save sidebar state
    const sidebarIsOpen = sidebar.classList.contains("open");
    localStorage.setItem("sidebarState", sidebarIsOpen ? "open" : "closed");

    // Toggle visibility of the dropdown arrow icon
    if (dropdownArrowIcon) {
      dropdownArrowIcon.style.display = sidebarIsOpen ? "block" : "none";
    }
  }

  // Handle logout (from teacher.js)
  function handleLogout() {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userEmail");
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
      `profileData_${currentLoggedInUserEmail}`,
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
    localStorage.setItem(
      `userPassword_${currentLoggedInUserEmail}`,
      newPassword
    );
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
      `preferences_${currentLoggedInUserEmail}`,
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
      localStorage.setItem(`userAvatar_${currentLoggedInUserEmail}`, imageData);

      showNotification("প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!", "success");
    };

    reader.readAsDataURL(file);
  }

  function loadProfileData() {
    const savedProfile = localStorage.getItem(
      `profileData_${currentLoggedInUserEmail}`
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
      `preferences_${currentLoggedInUserEmail}`
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
    const savedAvatar = localStorage.getItem(
      `userAvatar_${currentLoggedInUserEmail}`
    );
    if (savedAvatar) {
      avatarImg.src = savedAvatar;
      avatarImg.classList.remove("d-none");
      avatarText.style.display = "none";
    }
  }

  function updateStats() {
    // Get courses from dashboard data structure
    const dashboard = getUserDashboard();
    const courses = dashboard.courses || [];

    let userCourseCount = 0;
    let totalAssignments = 0;
    let totalStudents = 0;

    // Filter courses taught by the current teacher
    const teacherCourses = courses.filter(
      (course) => course.teacher === currentLoggedInUserEmail
    );

    userCourseCount = teacherCourses.length;
    totalAssignments = teacherCourses.reduce(
      (sum, course) => sum + (course.assignments || 0), // Assuming assignments property exists
      0
    );

    // Calculate total unique students across all courses taught by this teacher
    const uniqueStudents = new Set();
    teacherCourses.forEach((course) => {
      if (course.students && Array.isArray(course.students)) {
        course.students.forEach((studentEmail) => {
          uniqueStudents.add(studentEmail);
        });
      }
    });
    totalStudents = uniqueStudents.size;

    document.getElementById("totalCourses").textContent = userCourseCount;
    document.getElementById("totalAssignments").textContent = totalAssignments;
    document.getElementById("totalStudents").textContent = totalStudents;

    // Update join date
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - 6); // Example: 6 months ago
    document.getElementById("joinDate").textContent =
      joinDate.toLocaleDateString("en-US", {
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

  // Function to render enrolled classes in the sidebar dropdown (from teacher.js)
  function renderEnrolledClasses() {
    const dashboard = getUserDashboard();
    const enrolled = dashboard.courses.filter(
      (course) =>
        !course.archived && course.teacher === currentLoggedInUserEmail
    ); // Only show non-archived courses created by this teacher

    enrolledClassesDropdown.innerHTML = ""; // Clear existing list

    if (enrolled.length === 0) {
      const listItem = document.createElement("li");
      listItem.className = "dropdown-item-sidebar no-courses";
      listItem.textContent = "No classes taught";
      enrolledClassesDropdown.appendChild(listItem);
    } else {
      enrolled.forEach((course) => {
        const listItem = document.createElement("li");
        listItem.className = "dropdown-item-sidebar";
        listItem.textContent = course.name;
        listItem.dataset.courseId = course.id; // Store course ID for potential future use
        listItem.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent dropdown from closing immediately
          // You might want to navigate to a specific course detail page here
          // For now, it just logs the course name
          console.log("Clicked course:", course.name);
        });
        enrolledClassesDropdown.appendChild(listItem);
      });
    }
  }
});
