document.addEventListener("DOMContentLoaded", function () {
  // Elements - Updated to match student.html structure
  const menuIcon = document.getElementById("menuIcon");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInitial = document.getElementById("userInitial");
  const currentUserEmail = document.getElementById("currentUserEmail");
  const userRoleBadge = document.getElementById("userRoleBadge");

  // Profile specific elements
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");
  const savePreferences = document.getElementById("savePreferences");
  const avatarUpload = document.getElementById("avatarUpload");
  const avatarImg = document.getElementById("avatarImg");
  const avatarText = document.getElementById("avatarText");

  // Navigation links
  const navLinks = document.querySelectorAll("[data-nav-link]");

  // Enrolled Classes Dropdown elements - Same as student.html
  const enrolledClassesDropdownToggle = document.getElementById(
    "enrolledClassesDropdownToggle"
  );
  const enrolledClassesDropdown = document.getElementById(
    "enrolledClassesDropdown"
  );

  // User data - Get both keys for compatibility
  const currentUser =
    localStorage.getItem("currentUser") || localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  // Check authentication
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  // Ensure both keys are set for compatibility
  if (!localStorage.getItem("userEmail")) {
    localStorage.setItem("userEmail", currentUser);
  }
  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", currentUser);
  }

  // Initialize page
  initializePage();

  // Event listeners - Updated to match student.html
  menuIcon.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  profileForm.addEventListener("submit", handleProfileSubmit);
  passwordForm.addEventListener("submit", handlePasswordSubmit);
  savePreferences.addEventListener("click", handlePreferencesSubmit);
  avatarUpload.addEventListener("change", handleAvatarUpload);

  // Enrolled Classes Dropdown Toggle - Same as student.html
  enrolledClassesDropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    enrolledClassesDropdown.classList.toggle("show");
    this.querySelector(".dropdown-arrow").classList.toggle("rotate");
    renderEnrolledClasses();
  });

  // Navigation event listeners - Same as student.html
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const currentPage =
        window.location.pathname.split("/").pop() || "studentProfile.html";

      // Prevent default behavior and handle navigation manually
      e.preventDefault();
      e.stopPropagation();

      // If clicking on same page, do nothing
      if (
        href === currentPage ||
        (href === "studentProfile.html" && currentPage === "")
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

  // Close modals and dropdowns when clicking outside - Same as student.html
  window.addEventListener("click", function (e) {
    // Close enrolled classes dropdown if clicked outside
    if (
      !enrolledClassesDropdownToggle.contains(e.target) &&
      !enrolledClassesDropdown.contains(e.target)
    ) {
      enrolledClassesDropdown.classList.remove("show");
      enrolledClassesDropdownToggle
        .querySelector(".dropdown-arrow")
        .classList.remove("rotate");
    }
  });

  // Close sidebar when clicking outside - Same as student.html
  document.addEventListener("click", function (e) {
    const isNavLink = e.target.closest("[data-nav-link]");

    if (
      !isNavLink &&
      !sidebar.contains(e.target) &&
      !menuIcon.contains(e.target)
    ) {
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
    }
  });

  function initializePage() {
    // Set user info - Same as student.html
    const userName = currentUser.split("@")[0];
    const userInitialText = currentUser.charAt(0).toUpperCase();

    // Update header elements
    currentUserEmail.textContent = currentUser;
    userInitial.textContent = userInitialText;
    userRoleBadge.textContent = "Student";
    userRoleBadge.className = "role-badge student";

    // Update profile elements
    document.getElementById("profileName").textContent = userName;
    document.getElementById("profileEmail").textContent = currentUser;
    document.getElementById("email").value = currentUser;
    avatarText.textContent = userInitialText;

    // Handle sidebar state on page load - Same as student.html
    const savedSidebarState = localStorage.getItem("sidebarState");
    const intentionalNavigation = localStorage.getItem("intentionalNavigation");

    // If coming from intentional navigation and sidebar was open, restore it
    if (intentionalNavigation === "true" && savedSidebarState === "open") {
      sidebar.classList.add("open");
      mainContent.classList.add("sidebar-open");
      // Clear the navigation flag
      localStorage.removeItem("intentionalNavigation");
    } else {
      // Default closed state (for refresh or direct access)
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
    }

    // Load saved data
    loadProfileData();
    loadPreferences();
    loadAvatar();
    updateStats();
    renderEnrolledClasses(); // Same as student.html

    // Add fade-in animation
    document.querySelectorAll(".card").forEach((card) => {
      card.classList.add("fade-in");
    });
  }

  function toggleSidebar() {
    // Same as student.html
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");

    // Save sidebar state
    const sidebarIsOpen = sidebar.classList.contains("open");
    localStorage.setItem("sidebarState", sidebarIsOpen ? "open" : "closed");
  }

  function handleLogout() {
    // Same as student.html
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
  }

  // Function to render enrolled classes in the sidebar dropdown - Same as student.html
  function renderEnrolledClasses() {
    const dashboard = getUserDashboard();
    const enrolled = dashboard.courses.filter(
      (course) => !course.archived && course.students.includes(currentUser)
    );

    enrolledClassesDropdown.innerHTML = "";

    if (enrolled.length === 0) {
      const listItem = document.createElement("li");
      listItem.className = "dropdown-item-sidebar no-courses";
      listItem.textContent = "No enrolled classes";
      enrolledClassesDropdown.appendChild(listItem);
    } else {
      enrolled.forEach((course) => {
        const listItem = document.createElement("li");
        listItem.className = "dropdown-item-sidebar";
        listItem.textContent = course.name;
        listItem.dataset.courseId = course.id;
        listItem.addEventListener("click", (e) => {
          e.stopPropagation();
          openCourse(course);
        });
        enrolledClassesDropdown.appendChild(listItem);
      });
    }
  }

  function getUserDashboard() {
    // Same as student.html
    const dashboardKey = `dashboard_${currentUser}`;
    const dashboard = JSON.parse(
      localStorage.getItem(dashboardKey) || '{"courses": [], "role": "student"}'
    );
    if (!dashboard.courses) {
      dashboard.courses = [];
    }
    return dashboard;
  }

  function openCourse(course) {
    // Same as student.html
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    window.location.href = "studentStream.html";
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
      `profileData_${currentUser}`,
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
    localStorage.setItem(`userPassword_${currentUser}`, newPassword);
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
      `preferences_${currentUser}`,
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
      localStorage.setItem(`userAvatar_${currentUser}`, imageData);

      showNotification("প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!", "success");
    };

    reader.readAsDataURL(file);
  }

  function loadProfileData() {
    const savedProfile = localStorage.getItem(`profileData_${currentUser}`);
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
    const savedPreferences = localStorage.getItem(`preferences_${currentUser}`);
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
    const savedAvatar = localStorage.getItem(`userAvatar_${currentUser}`);
    if (savedAvatar) {
      avatarImg.src = savedAvatar;
      avatarImg.classList.remove("d-none");
      avatarText.style.display = "none";
    }
  }

  function updateStats() {
    // Get courses from dashboard data structure - Same as student.html
    const dashboardKey = `dashboard_${currentUser}`;
    const dashboard = JSON.parse(
      localStorage.getItem(dashboardKey) || '{"courses": [], "role": null}'
    );
    const courses = dashboard.courses || [];

    let userCourseCount = courses.length;
    let totalAssignments = 0;
    let totalStudents = 0;

    if (userRole === "teacher") {
      const userCourses = courses.filter(
        (course) => course.teacher === currentUser
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
      totalStudents = courses.length;
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
