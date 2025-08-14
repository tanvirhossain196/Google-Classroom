// studentArchive.js
document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const menuIcon = document.getElementById("menuIcon");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInitial = document.getElementById("userInitial");
  const currentUserEmail = document.getElementById("currentUserEmail");
  const userRoleBadge = document.getElementById("userRoleBadge");
  const coursesGrid = document.getElementById("coursesGrid");
  const emptyState = document.getElementById("emptyState");
  const emptyStateText = document.getElementById("emptyStateText");
  const dashboardTitle = document.getElementById("dashboardTitle");

  // Navigation links
  const navLinks = document.querySelectorAll("[data-nav-link]");

  // Enrolled Classes Dropdown elements
  const enrolledClassesDropdownToggle = document.getElementById(
    "enrolledClassesDropdownToggle"
  );
  const enrolledClassesDropdown = document.getElementById(
    "enrolledClassesDropdown"
  );

  // Modals (kept for consistency, but not actively used for create/join on this page)
  const createCourseModal = document.getElementById("createCourseModal");
  const joinCourseModal = document.getElementById("joinCourseModal");
  const editCourseModal = document.getElementById("editCourseModal");
  const closeCreateModal = document.getElementById("closeCreateModal");
  const closeJoinModal = document.getElementById("closeJoinModal");
  const closeEditModal = document.getElementById("closeEditModal");
  const createCourseForm = document.getElementById("createCourseForm");
  const joinCourseForm = document.getElementById("joinCourseForm");
  const editCourseForm = document.getElementById("editCourseForm");
  const cancelCreate = document.getElementById("cancelCreate");
  const cancelJoin = document.getElementById("cancelJoin");
  const cancelEdit = document.getElementById("cancelEdit");

  // Get current user
  const currentUser =
    localStorage.getItem("currentUser") || localStorage.getItem("userEmail");
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

  // Initialize archive page
  initializeArchive();

  // Event listeners
  menuIcon.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  closeCreateModal.addEventListener("click", hideCreateModal);
  closeJoinModal.addEventListener("click", hideJoinModal);
  closeEditModal.addEventListener("click", hideEditModal);
  cancelCreate.addEventListener("click", hideCreateModal);
  cancelJoin.addEventListener("click", hideJoinModal);
  cancelEdit.addEventListener("click", hideEditModal);

  // Enrolled Classes Dropdown Toggle
  enrolledClassesDropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    enrolledClassesDropdown.classList.toggle("show");
    this.querySelector(".dropdown-arrow").classList.toggle("rotate");
    renderEnrolledClasses();
  });

  // Navigation event listeners - Complete navigation fix
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const currentPage =
        window.location.pathname.split("/").pop() || "student.html";

      // Prevent default behavior and handle navigation manually
      e.preventDefault();
      e.stopPropagation();

      // If clicking on same page, do nothing
      if (
        href === currentPage ||
        (href === "student.html" && currentPage === "")
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

  // Current course being edited
  let currentEditingCourse = null;

  // Close modals when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target === createCourseModal) {
      hideCreateModal();
    }
    if (e.target === joinCourseModal) {
      hideJoinModal();
    }
    if (e.target === editCourseModal) {
      hideEditModal();
    }
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

  // Close sidebar when clicking outside (but don't interfere with navigation)
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
    }
  });

  // Close menus when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".course-card-menu")) {
      document.querySelectorAll(".course-menu-dropdown").forEach((menu) => {
        menu.classList.remove("show");
      });
    }
  });

  /**
   * Initializes the archive page by setting user information,
   * restoring sidebar state, updating UI for the user's role,
   * loading archived courses, and rendering enrolled classes.
   */
  function initializeArchive() {
    currentUserEmail.textContent = currentUser;
    userInitial.textContent = currentUser.charAt(0).toUpperCase();
    const userDashboard = getUserDashboard();
    const userRole = getUserRole();

    // Ensure userRole is set in localStorage for other pages
    if (userRole && !localStorage.getItem("userRole")) {
      localStorage.setItem("userRole", userRole);
    }

    // Handle sidebar state on page load
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

    updateUIForRole(userRole);
    loadUserCourses();
    renderEnrolledClasses();
    console.log("Current user:", currentUser);
    console.log("User role:", userRole);
    debugCourses();
  }

  /**
   * Retrieves the user's dashboard data from local storage.
   * Initializes with default values if no data is found.
   * @returns {object} The user's dashboard object.
   */
  function getUserDashboard() {
    const dashboardKey = `dashboard_${currentUser}`;
    const dashboard = JSON.parse(
      localStorage.getItem(dashboardKey) || '{"courses": [], "role": null}'
    );
    if (!dashboard.courses) {
      dashboard.courses = [];
    }
    return dashboard;
  }

  /**
   * Saves the user's dashboard data to local storage.
   * @param {object} dashboard - The dashboard object to save.
   */
  function saveUserDashboard(dashboard) {
    const dashboardKey = `dashboard_${currentUser}`;
    localStorage.setItem(dashboardKey, JSON.stringify(dashboard));
  }

  /**
   * Retrieves the current user's role from their dashboard.
   * @returns {string|null} The user's role (e.g., "teacher", "student") or null if not set.
   */
  function getUserRole() {
    const dashboard = getUserDashboard();
    return dashboard.role;
  }

  /**
   * Sets the user's role in their dashboard and in the registered users list.
   * @param {string} role - The role to set (e.g., "teacher", "student").
   */
  function setUserRole(role) {
    const dashboard = getUserDashboard();
    dashboard.role = role;
    saveUserDashboard(dashboard);
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const userIndex = registeredUsers.findIndex((u) => u.email === currentUser);
    if (userIndex !== -1) {
      registeredUsers[userIndex].role = role;
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
    }
    // Set both keys for compatibility
    localStorage.setItem("userRole", role);
  }

  /**
   * Updates the UI elements (like the role badge) based on the user's role.
   * @param {string} role - The user's role.
   */
  function updateUIForRole(role) {
    switch (role) {
      case "teacher":
        userRoleBadge.textContent = "Teacher";
        userRoleBadge.className = "role-badge teacher";
        break;
      case "student":
        userRoleBadge.textContent = "Student";
        userRoleBadge.className = "role-badge student";
        break;
      default:
        userRoleBadge.textContent = "New User";
        userRoleBadge.className = "role-badge new";
    }
  }

  /**
   * Toggles the visibility of the sidebar and adjusts the main content margin.
   * Saves the sidebar's state to local storage.
   */
  function toggleSidebar() {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");

    // Save sidebar state
    const sidebarIsOpen = sidebar.classList.contains("open");
    localStorage.setItem("sidebarState", sidebarIsOpen ? "open" : "closed");
  }

  /**
   * Handles the user logout process, clearing session data and redirecting to the login page.
   */
  function handleLogout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
  }

  /**
   * Displays the create course modal.
   */
  function showCreateModal() {
    createCourseModal.style.display = "block";
  }

  /**
   * Displays the join course modal.
   */
  function showJoinModal() {
    joinCourseModal.style.display = "block";
  }

  /**
   * Displays the edit course modal.
   */
  function showEditModal() {
    editCourseModal.style.display = "block";
  }

  /**
   * Hides the create course modal and resets its form.
   */
  function hideCreateModal() {
    createCourseModal.style.display = "none";
    createCourseForm.reset();
  }

  /**
   * Hides the join course modal and resets its form.
   */
  function hideJoinModal() {
    joinCourseModal.style.display = "none";
    joinCourseForm.reset();
  }

  /**
   * Hides the edit course modal and resets its form and current editing course.
   */
  function hideEditModal() {
    editCourseModal.style.display = "none";
    editCourseForm.reset();
    currentEditingCourse = null;
  }

  /**
   * Handles the create course form submission. (Not applicable for students on this page)
   * @param {Event} e - The submit event.
   */
  function handleCreateCourse(e) {
    e.preventDefault();
    alert("Create Course is not available on the Archive page for students.");
  }

  /**
   * Handles the join course form submission. (Not applicable for students on this page)
   * @param {Event} e - The submit event.
   */
  function handleJoinCourse(e) {
    e.preventDefault();
    alert("Join Course is not available on the Archive page for students.");
  }

  /**
   * Loads archived courses for the current user from their dashboard and renders them.
   * Handles duplicate course entries and displays an empty state if no courses are found.
   */
  function loadUserCourses() {
    const dashboard = getUserDashboard();
    let courses = (dashboard.courses || []).filter((course) => course.archived);

    // Remove duplicates based on course ID
    const uniqueCourses = [];
    const seenIds = new Set();

    courses.forEach((course) => {
      if (!seenIds.has(course.id)) {
        seenIds.add(course.id);
        uniqueCourses.push(course);
      }
    });

    // Update dashboard if we found duplicates
    if (uniqueCourses.length !== courses.length) {
      dashboard.courses = uniqueCourses;
      saveUserDashboard(dashboard);
      courses = uniqueCourses;
      console.log("Removed duplicate courses from dashboard");
    }

    if (courses.length === 0) {
      emptyState.style.display = "block";
      coursesGrid.innerHTML = "";
      return;
    }

    emptyState.style.display = "none";
    renderCourses(courses);
  }

  /**
   * Renders a list of course cards in the courses grid.
   * @param {Array<object>} courses - An array of course objects to render.
   */
  function renderCourses(courses) {
    coursesGrid.innerHTML = "";
    courses.forEach((course) => {
      const courseCard = createCourseCard(course);
      coursesGrid.appendChild(courseCard);
    });
  }

  /**
   * Creates a single course card element for display.
   * @param {object} course - The course object to create the card for.
   * @returns {HTMLElement} The created course card div element.
   */
  function createCourseCard(course) {
    const card = document.createElement("div");
    card.className = `course-card ${course.archived ? "archived" : ""}`;
    card.onclick = () => openCourse(course);

    const headerClass = getHeaderClass(course.subject, course.id);
    const userRole = getUserRole();
    const isTeacher = course.teacher === currentUser;

    // Archived badge
    const archivedBadge = document.createElement("div");
    archivedBadge.className = "archived-badge";
    archivedBadge.textContent = "Archived";
    card.appendChild(archivedBadge);

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

    // Add subtitle for instructor name
    const courseSubtitle = document.createElement("p");
    courseSubtitle.className = "course-subtitle";
    courseSubtitle.textContent = isTeacher ? "Your course" : course.teacher;

    headerContent.appendChild(courseTitle);
    headerContent.appendChild(courseSection);
    headerContent.appendChild(courseSubtitle);

    // Header Menu
    const headerMenu = document.createElement("div");
    headerMenu.className = "course-header-menu";

    courseHeader.appendChild(headerContent);
    courseHeader.appendChild(headerMenu);

    // Profile Initial Circle
    const profileInitial = document.createElement("div");
    profileInitial.className = "course-profile-initial";
    profileInitial.textContent = course.teacher.charAt(0).toUpperCase();
    profileInitial.style.background = `hsl(${
      hashString(course.teacher) % 360
    }, 70%, 40%)`;
    courseHeader.appendChild(profileInitial);

    // Course Body (Remaining 2/3rd white area)
    const courseBody = document.createElement("div");
    courseBody.className = "course-body";

    const bodyContent = document.createElement("div");
    bodyContent.className = "course-body-content";

    const courseInfo = document.createElement("div");
    courseInfo.className = "course-info";

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
      e.stopPropagation();
      openCourse(course);
    };

    // Classwork icon
    const classworkIcon = document.createElement("button");
    classworkIcon.className = "course-action-icon";
    classworkIcon.innerHTML = '<span class="material-icons">assignment</span>';
    classworkIcon.title = "Classwork";
    classworkIcon.onclick = (e) => {
      e.stopPropagation();
      // Add classwork functionality here
    };

    // People icon
    const peopleIcon = document.createElement("button");
    peopleIcon.className = "course-action-icon";
    peopleIcon.innerHTML = '<span class="material-icons">people</span>';
    peopleIcon.title = "People";
    peopleIcon.onclick = (e) => {
      e.stopPropagation();
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
   * Determines the CSS class for a course card header based on its subject.
   * Uses specific subject names or a hash-based default for consistent coloring.
   * @param {string} subject - The subject of the course.
   * @param {string} courseId - The unique ID of the course.
   * @returns {string} The CSS class name for the course header.
   */
  function getHeaderClass(subject, courseId) {
    const subjectLower = subject.toLowerCase();

    // Specific subject mappings
    if (
      subjectLower.includes("math") ||
      subjectLower.includes("mathmatics") ||
      subjectLower.includes("mathematics")
    )
      return "math";
    if (subjectLower.includes("science") || subjectLower.includes("scientific"))
      return "science";
    if (subjectLower.includes("bangla") || subjectLower.includes("bengali"))
      return "bangla";
    if (subjectLower.includes("english")) return "english";
    if (subjectLower.includes("programming") || subjectLower.includes("coding"))
      return "programming";
    if (subjectLower.includes("history")) return "history";
    if (subjectLower.includes("physics")) return "physics";
    if (subjectLower.includes("chemistry")) return "chemistry";
    if (subjectLower.includes("biology")) return "biology";
    if (subjectLower.includes("economics")) return "economics";
    if (subjectLower.includes("geography")) return "geography";
    if (subjectLower.includes("art")) return "art";
    if (subjectLower.includes("music")) return "music";
    if (subjectLower.includes("literature")) return "literature";
    if (subjectLower.includes("philosophy")) return "philosophy";
    if (subjectLower.includes("sociology")) return "sociology";
    if (subjectLower.includes("psychology")) return "psychology";
    if (subjectLower.includes("computer")) return "computer";
    if (subjectLower.includes("technology")) return "technology";
    if (subjectLower.includes("business")) return "business";
    if (subjectLower.includes("accounting")) return "accounting";
    if (subjectLower.includes("finance")) return "finance";
    if (subjectLower.includes("marketing")) return "marketing";
    if (subjectLower.includes("management")) return "management";
    if (subjectLower.includes("statistics")) return "statistics";
    if (subjectLower.includes("religion")) return "religion";
    if (subjectLower.includes("physical")) return "physical";
    if (subjectLower.includes("health")) return "health";
    if (subjectLower.includes("general")) return "general";

    // For courses without specific subject match, use hash-based color assignment
    // Use a combination of subject and courseId for more unique distribution
    const combinedHash = hashString(subject + courseId);
    const colorIndex = (combinedHash % 10) + 1;
    return `default-${colorIndex}`;
  }

  /**
   * Simple hash function to generate consistent numbers from a string.
   * Used for consistent color assignment to course names.
   * @param {string} str - The input string to hash.
   * @returns {number} An absolute integer hash value.
   */
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Opens a specific course by storing its data and navigating to the student stream page.
   * @param {object} course - The course object to open.
   */
  function openCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    window.location.href = "studentStream.html";
  }

  /**
   * Renders the list of enrolled classes in the sidebar dropdown.
   * Filters for non-archived courses the current student is enrolled in.
   */
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

  /**
   * Logs detailed information about all courses and the current user's dashboard to the console for debugging purposes.
   */
  function debugCourses() {
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    console.log("=== Debug: Available Courses (Archive Page) ===");
    console.log(`Total courses: ${allCourses.length}`);

    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. Name: "${course.name}"`);
      console.log(`   Code: "${course.code}"`);
      console.log(`   Teacher: "${course.teacher}"`);
      console.log(
        `   Students: ${course.students ? course.students.length : 0}`
      );
      console.log(`   Created: ${course.created}`);
      console.log(`   Archived: ${course.archived}`);
      console.log(`   ---`);
    });
    console.log("=== End Debug ===");

    const dashboard = getUserDashboard();
    console.log("=== Current User Dashboard (Archive Page) ===");
    console.log(`User: ${currentUser}`);
    console.log(`Role: ${dashboard.role}`);
    console.log(`Courses: ${dashboard.courses.length}`);
    dashboard.courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} (${course.code})`);
      console.log(`   Archived: ${course.archived}`);
    });
    console.log("=== End Dashboard ===");
  }

  // Global functions for debugging
  window.debugCourses = debugCourses;
  window.clearAllCourses = function () {
    if (
      confirm(
        "Are you sure you want to delete all courses? This will remove all courses from the system."
      )
    ) {
      localStorage.removeItem("allCourses");
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      registeredUsers.forEach((user) => {
        const dashboardKey = `dashboard_${user.email}`;
        const dashboard = JSON.parse(
          localStorage.getItem(dashboardKey) || "{}"
        );
        dashboard.courses = [];
        localStorage.setItem(dashboardKey, JSON.stringify(dashboard));
      });
      location.reload();
    }
  };

  // Global functions for onclick events
  window.showCreateModal = showCreateModal;
  window.showJoinModal = showJoinModal;
});
