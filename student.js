// student.js
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
  // const addCourseBtn = document.getElementById("addCourseBtn"); // Removed
  // const courseActionMenu = document.getElementById("courseActionMenu"); // Removed
  // const dashboardTitle = document.getElementById("dashboardTitle"); // Removed

  // New: Join Course Button in Navbar
  const joinCourseNavBtn = document.getElementById("joinCourseNavBtn");

  // Navigation links
  const navLinks = document.querySelectorAll("[data-nav-link]");

  // Enrolled Classes Dropdown elements
  const enrolledClassesDropdownToggle = document.getElementById(
    "enrolledClassesDropdownToggle"
  );
  const enrolledClassesDropdown = document.getElementById(
    "enrolledClassesDropdown"
  );

  // Modals
  const createCourseModal = document.getElementById("createCourseModal"); // Kept for consistency, not used
  const joinCourseModal = document.getElementById("joinCourseModal");
  const editCourseModal = document.getElementById("editCourseModal"); // Kept for consistency, not used
  const closeCreateModal = document.getElementById("closeCreateModal"); // Kept for consistency, not used
  const closeJoinModal = document.getElementById("closeJoinModal");
  const closeEditModal = document.getElementById("closeEditModal"); // Kept for consistency, not used
  const createCourseForm = document.getElementById("createCourseForm"); // Kept for consistency, not used
  const joinCourseForm = document.getElementById("joinCourseForm");
  const editCourseForm = document.getElementById("editCourseForm"); // Kept for consistency, not used
  const cancelCreate = document.getElementById("cancelCreate"); // Kept for consistency, not used
  const cancelJoin = document.getElementById("cancelJoin");
  const cancelEdit = document.getElementById("cancelEdit"); // Kept for consistency, not used

  // Get current user
  const currentUser =
    localStorage.getItem("currentUser") || localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!currentUser || userRole !== "student") {
    window.location.href = "index.html"; // Redirect if not logged in as student
    return;
  }

  // Initialize dashboard
  initializeDashboard();

  // Event listeners
  menuIcon.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  // addCourseBtn.addEventListener("click", toggleActionMenu); // Removed
  joinCourseNavBtn.addEventListener("click", showJoinModal); // New: Event listener for the new button
  joinCourseForm.addEventListener("submit", handleJoinCourse);
  closeJoinModal.addEventListener("click", hideJoinModal);
  cancelJoin.addEventListener("click", hideJoinModal);

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

  // Close modals when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target === joinCourseModal) {
      hideJoinModal();
    }
    // Removed logic for courseActionMenu as it's removed
    // if (
    //   !addCourseBtn.contains(e.target) &&
    //   !courseActionMenu.contains(e.target)
    // ) {
    //   courseActionMenu.classList.remove("show");
    // }
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
      // Clear the navigation flag
      localStorage.removeItem("intentionalNavigation");
    } else {
      // Default closed state (for refresh or direct access)
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
    }

    updateUIForRole(); // Always student role for this page
    loadUserCourses();
    renderEnrolledClasses(); // Initial render of enrolled classes
    console.log("Current user:", currentUser);
    console.log("User role:", userRole);
    debugCourses();
  }

  function getUserDashboard() {
    const dashboardKey = `dashboard_${currentUser}`;
    const dashboard = JSON.parse(
      localStorage.getItem(dashboardKey) || '{"courses": [], "role": "student"}'
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
    userRoleBadge.textContent = "Student";
    userRoleBadge.className = "role-badge student";
    // dashboardTitle.textContent = "Student Dashboard"; // Removed
    emptyStateText.textContent = "Join a course with the course code";
    // updateActionMenu(); // Removed as action menu is removed
  }

  // Removed updateActionMenu function

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

  // Removed toggleActionMenu function

  function showJoinModal() {
    joinCourseModal.style.display = "block";
    // courseActionMenu.classList.remove("show"); // Removed
  }

  function hideJoinModal() {
    joinCourseModal.style.display = "none";
    joinCourseForm.reset();
  }

  function handleJoinCourse(e) {
    e.preventDefault();
    const formData = new FormData(joinCourseForm);
    let courseCode = formData.get("courseCode");

    if (!courseCode) {
      alert("Please enter the course code");
      document.querySelector('input[name="courseCode"]').focus();
      return;
    }

    // Clean and format course code
    courseCode = courseCode.trim().toUpperCase().replace(/\s+/g, "");

    if (courseCode.length < 3 || courseCode.length > 10) {
      alert("Course code must be between 3-10 characters");
      return;
    }

    console.log("Attempting to join course with code:", courseCode);

    // Show loading state
    const joinButton = document.querySelector(
      '#joinCourseForm button[type="submit"]'
    );
    const originalText = joinButton.textContent;
    joinButton.textContent = "Joining...";
    joinButton.disabled = true;

    // Find course with better error handling
    const course = findCourseByCode(courseCode);

    if (!course) {
      joinButton.textContent = originalText;
      joinButton.disabled = false;
      alert(
        `Course not found.\n\nYour code: "${courseCode}"\n\nPlease:\n• Check if the course code is correct\n• Confirm the correct code with the teacher`
      );
      console.log("Available course codes:", getAllCourseCodes());
      return;
    }

    // Check if user is the teacher (should not happen on student page, but good check)
    if (course.teacher === currentUser) {
      joinButton.textContent = originalText;
      joinButton.disabled = false;
      alert(
        "You are the teacher of this course. You cannot join your own course as a student."
      );
      return;
    }

    // Check if already enrolled
    if (course.students && course.students.includes(currentUser)) {
      joinButton.textContent = originalText;
      joinButton.disabled = false;
      alert("You are already enrolled in this course.");
      loadUserCourses();
      hideJoinModal();
      return;
    }

    // Join the course
    const joinResult = joinCourse(course);

    // Reset button
    joinButton.textContent = originalText;
    joinButton.disabled = false;

    if (joinResult.success) {
      hideJoinModal();
      loadUserCourses();
      renderEnrolledClasses(); // Update enrolled classes dropdown

      // Success message with course details
      alert(
        `✅ Successfully joined the course!\n\n📚 Course: ${
          course.name
        }\n👨🏫 Teacher: ${course.teacher}\n📝 Section: ${
          course.section
        }\n🏫 Subject: ${
          course.subject || "Not specified"
        }\n\n🎉 You can now access all the content of this course.`
      );
    } else {
      alert(
        `❌ There was a problem joining the course: ${joinResult.message}\n\nPlease try again or contact the teacher.`
      );
    }
  }

  function findCourseByCode(code) {
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    console.log("Searching for course code:", code);
    console.log("Total available courses:", allCourses.length);

    allCourses.forEach((course, index) => {
      console.log(
        `Course ${index + 1}: ${course.name} - Code: ${
          course.code
        } - Teacher: ${course.teacher}`
      );
    });

    const foundCourse = allCourses.find(
      (course) =>
        course.code &&
        course.code.toUpperCase().trim() === code.toUpperCase().trim()
    );

    console.log("Found course:", foundCourse ? foundCourse.name : "None");
    return foundCourse;
  }

  function getAllCourseCodes() {
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    return allCourses.map((course) => course.code).filter((code) => code);
  }

  function joinCourse(course) {
    try {
      console.log("Joining course:", course.name);

      if (!course.students) {
        course.students = [];
      }

      if (!course.students.includes(currentUser)) {
        course.students.push(currentUser);
        console.log(
          "Added student to course. Total students:",
          course.students.length
        );
      }

      // Update course in global courses list
      const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
      const courseIndex = allCourses.findIndex((c) => c.id === course.id);

      if (courseIndex !== -1) {
        allCourses[courseIndex] = { ...course };
        localStorage.setItem("allCourses", JSON.stringify(allCourses));
        console.log("Updated course in global list");
      } else {
        console.error("Course not found in global list");
        return {
          success: false,
          message: "Course not found in the system",
        };
      }

      // Add course to current user's dashboard
      const dashboard = getUserDashboard();
      const existingCourseIndex = dashboard.courses.findIndex(
        (c) => c.id === course.id
      );

      if (existingCourseIndex === -1) {
        dashboard.courses.push({ ...course });
        console.log("Added course to user dashboard");
      } else {
        dashboard.courses[existingCourseIndex] = { ...course };
        console.log("Updated existing course in user dashboard");
      }

      saveUserDashboard(dashboard);
      updateTeacherDashboard(course);

      return { success: true, message: "Successfully joined the course" };
    } catch (error) {
      console.error("Error joining course:", error);
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  function updateTeacherDashboard(course) {
    try {
      const teacherDashboardKey = `dashboard_${course.teacher}`;
      const teacherDashboard = JSON.parse(
        localStorage.getItem(teacherDashboardKey) ||
          '{"courses": [], "role": "teacher"}'
      );

      const teacherCourseIndex = teacherDashboard.courses.findIndex(
        (c) => c.id === course.id
      );

      if (teacherCourseIndex !== -1) {
        teacherDashboard.courses[teacherCourseIndex] = { ...course };
        localStorage.setItem(
          teacherDashboardKey,
          JSON.stringify(teacherDashboard)
        );
        console.log("Updated teacher's dashboard");
      }
    } catch (error) {
      console.error("Error updating teacher dashboard:", error);
    }
  }

  function loadUserCourses() {
    const dashboard = getUserDashboard();
    // Filter to only show non-archived courses on the dashboard that the student is enrolled in
    let courses = (dashboard.courses || []).filter(
      (course) => !course.archived && course.students.includes(currentUser)
    );

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
      if (!e.target.closest(".course-action-icon")) {
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
    courseSubtitle.textContent = course.teacher;

    headerContent.appendChild(courseTitle);
    headerContent.appendChild(courseSection);
    headerContent.appendChild(courseSubtitle);

    courseHeader.appendChild(headerContent);

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

  function openCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    window.location.href = "studentStream.html"; // Assuming studentStream.html exists
  }

  // Function to render enrolled classes in the sidebar dropdown
  function renderEnrolledClasses() {
    const dashboard = getUserDashboard();
    const enrolled = dashboard.courses.filter(
      (course) => !course.archived && course.students.includes(currentUser)
    ); // Only show non-archived courses the student is enrolled in

    enrolledClassesDropdown.innerHTML = ""; // Clear existing list

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
  window.showJoinModal = showJoinModal;
});
