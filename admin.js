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
  const courseForm = document.getElementById("courseForm");
  const saveCourseBtn = document.getElementById("saveCourseBtn");
  const assignmentForm = document.getElementById("assignmentForm");
  const saveAssignmentBtn = document.getElementById("saveAssignmentBtn");
  const adminProfileForm = document.getElementById("adminProfileForm");
  const saveAdminProfileBtn = document.getElementById("saveAdminProfileBtn");
  const editAdminProfileBtn = document.getElementById("editAdminProfileBtn");

  // Current User Info - FIX: Use correct localStorage keys
  const currentUserEmail = localStorage.getItem("currentUser"); // Changed from "userEmail"
  const userRole = localStorage.getItem("userRole");

  console.log(
    "Admin panel loading with user:",
    currentUserEmail,
    "role:",
    userRole
  );

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
      window.location.href = "dashboard.html"; // Changed from index.html to dashboard.html
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
  document
    .getElementById("createCourseBtn")
    .addEventListener("click", () => openCourseModal());
  saveCourseBtn.addEventListener("click", saveCourse);

  // Assignment Management
  document
    .getElementById("createAssignmentBtn")
    .addEventListener("click", () => openAssignmentModal());
  saveAssignmentBtn.addEventListener("click", saveAssignment);

  // Analytics & Communications
  document
    .getElementById("generateReportBtn")
    .addEventListener("click", generateReport);
  document
    .getElementById("sendAnnouncementBtn")
    .addEventListener("click", sendAnnouncement); // Focuses on announcement form
  announcementForm.addEventListener("submit", handleAnnouncementSubmit);

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

  // Close sidebar on mobile when clicking outside
  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove("show");
      }
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
    loadCourses();
    loadAssignments();
    loadAnalytics(); // Placeholder for actual analytics loading
    loadMessages();
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
      // FIX: Clear correct localStorage keys
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userRole");
      console.log("Logging out, redirecting to login page");
      window.location.href = "index.html";
    }
  }

  /**
   * Switches the active section in the main content area based on sidebar navigation.
   * @param {string} section - The ID of the section to display.
   */
  function switchSection(section) {
    navItems.forEach((item) => item.classList.remove("active"));
    document
      .querySelector(`[data-section="${section}"]`)
      .classList.add("active");

    adminSections.forEach((sectionEl) => sectionEl.classList.remove("active"));
    document.getElementById(section).classList.add("active");
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
    // FIX: Use correct localStorage key for registered users
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
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
    // FIX: Use correct localStorage key for registered users
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    if (allUsers.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center">কোনো ব্যবহারকারী নেই</td></tr>';
      return;
    }

    allUsers.forEach((user) => {
      const row = document.createElement("tr");
      const profileData =
        JSON.parse(localStorage.getItem(`profileData_${user.email}`)) || {};
      const lastActivity =
        localStorage.getItem(`lastActivity_${user.email}`) || "কখনো নয়";

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
                <td><span class="badge badge-success">সক্রিয়</span></td>
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
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    // FIX: Use correct localStorage key for registered users
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const coursesGrid = document.getElementById("coursesGrid");
    coursesGrid.innerHTML = "";

    if (courses.length === 0) {
      coursesGrid.innerHTML =
        '<div class="text-center text-muted">কোনো কোর্স নেই</div>';
      return;
    }

    courses.forEach((course) => {
      const teacher = allUsers.find((user) => user.email === course.createdBy);
      const teacherName = teacher
        ? teacher.name || teacher.email.split("@")[0]
        : "Unknown";

      const courseCard = document.createElement("div");
      courseCard.className = "course-card";
      courseCard.innerHTML = `
                <div class="course-header">
                    <div class="course-title">${course.title}</div>
                    <div class="course-teacher">শিক্ষক: ${teacherName}</div>
                    <div class="course-email">
                        <small>${course.createdBy}</small>
                    </div>
                </div>
                <div class="course-body">
                    <div class="course-stats">
                        <div class="course-stat">
                            <div class="course-stat-number">${
                              course.students ? course.students.length : 0
                            }</div>
                            <div class="course-stat-label">শিক্ষার্থী</div>
                        </div>
                        <div class="course-stat">
                            <div class="course-stat-number">${
                              course.assignments ? course.assignments.length : 0
                            }</div>
                            <div class="course-stat-label">অ্যাসাইনমেন্ট</div>
                        </div>
                        <div class="course-stat">
                            <span class="badge badge-${
                              course.status === "active"
                                ? "success"
                                : course.status === "archived"
                                ? "info"
                                : "warning"
                            }">${getCourseStatusText(
        course.status || "active"
      )}</span>
                        </div>
                    </div>
                    <div class="course-description">
                        <p>${course.description || "কোর্সের বিবরণ নেই"}</p>
                    </div>
                    <div class="course-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewCourseDetails('${
                          course.id
                        }')">বিস্তারিত</button>
                        <button class="btn btn-sm btn-warning" onclick="editCourse('${
                          course.id
                        }')">সম্পাদনা</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCourse('${
                          course.id
                        }')">মুছুন</button>
                    </div>
                </div>
            `;
      coursesGrid.appendChild(courseCard);
    });
    filterCourses(); // Apply filters after loading
  }

  /**
   * Loads and displays assignment data in the assignments table.
   */
  function loadAssignments() {
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    // FIX: Use correct localStorage key for registered users
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
                <td>${course ? course.title : "Unknown Course"}</td>
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
   * Placeholder function for loading analytics data.
   */
  function loadAnalytics() {
    // showNotification("অ্যানালিটিক্স ডেটা লোড হচ্ছে...", "info");
    // In a real application, this would fetch and process analytics data.
  }

  /**
   * Loads and displays recent messages in the messages list.
   */
  function loadMessages() {
    const messages = JSON.parse(localStorage.getItem("messages")) || [];

    const messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = "";

    if (messages.length === 0) {
      messagesList.innerHTML =
        '<div class="text-center text-muted">কোনো বার্তা নেই</div>';
      return;
    }

    messages.forEach((message) => {
      const messageItem = document.createElement("div");
      messageItem.className = "message-item";
      messageItem.innerHTML = `
                <div class="message-header">
                    <div class="message-sender">${message.sender}</div>
                    <div class="message-time">${message.timestamp}</div>
                </div>
                <div class="message-content">${message.content}</div>
            `;
      messagesList.appendChild(messageItem);
    });
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
   * Initializes Chart.js graphs for user activity and course performance.
   */
  function initializeCharts() {
    const userActivityCtx = document.getElementById("userActivityChart");
    if (userActivityCtx) {
      new Chart(userActivityCtx, {
        type: "line",
        data: {
          labels: ["জান", "ফেব", "মার", "এপ্রিল", "মে", "জুন", "জুলাই"],
          datasets: [
            {
              label: "সক্রিয় ব্যবহারকারী",
              data: [120, 135, 150, 165, 180, 200, 220],
              borderColor: "#e74c3c",
              backgroundColor: "rgba(231, 76, 60, 0.1)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    const coursePerformanceCtx = document.getElementById(
      "coursePerformanceChart"
    );
    if (coursePerformanceCtx) {
      new Chart(coursePerformanceCtx, {
        type: "doughnut",
        data: {
          labels: ["সম্পন্ন", "চলমান", "আর্কাইভ"],
          datasets: [
            {
              data: [45, 30, 10],
              backgroundColor: ["#10b981", "#f59e0b", "#64748b"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
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
      user: "ব্যবহারকারী",
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

    const cards = document.querySelectorAll("#coursesGrid .course-card");
    cards.forEach((card) => {
      const title = card
        .querySelector(".course-title")
        .textContent.toLowerCase();
      const teacherEmail = card
        .querySelector(".course-email small")
        .textContent.toLowerCase();
      const status = card
        .querySelector(".course-stat .badge")
        .textContent.toLowerCase();

      const matchesSearch = title.includes(search);
      const matchesStatus =
        !statusFilter ||
        status.includes(getCourseStatusText(statusFilter).toLowerCase());
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
    // FIX: Use correct localStorage key for registered users
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

    // FIX: Use correct localStorage key for registered users
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

    logUserActivity(currentUserEmail, "নতুন ব্যবহারকারী তৈরি", "User", email);

    showNotification("নতুন ব্যবহারকারী যোগ করা হয়েছে", "success");
    addUserModal.hide();
    addUserForm.reset();
    loadUsers(); // Reload users table
    loadDashboardStats(); // Update dashboard stats
    populateCourseTeacherFilter(); // Update teacher list if new teacher added
  }

  /**
   * Opens the edit user modal and populates it with user data.
   * @param {string} email - The email of the user to edit.
   */
  window.editUser = function (email) {
    // FIX: Use correct localStorage key for registered users
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
    document.getElementById("editUserStatus").value = "active"; // Default status
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

    // FIX: Use correct localStorage key for registered users
    let allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const userIndex = allUsers.findIndex((user) => user.email === userEmail);

    if (userIndex > -1) {
      allUsers[userIndex].name = name;
      allUsers[userIndex].role = role;
      // Note: status field doesn't exist in registeredUsers structure, but keeping it for consistency
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

      logUserActivity(currentUserEmail, "ব্যবহারকারী সম্পাদনা", "User", email);
      showNotification("ব্যবহারকারী সফলভাবে আপডেট করা হয়েছে", "success");
      editUserModal.hide();
      loadUsers();
      loadDashboardStats();
      populateCourseTeacherFilter(); // Update teacher list if role changed
    } else {
      showNotification("ব্যবহারকারী খুঁজে পাওয়া যায়নি", "error");
    }
  }

  /**
   * Handles the submission of the announcement form.
   * @param {Event} e - The form submission event.
   */
  function handleAnnouncementSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("announcementTitle").value;
    const message = document.getElementById("announcementMessage").value;
    const recipients = document.getElementById("announcementRecipients").value;

    if (!title || !message || !recipients) {
      showNotification("সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    const announcements =
      JSON.parse(localStorage.getItem("announcements")) || [];
    const newAnnouncement = {
      id: Date.now(),
      title: title,
      message: message,
      recipients: recipients,
      createdBy: currentUserEmail,
      createdAt: new Date().toLocaleString("bn-BD"),
    };

    announcements.push(newAnnouncement);
    localStorage.setItem("announcements", JSON.stringify(announcements));

    logUserActivity(currentUserEmail, "ঘোষণা পাঠানো", "Announcement", title);

    showNotification("ঘোষণা পাঠানো হয়েছে", "success");
    announcementForm.reset();
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
    // FIX: Use correct localStorage key for registered users
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
   * Opens the course modal for creating a new course or editing an existing one.
   * @param {string} [courseId] - The ID of the course to edit. If not provided, a new course is created.
   */
  window.openCourseModal = function (courseId = null) {
    const courseModalTitle = document.getElementById("courseModalTitle");
    const courseIdInput = document.getElementById("courseId");
    const courseTitleInput = document.getElementById("courseTitle");
    const courseTeacherSelect = document.getElementById("courseTeacher");
    const courseDescriptionInput = document.getElementById("courseDescription");
    const courseStatusSelect = document.getElementById("courseStatus");
    const courseStudentsInput = document.getElementById("courseStudents");

    // Populate teachers dropdown
    // FIX: Use correct localStorage key for registered users
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const teachers = allUsers.filter((user) => user.role === "teacher");
    courseTeacherSelect.innerHTML =
      '<option value="">শিক্ষক নির্বাচন করুন</option>';
    teachers.forEach((teacher) => {
      const option = document.createElement("option");
      option.value = teacher.email;
      option.textContent = teacher.name || teacher.email.split("@")[0];
      courseTeacherSelect.appendChild(option);
    });

    if (courseId) {
      courseModalTitle.textContent = "কোর্স সম্পাদনা করুন";
      const courses = JSON.parse(localStorage.getItem("courses")) || [];
      const course = courses.find((c) => c.id === courseId);

      if (course) {
        courseIdInput.value = course.id;
        courseTitleInput.value = course.title;
        courseTeacherSelect.value = course.createdBy;
        courseDescriptionInput.value = course.description || "";
        courseStatusSelect.value = course.status || "active";
        courseStudentsInput.value = course.students
          ? course.students.join(", ")
          : "";
      } else {
        showNotification("কোর্স খুঁজে পাওয়া যায়নি", "error");
        return;
      }
    } else {
      courseModalTitle.textContent = "নতুন কোর্স তৈরি করুন";
      courseForm.reset();
      courseIdInput.value = ""; // Clear hidden ID for new course
      courseTeacherSelect.value = currentUserEmail; // Default to current admin as teacher
    }
    courseModal.show();
  };

  /**
   * Saves a new course or updates an existing one.
   */
  function saveCourse() {
    const courseId = document.getElementById("courseId").value;
    const title = document.getElementById("courseTitle").value;
    const teacherEmail = document.getElementById("courseTeacher").value;
    const description = document.getElementById("courseDescription").value;
    const status = document.getElementById("courseStatus").value;
    const studentsInput = document.getElementById("courseStudents").value;
    const students = studentsInput
      ? studentsInput.split(",").map((s) => s.trim())
      : [];

    if (!title || !teacherEmail) {
      showNotification("কোর্সের নাম এবং শিক্ষক নির্বাচন করুন", "error");
      return;
    }

    let courses = JSON.parse(localStorage.getItem("courses")) || [];
    let message = "";

    if (courseId) {
      // Edit existing course
      const courseIndex = courses.findIndex((c) => c.id == courseId);
      if (courseIndex > -1) {
        courses[courseIndex] = {
          ...courses[courseIndex],
          title: title,
          createdBy: teacherEmail,
          description: description,
          status: status,
          students: students,
          updatedAt: new Date().toLocaleString("bn-BD"),
        };
        message = "কোর্স সফলভাবে আপডেট করা হয়েছে";
        logUserActivity(currentUserEmail, "কোর্স সম্পাদনা", "Course", title);
      } else {
        showNotification("কোর্স খুঁজে পাওয়া যায়নি", "error");
        return;
      }
    } else {
      // Create new course
      const newCourse = {
        id: `course_${Date.now()}`,
        title: title,
        createdBy: teacherEmail,
        description: description,
        status: status,
        students: students,
        assignments: [], // Initialize with empty assignments
        createdAt: new Date().toLocaleString("bn-BD"),
      };
      courses.push(newCourse);
      message = "নতুন কোর্স তৈরি করা হয়েছে";
      logUserActivity(currentUserEmail, "নতুন কোর্স তৈরি", "Course", title);
    }

    localStorage.setItem("courses", JSON.stringify(courses));
    showNotification(message, "success");
    courseModal.hide();
    loadCourses();
    loadDashboardStats();
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
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    assignmentCourseSelect.innerHTML =
      '<option value="">কোর্স নির্বাচন করুন</option>';
    courses.forEach((course) => {
      const option = document.createElement("option");
      option.value = course.id;
      option.textContent = course.title;
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
      courses: JSON.parse(localStorage.getItem("courses")) || [],
      assignments: JSON.parse(localStorage.getItem("assignments")) || [],
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

    showNotification("রিপোর্ট তৈরি এবং ডাউনলোড সম্পন্ন", "success");
  }

  /**
   * Scrolls to and focuses on the announcement form.
   */
  function sendAnnouncement() {
    switchSection("communications"); // Ensure communications section is active
    document.getElementById("announcementTitle").focus();
  }

  /**
   * Creates and downloads a system backup as a JSON file.
   */
  function createSystemBackup() {
    const backupData = {
      users: localStorage.getItem("registeredUsers"),
      courses: localStorage.getItem("courses"),
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
    // FIX: Use correct localStorage key for registered users
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
    // FIX: Use correct localStorage key for registered users
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
    const userCourses = JSON.parse(localStorage.getItem("courses")) || [];

    document.getElementById("profileUserEmail").textContent = email;
    document.getElementById("profileUserName").textContent =
      userProfile.fullName || "N/A";
    document.getElementById("profileUserPhone").textContent =
      userProfile.phone || "N/A";
    document.getElementById("profileUserAddress").textContent =
      userProfile.address || "N/A";
    document.getElementById("profileUserBio").textContent =
      userProfile.bio || "N/A";

    const createdCourses = userCourses.filter(
      (course) => course.createdBy === email
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
      confirm(`আপনি কি ${email} ব্যবহারকারীকে সম্পূর্ণভাবে মুছে ফেলতে চান?`)
    ) {
      // FIX: Use correct localStorage key for registered users
      let allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
      const updatedUsers = allUsers.filter((user) => user.email !== email);
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

      // Clean up associated data
      localStorage.removeItem(`profileData_${email}`);
      localStorage.removeItem(`loginHistory_${email}`);
      localStorage.removeItem(`lastActivity_${email}`);

      // Remove courses created by this user (optional, depending on business logic)
      let courses = JSON.parse(localStorage.getItem("courses")) || [];
      const updatedCourses = courses.filter(
        (course) => course.createdBy !== email
      );
      localStorage.setItem("courses", JSON.stringify(updatedCourses));

      logUserActivity(currentUserEmail, "ব্যবহারকারী মুছে ফেলা", "User", email);

      showNotification("ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে", "success");
      loadUsers(); // Reload users table
      loadCourses(); // Reload courses (if any were deleted)
      loadDashboardStats(); // Update dashboard stats
      populateCourseTeacherFilter(); // Update teacher list
    }
  };

  window.viewCourseDetails = function (courseId) {
    showNotification(
      `কোর্স ${courseId} এর বিস্তারিত দেখার ফিচার শীঘ্রই আসছে`,
      "info"
    );
    // TODO: Implement modal or page for course details
  };

  window.editCourse = function (courseId) {
    openCourseModal(courseId);
  };

  window.deleteCourse = function (courseId) {
    if (confirm("আপনি কি এই কোর্সটি সম্পূর্ণভাবে মুছে ফেলতে চান?")) {
      let courses = JSON.parse(localStorage.getItem("courses")) || [];
      const course = courses.find((c) => c.id === courseId); // Get course details for logging
      const updatedCourses = courses.filter((course) => course.id !== courseId);
      localStorage.setItem("courses", JSON.stringify(updatedCourses));

      if (course) {
        logUserActivity(
          currentUserEmail,
          "কোর্স মুছে ফেলা",
          "Course",
          course.title
        );
      }

      showNotification("কোর্স সফলভাবে মুছে ফেলা হয়েছে", "success");
      loadCourses(); // Reload courses grid
      loadDashboardStats(); // Update dashboard stats
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
    if (confirm("আপনি কি এই অ্যাসাইনমেন্টটি মুছে ফেলতে চান?")) {
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
   */
  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    const colors = {
      success: "linear-gradient(135deg, #10b981, #34d399)",
      error: "linear-gradient(135deg, #ef4444, #f87171)",
      warning: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      info: "linear-gradient(135deg, #06b6d4, #22d3ee)",
    };

    notification.style.background = colors[type] || colors.info;

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
    }, 3000);
  }

  /**
   * Initializes dummy data in localStorage if it doesn't exist.
   * This is for demonstration purposes to make the panel functional out of the box.
   */
  function initializeDummyData() {
    // FIX: Use correct localStorage key for registered users and initialize if empty
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
        },
        {
          name: "Teacher One",
          email: "teacher1@example.com",
          password: "password123",
          role: "teacher",
          registeredAt: new Date("2023-02-05").toISOString(),
        },
        {
          name: "Student A",
          email: "studentA@example.com",
          password: "password123",
          role: "user",
          registeredAt: new Date("2023-03-10").toISOString(),
        },
        {
          name: "Student B",
          email: "studentB@example.com",
          password: "password123",
          role: "user",
          registeredAt: new Date("2023-03-15").toISOString(),
        },
        {
          name: "Teacher Two",
          email: "teacher2@example.com",
          password: "password123",
          role: "teacher",
          registeredAt: new Date("2023-04-20").toISOString(),
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
    }

    if (!localStorage.getItem("courses")) {
      const dummyCourses = [
        {
          id: "course_101",
          title: "Introduction to Programming",
          createdBy: "teacher1@example.com",
          description:
            "A beginner-friendly course covering the basics of Python programming.",
          status: "active",
          students: ["studentA@example.com"],
          assignments: ["assignment_001"],
          createdAt: "01/04/2023",
        },
        {
          id: "course_102",
          title: "Advanced Mathematics",
          createdBy: "teacher2@example.com",
          description: "Deep dive into calculus and linear algebra.",
          status: "active",
          students: ["studentB@example.com"],
          assignments: [],
          createdAt: "15/04/2023",
        },
        {
          id: "course_103",
          title: "Web Development Fundamentals",
          createdBy: "teacher1@example.com",
          description:
            "Learn HTML, CSS, and JavaScript to build modern web applications.",
          status: "draft",
          students: [],
          assignments: [],
          createdAt: "20/05/2023",
        },
      ];
      localStorage.setItem("courses", JSON.stringify(dummyCourses));
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
      ];
      localStorage.setItem("announcements", JSON.stringify(dummyAnnouncements));
    }
  }
});
