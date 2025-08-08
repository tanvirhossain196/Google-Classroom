// MultipleFiles/archive.js
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
  // const addCourseBtn = document.getElementById("addCourseBtn"); // Not on archive page
  // const courseActionMenu = document.getElementById("courseActionMenu"); // Not on archive page
  const dashboardTitle = document.getElementById("dashboardTitle"); // Renamed to Archived Classes

  // Navigation links
  const navLinks = document.querySelectorAll("[data-nav-link]");

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
  // No addCourseBtn on archive page
  // createCourseForm.addEventListener("submit", handleCreateCourse); // Not used
  // joinCourseForm.addEventListener("submit", handleJoinCourse); // Not used
  editCourseForm.addEventListener("submit", handleEditCourse);
  closeCreateModal.addEventListener("click", hideCreateModal);
  closeJoinModal.addEventListener("click", hideJoinModal);
  closeEditModal.addEventListener("click", hideEditModal);
  cancelCreate.addEventListener("click", hideCreateModal);
  cancelJoin.addEventListener("click", hideJoinModal);
  cancelEdit.addEventListener("click", hideEditModal);

  // Navigation event listeners - Complete navigation fix
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const currentPage =
        window.location.pathname.split("/").pop() || "dashboard.html";

      // Prevent default behavior and handle navigation manually
      e.preventDefault();
      e.stopPropagation();

      // If clicking on same page, do nothing
      if (
        href === currentPage ||
        (href === "dashboard.html" && currentPage === "")
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
    // No courseActionMenu on archive page
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
    loadUserCourses(); // This will now load archived courses
    console.log("Current user:", currentUser);
    console.log("User role:", userRole);
    debugCourses();
  }

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

  function saveUserDashboard(dashboard) {
    const dashboardKey = `dashboard_${currentUser}`;
    localStorage.setItem(dashboardKey, JSON.stringify(dashboard));
  }

  function getUserRole() {
    const dashboard = getUserDashboard();
    return dashboard.role;
  }

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

  function updateUIForRole(role) {
    switch (role) {
      case "teacher":
        userRoleBadge.textContent = "Teacher";
        userRoleBadge.className = "role-badge teacher";
        // dashboardTitle.textContent = "Archived Classes (Teacher)"; // Already set in HTML
        break;
      case "student":
        userRoleBadge.textContent = "Student";
        userRoleBadge.className = "role-badge student";
        // dashboardTitle.textContent = "Archived Classes (Student)"; // Already set in HTML
        break;
      default:
        userRoleBadge.textContent = "New User";
        userRoleBadge.className = "role-badge new";
      // dashboardTitle.textContent = "Archived Classes"; // Already set in HTML
    }
    // No action menu on archive page
  }

  function toggleSidebar() {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");

    // Save sidebar state
    const sidebarIsOpen = sidebar.classList.contains("open");
    localStorage.setItem("sidebarState", sidebarIsOpen ? "open" : "closed");
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
  }

  // Stubs for modals not used on this page
  function showCreateModal() {
    createCourseModal.style.display = "block";
  }

  function showJoinModal() {
    joinCourseModal.style.display = "block";
  }

  function showEditModal() {
    editCourseModal.style.display = "block";
  }

  function hideCreateModal() {
    createCourseModal.style.display = "none";
    createCourseForm.reset();
  }

  function hideJoinModal() {
    joinCourseModal.style.display = "none";
    joinCourseForm.reset();
  }

  function hideEditModal() {
    editCourseModal.style.display = "none";
    editCourseForm.reset();
    currentEditingCourse = null;
  }

  // Stubs for form handlers not used on this page
  function handleCreateCourse(e) {
    e.preventDefault();
    alert("Create Course is not available on the Archive page.");
  }

  function handleJoinCourse(e) {
    e.preventDefault();
    alert("Join Course is not available on the Archive page.");
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
    loadUserCourses();
    alert("Course updated successfully!");
  }

  function generateCourseCode() {
    // Not used on archive page
    return "CODE123";
  }

  function addCourseToUser(course) {
    // Not used on archive page
  }

  function addCourseToGlobalList(course) {
    // Not used on archive page
  }

  function findCourseByCode(code) {
    // Not used on archive page
    return null;
  }

  function getAllCourseCodes() {
    // Not used on archive page
    return [];
  }

  function joinCourse(course) {
    // Not used on archive page
    return { success: false, message: "Not available on archive page" };
  }

  function updateTeacherDashboard(course) {
    // Not used on archive page
  }

  function loadUserCourses() {
    const dashboard = getUserDashboard();
    // Filter to only show archived courses on the archive page
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
    card.onclick = () => openCourse(course);

    const headerClass = getHeaderClass(course.subject, course.id); // Pass course.id for more unique hashing
    const userRole = getUserRole();
    const isTeacher = course.teacher === currentUser;

    // Archived badge (always present on archive page)
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

    // Header Menu (only for teachers/course creators)
    const headerMenu = document.createElement("div");
    headerMenu.className = "course-header-menu";

    if (isTeacher) {
      // Only teachers can unarchive/delete their own courses
      const cardMenu = document.createElement("div");
      cardMenu.className = "course-card-menu";

      const menuButton = document.createElement("button");
      menuButton.className = "course-menu";
      menuButton.innerHTML = '<span class="material-icons">more_vert</span>';
      menuButton.onclick = (e) => {
        e.stopPropagation();
        toggleCourseMenu(course.id);
      };

      const menuDropdown = document.createElement("div");
      menuDropdown.className = "course-menu-dropdown";
      menuDropdown.id = `courseMenu_${course.id}`;

      // Unarchive option
      const unarchiveItem = document.createElement("div");
      unarchiveItem.className = "course-menu-item archive"; // Reusing archive class for styling
      unarchiveItem.onclick = () => toggleArchiveCourse(course.id);
      const unarchiveIcon = document.createElement("span");
      unarchiveIcon.className = "material-icons";
      unarchiveIcon.textContent = "unarchive";
      const unarchiveText = document.createTextNode("Unarchive");
      unarchiveItem.appendChild(unarchiveIcon);
      unarchiveItem.appendChild(unarchiveText);

      // Delete option
      const deleteItem = document.createElement("div");
      deleteItem.className = "course-menu-item delete";
      deleteItem.onclick = () => deleteCourse(course.id);
      const deleteIcon = document.createElement("span");
      deleteIcon.className = "material-icons";
      deleteIcon.textContent = "delete";
      const deleteText = document.createTextNode("Delete");
      deleteItem.appendChild(deleteIcon);
      deleteItem.appendChild(deleteText);

      menuDropdown.appendChild(unarchiveItem);
      menuDropdown.appendChild(deleteItem);

      cardMenu.appendChild(menuButton);
      cardMenu.appendChild(menuDropdown);
      headerMenu.appendChild(cardMenu);
    }

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

    if (isTeacher) {
      // For teachers: Show course code
      const courseCode = document.createElement("p");
      courseCode.className = "course-code";
      courseCode.textContent = `Code: ${course.code}`;
      courseInfo.appendChild(courseCode);
    }

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
        if (studentEmail !== currentUser) {
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
        }
      });
    }
  }

  function toggleArchiveCourse(courseId) {
    const dashboard = getUserDashboard();
    const course = dashboard.courses.find((c) => c.id === courseId);
    if (!course) return;

    const newArchivedStatus = !course.archived;
    const confirmMessage = newArchivedStatus
      ? "Do you want to archive this course? It will be moved to the Archive Classes page."
      : "Do you want to unarchive this course? It will be moved back to your Dashboard.";

    if (!confirm(confirmMessage)) return;

    updateCourse(courseId, { archived: newArchivedStatus });
    loadUserCourses(); // Reload archive page to reflect changes
    // If unarchiving, redirect to dashboard to show it at the top
    if (!newArchivedStatus) {
      // Store the course ID to highlight it on the dashboard if needed
      localStorage.setItem("highlightCourseId", courseId);
      window.location.href = "dashboard.html";
    }
  }

  function deleteCourse(courseId) {
    if (
      !confirm(
        "Are you sure you want to permanently delete this course?\n\nThis action cannot be undone."
      )
    ) {
      return;
    }

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

    loadUserCourses();
    alert("Course successfully deleted.");
  }

  function openCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    window.location.href = "stream.html";
  }

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
      console.log(`   Archived: ${course.archived}`); // Debug archived status
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
  window.showJoinModal = showJoinModal;
  window.toggleCourseMenu = toggleCourseMenu;
  window.editCourse = editCourse;
  window.toggleArchiveCourse = toggleArchiveCourse;
  window.deleteCourse = deleteCourse;
});
