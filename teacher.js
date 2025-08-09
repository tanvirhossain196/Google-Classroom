// teacher.js
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
  const addCourseBtn = document.getElementById("addCourseBtn");
  const courseActionMenu = document.getElementById("courseActionMenu");
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
  // Get the dropdown arrow icon
  const dropdownArrowIcon = enrolledClassesDropdownToggle.querySelector(
    ".dropdown-arrow-icon"
  );

  // Modals
  const createCourseModal = document.getElementById("createCourseModal");
  const joinCourseModal = document.getElementById("joinCourseModal"); // Kept for consistency, not used
  const editCourseModal = document.getElementById("editCourseModal");
  const closeCreateModal = document.getElementById("closeCreateModal");
  const closeJoinModal = document.getElementById("closeJoinModal"); // Kept for consistency, not used
  const closeEditModal = document.getElementById("closeEditModal");
  const createCourseForm = document.getElementById("createCourseForm");
  const joinCourseForm = document.getElementById("joinCourseForm"); // Kept for consistency, not used
  const editCourseForm = document.getElementById("editCourseForm");
  const cancelCreate = document.getElementById("cancelCreate");
  const cancelJoin = document.getElementById("cancelJoin"); // Kept for consistency, not used
  const cancelEdit = document.getElementById("cancelEdit");

  // Get current user
  const currentUser =
    localStorage.getItem("currentUser") || localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!currentUser || userRole !== "teacher") {
    window.location.href = "index.html"; // Redirect if not logged in as teacher
    return;
  }

  // Initialize dashboard
  initializeDashboard();

  // Event listeners
  menuIcon.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  addCourseBtn.addEventListener("click", toggleActionMenu);
  createCourseForm.addEventListener("submit", handleCreateCourse);
  editCourseForm.addEventListener("submit", handleEditCourse);
  closeCreateModal.addEventListener("click", hideCreateModal);
  closeEditModal.addEventListener("click", hideEditModal);
  cancelCreate.addEventListener("click", hideCreateModal);
  cancelEdit.addEventListener("click", hideEditModal);

  // Enrolled Classes Dropdown Toggle
  enrolledClassesDropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent sidebar from closing if clicked inside
    enrolledClassesDropdown.classList.toggle("show");
    this.querySelector(".dropdown-arrow").classList.toggle("rotate"); // Rotate arrow
    renderEnrolledClasses(); // Re-render to ensure up-to-date list
  });

  // Navigation event listeners - Complete navigation fix
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
        (href === "teacher.html" && currentPage === "")
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
    if (e.target === editCourseModal) {
      hideEditModal();
    }
    if (
      !addCourseBtn.contains(e.target) &&
      !courseActionMenu.contains(e.target)
    ) {
      courseActionMenu.classList.remove("show");
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
      // Ensure dropdown arrow is hidden when sidebar closes
      if (dropdownArrowIcon) {
        dropdownArrowIcon.style.display = "none";
      }
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

  function initializeDashboard() {
    currentUserEmail.textContent = currentUser;
    userInitial.textContent = currentUser.charAt(0).toUpperCase();

    // Handle sidebar state on page load
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

    updateUIForRole(); // Always teacher role for this page
    loadUserCourses();
    renderEnrolledClasses(); // Initial render of enrolled classes
    console.log("Current user:", currentUser);
    console.log("User role:", userRole);
    debugCourses();
  }

  function getUserDashboard() {
    const dashboardKey = `dashboard_${currentUser}`;
    const dashboard = JSON.parse(
      localStorage.getItem(dashboardKey) || '{"courses": [], "role": "teacher"}'
    );
    if (!dashboard.courses) {
      dashboard.courses = [];
    }
    return dashboard;
  }

  function saveUserDashboard(dashboard) {
    const dashboardKey = `dashboard_${currentUser}`;
    localStorage.setItem(dashboardKey, JSON.stringify(dashboard));
  }

  function updateUIForRole() {
    userRoleBadge.textContent = "Teacher";
    userRoleBadge.className = "role-badge teacher";
    dashboardTitle.textContent = "Teacher Dashboard";
    emptyStateText.textContent = "Create your first course";
    updateActionMenu();
  }

  function updateActionMenu() {
    courseActionMenu.innerHTML = "";
    const createItem = document.createElement("div");
    createItem.className = "dropdown-item";
    createItem.onclick = showCreateModal;
    const createIcon = document.createElement("span");
    createIcon.className = "material-icons";
    createIcon.textContent = "add";
    const createText = document.createTextNode("Create a new course");
    createItem.appendChild(createIcon);
    createItem.appendChild(createText);
    courseActionMenu.appendChild(createItem);
  }

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

  function handleLogout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
  }

  function toggleActionMenu() {
    courseActionMenu.classList.toggle("show");
  }

  function showCreateModal() {
    createCourseModal.style.display = "block";
    courseActionMenu.classList.remove("show");
  }

  function hideCreateModal() {
    createCourseModal.style.display = "none";
    createCourseForm.reset();
  }

  function showEditModal() {
    editCourseModal.style.display = "block";
  }

  function hideEditModal() {
    editCourseModal.style.display = "none";
    editCourseForm.reset();
    currentEditingCourse = null;
  }

  function handleCreateCourse(e) {
    e.preventDefault();
    const formData = new FormData(createCourseForm);
    const courseName = formData.get("courseName").trim();
    const section = formData.get("section").trim() || "Section not specified";
    const subject = formData.get("subject").trim() || "Subject not specified";
    const room = formData.get("room").trim() || "Room not specified";

    if (!courseName) {
      alert("Please enter the course name");
      document.querySelector('input[name="courseName"]').focus();
      return;
    }

    if (courseName.length < 3) {
      alert("Course name must be at least 3 characters long");
      return;
    }

    // Generate unique course code
    const courseCode = generateCourseCode();

    const newCourse = {
      id: Date.now().toString(),
      name: courseName,
      section: section,
      subject: subject,
      room: room,
      code: courseCode,
      teacher: currentUser,
      students: [],
      created: new Date().toISOString(),
      archived: false, // New property: not archived by default
    };

    // Check if course already exists for this teacher
    const dashboard = getUserDashboard();
    const existingCourse = dashboard.courses.find(
      (c) =>
        c.name.toLowerCase() === courseName.toLowerCase() &&
        c.section === section &&
        c.teacher === currentUser
    );

    if (existingCourse) {
      alert("A course with this name and section already exists");
      return;
    }

    addCourseToUser(newCourse);
    addCourseToGlobalList(newCourse);
    hideCreateModal();
    loadUserCourses();
    renderEnrolledClasses(); // Update enrolled classes dropdown
    alert(
      `Course created successfully!\n\nCourse Code: ${courseCode}\n\nShare this code with students so they can join your course.`
    );
  }

  function handleEditCourse(e) {
    e.preventDefault();
    if (!currentEditingCourse) return;

    const formData = new FormData(editCourseForm);
    const courseName = formData.get("courseName").trim();
    const section = formData.get("section").trim() || "";
    const subject = formData.get("subject").trim() || "";
    const room = formData.get("room").trim() || "";

    if (!courseName) {
      alert("Please enter the course name");
      return;
    }

    if (courseName.length < 3) {
      alert("Course name must be at least 3 characters long");
      return;
    }

    const updates = {
      name: courseName,
      section: section,
      subject: subject,
      room: room,
      modified: new Date().toISOString(),
    };

    updateCourse(currentEditingCourse.id, updates);
    hideEditModal();
    loadUserCourses(); // Reload courses to reflect changes on the dashboard
    renderEnrolledClasses(); // Update enrolled classes dropdown
    alert("Course updated successfully!");
  }

  function generateCourseCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01256789"; // Exclude 3 and 4 for better readability
    let result = "";
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure uniqueness
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    if (allCourses.some((course) => course.code === result)) {
      return generateCourseCode(); // Regenerate if duplicate
    }

    return result;
  }

  function addCourseToUser(course) {
    const dashboard = getUserDashboard();
    dashboard.courses.push(course);
    saveUserDashboard(dashboard);
    console.log("Added course to user dashboard:", course.name);
  }

  function addCourseToGlobalList(course) {
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    allCourses.push(course);
    localStorage.setItem("allCourses", JSON.stringify(allCourses));
    console.log(
      "Added course to global list:",
      course.name,
      "Code:",
      course.code
    );
  }

  function loadUserCourses() {
    const dashboard = getUserDashboard();
    // Filter to only show non-archived courses on the dashboard
    let courses = (dashboard.courses || []).filter(
      (course) => !course.archived && course.teacher === currentUser
    ); // Only show courses created by this teacher

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

  function renderCourses(courses) {
    coursesGrid.innerHTML = "";
    courses.forEach((course) => {
      const courseCard = createCourseCard(course);
      coursesGrid.appendChild(courseCard);
    });
  }

  function createCourseCard(course) {
    const card = document.createElement("div");
    card.className = `course-card ${course.archived ? "archived" : ""}`;
    // Only open course details if not an action button click
    card.onclick = (e) => {
      // Check if the click target is one of the action buttons or their children
      if (
        !e.target.closest(".course-menu") &&
        !e.target.closest(".course-action-icon")
      ) {
        openCourse(course);
      }
    };

    const headerClass = getHeaderClass(course.subject, course.id); // Pass course.id for more unique hashing

    // Archived badge
    if (course.archived) {
      const archivedBadge = document.createElement("div");
      archivedBadge.className = "archived-badge";
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

    // Add subtitle for instructor name
    const courseSubtitle = document.createElement("p");
    courseSubtitle.className = "course-subtitle";
    courseSubtitle.textContent = "Your course";

    headerContent.appendChild(courseTitle);
    headerContent.appendChild(courseSection);
    headerContent.appendChild(courseSubtitle);

    // Header Menu (only for teachers/course creators)
    const headerMenu = document.createElement("div");
    headerMenu.className = "course-header-menu";

    const cardMenu = document.createElement("div");
    cardMenu.className = "course-card-menu";

    const menuButton = document.createElement("button");
    menuButton.className = "course-menu";
    menuButton.innerHTML = '<span class="material-icons">more_vert</span>';
    menuButton.onclick = (e) => {
      e.stopPropagation(); // Prevent card click from firing
      toggleCourseMenu(course.id);
    };

    const menuDropdown = document.createElement("div");
    menuDropdown.className = "course-menu-dropdown";
    menuDropdown.id = `courseMenu_${course.id}`;

    // Edit option
    const editItem = document.createElement("div");
    editItem.className = "course-menu-item";
    editItem.onclick = (e) => {
      e.stopPropagation(); // Prevent card click from firing
      editCourse(course.id);
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
      toggleArchiveCourse(course.id);
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
      deleteCourse(course.id); // Call the updated deleteCourse function
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

    // For teachers: Show course code
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

  function getHeaderClass(subject, courseId) {
    const subjectLower = subject.toLowerCase();

    // Specific subject mappings
    if (
      subjectLower.includes("math") ||
      subjectLower.includes("Mathmatics") ||
      subjectLower.includes("mathematics")
    )
      return "math";
    if (subjectLower.includes("science") || subjectLower.includes("scientific"))
      return "science";
    if (
      subjectLower.includes("bangla") ||
      subjectLower.includes("bangla") ||
      subjectLower.includes("bengali")
    )
      return "bangla";
    if (subjectLower.includes("english") || subjectLower.includes("ইংরেজি"))
      return "english";
    if (
      subjectLower.includes("programming") ||
      subjectLower.includes("programming") ||
      subjectLower.includes("coding")
    )
      return "programming";
    if (subjectLower.includes("history") || subjectLower.includes("History"))
      return "history";
    if (subjectLower.includes("physics") || subjectLower.includes("Physics"))
      return "physics";
    if (
      subjectLower.includes("chemistry") ||
      subjectLower.includes("Chemistry")
    )
      return "chemistry";
    if (subjectLower.includes("biology") || subjectLower.includes("Biology"))
      return "biology";
    if (
      subjectLower.includes("economics") ||
      subjectLower.includes("Economics")
    )
      return "economics";
    if (
      subjectLower.includes("geography") ||
      subjectLower.includes("Geography")
    )
      return "geography";
    if (subjectLower.includes("art") || subjectLower.includes("Art"))
      return "art";
    if (subjectLower.includes("music") || subjectLower.includes("Music"))
      return "music";
    if (
      subjectLower.includes("literature") ||
      subjectLower.includes("Literature")
    )
      return "literature";
    if (
      subjectLower.includes("philosophy") ||
      subjectLower.includes("Philosophy")
    )
      return "philosophy";
    if (
      subjectLower.includes("sociology") ||
      subjectLower.includes("Sociology")
    )
      return "sociology";
    if (
      subjectLower.includes("psychology") ||
      subjectLower.includes("Psychology")
    )
      return "psychology";
    if (subjectLower.includes("computer") || subjectLower.includes("Computer"))
      return "computer";
    if (
      subjectLower.includes("technology") ||
      subjectLower.includes("Technology")
    )
      return "technology";
    if (subjectLower.includes("business") || subjectLower.includes("Business"))
      return "business";
    if (
      subjectLower.includes("accounting") ||
      subjectLower.includes("Accounting")
    )
      return "accounting";
    if (subjectLower.includes("finance") || subjectLower.includes("Finance"))
      return "finance";
    if (
      subjectLower.includes("marketing") ||
      subjectLower.includes("Marketing")
    )
      return "marketing";
    if (
      subjectLower.includes("management") ||
      subjectLower.includes("Management")
    )
      return "management";
    if (
      subjectLower.includes("statistics") ||
      subjectLower.includes("Statistics")
    )
      return "statistics";
    if (subjectLower.includes("religion") || subjectLower.includes("Religion"))
      return "religion";
    if (subjectLower.includes("physical") || subjectLower.includes("Physical"))
      return "physical";
    if (subjectLower.includes("health") || subjectLower.includes("Health"))
      return "health";
    if (subjectLower.includes("general") || subjectLower.includes("General"))
      return "general";

    // For courses without specific subject match, use hash-based color assignment
    // This ensures same course name always gets same color but different courses get different colors
    // Use a combination of subject and courseId for more unique distribution
    const combinedHash = hashString(subject + courseId);
    const colorIndex = (combinedHash % 10) + 1; // Use 10 different default classes
    return `default-${colorIndex}`;
  }

  // Simple hash function to generate consistent colors for course names
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  function toggleCourseMenu(courseId) {
    const menu = document.getElementById(`courseMenu_${courseId}`);
    document.querySelectorAll(".course-menu-dropdown").forEach((m) => {
      if (m !== menu) m.classList.remove("show");
    });
    menu.classList.toggle("show");
  }

  function editCourse(courseId) {
    const dashboard = getUserDashboard();
    const course = dashboard.courses.find((c) => c.id === courseId);
    if (!course) return;

    currentEditingCourse = course;

    document.getElementById("editCourseName").value = course.name;
    document.getElementById("editCourseSection").value = course.section;
    document.getElementById("editCourseSubject").value = course.subject;
    document.getElementById("editCourseRoom").value = course.room;

    showEditModal();
  }

  function updateCourse(courseId, updates) {
    // Update in user dashboard
    const dashboard = getUserDashboard();
    const courseIndex = dashboard.courses.findIndex((c) => c.id === courseId);
    if (courseIndex !== -1) {
      dashboard.courses[courseIndex] = {
        ...dashboard.courses[courseIndex],
        ...updates,
      };
      saveUserDashboard(dashboard);
    }

    // Update in global courses list
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    const allCoursesIndex = allCourses.findIndex((c) => c.id === courseId);
    if (allCoursesIndex !== -1) {
      allCourses[allCoursesIndex] = {
        ...allCourses[allCoursesIndex],
        ...updates,
      };
      localStorage.setItem("allCourses", JSON.stringify(allCourses));
    }

    // Update in all enrolled students' dashboards
    const course = allCourses[allCoursesIndex];
    if (course && course.students) {
      course.students.forEach((studentEmail) => {
        const studentDashboardKey = `dashboard_${studentEmail}`;
        const studentDashboard = JSON.parse(
          localStorage.getItem(studentDashboardKey) || '{"courses": []}'
        );
        const studentCourseIndex = studentDashboard.courses.findIndex(
          (c) => c.id === courseId
        );
        if (studentCourseIndex !== -1) {
          studentDashboard.courses[studentCourseIndex] = {
            ...studentDashboard.courses[studentCourseIndex],
            ...updates,
          };
          localStorage.setItem(
            studentDashboardKey,
            JSON.stringify(studentDashboard)
          );
        }
      });
    }
    renderEnrolledClasses(); // Update enrolled classes dropdown after any course update
  }

  function toggleArchiveCourse(courseId) {
    const dashboard = getUserDashboard();
    const course = dashboard.courses.find((c) => c.id === courseId);
    if (!course) return;

    const newArchivedStatus = !course.archived;
    const confirmMessage = newArchivedStatus
      ? "Do you want to archive this course? It will be moved to the Archive Classes page."
      : "Do you want to unarchive this course? It will be moved back to your Dashboard.";

    if (!confirm(confirmMessage)) {
      // Close the dropdown menu if the user cancels the action
      document.querySelectorAll(".course-menu-dropdown").forEach((m) => {
        m.classList.remove("show");
      });
      return;
    }

    updateCourse(courseId, { archived: newArchivedStatus });
    loadUserCourses(); // Reload dashboard to reflect changes
    renderEnrolledClasses(); // Update enrolled classes dropdown
  }

  // Updated deleteCourse function
  function deleteCourse(courseId) {
    // Close any open dropdown menus first
    document.querySelectorAll(".course-menu-dropdown").forEach((m) => {
      m.classList.remove("show");
    });

    // Show confirmation dialog
    const confirmation = confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmation) {
      // If user clicks "Cancel", stop the deletion process
      return;
    }

    // If user clicks "Yes", proceed with deletion
    // Remove from user dashboard
    const dashboard = getUserDashboard();
    dashboard.courses = dashboard.courses.filter((c) => c.id !== courseId);
    saveUserDashboard(dashboard);

    // Remove from global courses list
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    const filteredCourses = allCourses.filter((c) => c.id !== courseId);
    localStorage.setItem("allCourses", JSON.stringify(filteredCourses));

    // Remove from all students' dashboards
    const courseToDelete = allCourses.find((c) => c.id === courseId);
    if (courseToDelete && courseToDelete.students) {
      courseToDelete.students.forEach((studentEmail) => {
        const studentDashboardKey = `dashboard_${studentEmail}`;
        const studentDashboard = JSON.parse(
          localStorage.getItem(studentDashboardKey) || '{"courses": []}'
        );
        studentDashboard.courses = studentDashboard.courses.filter(
          (c) => c.id !== courseId
        );
        localStorage.setItem(
          studentDashboardKey,
          JSON.stringify(studentDashboard)
        );
      });
    }

    loadUserCourses(); // Reload courses to reflect changes on the dashboard
    renderEnrolledClasses(); // Update enrolled classes dropdown
    alert("Course successfully deleted.");
  }

  function openCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    window.location.href = "stream.html"; // Assuming stream.html exists
  }

  // Function to render enrolled classes in the sidebar dropdown
  function renderEnrolledClasses() {
    const dashboard = getUserDashboard();
    const enrolled = dashboard.courses.filter(
      (course) => !course.archived && course.teacher === currentUser
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
          openCourse(course); // Navigate to the course page
        });
        enrolledClassesDropdown.appendChild(listItem);
      });
    }
  }

  function debugCourses() {
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    console.log("=== Debug: Available Courses (Global) ===");
    console.log(`Total courses: ${allCourses.length}`);

    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. Name: "${course.name}"`);
      console.log(`   Code: "${course.code}"`);
      console.log(`   Teacher: "${course.teacher}"`);
      console.log(
        `   Students: ${course.students ? course.students.length : 0}`
      );
      console.log(`   Created: ${course.created}`);
      console.log(`   Archived: ${course.archived}`); // Debug archived status
      console.log(`   ---`);
    });
    console.log("=== End Debug (Global) ===");

    const dashboard = getUserDashboard();
    console.log("=== Current User Dashboard ===");
    console.log(`User: ${currentUser}`);
    console.log(`Role: ${userRole}`);
    console.log(`Courses: ${dashboard.courses.length}`);
    dashboard.courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} (${course.code})`);
      console.log(`   Archived: ${course.archived}`); // Debug archived status
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
  window.toggleCourseMenu = toggleCourseMenu;
  window.editCourse = editCourse;
  window.toggleArchiveCourse = toggleArchiveCourse;
  window.deleteCourse = deleteCourse;
});
