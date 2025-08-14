document.addEventListener("DOMContentLoaded", function () {
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

  const joinCourseNavBtn = document.getElementById("joinCourseNavBtn");

  const navLinks = document.querySelectorAll("[data-nav-link]");

  const enrolledClassesDropdownToggle = document.getElementById(
    "enrolledClassesDropdownToggle"
  );
  const enrolledClassesDropdown = document.getElementById(
    "enrolledClassesDropdown"
  );

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

  const currentUser =
    localStorage.getItem("currentUser") || localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!currentUser || userRole !== "student") {
    window.location.href = "index.html";
    return;
  }

  initializeDashboard();

  menuIcon.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  joinCourseNavBtn.addEventListener("click", showJoinModal);
  joinCourseForm.addEventListener("submit", handleJoinCourse);
  closeJoinModal.addEventListener("click", hideJoinModal);
  cancelJoin.addEventListener("click", hideJoinModal);

  enrolledClassesDropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    enrolledClassesDropdown.classList.toggle("show");
    this.querySelector(".dropdown-arrow").classList.toggle("rotate");
    renderEnrolledClasses();
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const currentPage =
        window.location.pathname.split("/").pop() || "student.html";

      e.preventDefault();
      e.stopPropagation();

      if (
        href === currentPage ||
        (href === "student.html" && currentPage === "")
      ) {
        return;
      }

      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      localStorage.setItem("intentionalNavigation", "true");
      localStorage.setItem("targetPage", href);

      setTimeout(() => {
        window.location.href = href;
      }, 100);
    });
  });

  window.addEventListener("click", function (e) {
    if (e.target === joinCourseModal) {
      hideJoinModal();
    }
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

  /**
   * Initializes the student dashboard by setting user information,
   * restoring sidebar state, updating UI for the student role,
   * loading user's enrolled courses, and rendering the enrolled classes dropdown.
   */
  function initializeDashboard() {
    currentUserEmail.textContent = currentUser;
    userInitial.textContent = currentUser.charAt(0).toUpperCase();

    const savedSidebarState = localStorage.getItem("sidebarState");
    const intentionalNavigation = localStorage.getItem("intentionalNavigation");

    if (intentionalNavigation === "true" && savedSidebarState === "open") {
      sidebar.classList.add("open");
      mainContent.classList.add("sidebar-open");
      localStorage.removeItem("intentionalNavigation");
    } else {
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
    }

    updateUIForRole();
    loadUserCourses();
    renderEnrolledClasses();
    console.log("Current user:", currentUser);
    console.log("User role:", userRole);
    debugCourses();
  }

  /**
   * Retrieves the dashboard data for the current user from local storage.
   * If no dashboard exists, it initializes a new one with an empty courses array and student role.
   * @returns {object} The user's dashboard object.
   */
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

  /**
   * Saves the provided dashboard object to local storage for the current user.
   * @param {object} dashboard - The dashboard object to save.
   */
  function saveUserDashboard(dashboard) {
    const dashboardKey = `dashboard_${currentUser}`;
    localStorage.setItem(dashboardKey, JSON.stringify(dashboard));
  }

  /**
   * Updates the user interface elements specific to the student role,
   * such as the role badge text and styling, and the empty state message.
   */
  function updateUIForRole() {
    userRoleBadge.textContent = "Student";
    userRoleBadge.className = "role-badge student";
    emptyStateText.textContent = "Join a course with the course code";
  }

  /**
   * Toggles the visibility and state of the sidebar and main content area.
   * Also saves the current sidebar state to local storage.
   */
  function toggleSidebar() {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");

    const sidebarIsOpen = sidebar.classList.contains("open");
    localStorage.setItem("sidebarState", sidebarIsOpen ? "open" : "closed");
  }

  /**
   * Handles the user logout process by clearing user-related data from local storage
   * and redirecting to the index page.
   */
  function handleLogout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
  }

  /**
   * Displays the "Join Course" modal.
   */
  function showJoinModal() {
    joinCourseModal.style.display = "block";
  }

  /**
   * Hides the "Join Course" modal and resets the join course form.
   */
  function hideJoinModal() {
    joinCourseModal.style.display = "none";
    joinCourseForm.reset();
  }

  /**
   * Handles the submission of the join course form.
   * It validates the course code, checks for existing enrollment,
   * and attempts to join the course, updating the UI accordingly.
   * @param {Event} e - The form submission event.
   */
  function handleJoinCourse(e) {
    e.preventDefault();
    const formData = new FormData(joinCourseForm);
    let courseCode = formData.get("courseCode");

    if (!courseCode) {
      alert("Please enter the course code");
      document.querySelector('input[name="courseCode"]').focus();
      return;
    }

    courseCode = courseCode.trim().toUpperCase().replace(/\s+/g, "");

    if (courseCode.length < 3 || courseCode.length > 10) {
      alert("Course code must be between 3-10 characters");
      return;
    }

    console.log("Attempting to join course with code:", courseCode);

    const joinButton = document.querySelector(
      '#joinCourseForm button[type="submit"]'
    );
    const originalText = joinButton.textContent;
    joinButton.textContent = "Joining...";
    joinButton.disabled = true;

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

    if (course.teacher === currentUser) {
      joinButton.textContent = originalText;
      joinButton.disabled = false;
      alert(
        "You are the teacher of this course. You cannot join your own course as a student."
      );
      return;
    }

    if (course.students && course.students.includes(currentUser)) {
      joinButton.textContent = originalText;
      joinButton.disabled = false;
      alert("You are already enrolled in this course.");
      loadUserCourses();
      hideJoinModal();
      return;
    }

    const joinResult = joinCourse(course);

    joinButton.textContent = originalText;
    joinButton.disabled = false;

    if (joinResult.success) {
      hideJoinModal();
      loadUserCourses();
      renderEnrolledClasses();

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

  /**
   * Finds a course by its unique course code from the global list of all courses.
   * @param {string} code - The course code to search for.
   * @returns {object|undefined} The course object if found, otherwise undefined.
   */
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

  /**
   * Retrieves a list of all course codes currently stored in local storage.
   * @returns {string[]} An array of course codes.
   */
  function getAllCourseCodes() {
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    return allCourses.map((course) => course.code).filter((code) => code);
  }

  /**
   * Enrolls the current user into a specified course.
   * It updates the course's student list, the global course list,
   * and the current user's dashboard. It also updates the teacher's dashboard.
   * @param {object} course - The course object to join.
   * @returns {object} An object indicating success or failure with a message.
   */
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

  /**
   * Updates the teacher's dashboard with the latest information for a specific course.
   * This ensures that the teacher's view of their courses reflects changes like student enrollment.
   * @param {object} course - The course object to update in the teacher's dashboard.
   */
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

  /**
   * Loads the courses for the current user from their dashboard.
   * It filters for non-archived courses that the student is enrolled in,
   * removes any duplicates, and then renders them on the dashboard.
   */
  function loadUserCourses() {
    const dashboard = getUserDashboard();
    let courses = (dashboard.courses || []).filter(
      (course) => !course.archived && course.students.includes(currentUser)
    );

    const uniqueCourses = [];
    const seenIds = new Set();

    courses.forEach((course) => {
      if (!seenIds.has(course.id)) {
        seenIds.add(course.id);
        uniqueCourses.push(course);
      }
    });

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
   * @param {object[]} courses - An array of course objects to render.
   */
  function renderCourses(courses) {
    coursesGrid.innerHTML = "";
    courses.forEach((course) => {
      const courseCard = createCourseCard(course);
      coursesGrid.appendChild(courseCard);
    });
  }

  /**
   * Creates a single course card element for display on the dashboard.
   * It includes course details, teacher information, and action icons.
   * @param {object} course - The course object to create a card for.
   * @returns {HTMLElement} The created course card DOM element.
   */
  function createCourseCard(course) {
    const card = document.createElement("div");
    card.className = `course-card ${course.archived ? "archived" : ""}`;
    card.onclick = (e) => {
      if (!e.target.closest(".course-action-icon")) {
        openCourse(course);
      }
    };

    const headerClass = getHeaderClass(course.subject, course.id);

    if (course.archived) {
      const archivedBadge = document.createElement("div");
      archivedBadge.className = "archived-badge";
      archivedBadge.textContent = "Archived";
      card.appendChild(archivedBadge);
    }

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
    courseSubtitle.textContent = course.teacher;

    headerContent.appendChild(courseTitle);
    headerContent.appendChild(courseSection);
    headerContent.appendChild(courseSubtitle);

    courseHeader.appendChild(headerContent);

    const profileInitial = document.createElement("div");
    profileInitial.className = "course-profile-initial";
    profileInitial.textContent = course.teacher.charAt(0).toUpperCase();
    profileInitial.style.background = `hsl(${
      hashString(course.teacher) % 360
    }, 70%, 40%)`;
    courseHeader.appendChild(profileInitial);

    const courseBody = document.createElement("div");
    courseBody.className = "course-body";

    const bodyContent = document.createElement("div");
    bodyContent.className = "course-body-content";

    const courseInfo = document.createElement("div");
    courseInfo.className = "course-info";

    bodyContent.appendChild(courseInfo);

    const bottomActions = document.createElement("div");
    bottomActions.className = "course-bottom-actions";

    const streamIcon = document.createElement("button");
    streamIcon.className = "course-action-icon";
    streamIcon.innerHTML = '<span class="material-icons">dynamic_feed</span>';
    streamIcon.title = "Stream";
    streamIcon.onclick = (e) => {
      e.stopPropagation();
      openCourse(course);
    };

    const classworkIcon = document.createElement("button");
    classworkIcon.className = "course-action-icon";
    classworkIcon.innerHTML = '<span class="material-icons">assignment</span>';
    classworkIcon.title = "Classwork";
    classworkIcon.onclick = (e) => {
      e.stopPropagation();
    };

    const peopleIcon = document.createElement("button");
    peopleIcon.className = "course-action-icon";
    peopleIcon.innerHTML = '<span class="material-icons">people</span>';
    peopleIcon.title = "People";
    peopleIcon.onclick = (e) => {
      e.stopPropagation();
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
   * Determines the CSS class for a course card header based on the course subject.
   * It provides specific classes for common subjects and a hash-based default for others.
   * @param {string} subject - The subject of the course.
   * @param {string} courseId - The unique ID of the course for consistent hashing.
   * @returns {string} The CSS class name for the course header.
   */
  function getHeaderClass(subject, courseId) {
    const subjectLower = subject.toLowerCase();

    if (subjectLower.includes("math") || subjectLower.includes("mathematics"))
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

    const combinedHash = hashString(subject + courseId);
    const colorIndex = (combinedHash % 10) + 1;
    return `default-${colorIndex}`;
  }

  /**
   * Simple hash function to generate a numeric hash from a string.
   * Used for consistent color assignment to course cards.
   * @param {string} str - The input string to hash.
   * @returns {number} The absolute hash value.
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
   * Opens the stream page for a selected course.
   * Stores the course details in local storage and redirects the user.
   * @param {object} course - The course object to open.
   */
  function openCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    window.location.href = "studentStream.html";
  }

  /**
   * Renders the list of enrolled classes in the sidebar dropdown menu.
   * It displays non-archived courses that the current student is enrolled in.
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
   * Logs detailed information about all courses (global) and the current user's dashboard
   * to the console for debugging purposes.
   */
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
      console.log(`   Archived: ${course.archived}`);
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
      console.log(`   Archived: ${course.archived}`);
    });
    console.log("=== End Dashboard ===");
  }

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

  window.showJoinModal = showJoinModal;
});
