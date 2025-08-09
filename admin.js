document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const headerUserInitial = document.getElementById("headerUserInitial");
  const adminName = document.getElementById("adminName");
  const navItems = document.querySelectorAll(".nav-item");
  const adminSections = document.querySelectorAll(".admin-section");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const navbarSearchInput = document.getElementById("navbarSearchInput");

  // Modals
  const addUserModal = new bootstrap.Modal(
    document.getElementById("addUserModal")
  );
  const userProfileModal = new bootstrap.Modal(
    document.getElementById("userProfileModal")
  );
  const editUserModal = new bootstrap.Modal(
    document.getElementById("editUserModal")
  );
  const courseModal = new bootstrap.Modal(
    document.getElementById("courseModal")
  );
  const assignmentModal = new bootstrap.Modal(
    document.getElementById("assignmentModal")
  );
  const adminProfileModal = new bootstrap.Modal(
    document.getElementById("adminProfileModal")
  );

  // Forms & Buttons
  const addUserForm = document.getElementById("addUserForm");
  const saveUserBtn = document.getElementById("saveUserBtn");
  const editUserForm = document.getElementById("editUserForm");
  const saveEditedUserBtn = document.getElementById("saveEditedUserBtn");
  const announcementForm = document.getElementById("announcementForm");
  const saveAnnouncementBtn = document.getElementById("saveAnnouncementBtn");
  const cancelAnnouncementEditBtn = document.getElementById(
    "cancelAnnouncementEditBtn"
  );
  const courseForm = document.getElementById("courseForm");
  const saveCourseBtn = document.getElementById("saveCourseBtn");
  const assignmentForm = document.getElementById("assignmentForm");
  const saveAssignmentBtn = document.getElementById("saveAssignmentBtn");
  const adminProfileForm = document.getElementById("adminProfileForm");
  const saveAdminProfileBtn = document.getElementById("saveAdminProfileBtn");
  const editAdminProfileBtn = document.getElementById("editAdminProfileBtn");

  // Course specific elements
  const coursesGridAdmin = document.getElementById("coursesGridAdmin");
  const createCourseBtn = document.getElementById("createCourseBtn");
  const courseTitleInput = document.getElementById("courseTitle");
  const courseSectionInput = document.getElementById("courseSection");
  const courseSubjectInput = document.getElementById("courseSubject");
  const courseRoomInput = document.getElementById("courseRoom");
  const courseTeacherSelect = document.getElementById("courseTeacher");
  const courseStatusSelect = document.getElementById("courseStatus");
  const courseStudentsInput = document.getElementById("courseStudents");
  const courseIdInput = document.getElementById("courseId");
  const courseModalTitle = document.getElementById("courseModalTitle");

  // Current User Info
  const currentUserEmail = localStorage.getItem("currentUser");
  const userRole = localStorage.getItem("userRole");

  // Chart Instances
  let userActivityChartInstance;
  let coursePerformanceChartInstance;
  let userRoleChartInstance;
  let courseStatusChartInstance;

  // --- Initialization and Authentication ---
  if (!currentUserEmail) {
    console.log("No current user found, redirecting to login");
    window.location.href = "index.html"; // Redirect to login page
    return;
  }

  if (userRole !== "admin") {
    console.log("User is not admin, access denied");
    showNotification("প্রশাসনিক প্যানেল অ্যাক্সেস করার অনুমতি নেই!", "error");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
    return;
  }

  console.log("Admin authentication successful, initializing page");
  initializePage();
  initializeDummyData(); // Ensure some data exists for demonstration

  // --- Event Listeners ---
  menuToggle.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  themeToggle.addEventListener("click", toggleTheme);
  navbarSearchInput.addEventListener("input", handleNavbarSearch);

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const section = this.dataset.section;
      switchSection(section);
    });
  });

  // User Management
  document
    .getElementById("addUserBtn")
    .addEventListener("click", () => addUserModal.show());
  document
    .getElementById("bulkUploadBtn")
    .addEventListener("click", handleBulkUpload);
  document
    .getElementById("exportUsersBtn")
    .addEventListener("click", exportUsers);
  saveUserBtn.addEventListener("click", saveUser);
  saveEditedUserBtn.addEventListener("click", saveEditedUser);
  document
    .getElementById("editUserFromProfile")
    .addEventListener("click", () => {
      const email = document.getElementById("profileUserEmail").textContent;
      userProfileModal.hide();
      editUser(email);
    });

  // Course Management
  createCourseBtn.addEventListener("click", () => openCourseModal());
  saveCourseBtn.addEventListener("click", saveCourse);

  // Assignment Management
  document
    .getElementById("createAssignmentBtn")
    .addEventListener("click", () => openAssignmentModal());
  saveAssignmentBtn.addEventListener("click", saveAssignment);

  // Announcements
  document
    .getElementById("newAnnouncementBtn")
    .addEventListener("click", () => openAnnouncementForm());
  announcementForm.addEventListener("submit", handleAnnouncementSubmit);
  cancelAnnouncementEditBtn.addEventListener("click", () =>
    openAnnouncementForm()
  ); // Reset form

  // Analytics & Communications
  document
    .getElementById("generateReportBtn")
    .addEventListener("click", generateReport);

  // System Management
  document
    .getElementById("systemBackupBtn")
    .addEventListener("click", createSystemBackup);
  document
    .getElementById("systemMaintenanceBtn")
    .addEventListener("click", toggleMaintenance);
  document
    .getElementById("systemUpdateBtn")
    .addEventListener("click", checkSystemUpdate);

  // Filters
  document.getElementById("userSearch").addEventListener("input", filterUsers);
  document.getElementById("roleFilter").addEventListener("change", filterUsers);
  document
    .getElementById("statusFilter")
    .addEventListener("change", filterUsers);
  document
    .getElementById("courseSearch")
    .addEventListener("input", filterCourses);
  document
    .getElementById("courseStatusFilter")
    .addEventListener("change", filterCourses);
  document
    .getElementById("courseTeacherFilter")
    .addEventListener("change", filterCourses);

  // Admin Profile
  editAdminProfileBtn.addEventListener("click", openAdminProfileModal);
  saveAdminProfileBtn.addEventListener("click", saveAdminProfile);

  // Expandable textarea for announcements
  document
    .getElementById("announcementMessage")
    .addEventListener("focus", function () {
      this.parentNode.classList.add("expanded");
    });
  document
    .getElementById("announcementMessage")
    .addEventListener("blur", function () {
      if (!this.value.trim()) {
        // Collapse only if empty
        this.parentNode.classList.remove("expanded");
      }
    });

  // Close sidebar on mobile when clicking outside
  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove("show");
      }
    }
  });

  // Close course menu dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".course-card-admin .course-card-menu")) {
      document
        .querySelectorAll(".course-card-admin .course-menu-dropdown")
        .forEach((menu) => {
          menu.classList.remove("show");
        });
    }
  });

  // Reset sidebar state on resize for larger screens
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("show");
    }
  });

  // --- Core Functions ---

  /**
   * Initializes the admin panel page by loading user data, stats, and charts.
   */
  function initializePage() {
    const userName = currentUserEmail.split("@")[0];
    const userInitial = currentUserEmail.charAt(0).toUpperCase();

    console.log("Initializing page for user:", userName);

    adminName.textContent = userName;
    headerUserInitial.textContent = userInitial;

    loadDashboardStats();
    loadActivityFeed();
    loadUsers();
    loadCourses(); // Load courses for admin panel
    loadAssignments();
    loadAnnouncements(); // Load announcements
    loadAnalytics(); // Placeholder for actual analytics loading
    loadSecurityLogs();
    populateCourseTeacherFilter(); // Populate teacher filter for courses

    initializeCharts();
    applySavedTheme(); // Apply theme on load
  }

  /**
   * Toggles the sidebar collapse state for desktop and visibility for mobile.
   */
  function toggleSidebar() {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("show");
    } else {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("collapsed");
    }
  }

  /**
   * Handles user logout, clears local storage, and redirects to the login page.
   */
  function handleLogout() {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userRole");
      console.log("Logging out, redirecting to login page");
      window.location.href = "index.html";
    }
  }

  /**
   * Switches the active section in the main content area based on sidebar navigation.
   */
  function switchSection(section) {
    navItems.forEach((item) => item.classList.remove("active"));
    document
      .querySelector(`[data-section="${section}"]`)
      .classList.add("active");

    adminSections.forEach((sectionEl) => sectionEl.classList.remove("active"));
    document.getElementById(section).classList.add("active");

    // Re-render charts when analytics section is active to ensure responsiveness
    if (section === "analytics") {
      initializeCharts();
    }
  }

  /**
   * Toggles between light and dark themes.
   */
  function toggleTheme() {
    const body = document.body;
    if (body.classList.contains("light-theme")) {
      body.classList.remove("light-theme");
      body.classList.add("dark-theme");
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-theme");
      body.classList.add("light-theme");
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
      localStorage.setItem("theme", "light");
    }
  }

  /**
   * Applies the theme saved in localStorage on page load.
   */
  function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    const body = document.body;
    if (savedTheme === "dark") {
      body.classList.add("dark-theme");
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    } else {
      body.classList.add("light-theme");
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }
  }

  /**
   * Handles search input in the navbar. (Currently just a placeholder)
   */
  function handleNavbarSearch() {
    const query = navbarSearchInput.value.trim();
    if (query) {
      showNotification(`"${query}" অনুসন্ধান করা হচ্ছে...`, "info");
      // In a real application, this would trigger a global search or filter current view
    }
  }

  /**
   * Loads and displays key statistics on the dashboard.
   */
  function loadDashboardStats() {
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const courses = JSON.parse(localStorage.getItem("allCourses")) || []; // Use allCourses
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];

    const totalUsers = allUsers.length;
    const totalCourses = courses.length;
    const activeAssignments = assignments.filter(
      (a) => a.status === "active"
    ).length;

    document.getElementById("totalUsers").textContent = totalUsers;
    document.getElementById("totalCourses").textContent = totalCourses;
    document.getElementById("activeAssignments").textContent =
      activeAssignments;
    document.getElementById("systemHealth").textContent = "100%"; // Dummy value

    // Calculate dummy growth metrics
    const userGrowth = Math.floor(totalUsers * 0.1);
    const courseGrowth = Math.floor(totalCourses * 0.15);

    document.getElementById(
      "userGrowth"
    ).textContent = `+${userGrowth} নতুন এই মাসে`;
    document.getElementById(
      "courseGrowth"
    ).textContent = `+${courseGrowth} নতুন কোর্স`;
  }

  /**
   * Loads and displays recent activity logs in the activity feed.
   */
  function loadActivityFeed() {
    const auditLogs = JSON.parse(localStorage.getItem("auditLogs")) || [];
    // Display only the 5 most recent logs
    const recentLogs = auditLogs.slice(0, 5);

    const activityFeed = document.getElementById("activityFeed");
    activityFeed.innerHTML = "";

    if (recentLogs.length === 0) {
      activityFeed.innerHTML =
        '<div class="text-center text-muted">কোনো সাম্প্রতিক কার্যকলাপ নেই</div>';
      return;
    }

    recentLogs.forEach((log) => {
      const activityItem = document.createElement("div");
      activityItem.className = "activity-item";
      activityItem.innerHTML = `
                <div class="activity-time">${log.timestamp}</div>
                <div class="activity-text">${log.action}: ${log.userEmail}</div>
            `;
      activityFeed.appendChild(activityItem);
    });
  }

  /**
   * Loads and displays user data in the users table.
   */
  function loadUsers() {
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    if (allUsers.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center">কোনো ব্যবহারকারী নেই</td></tr>';
      return;
    }

    allUsers.forEach((user) => {
      const profileData =
        JSON.parse(localStorage.getItem(`profileData_${user.email}`)) || {};
      const lastActivity =
        localStorage.getItem(`lastActivity_${user.email}`) || "কখনো নয়";
      const userStatus = user.status || "active"; // Default to active

      const row = document.createElement("tr");
      row.innerHTML = `
                <td><input type="checkbox" class="user-checkbox" data-email="${
                  user.email
                }"></td>
                <td>
                    <div class="user-info">
                        <strong>${
                          profileData.fullName ||
                          user.name ||
                          user.email.split("@")[0]
                        }</strong>
                        <br><small class="text-muted">${user.email}</small>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="badge badge-${getRoleBadgeClass(
                  user.role
                )}">${getRoleText(user.role)}</span></td>
                <td><span class="badge badge-${
                  userStatus === "active" ? "success" : "danger"
                }">${
        userStatus === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"
      }</span></td>
                <td>${
                  user.registeredAt
                    ? new Date(user.registeredAt).toLocaleDateString("bn-BD")
                    : "N/A"
                }</td>
                <td>${lastActivity}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="viewUserProfile('${
                      user.email
                    }')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-info me-1" onclick="editUser('${
                      user.email
                    }')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${
                      user.email
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });
    filterUsers(); // Apply filters after loading
  }

  /**
   * Loads and displays course data in the courses grid.
   */
  function loadCourses() {
    const allCourses = JSON.parse(localStorage.getItem("allCourses")) || [];
    coursesGridAdmin.innerHTML = "";

    if (allCourses.length === 0) {
      coursesGridAdmin.innerHTML =
        '<div class="empty-state"><div class="empty-icon"><span class="material-icons">school</span></div><h3>No Courses Available</h3><p>Create your first course or join an existing course</p></div>';
      return;
    }

    allCourses.forEach((course) => {
      const courseCard = createCourseCardAdmin(course);
      coursesGridAdmin.appendChild(courseCard);
    });
    filterCourses(); // Apply filters after loading
  }

  /**
   * Creates a course card for the admin panel, matching the dashboard style.
   * @param {object} course - The course object.
   * @returns {HTMLElement} The created course card element.
   */
  function createCourseCardAdmin(course) {
    const card = document.createElement("div");
    card.className = `course-card-admin ${course.archived ? "archived" : ""}`;

    const headerClass = getHeaderClass(course.subject, course.id);

    // Archived badge
    if (course.archived) {
      const archivedBadge = document.createElement("div");
      archivedBadge.className = "archived-badge-admin";
      archivedBadge.textContent = "Archived";
      card.appendChild(archivedBadge);
    }

    // Course Header (Top 1/3rd with gradient background)
    const courseHeader = document.createElement("div");
    courseHeader.className = `course-header ${headerClass}`;

    const headerContent = document.createElement("div");
    headerContent.className = "course-header-content";

    const courseTitle = document.createElement("h3");
    courseTitle.className = "course-title";
    courseTitle.textContent = course.name;

    const courseSection = document.createElement("p");
    courseSection.className = "course-section";
    courseSection.textContent = course.section;

    const courseSubtitle = document.createElement("p");
    courseSubtitle.className = "course-subtitle";
    courseSubtitle.textContent = course.teacher; // Display teacher email

    headerContent.appendChild(courseTitle);
    headerContent.appendChild(courseSection);
    headerContent.appendChild(courseSubtitle);

    // Header Menu
    const headerMenu = document.createElement("div");
    headerMenu.className = "course-header-menu";

    const cardMenu = document.createElement("div");
    cardMenu.className = "course-card-menu";

    const menuButton = document.createElement("button");
    menuButton.className = "course-menu";
    menuButton.innerHTML = '<span class="material-icons">more_vert</span>';
    menuButton.onclick = (e) => {
      e.stopPropagation(); // Prevent card click from firing
      toggleCourseMenuAdmin(course.id);
    };

    const menuDropdown = document.createElement("div");
    menuDropdown.className = "course-menu-dropdown";
    menuDropdown.id = `courseMenuAdmin_${course.id}`;

    // Edit option
    const editItem = document.createElement("div");
    editItem.className = "course-menu-item";
    editItem.onclick = (e) => {
      e.stopPropagation(); // Prevent card click from firing
      editCourseAdmin(course.id);
    };
    const editIcon = document.createElement("span");
    editIcon.className = "material-icons";
    editIcon.textContent = "edit";
    const editText = document.createTextNode("Edit");
    editItem.appendChild(editIcon);
    editItem.appendChild(editText);

    // Archive option
    const archiveItem = document.createElement("div");
    archiveItem.className = "course-menu-item archive";
    archiveItem.onclick = (e) => {
      e.stopPropagation(); // Prevent card click from firing
      toggleArchiveCourseAdmin(course.id);
    };
    const archiveIcon = document.createElement("span");
    archiveIcon.className = "material-icons";
    archiveIcon.textContent = course.archived ? "unarchive" : "archive";
    const archiveText = document.createTextNode(
      course.archived ? "Unarchive" : "Archive"
    );
    archiveItem.appendChild(archiveIcon);
    archiveItem.appendChild(archiveText);

    // Delete option
    const deleteItem = document.createElement("div");
    deleteItem.className = "course-menu-item delete";
    deleteItem.onclick = (e) => {
      e.stopPropagation(); // Prevent card click from firing
      deleteCourseAdmin(course.id);
    };
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "material-icons";
    deleteIcon.textContent = "delete";
    const deleteText = document.createTextNode("Delete");
    deleteItem.appendChild(deleteIcon);
    deleteItem.appendChild(deleteText);

    menuDropdown.appendChild(editItem);
    menuDropdown.appendChild(archiveItem);
    menuDropdown.appendChild(deleteItem);

    cardMenu.appendChild(menuButton);
    cardMenu.appendChild(menuDropdown);
    headerMenu.appendChild(cardMenu);

    courseHeader.appendChild(headerContent);
    courseHeader.appendChild(headerMenu);

    // Profile Initial Circle (overlapping the header)
    const profileInitial = document.createElement("div");
    profileInitial.className = "course-profile-initial";
    profileInitial.textContent = course.teacher.charAt(0).toUpperCase();
    profileInitial.style.background = `hsl(${
      hashString(course.teacher) % 360
    }, 70%, 40%)`; // Dynamic color for initial
    courseHeader.appendChild(profileInitial);

    // Course Body (Remaining 2/3rd white area)
    const courseBody = document.createElement("div");
    courseBody.className = "course-body";

    const bodyContent = document.createElement("div");
    bodyContent.className = "course-body-content";

    const courseInfo = document.createElement("div");
    courseInfo.className = "course-info";

    const courseCode = document.createElement("p");
    courseCode.className = "course-code";
    courseCode.textContent = `Code: ${course.code}`;
    courseInfo.appendChild(courseCode);

    bodyContent.appendChild(courseInfo);

    // Bottom Actions (Google Classroom style icons)
    const bottomActions = document.createElement("div");
    bottomActions.className = "course-bottom-actions";

    // Stream icon
    const streamIcon = document.createElement("button");
    streamIcon.className = "course-action-icon";
    streamIcon.innerHTML = '<span class="material-icons">dynamic_feed</span>';
    streamIcon.title = "Stream";
    streamIcon.onclick = (e) => {
      e.stopPropagation(); // Prevent card click from firing
      showNotification(`Opening stream for ${course.name}`, "info");
      // In a real app, this would navigate to the course stream page
    };

    // Classwork icon
    const classworkIcon = document.createElement("button");
    classworkIcon.className = "course-action-icon";
    classworkIcon.innerHTML = '<span class="material-icons">assignment</span>';
    classworkIcon.title = "Classwork";
    classworkIcon.onclick = (e) => {
      e.stopPropagation();
      showNotification(`Opening classwork for ${course.name}`, "info");
      // Add classwork functionality here
    };

    // People icon
    const peopleIcon = document.createElement("button");
    peopleIcon.className = "course-action-icon";
    peopleIcon.innerHTML = '<span class="material-icons">people</span>';
    peopleIcon.title = "People";
    peopleIcon.onclick = (e) => {
      e.stopPropagation();
      showNotification(`Opening people for ${course.name}`, "info");
      // Add people management functionality here
    };

    bottomActions.appendChild(streamIcon);
    bottomActions.appendChild(classworkIcon);
    bottomActions.appendChild(peopleIcon);

    courseBody.appendChild(bodyContent);
    courseBody.appendChild(bottomActions);

    card.appendChild(courseHeader);
    card.appendChild(courseBody);

    return card;
  }

  /**
   * Simple hash function to generate consistent colors for course names.
   * @param {string} str - The string to hash.
   * @returns {number} The absolute hash value.
   */
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Determines the CSS class for a course card header based on subject.
   * @param {string} subject - The course subject.
   * @param {string} courseId - The course ID for unique hashing.
   * @returns {string} The CSS class name.
   */
  function getHeaderClass(subject, courseId) {
    const subjectLower = subject ? subject.toLowerCase() : "";

    // Specific subject mappings
    if (subjectLower.includes("math") || subjectLower.includes("mathematics"))
      return "math";
    if (subjectLower.includes("science")) return "science";
    if (subjectLower.includes("bangla") || subjectLower.includes("bengali"))
      return "bangla";
    if (subjectLower.includes("english")) return "english";
    if (subjectLower.includes("programming") || subjectLower.includes("coding"))
      return "programming";
    // Add more specific mappings as needed

    // For courses without specific subject match, use hash-based color assignment
    const combinedHash = hashString(subject + courseId);
    const colorIndex = (combinedHash % 10) + 1; // Use 10 different default classes
    return `default-${colorIndex}`;
  }

  /**
   * Toggles the visibility of a course card's menu dropdown.
   * @param {string} courseId - The ID of the course.
   */
  function toggleCourseMenuAdmin(courseId) {
    const menu = document.getElementById(`courseMenuAdmin_${courseId}`);
    document
      .querySelectorAll(".course-card-admin .course-menu-dropdown")
      .forEach((m) => {
        if (m !== menu) m.classList.remove("show");
      });
    menu.classList.toggle("show");
  }

  /**
   * Opens the course modal for editing an existing course.
   * @param {string} courseId - The ID of the course to edit.
   */
  function editCourseAdmin(courseId) {
    const allCourses = JSON.parse(localStorage.getItem("allCourses")) || [];
    const course = allCourses.find((c) => c.id === courseId);

    if (!course) {
      showNotification("Course not found!", "error");
      return;
    }

    courseModalTitle.textContent = "Edit Course";
    courseIdInput.value = course.id;
    courseTitleInput.value = course.name;
    courseSectionInput.value = course.section;
    courseSubjectInput.value = course.subject;
    courseRoomInput.value = course.room;

    // Populate teachers dropdown and select current teacher
    populateCourseTeacherDropdown(course.teacher);

    courseStatusSelect.value = course.archived ? "archived" : "active";
    courseStudentsInput.value = course.students
      ? course.students.join(", ")
      : "";

    courseModal.show();
  }

  /**
   * Toggles the archived status of a course.
   * @param {string} courseId - The ID of the course to archive/unarchive.
   */
  function toggleArchiveCourseAdmin(courseId) {
    let allCourses = JSON.parse(localStorage.getItem("allCourses")) || [];
    const courseIndex = allCourses.findIndex((c) => c.id === courseId);

    if (courseIndex === -1) {
      showNotification("Course not found!", "error");
      return;
    }

    const course = allCourses[courseIndex];
    const newArchivedStatus = !course.archived;
    const actionText = newArchivedStatus ? "archive" : "unarchive";
    const confirmMessage = `Are you sure you want to ${actionText} this course?`;

    if (!confirm(confirmMessage)) {
      toggleCourseMenuAdmin(courseId); // Close menu if cancelled
      return;
    }

    // Update in global list
    allCourses[courseIndex].archived = newArchivedStatus;
    localStorage.setItem("allCourses", JSON.stringify(allCourses));

    // Update in all user dashboards
    updateCourseInAllDashboards(courseId, { archived: newArchivedStatus });

    showNotification(`Course successfully ${actionText}d!`, "success");
    loadCourses(); // Re-render admin courses
    loadDashboardStats(); // Update stats
  }

  /**
   * Deletes a course from the system.
   * @param {string} courseId - The ID of the course to delete.
   */
  function deleteCourseAdmin(courseId) {
    if (
      !confirm(
        "Are you sure you want to permanently delete this course? This action cannot be undone."
      )
    ) {
      toggleCourseMenuAdmin(courseId); // Close menu if cancelled
      return;
    }

    let allCourses = JSON.parse(localStorage.getItem("allCourses")) || [];
    const courseToDelete = allCourses.find((c) => c.id === courseId);

    if (!courseToDelete) {
      showNotification("Course not found!", "error");
      return;
    }

    // Remove from global list
    allCourses = allCourses.filter((c) => c.id !== courseId);
    localStorage.setItem("allCourses", JSON.stringify(allCourses));

    // Remove from all user dashboards
    const registeredUsers =
      JSON.parse(localStorage.getItem("registeredUsers")) || [];
    registeredUsers.forEach((user) => {
      const dashboardKey = `dashboard_${user.email}`;
      const dashboard = JSON.parse(
        localStorage.getItem(dashboardKey) || '{"courses": []}'
      );
      dashboard.courses = dashboard.courses.filter((c) => c.id !== courseId);
      localStorage.setItem(dashboardKey, JSON.stringify(dashboard));
    });

    logUserActivity(
      currentUserEmail,
      "Course Deleted",
      "Course",
      courseToDelete.name
    );
    showNotification("Course successfully deleted!", "success");
    loadCourses(); // Re-render admin courses
    loadDashboardStats(); // Update stats
  }

  /**
   * Updates a course in all relevant user dashboards.
   * This is crucial for keeping data consistent between admin and dashboard pages.
   * @param {string} courseId - The ID of the course to update.
   * @param {object} updates - An object containing the properties to update.
   */
  function updateCourseInAllDashboards(courseId, updates) {
    const registeredUsers =
      JSON.parse(localStorage.getItem("registeredUsers")) || [];
    registeredUsers.forEach((user) => {
      const dashboardKey = `dashboard_${user.email}`;
      const dashboard = JSON.parse(
        localStorage.getItem(dashboardKey) || '{"courses": []}'
      );
      const courseIndex = dashboard.courses.findIndex((c) => c.id === courseId);
      if (courseIndex !== -1) {
        dashboard.courses[courseIndex] = {
          ...dashboard.courses[courseIndex],
          ...updates,
        };
        localStorage.setItem(dashboardKey, JSON.stringify(dashboard));
      }
    });
  }

  /**
   * Loads and displays assignment data in the assignments table.
   */
  function loadAssignments() {
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const courses = JSON.parse(localStorage.getItem("allCourses")) || []; // Use allCourses
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const tbody = document.getElementById("assignmentsTableBody");
    tbody.innerHTML = "";

    if (assignments.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center">কোনো অ্যাসাইনমেন্ট নেই</td></tr>';
      return;
    }

    assignments.forEach((assignment) => {
      const course = courses.find((c) => c.id === assignment.courseId);
      const teacher = allUsers.find((u) => u.email === assignment.createdBy);

      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${assignment.title}</td>
                <td>${course ? course.name : "Unknown Course"}</td>
                <td>${
                  teacher
                    ? teacher.name || teacher.email.split("@")[0]
                    : "Unknown"
                }</td>
                <td>${assignment.dueDate || "N/A"}</td>
                <td>${assignment.submissions || 0}</td>
                <td>${assignment.graded || 0}</td>
                <td><span class="badge badge-${getAssignmentStatusBadgeClass(
                  assignment.status
                )}">${getAssignmentStatusText(assignment.status)}</span></td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editAssignment('${
                      assignment.id
                    }')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success me-1" onclick="gradeAssignment('${
                      assignment.id
                    }')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAssignment('${
                      assignment.id
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });
  }

  /**
   * Loads and displays announcements.
   */
  function loadAnnouncements() {
    const announcements =
      JSON.parse(localStorage.getItem("announcements")) || [];
    const announcementsList = document.getElementById("announcementsList");
    announcementsList.innerHTML = "";

    if (announcements.length === 0) {
      announcementsList.innerHTML =
        '<div class="text-center text-muted">কোনো ঘোষণা নেই</div>';
      return;
    }

    announcements.forEach((announcement) => {
      const announcementItem = document.createElement("div");
      announcementItem.className = "announcement-item";
      announcementItem.innerHTML = `
        <div class="announcement-header">
          <div class="announcement-title">${announcement.title}</div>
          <div class="announcement-meta">
            <span>${announcement.createdAt}</span> |
            <span>প্রাপক: ${getRecipientText(announcement.recipients)}</span>
          </div>
        </div>
        <div class="announcement-content">${announcement.message}</div>
        <div class="announcement-actions">
          <button class="btn btn-sm btn-info" onclick="editAnnouncement('${
            announcement.id
          }')">
            <i class="fas fa-edit"></i> সম্পাদনা
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement('${
            announcement.id
          }')">
            <i class="fas fa-trash"></i> মুছুন
          </button>
        </div>
      `;
      announcementsList.appendChild(announcementItem);
    });
  }

  /**
   * Opens the announcement form for creating a new announcement or editing an existing one.
   * @param {string} [announcementId] - The ID of the announcement to edit.
   */
  window.openAnnouncementForm = function (announcementId = null) {
    const formTitle = document.getElementById("announcementFormTitle");
    const announcementIdInput = document.getElementById("announcementId");
    const announcementTitleInput = document.getElementById("announcementTitle");
    const announcementMessageInput = document.getElementById(
      "announcementMessage"
    );
    const announcementRecipientsSelect = document.getElementById(
      "announcementRecipients"
    );
    const saveBtn = document.getElementById("saveAnnouncementBtn");
    const cancelBtn = document.getElementById("cancelAnnouncementEditBtn");
    const messageWrapper = document.querySelector(
      ".announcement-textarea-wrapper"
    );

    if (announcementId) {
      formTitle.textContent = "ঘোষণা সম্পাদনা করুন";
      saveBtn.textContent = "আপডেট করুন";
      cancelBtn.classList.remove("d-none");
      const announcements =
        JSON.parse(localStorage.getItem("announcements")) || [];
      const announcement = announcements.find((a) => a.id == announcementId);

      if (announcement) {
        announcementIdInput.value = announcement.id;
        announcementTitleInput.value = announcement.title;
        announcementMessageInput.value = announcement.message;
        announcementRecipientsSelect.value = announcement.recipients;
        messageWrapper.classList.add("expanded"); // Keep expanded when editing
      } else {
        showNotification("ঘোষণা খুঁজে পাওয়া যায়নি", "error");
        // Reset form if not found
        formTitle.textContent = "ঘোষণা পাঠান";
        saveBtn.textContent = "পাঠান";
        cancelBtn.classList.add("d-none");
        announcementForm.reset();
        announcementIdInput.value = "";
        messageWrapper.classList.remove("expanded");
      }
    } else {
      formTitle.textContent = "ঘোষণা পাঠান";
      saveBtn.textContent = "পাঠান";
      cancelBtn.classList.add("d-none");
      announcementForm.reset();
      announcementIdInput.value = "";
      messageWrapper.classList.remove("expanded"); // Collapse if new form
    }
  };

  /**
   * Handles the submission of the announcement form (create/edit).
   * @param {Event} e - The form submission event.
   */
  function handleAnnouncementSubmit(e) {
    e.preventDefault();
    const announcementId = document.getElementById("announcementId").value;
    const title = document.getElementById("announcementTitle").value;
    const message = document.getElementById("announcementMessage").value;
    const recipients = document.getElementById("announcementRecipients").value;

    if (!title || !message || !recipients) {
      showNotification("সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    let notificationMessage = "";

    if (announcementId) {
      // Edit existing announcement
      const index = announcements.findIndex((a) => a.id == announcementId);
      if (index > -1) {
        announcements[index] = {
          ...announcements[index],
          title: title,
          message: message,
          recipients: recipients,
          updatedAt: new Date().toLocaleString("bn-BD"),
        };
        notificationMessage = "ঘোষণা সফলভাবে আপডেট করা হয়েছে";
        logUserActivity(
          currentUserEmail,
          "ঘোষণা সম্পাদনা",
          "Announcement",
          title
        );
      } else {
        showNotification("ঘোষণা খুঁজে পাওয়া যায়না", "error");
        return;
      }
    } else {
      // Create new announcement
      const newAnnouncement = {
        id: Date.now(),
        title: title,
        message: message,
        recipients: recipients,
        createdBy: currentUserEmail,
        createdAt: new Date().toLocaleString("bn-BD"),
      };
      announcements.unshift(newAnnouncement); // Add to top
      notificationMessage = "ঘোষণা পাঠানো হয়েছে";
      logUserActivity(currentUserEmail, "ঘোষণা পাঠানো", "Announcement", title);
    }

    localStorage.setItem("announcements", JSON.stringify(announcements));
    showNotification(notificationMessage, "success");
    loadAnnouncements(); // Reload announcements list
    openAnnouncementForm(); // Reset form
  }

  /**
   * Deletes an announcement after confirmation.
   * @param {string} id - The ID of the announcement to delete.
   */
  window.deleteAnnouncement = function (id) {
    if (confirm("আপনি কি এই ঘোষণাটি মুছে ফেলতে চান?")) {
      let announcements =
        JSON.parse(localStorage.getItem("announcements")) || [];
      const announcementToDelete = announcements.find((a) => a.id == id);
      const updatedAnnouncements = announcements.filter((a) => a.id != id);
      localStorage.setItem(
        "announcements",
        JSON.stringify(updatedAnnouncements)
      );

      if (announcementToDelete) {
        logUserActivity(
          currentUserEmail,
          "ঘোষণা মুছে ফেলা",
          "Announcement",
          announcementToDelete.title
        );
      }
      showNotification("ঘোষণা সফলভাবে মুছে ফেলা হয়েছে", "success");
      loadAnnouncements();
      openAnnouncementForm(); // Reset form in case it was being edited
    }
  };

  /**
   * Edits an announcement.
   * @param {string} id - The ID of the announcement to edit.
   */
  window.editAnnouncement = function (id) {
    openAnnouncementForm(id);
  };

  /**
   * Placeholder function for loading analytics data.
   */
  function loadAnalytics() {
    // showNotification("অ্যানালিটিক্স ডেটা লোড হচ্ছে...", "info");
    // In a real application, this would fetch and process analytics data.
  }

  /**
   * Loads and displays security logs in the security log table.
   */
  function loadSecurityLogs() {
    const auditLogs = JSON.parse(localStorage.getItem("auditLogs")) || [];

    const tbody = document.getElementById("securityLogTableBody");
    tbody.innerHTML = "";

    if (auditLogs.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center">কোনো নিরাপত্তা লগ নেই</td></tr>';
      return;
    }

    // Display a limited number of recent logs
    auditLogs.slice(0, 20).forEach((log) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${log.timestamp}</td>
                <td>${log.userEmail}</td>
                <td>${log.action}</td>
                <td>${log.ipAddress || "N/A"}</td>
                <td><span class="badge badge-${
                  log.status === "success" ? "success" : "danger"
                }">${log.status === "success" ? "সফল" : "ব্যর্থ"}</span></td>
            `;
      tbody.appendChild(row);
    });
  }

  /**
   * Initializes Chart.js graphs for user activity, course performance, user roles, and course status.
   */
  function initializeCharts() {
    // Destroy existing chart instances to prevent duplicates
    if (userActivityChartInstance) userActivityChartInstance.destroy();
    if (coursePerformanceChartInstance)
      coursePerformanceChartInstance.destroy();
    if (userRoleChartInstance) userRoleChartInstance.destroy();
    if (courseStatusChartInstance) courseStatusChartInstance.destroy();

    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const courses = JSON.parse(localStorage.getItem("allCourses")) || []; // Use allCourses

    // User Activity Chart (Line Graph)
    const userActivityCtx = document.getElementById("userActivityChart");
    if (userActivityCtx) {
      userActivityChartInstance = new Chart(userActivityCtx, {
        type: "line",
        data: {
          labels: ["জান", "ফেব", "মার", "এপ্রিল", "মে", "জুন", "জুলাই"],
          datasets: [
            {
              label: "সক্রিয় ব্যবহারকারী",
              data: [120, 135, 150, 165, 180, 200, 220], // Dummy data
              borderColor: "#e74c3c",
              backgroundColor: "rgba(231, 76, 60, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "ব্যবহারকারীর সংখ্যা",
              },
            },
            x: {
              title: {
                display: true,
                text: "মাস",
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: "মাসিক ব্যবহারকারী সক্রিয়তা",
            },
          },
        },
      });
    }

    // Course Performance Chart (Doughnut Chart)
    const coursePerformanceCtx = document.getElementById(
      "coursePerformanceChart"
    );
    if (coursePerformanceCtx) {
      const activeCourses = courses.filter((c) => !c.archived).length; // Active courses are not archived
      const archivedCourses = courses.filter((c) => c.archived).length;
      // Assuming 'draft' status is not directly used in allCourses, adjust if needed
      const draftCourses = 0; // Placeholder if no draft status in allCourses

      coursePerformanceChartInstance = new Chart(coursePerformanceCtx, {
        type: "doughnut",
        data: {
          labels: ["সক্রিয়", "আর্কাইভ", "খসড়া"],
          datasets: [
            {
              data: [activeCourses, archivedCourses, draftCourses],
              backgroundColor: ["#10b981", "#64748b", "#f59e0b"],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            title: {
              display: true,
              text: "কোর্স স্ট্যাটাস বিতরণ",
            },
          },
        },
      });
    }

    // User Role Chart (Bar Graph)
    const userRoleCtx = document.getElementById("userRoleChart");
    if (userRoleCtx) {
      const roleCounts = allUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      const labels = Object.keys(roleCounts).map(getRoleText);
      const data = Object.values(roleCounts);
      const backgroundColors = labels.map((role) => {
        if (role === "প্রশাসক") return "#e74c3c";
        if (role === "শিক্ষক") return "#f59e0b";
        if (role === "শিক্ষার্থী") return "#06b6d4";
        return "#64748b";
      });

      userRoleChartInstance = new Chart(userRoleCtx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "ব্যবহারকারীর সংখ্যা",
              data: data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map((color) =>
                color.replace("0.1", "1")
              ),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "সংখ্যা",
              },
            },
            x: {
              title: {
                display: true,
                text: "ভূমিকা",
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: "ভূমিকা অনুসারে ব্যবহারকারী বিতরণ",
            },
            legend: {
              display: false,
            },
          },
        },
      });
    }

    // Course Status Chart (Pie Chart - similar to doughnut but different visual)
    const courseStatusCtx = document.getElementById("courseStatusChart");
    if (courseStatusCtx) {
      const statusCounts = courses.reduce((acc, course) => {
        const status = course.archived ? "archived" : "active"; // Map to active/archived
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const labels = Object.keys(statusCounts).map(getCourseStatusText);
      const data = Object.values(statusCounts);
      const backgroundColors = labels.map((status) => {
        if (status === "সক্রিয়") return "#10b981";
        if (status === "আর্কাইভ") return "#64748b";
        if (status === "খসড়া") return "#f59e0b";
        return "#06b6d4";
      });

      courseStatusChartInstance = new Chart(courseStatusCtx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: "কোর্সের সংখ্যা",
              data: data,
              backgroundColor: backgroundColors,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            title: {
              display: true,
              text: "কোর্স স্ট্যাটাস ওভারভিউ",
            },
          },
        },
      });
    }
  }

  /**
   * Returns the Bengali text for a given user role.
   * @param {string} role - The role string (e.g., "admin", "teacher").
   * @returns {string} The Bengali equivalent of the role.
   */
  function getRoleText(role) {
    const roles = {
      admin: "প্রশাসক",
      teacher: "শিক্ষক",
      student: "শিক্ষার্থী",
      user: "শিক্ষার্থী", // Assuming 'user' role is equivalent to 'student' for display
    };
    return roles[role] || role;
  }

  /**
   * Returns the Bootstrap badge class for a given user role.
   * @param {string} role - The role string.
   * @returns {string} The Bootstrap badge class.
   */
  function getRoleBadgeClass(role) {
    const classes = {
      admin: "primary",
      teacher: "warning",
      student: "info",
      user: "info",
    };
    return classes[role] || "secondary";
  }

  /**
   * Returns the Bengali text for a given course status.
   * @param {string} status - The status string (e.g., "active", "archived").
   * @returns {string} The Bengali equivalent of the status.
   */
  function getCourseStatusText(status) {
    const statuses = {
      active: "সক্রিয়",
      archived: "আর্কাইভ",
      draft: "খসড়া",
    };
    return statuses[status] || status;
  }

  /**
   * Returns the Bengali text for a given assignment status.
   * @param {string} status - The status string (e.g., "active", "draft").
   * @returns {string} The Bengali equivalent of the status.
   */
  function getAssignmentStatusText(status) {
    const statuses = {
      active: "সক্রিয়",
      draft: "খসড়া",
      closed: "বন্ধ",
    };
    return statuses[status] || status;
  }

  /**
   * Returns the Bootstrap badge class for a given assignment status.
   * @param {string} status - The status string.
   * @returns {string} The Bootstrap badge class.
   */
  function getAssignmentStatusBadgeClass(status) {
    const classes = {
      active: "success",
      draft: "warning",
      closed: "danger",
    };
    return classes[status] || "secondary";
  }

  /**
   * Returns the Bengali text for announcement recipients.
   * @param {string} recipients - The recipient type (e.g., "all", "students").
   * @returns {string} The Bengali equivalent.
   */
  function getRecipientText(recipients) {
    const map = {
      all: "সবাই",
      students: "শিক্ষার্থীরা",
      teachers: "শিক্ষকরা",
    };
    return map[recipients] || recipients;
  }

  /**
   * Filters the users table based on search input, role, and status filters.
   */
  function filterUsers() {
    const search = document.getElementById("userSearch").value.toLowerCase();
    const roleFilter = document.getElementById("roleFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;

    const rows = document.querySelectorAll("#usersTableBody tr");
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length > 1) {
        const name = cells[1].querySelector("strong").textContent.toLowerCase();
        const email = cells[2].textContent.toLowerCase();
        const role = cells[3].textContent.toLowerCase();
        const status = cells[4].textContent.toLowerCase();

        const matchesSearch = name.includes(search) || email.includes(search);
        const matchesRole =
          !roleFilter || role.includes(getRoleText(roleFilter).toLowerCase());
        const matchesStatus =
          !statusFilter ||
          status.includes(statusFilter === "active" ? "সক্রিয়" : "নিষ্ক্রিয়");

        if (matchesSearch && matchesRole && matchesStatus) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      }
    });
  }

  /**
   * Filters the courses grid based on search input, status, and teacher filters.
   */
  function filterCourses() {
    const search = document.getElementById("courseSearch").value.toLowerCase();
    const statusFilter = document.getElementById("courseStatusFilter").value;
    const teacherFilter = document.getElementById("courseTeacherFilter").value;

    const cards = document.querySelectorAll(
      "#coursesGridAdmin .course-card-admin"
    );
    cards.forEach((card) => {
      const title = card
        .querySelector(".course-title")
        .textContent.toLowerCase();
      const teacherEmail = card
        .querySelector(".course-subtitle")
        .textContent.toLowerCase(); // Teacher email is in subtitle
      const isArchived = card.classList.contains("archived");

      const matchesSearch = title.includes(search);
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && !isArchived) ||
        (statusFilter === "archived" && isArchived);
      const matchesTeacher =
        !teacherFilter || teacherEmail.includes(teacherFilter.toLowerCase());

      if (matchesSearch && matchesStatus && matchesTeacher) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  /**
   * Populates the teacher filter dropdown for courses.
   */
  function populateCourseTeacherFilter() {
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const teachers = allUsers.filter((user) => user.role === "teacher");
    const teacherFilterSelect = document.getElementById("courseTeacherFilter");

    teacherFilterSelect.innerHTML = '<option value="">সব শিক্ষক</option>'; // Reset options
    teachers.forEach((teacher) => {
      const option = document.createElement("option");
      option.value = teacher.email;
      option.textContent = teacher.name || teacher.email.split("@")[0];
      teacherFilterSelect.appendChild(option);
    });
  }

  /**
   * Saves a new user to local storage and updates the UI.
   */
  function saveUser() {
    const name = document.getElementById("newUserName").value;
    const email = document.getElementById("newUserEmail").value;
    const role = document.getElementById("newUserRole").value;

    if (!name || !email || !role) {
      showNotification("সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    let allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const existingUser = allUsers.find((user) => user.email === email);

    if (existingUser) {
      showNotification("এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে", "error");
      return;
    }

    const newUser = {
      name: name,
      email: email,
      role: role,
      password: "defaultPassword123", // Default password for admin-created users
      registeredAt: new Date().toISOString(),
      status: "active", // New users are active by default
    };

    allUsers.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(allUsers));

    // Initialize a basic profile for the new user
    const profileData = {
      fullName: name,
      email: email,
      phone: "",
      address: "",
      bio: "",
    };
    localStorage.setItem(`profileData_${email}`, JSON.stringify(profileData));

    // Initialize an empty dashboard for the new user
    const dashboardKey = `dashboard_${email}`;
    localStorage.setItem(
      dashboardKey,
      JSON.stringify({ courses: [], role: role })
    );

    logUserActivity(currentUserEmail, "নতুন ব্যবহারকারী তৈরি", "User", email);

    showNotification("নতুন ব্যবহারকারী যোগ করা হয়েছে", "success");
    addUserModal.hide();
    addUserForm.reset();
    loadUsers(); // Reload users table
    loadDashboardStats(); // Update dashboard stats
    populateCourseTeacherFilter(); // Update teacher list if new teacher added
    initializeCharts(); // Update charts with new user data
  }

  /**
   * Opens the edit user modal and populates it with user data.
   * @param {string} email - The email of the user to edit.
   */
  window.editUser = function (email) {
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const userToEdit = allUsers.find((user) => user.email === email);
    const profileData =
      JSON.parse(localStorage.getItem(`profileData_${email}`)) || {};

    if (!userToEdit) {
      showNotification("ব্যবহারকারী খুঁজে পাওয়া যায়নি", "error");
      return;
    }

    document.getElementById("editUserId").value = userToEdit.email; // Use email as ID
    document.getElementById("editUserName").value =
      profileData.fullName || userToEdit.name;
    document.getElementById("editUserEmail").value = userToEdit.email;
    document.getElementById("editUserRole").value = userToEdit.role;
    document.getElementById("editUserStatus").value =
      userToEdit.status || "active"; // Set current status
    document.getElementById("editUserPhone").value = profileData.phone || "";
    document.getElementById("editUserAddress").value =
      profileData.address || "";
    document.getElementById("editUserBio").value = profileData.bio || "";

    editUserModal.show();
  };

  /**
   * Saves the edited user data to local storage.
   */
  function saveEditedUser() {
    const userEmail = document.getElementById("editUserId").value;
    const email = document.getElementById("editUserEmail").value;
    const name = document.getElementById("editUserName").value;
    const role = document.getElementById("editUserRole").value;
    const status = document.getElementById("editUserStatus").value;
    const phone = document.getElementById("editUserPhone").value;
    const address = document.getElementById("editUserAddress").value;
    const bio = document.getElementById("editUserBio").value;

    let allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const userIndex = allUsers.findIndex((user) => user.email === userEmail);

    if (userIndex > -1) {
      allUsers[userIndex].name = name;
      allUsers[userIndex].role = role;
      allUsers[userIndex].status = status; // Update user status
      localStorage.setItem("registeredUsers", JSON.stringify(allUsers));

      // Update profile data
      const profileData = {
        fullName: name,
        email: email,
        phone: phone,
        address: address,
        bio: bio,
      };
      localStorage.setItem(`profileData_${email}`, JSON.stringify(profileData));

      // Update user's dashboard role
      const dashboardKey = `dashboard_${email}`;
      const dashboard = JSON.parse(
        localStorage.getItem(dashboardKey) || '{"courses": [], "role": null}'
      );
      dashboard.role = role;
      localStorage.setItem(dashboardKey, JSON.stringify(dashboard));

      logUserActivity(currentUserEmail, "ব্যবহারকারী সম্পাদনা", "User", email);
      showNotification("ব্যবহারকারী সফলভাবে আপডেট করা হয়েছে", "success");
      editUserModal.hide();
      loadUsers();
      loadDashboardStats();
      populateCourseTeacherFilter(); // Update teacher list if role changed
      initializeCharts(); // Update charts with new user data
    } else {
      showNotification("ব্যবহারকারী খুঁজে পাওয়া যায়নি", "error");
    }
  }

  /**
   * Placeholder for bulk user upload functionality.
   */
  function handleBulkUpload() {
    showNotification("বাল্ক আপলোড ফিচার শীঘ্রই আসছে", "info");
  }

  /**
   * Exports user data as a JSON file.
   */
  function exportUsers() {
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const dataStr = JSON.stringify(allUsers, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `users_export_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    showNotification("ব্যবহারকারীদের তথ্য এক্সপোর্ট সম্পন্ন", "success");
  }

  /**
   * Populates the teacher dropdown in the course modal.
   * @param {string} [selectedTeacherEmail] - The email of the teacher to pre-select.
   */
  function populateCourseTeacherDropdown(selectedTeacherEmail = null) {
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const teachers = allUsers.filter((user) => user.role === "teacher");
    courseTeacherSelect.innerHTML = '<option value="">Select Teacher</option>';
    teachers.forEach((teacher) => {
      const option = document.createElement("option");
      option.value = teacher.email;
      option.textContent = teacher.name || teacher.email.split("@")[0];
      if (selectedTeacherEmail && teacher.email === selectedTeacherEmail) {
        option.selected = true;
      }
      courseTeacherSelect.appendChild(option);
    });
  }

  /**
   * Opens the course modal for creating a new course or editing an existing one.
   * @param {string} [courseId] - The ID of the course to edit. If not provided, a new course is created.
   */
  window.openCourseModal = function (courseId = null) {
    courseForm.reset(); // Reset form fields
    courseIdInput.value = ""; // Clear hidden ID

    populateCourseTeacherDropdown(); // Populate teachers dropdown

    if (courseId) {
      courseModalTitle.textContent = "Edit Course";
      const allCourses = JSON.parse(localStorage.getItem("allCourses")) || [];
      const course = allCourses.find((c) => c.id === courseId);

      if (course) {
        courseIdInput.value = course.id;
        courseTitleInput.value = course.name;
        courseSectionInput.value = course.section;
        courseSubjectInput.value = course.subject;
        courseRoomInput.value = course.room;
        populateCourseTeacherDropdown(course.teacher); // Select current teacher
        courseStatusSelect.value = course.archived ? "archived" : "active";
        courseStudentsInput.value = course.students
          ? course.students.join(", ")
          : "";
      } else {
        showNotification("Course not found!", "error");
        return;
      }
    } else {
      courseModalTitle.textContent = "Create New Course";
      // Default teacher to current admin if they are a teacher, otherwise leave blank
      if (userRole === "teacher") {
        populateCourseTeacherDropdown(currentUserEmail);
      }
    }
    courseModal.show();
  };

  /**
   * Saves a new course or updates an existing one.
   */
  function saveCourse() {
    const courseId = courseIdInput.value;
    const name = courseTitleInput.value.trim();
    const section = courseSectionInput.value.trim();
    const subject = courseSubjectInput.value.trim();
    const room = courseRoomInput.value.trim();
    const teacher = courseTeacherSelect.value;
    const status = courseStatusSelect.value;
    const studentsInput = courseStudentsInput.value;
    const students = studentsInput
      ? studentsInput
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [];

    if (!name || !teacher) {
      showNotification("Course Name and Teacher are required!", "error");
      return;
    }

    let allCourses = JSON.parse(localStorage.getItem("allCourses")) || [];
    let message = "";

    if (courseId) {
      // Edit existing course
      const courseIndex = allCourses.findIndex((c) => c.id === courseId);
      if (courseIndex > -1) {
        const oldCourse = allCourses[courseIndex];
        const updatedCourse = {
          ...oldCourse,
          name: name,
          section: section,
          subject: subject,
          room: room,
          teacher: teacher,
          archived: status === "archived",
          students: students,
          modified: new Date().toISOString(),
        };
        allCourses[courseIndex] = updatedCourse;
        message = "Course updated successfully!";
        logUserActivity(currentUserEmail, "Course Edited", "Course", name);

        // Update in all user dashboards
        updateCourseInAllDashboards(courseId, {
          name: name,
          section: section,
          subject: subject,
          room: room,
          teacher: teacher,
          archived: status === "archived",
          students: students,
          modified: new Date().toISOString(),
        });
      } else {
        showNotification("Course not found!", "error");
        return;
      }
    } else {
      // Create new course
      const newCourse = {
        id: Date.now().toString(), // Unique ID
        name: name,
        section: section,
        subject: subject,
        room: room,
        code: generateCourseCode(), // Generate unique code
        teacher: teacher,
        students: students,
        created: new Date().toISOString(),
        archived: status === "archived",
      };
      allCourses.push(newCourse);
      message = "New course created successfully!";
      logUserActivity(currentUserEmail, "Course Created", "Course", name);

      // Add to teacher's dashboard
      const teacherDashboardKey = `dashboard_${teacher}`;
      const teacherDashboard = JSON.parse(
        localStorage.getItem(teacherDashboardKey) ||
          '{"courses": [], "role": "teacher"}'
      );
      teacherDashboard.courses.push(newCourse);
      localStorage.setItem(
        teacherDashboardKey,
        JSON.stringify(teacherDashboard)
      );
    }

    localStorage.setItem("allCourses", JSON.stringify(allCourses));
    showNotification(message, "success");
    courseModal.hide();
    loadCourses(); // Re-render admin courses
    loadDashboardStats(); // Update stats
    initializeCharts(); // Update charts with new course data
  }

  /**
   * Generates a unique 7-character alphanumeric course code.
   * @returns {string} The generated course code.
   */
  function generateCourseCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure uniqueness against existing codes
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    if (allCourses.some((course) => course.code === result)) {
      return generateCourseCode(); // Regenerate if duplicate
    }
    return result;
  }

  /**
   * Opens the assignment modal for creating a new assignment or editing an existing one.
   * @param {string} [assignmentId] - The ID of the assignment to edit. If not provided, a new assignment is created.
   */
  window.openAssignmentModal = function (assignmentId = null) {
    const assignmentModalTitle = document.getElementById(
      "assignmentModalTitle"
    );
    const assignmentIdInput = document.getElementById("assignmentId");
    const assignmentTitleInput = document.getElementById("assignmentTitle");
    const assignmentCourseSelect = document.getElementById("assignmentCourse");
    const assignmentDescriptionInput = document.getElementById(
      "assignmentDescription"
    );
    const assignmentDueDateInput = document.getElementById("assignmentDueDate");
    const assignmentStatusSelect = document.getElementById("assignmentStatus");

    // Populate courses dropdown
    const courses = JSON.parse(localStorage.getItem("allCourses")) || []; // Use allCourses
    assignmentCourseSelect.innerHTML =
      '<option value="">কোর্স নির্বাচন করুন</option>';
    courses.forEach((course) => {
      const option = document.createElement("option");
      option.value = course.id;
      option.textContent = course.name; // Use course.name for display
      assignmentCourseSelect.appendChild(option);
    });

    if (assignmentId) {
      assignmentModalTitle.textContent = "অ্যাসাইনমেন্ট সম্পাদনা করুন";
      const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
      const assignment = assignments.find((a) => a.id === assignmentId);

      if (assignment) {
        assignmentIdInput.value = assignment.id;
        assignmentTitleInput.value = assignment.title;
        assignmentCourseSelect.value = assignment.courseId;
        assignmentDescriptionInput.value = assignment.description || "";
        assignmentDueDateInput.value = assignment.dueDate || "";
        assignmentStatusSelect.value = assignment.status || "active";
      } else {
        showNotification("অ্যাসাইনমেন্ট খুঁজে পাওয়া যায়নি", "error");
        return;
      }
    } else {
      assignmentModalTitle.textContent = "নতুন অ্যাসাইনমেন্ট তৈরি করুন";
      assignmentForm.reset();
      assignmentIdInput.value = ""; // Clear hidden ID for new assignment
    }
    assignmentModal.show();
  };

  /**
   * Saves a new assignment or updates an existing one.
   */
  function saveAssignment() {
    const assignmentId = document.getElementById("assignmentId").value;
    const title = document.getElementById("assignmentTitle").value;
    const courseId = document.getElementById("assignmentCourse").value;
    const description = document.getElementById("assignmentDescription").value;
    const dueDate = document.getElementById("assignmentDueDate").value;
    const status = document.getElementById("assignmentStatus").value;

    if (!title || !courseId || !dueDate) {
      showNotification("সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    let message = "";

    if (assignmentId) {
      // Edit existing assignment
      const assignmentIndex = assignments.findIndex(
        (a) => a.id == assignmentId
      );
      if (assignmentIndex > -1) {
        assignments[assignmentIndex] = {
          ...assignments[assignmentIndex],
          title: title,
          courseId: courseId,
          description: description,
          dueDate: dueDate,
          status: status,
          updatedAt: new Date().toLocaleString("bn-BD"),
        };
        message = "অ্যাসাইনমেন্ট সফলভাবে আপডেট করা হয়েছে";
        logUserActivity(
          currentUserEmail,
          "অ্যাসাইনমেন্ট সম্পাদনা",
          "Assignment",
          title
        );
      } else {
        showNotification("অ্যাসাইনমেন্ট খুঁজে পাওয়া যায়নি", "error");
        return;
      }
    } else {
      // Create new assignment
      const newAssignment = {
        id: `assignment_${Date.now()}`,
        title: title,
        courseId: courseId,
        createdBy: currentUserEmail,
        description: description,
        dueDate: dueDate,
        status: status,
        submissions: 0,
        graded: 0,
        createdAt: new Date().toLocaleString("bn-BD"),
      };
      assignments.push(newAssignment);
      message = "নতুন অ্যাসাইনমেন্ট তৈরি করা হয়েছে";
      logUserActivity(
        currentUserEmail,
        "নতুন অ্যাসাইনমেন্ট তৈরি",
        "Assignment",
        title
      );
    }

    localStorage.setItem("assignments", JSON.stringify(assignments));
    showNotification(message, "success");
    assignmentModal.hide();
    loadAssignments();
    loadDashboardStats();
  }

  /**
   * Generates and downloads a system report as a JSON file.
   */
  function generateReport() {
    const reportData = {
      users: JSON.parse(localStorage.getItem("registeredUsers")) || [],
      courses: JSON.parse(localStorage.getItem("allCourses")) || [], // Use allCourses
      assignments: JSON.parse(localStorage.getItem("assignments")) || [],
      announcements: JSON.parse(localStorage.getItem("announcements")) || [],
      auditLogs: JSON.parse(localStorage.getItem("auditLogs")) || [],
      generatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `admin_report_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    showNotification("রিপোর্ট তৈরি এবং ডাউনলোড সম্পন্ন (JSON)", "success");
    showNotification(
      "PDF/Excel রিপোর্ট তৈরির জন্য সার্ভার-সাইড প্রক্রিয়াকরণ প্রয়োজন।",
      "info",
      5000
    );
  }

  /**
   * Creates and downloads a system backup as a JSON file.
   */
  function createSystemBackup() {
    const backupData = {
      registeredUsers: localStorage.getItem("registeredUsers"),
      allCourses: localStorage.getItem("allCourses"), // Use allCourses
      assignments: localStorage.getItem("assignments"),
      auditLogs: localStorage.getItem("auditLogs"),
      messages: localStorage.getItem("messages"),
      announcements: localStorage.getItem("announcements"),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `system_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    showNotification("সিস্টেম ব্যাকআপ তৈরি এবং ডাউনলোড সম্পন্ন", "success");
  }

  /**
   * Toggles the system maintenance mode status in local storage.
   */
  function toggleMaintenance() {
    const isMaintenanceMode =
      localStorage.getItem("maintenanceMode") === "true";
    localStorage.setItem("maintenanceMode", !isMaintenanceMode);

    if (!isMaintenanceMode) {
      showNotification("রক্ষণাবেক্ষণ মোড সক্রিয় করা হয়েছে", "warning");
    } else {
      showNotification("রক্ষণাবেক্ষণ মোড নিষ্ক্রিয় করা হয়েছে", "success");
    }
  }

  /**
   * Placeholder for checking system updates.
   */
  function checkSystemUpdate() {
    showNotification("সিস্টেম আপডেট চেক করা হচ্ছে...", "info");
    setTimeout(() => {
      showNotification(
        "সিস্টেম আপডেট হয়েছে! কোনো নতুন আপডেট পাওয়া যায়নি।",
        "success"
      );
    }, 2000);
  }

  /**
   * Opens the admin profile edit modal and populates it.
   */
  function openAdminProfileModal() {
    const adminProfile =
      JSON.parse(localStorage.getItem(`profileData_${currentUserEmail}`)) || {};
    const adminUser = (
      JSON.parse(localStorage.getItem("registeredUsers")) || []
    ).find((u) => u.email === currentUserEmail);

    document.getElementById("adminProfileName").value =
      adminProfile.fullName ||
      adminUser?.name ||
      currentUserEmail.split("@")[0];
    document.getElementById("adminProfileEmail").value = currentUserEmail;
    document.getElementById("adminProfilePhone").value =
      adminProfile.phone || "";
    document.getElementById("adminProfileAddress").value =
      adminProfile.address || "";
    document.getElementById("adminProfileBio").value = adminProfile.bio || "";

    adminProfileModal.show();
  }

  /**
   * Saves the updated admin profile data.
   */
  function saveAdminProfile() {
    const name = document.getElementById("adminProfileName").value;
    const email = document.getElementById("adminProfileEmail").value;
    const phone = document.getElementById("adminProfilePhone").value;
    const address = document.getElementById("adminProfileAddress").value;
    const bio = document.getElementById("adminProfileBio").value;

    // Update the user's name in the registeredUsers array
    let allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const userIndex = allUsers.findIndex((user) => user.email === email);
    if (userIndex > -1) {
      allUsers[userIndex].name = name;
      localStorage.setItem("registeredUsers", JSON.stringify(allUsers));
    }

    // Update the profileData for the current admin
    const profileData = {
      fullName: name,
      email: email,
      phone: phone,
      address: address,
      bio: bio,
    };
    localStorage.setItem(`profileData_${email}`, JSON.stringify(profileData));

    logUserActivity(
      currentUserEmail,
      "প্রোফাইল সম্পাদনা",
      "Admin Profile",
      email
    );
    showNotification("প্রোফাইল সফলভাবে আপডেট করা হয়েছে", "success");
    adminProfileModal.hide();
    initializePage(); // Re-initialize to update header name etc.
  }

  /**
   * Logs user activity to local storage for auditing purposes.
   * @param {string} userEmail - The email of the user performing the action.
   * @param {string} action - A description of the action performed.
   * @param {string} resource - The type of resource affected (e.g., "User", "Course").
   * @param {string} [details=""] - Additional details about the action.
   */
  function logUserActivity(userEmail, action, resource, details = "") {
    const auditLogs = JSON.parse(localStorage.getItem("auditLogs")) || [];

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString("bn-BD"),
      userEmail: userEmail,
      action: action,
      resource: resource,
      details: details,
      status: "success", // Assuming success for logged actions
      ipAddress: "127.0.0.1", // Dummy IP address
    };

    auditLogs.unshift(newLog); // Add to the beginning

    // Keep the log size manageable
    if (auditLogs.length > 100) {
      auditLogs.splice(100);
    }

    localStorage.setItem("auditLogs", JSON.stringify(auditLogs));
  }

  // --- Global Functions (accessible from HTML onclick attributes) ---

  window.viewUserProfile = function (email) {
    const userProfile =
      JSON.parse(localStorage.getItem(`profileData_${email}`)) || {};
    const userCourses = JSON.parse(localStorage.getItem("allCourses")) || []; // Use allCourses
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const user = allUsers.find((u) => u.email === email);

    document.getElementById("profileUserEmail").textContent = email;
    document.getElementById("profileUserName").textContent =
      userProfile.fullName || "N/A";
    document.getElementById("profileUserPhone").textContent =
      userProfile.phone || "N/A";
    document.getElementById("profileUserAddress").textContent =
      userProfile.address || "N/A";
    document.getElementById("profileUserBio").textContent =
      userProfile.bio || "N/A";
    document.getElementById("profileUserRole").textContent = getRoleText(
      user?.role || "N/A"
    );
    document.getElementById("profileUserStatus").textContent =
      user?.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়";

    const createdCourses = userCourses.filter(
      (course) => course.teacher === email
    );
    const enrolledCourses = userCourses.filter(
      (course) => course.students && course.students.includes(email)
    );

    document.getElementById("userCreatedCourses").textContent =
      createdCourses.length;
    document.getElementById("userEnrolledCourses").textContent =
      enrolledCourses.length;

    userProfileModal.show();
  };

  window.deleteUser = function (email) {
    if (
      confirm(
        `আপনি কি ${email} ব্যবহারকারীকে সম্পূর্ণভাবে মুছে ফেলতে চান? এই পদক্ষেপটি অপরিবর্তনীয়।`
      )
    ) {
      let allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
      const updatedUsers = allUsers.filter((user) => user.email !== email);
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

      // Clean up associated data
      localStorage.removeItem(`profileData_${email}`);
      localStorage.removeItem(`loginHistory_${email}`);
      localStorage.removeItem(`lastActivity_${email}`);
      localStorage.removeItem(`dashboard_${email}`); // Remove user's dashboard

      // Remove courses created by this user (optional, depending on business logic)
      let allCourses = JSON.parse(localStorage.getItem("allCourses")) || [];
      const updatedCourses = allCourses.filter(
        (course) => course.teacher !== email
      );
      localStorage.setItem("allCourses", JSON.stringify(updatedCourses));

      // Remove user from any enrolled courses
      allCourses.forEach((course) => {
        if (course.students && course.students.includes(email)) {
          course.students = course.students.filter(
            (studentEmail) => studentEmail !== email
          );
        }
      });
      localStorage.setItem("allCourses", JSON.stringify(allCourses));

      logUserActivity(currentUserEmail, "ব্যবহারকারী মুছে ফেলা", "User", email);

      showNotification("ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে", "success");
      loadUsers(); // Reload users table
      loadCourses(); // Reload courses (if any were deleted)
      loadDashboardStats(); // Update dashboard stats
      populateCourseTeacherFilter(); // Update teacher list
      initializeCharts(); // Update charts
    }
  };

  window.editAssignment = function (assignmentId) {
    openAssignmentModal(assignmentId);
  };

  window.gradeAssignment = function (assignmentId) {
    showNotification(
      `অ্যাসাইনমেন্ট ${assignmentId} গ্রেড করার ফিচার শীঘ্রই আসছে`,
      "info"
    );
    // TODO: Implement grading functionality
  };

  window.deleteAssignment = function (assignmentId) {
    if (
      confirm(
        "আপনি কি এই অ্যাসাইনমেন্টটি মুছে ফেলতে চান? এই পদক্ষেপটি অপরিবর্তনীয়।"
      )
    ) {
      let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
      const assignment = assignments.find((a) => a.id === assignmentId); // Get assignment details for logging
      const updatedAssignments = assignments.filter(
        (a) => a.id !== assignmentId
      );
      localStorage.setItem("assignments", JSON.stringify(updatedAssignments));

      if (assignment) {
        logUserActivity(
          currentUserEmail,
          "অ্যাসাইনমেন্ট মুছে ফেলা",
          "Assignment",
          assignment.title
        );
      }

      showNotification("অ্যাসাইনমেন্ট সফলভাবে মুছে ফেলা হয়েছে", "success");
      loadAssignments(); // Reload assignments table
      loadDashboardStats(); // Update dashboard stats
    }
  };

  /**
   * Displays a temporary notification message on the screen.
   * @param {string} message - The message to display.
   * @param {"success" | "error" | "warning" | "info"} type - The type of notification, affecting its color and icon.
   * @param {number} duration - How long the notification should be visible in milliseconds.
   */
  function showNotification(message, type, duration = 3000) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };

    notification.innerHTML = `
            <i class="fas fa-${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    // Animate out and remove after a delay
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300); // Allow transition to complete before removing
    }, duration);
  }

  /**
   * Initializes dummy data in localStorage if it doesn't exist.
   * This is for demonstration purposes to make the panel functional out of the box.
   */
  function initializeDummyData() {
    if (
      !localStorage.getItem("registeredUsers") ||
      JSON.parse(localStorage.getItem("registeredUsers")).length === 0
    ) {
      const dummyUsers = [
        {
          name: "Admin User",
          email: "tanvir479@gmail.com",
          password: "111111",
          role: "admin",
          registeredAt: new Date("2023-01-01").toISOString(),
          status: "active",
        },
        {
          name: "Teacher One",
          email: "teacher1@example.com",
          password: "password123",
          role: "teacher",
          registeredAt: new Date("2023-02-05").toISOString(),
          status: "active",
        },
        {
          name: "Student A",
          email: "studentA@example.com",
          password: "password123",
          role: "student", // Changed from 'user' to 'student'
          registeredAt: new Date("2023-03-10").toISOString(),
          status: "active",
        },
        {
          name: "Student B",
          email: "studentB@example.com",
          password: "password123",
          role: "student", // Changed from 'user' to 'student'
          registeredAt: new Date("2023-03-15").toISOString(),
          status: "active",
        },
        {
          name: "Teacher Two",
          email: "teacher2@example.com",
          password: "password123",
          role: "teacher",
          registeredAt: new Date("2023-04-20").toISOString(),
          status: "active",
        },
        {
          name: "Inactive Student",
          email: "inactive@example.com",
          password: "password123",
          role: "student",
          registeredAt: new Date("2023-05-01").toISOString(),
          status: "inactive",
        },
      ];
      localStorage.setItem("registeredUsers", JSON.stringify(dummyUsers));

      // Set dummy profile data for admin
      localStorage.setItem(
        "profileData_tanvir479@gmail.com",
        JSON.stringify({
          fullName: "Admin User",
          email: "tanvir479@gmail.com",
          phone: "123-456-7890",
          address: "123 Admin St, City",
          bio: "System administrator with 5 years of experience in educational platforms.",
        })
      );

      // Initialize dashboards for dummy users
      dummyUsers.forEach((user) => {
        const dashboardKey = `dashboard_${user.email}`;
        localStorage.setItem(
          dashboardKey,
          JSON.stringify({ courses: [], role: user.role })
        );
      });
    }

    // Use 'allCourses' for global course storage
    if (!localStorage.getItem("allCourses")) {
      const dummyCourses = [
        {
          id: "course_101",
          name: "Introduction to Programming",
          section: "A",
          subject: "Computer Science",
          room: "Lab 101",
          code: "PROG101",
          teacher: "teacher1@example.com",
          students: ["studentA@example.com"],
          created: "2023-01-04T10:00:00Z",
          archived: false,
        },
        {
          id: "course_102",
          name: "Advanced Mathematics",
          section: "B",
          subject: "Mathematics",
          room: "Room 203",
          code: "MATH201",
          teacher: "teacher2@example.com",
          students: ["studentB@example.com"],
          created: "2023-02-15T11:30:00Z",
          archived: false,
        },
        {
          id: "course_103",
          name: "Web Development Fundamentals",
          section: "C",
          subject: "Web Development",
          room: "Online",
          code: "WEBDEV",
          teacher: "teacher1@example.com",
          students: [],
          created: "2023-03-20T09:00:00Z",
          archived: true, // Example archived course
        },
        {
          id: "course_104",
          name: "Data Science Basics",
          section: "D",
          subject: "Data Science",
          room: "Lab 205",
          code: "DATASCI",
          teacher: "teacher2@example.com",
          students: ["studentA@example.com", "studentB@example.com"],
          created: "2023-04-01T14:00:00Z",
          archived: false,
        },
      ];
      localStorage.setItem("allCourses", JSON.stringify(dummyCourses));

      // Populate dashboards for teachers and students
      dummyCourses.forEach((course) => {
        // Teacher's dashboard
        const teacherDashboardKey = `dashboard_${course.teacher}`;
        const teacherDashboard = JSON.parse(
          localStorage.getItem(teacherDashboardKey) ||
            '{"courses": [], "role": "teacher"}'
        );
        if (!teacherDashboard.courses.some((c) => c.id === course.id)) {
          teacherDashboard.courses.push(course);
          localStorage.setItem(
            teacherDashboardKey,
            JSON.stringify(teacherDashboard)
          );
        }

        // Students' dashboards
        if (course.students && course.students.length > 0) {
          course.students.forEach((studentEmail) => {
            const studentDashboardKey = `dashboard_${studentEmail}`;
            const studentDashboard = JSON.parse(
              localStorage.getItem(studentDashboardKey) ||
                '{"courses": [], "role": "student"}'
            );
            if (!studentDashboard.courses.some((c) => c.id === course.id)) {
              studentDashboard.courses.push(course);
              localStorage.setItem(
                studentDashboardKey,
                JSON.stringify(studentDashboard)
              );
            }
          });
        }
      });
    }

    if (!localStorage.getItem("assignments")) {
      const dummyAssignments = [
        {
          id: "assignment_001",
          title: "Python Basics Quiz",
          courseId: "course_101",
          createdBy: "teacher1@example.com",
          description: "A short quiz on Python syntax and basic data types.",
          dueDate: "2023-06-30",
          status: "active",
          submissions: 5,
          graded: 3,
          createdAt: "10/06/2023",
        },
        {
          id: "assignment_002",
          title: "Final Project Proposal",
          courseId: "course_101",
          createdBy: "teacher1@example.com",
          description: "Submit your final project idea and outline.",
          dueDate: "2023-07-15",
          status: "draft",
          submissions: 0,
          graded: 0,
          createdAt: "01/07/2023",
        },
      ];
      localStorage.setItem("assignments", JSON.stringify(dummyAssignments));
    }

    if (!localStorage.getItem("auditLogs")) {
      const dummyLogs = [
        {
          id: 1,
          timestamp: "2023-07-25 10:30:00",
          userEmail: "tanvir479@gmail.com",
          action: "লগইন",
          resource: "Authentication",
          details: "সফল লগইন",
          status: "success",
          ipAddress: "192.168.1.1",
        },
        {
          id: 2,
          timestamp: "2023-07-25 10:35:15",
          userEmail: "tanvir479@gmail.com",
          action: "নতুন ব্যবহারকারী তৈরি",
          resource: "User",
          details: "studentC@example.com",
          status: "success",
          ipAddress: "192.168.1.1",
        },
        {
          id: 3,
          timestamp: "2023-07-25 10:40:00",
          userEmail: "teacher1@example.com",
          action: "কোর্স তৈরি",
          resource: "Course",
          details: "Introduction to AI",
          status: "success",
          ipAddress: "192.168.1.2",
        },
      ];
      localStorage.setItem("auditLogs", JSON.stringify(dummyLogs));
    }

    if (!localStorage.getItem("messages")) {
      const dummyMessages = [
        {
          id: 1,
          sender: "Support Team",
          timestamp: "2023-07-24 14:00:00",
          content: "আপনার সিস্টেম আপডেটের জন্য একটি নতুন প্যাচ উপলব্ধ।",
        },
        {
          id: 2,
          sender: "teacher1@example.com",
          timestamp: "2023-07-23 09:15:00",
          content: "কোর্স 101-এ কিছু শিক্ষার্থীর সমস্যা হচ্ছে।",
        },
      ];
      localStorage.setItem("messages", JSON.stringify(dummyMessages));
    }

    if (!localStorage.getItem("announcements")) {
      const dummyAnnouncements = [
        {
          id: 1,
          title: "সিস্টেম রক্ষণাবেক্ষণ",
          message:
            "আগামীকাল রাত ২টা থেকে ৪টা পর্যন্ত সিস্টেম রক্ষণাবেক্ষণ করা হবে।",
          recipients: "all",
          createdBy: "tanvir479@gmail.com",
          createdAt: "2023-07-20 17:00:00",
        },
        {
          id: 2,
          title: "নতুন কোর্স যোগ করা হয়েছে",
          message:
            "শিক্ষার্থীদের জন্য নতুন কোর্স 'ডেটা সায়েন্স বেসিকস' যোগ করা হয়েছে।",
          recipients: "students",
          createdBy: "tanvir479@gmail.com",
          createdAt: "2023-07-22 10:00:00",
        },
      ];
      localStorage.setItem("announcements", JSON.stringify(dummyAnnouncements));
    }
  }
});
