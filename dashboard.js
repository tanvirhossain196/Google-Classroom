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

  // Modals
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
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  // Initialize dashboard
  initializeDashboard();

  // Event listeners
  menuIcon.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  addCourseBtn.addEventListener("click", toggleActionMenu);
  createCourseForm.addEventListener("submit", handleCreateCourse);
  joinCourseForm.addEventListener("submit", handleJoinCourse);
  editCourseForm.addEventListener("submit", handleEditCourse);
  closeCreateModal.addEventListener("click", hideCreateModal);
  closeJoinModal.addEventListener("click", hideJoinModal);
  closeEditModal.addEventListener("click", hideEditModal);
  cancelCreate.addEventListener("click", hideCreateModal);
  cancelJoin.addEventListener("click", hideJoinModal);
  cancelEdit.addEventListener("click", hideEditModal);

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
    if (
      !addCourseBtn.contains(e.target) &&
      !courseActionMenu.contains(e.target)
    ) {
      courseActionMenu.classList.remove("show");
    }
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", function (e) {
    if (!sidebar.contains(e.target) && !menuIcon.contains(e.target)) {
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
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
    const userDashboard = getUserDashboard();
    const userRole = getUserRole();
    updateUIForRole(userRole);
    loadUserCourses();
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
    localStorage.setItem("userRole", role);
  }

  function updateUIForRole(role) {
    switch (role) {
      case "teacher":
        userRoleBadge.textContent = "শিক্ষক";
        userRoleBadge.className = "role-badge teacher";
        dashboardTitle.textContent = "শিক্ষক ড্যাশবোর্ড";
        emptyStateText.textContent =
          "আপনার প্রথম কোর্স তৈরি করুন অথবা অন্য কোর্সে যোগ দিন";
        break;
      case "student":
        userRoleBadge.textContent = "শিক্ষার্থী";
        userRoleBadge.className = "role-badge student";
        dashboardTitle.textContent = "শিক্ষার্থী ড্যাশবোর্ড";
        emptyStateText.textContent = "কোর্স কোড দিয়ে কোর্সে যোগ দিন";
        break;
      default:
        userRoleBadge.textContent = "নতুন ব্যবহারকারী";
        userRoleBadge.className = "role-badge new";
        dashboardTitle.textContent = "আমার ক্লাসরুম";
        emptyStateText.textContent =
          "আপনার প্রথম কোর্স তৈরি করুন অথবা একটি কোর্সে যোগ দিন";
    }
    updateActionMenu(role);
  }

  function updateActionMenu(role) {
    courseActionMenu.innerHTML = "";
    if (role === "student") {
      showStudentActions();
    } else {
      showTeacherActions();
    }
  }

  function showStudentActions() {
    const joinItem = document.createElement("div");
    joinItem.className = "dropdown-item";
    joinItem.onclick = showJoinModal;
    const joinIcon = document.createElement("span");
    joinIcon.className = "material-icons";
    joinIcon.textContent = "add";
    const joinText = document.createTextNode("কোর্সে যোগ দিন");
    joinItem.appendChild(joinIcon);
    joinItem.appendChild(joinText);
    courseActionMenu.appendChild(joinItem);
  }

  function showTeacherActions() {
    const createItem = document.createElement("div");
    createItem.className = "dropdown-item";
    createItem.onclick = showCreateModal;
    const createIcon = document.createElement("span");
    createIcon.className = "material-icons";
    createIcon.textContent = "add";
    const createText = document.createTextNode("নতুন কোর্স তৈরি করুন");
    createItem.appendChild(createIcon);
    createItem.appendChild(createText);
    courseActionMenu.appendChild(createItem);

    const joinItem = document.createElement("div");
    joinItem.className = "dropdown-item";
    joinItem.onclick = showJoinModal;
    const joinIcon = document.createElement("span");
    joinIcon.className = "material-icons";
    joinIcon.textContent = "group_add";
    const joinText = document.createTextNode("কোর্সে যোগ দিন");
    joinItem.appendChild(joinIcon);
    joinItem.appendChild(joinText);
    courseActionMenu.appendChild(joinItem);
  }

  function toggleSidebar() {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
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

  function showJoinModal() {
    joinCourseModal.style.display = "block";
    courseActionMenu.classList.remove("show");
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

  function handleCreateCourse(e) {
    e.preventDefault();
    const formData = new FormData(createCourseForm);
    const courseName = formData.get("courseName").trim();
    const section =
      formData.get("section").trim() || "সেকশন নির্দিষ্ট করা হয়নি";
    const subject =
      formData.get("subject").trim() || "বিষয় নির্দিষ্ট করা হয়নি";
    const room = formData.get("room").trim() || "রুম নির্দিষ্ট করা হয়নি";

    if (!courseName) {
      alert("অনুগ্রহ করে কোর্সের নাম লিখুন");
      document.querySelector('input[name="courseName"]').focus();
      return;
    }

    if (courseName.length < 3) {
      alert("কোর্সের নাম অন্তত ৩ অক্ষরের হতে হবে");
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
      archived: false,
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
      alert("এই নামে এবং সেকশনে আপনার একটি কোর্স ইতিমধ্যে রয়েছে");
      return;
    }

    addCourseToUser(newCourse);
    addCourseToGlobalList(newCourse);
    setUserRole("teacher");
    hideCreateModal();
    loadUserCourses();
    updateUIForRole("teacher");
    alert(
      `কোর্স সফলভাবে তৈরি হয়েছে!\n\nকোর্স কোড: ${courseCode}\n\nএই কোড শিক্ষার্থীদের সাথে শেয়ার করুন যাতে তারা আপনার কোর্সে যোগ দিতে পারে।`
    );
  }

  function handleJoinCourse(e) {
    e.preventDefault();
    const formData = new FormData(joinCourseForm);
    let courseCode = formData.get("courseCode");

    if (!courseCode) {
      alert("অনুগ্রহ করে কোর্স কোড লিখুন");
      document.querySelector('input[name="courseCode"]').focus();
      return;
    }

    // Clean and format course code
    courseCode = courseCode.trim().toUpperCase().replace(/\s+/g, "");

    if (courseCode.length < 3 || courseCode.length > 10) {
      alert("কোর্স কোড ৩-১০ অক্ষরের মধ্যে হতে হবে");
      return;
    }

    console.log("Attempting to join course with code:", courseCode);

    // Show loading state
    const joinButton = document.querySelector(
      '#joinCourseForm button[type="submit"]'
    );
    const originalText = joinButton.textContent;
    joinButton.textContent = "যোগ দিচ্ছি...";
    joinButton.disabled = true;

    // Find course with better error handling
    const course = findCourseByCode(courseCode);

    if (!course) {
      joinButton.textContent = originalText;
      joinButton.disabled = false;
      alert(
        `কোর্স খুঁজে পাওয়া যায়নি।\n\nআপনার কোড: "${courseCode}"\n\nঅনুগ্রহ করে:\n• কোর্স কোড সঠিক কিনা যাচাই করুন\n• শিক্ষকের কাছ থেকে সঠিক কোড নিশ্চিত করুন`
      );
      console.log("Available course codes:", getAllCourseCodes());
      return;
    }

    // Check if user is the teacher
    if (course.teacher === currentUser) {
      joinButton.textContent = originalText;
      joinButton.disabled = false;
      alert(
        "আপনি এই কোর্সের শিক্ষক। নিজের কোর্সে শিক্ষার্থী হিসেবে যোগ দিতে পারবেন না।"
      );
      return;
    }

    // Check if already enrolled
    if (course.students && course.students.includes(currentUser)) {
      joinButton.textContent = originalText;
      joinButton.disabled = false;
      alert("আপনি ইতিমধ্যে এই কোর্সে যোগদান করেছেন।");
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
      // Set role as student if not already a teacher
      const currentRole = getUserRole();
      if (currentRole !== "teacher") {
        setUserRole("student");
        updateUIForRole("student");
      }

      hideJoinModal();
      loadUserCourses();

      // Success message with course details
      alert(
        `✅ সফলভাবে কোর্সে যোগদান করেছেন!\n\n📚 কোর্স: ${
          course.name
        }\n👨🏫 শিক্ষক: ${course.teacher}\n📝 সেকশন: ${
          course.section
        }\n🏫 বিষয়: ${
          course.subject || "নির্দিষ্ট নয়"
        }\n\n🎉 এখন আপনি এই কোর্সের সকল বিষয়বস্তু দেখতে পারবেন।`
      );
    } else {
      alert(
        `❌ কোর্সে যোগদানে সমস্যা হয়েছে: ${joinResult.message}\n\nআবার চেষ্টা করুন অথবা শিক্ষকের সাথে যোগাযোগ করুন।`
      );
    }
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
      alert("কোর্সের নাম লিখুন");
      return;
    }

    if (courseName.length < 3) {
      alert("কোর্সের নাম অন্তত ৩ অক্ষরের হতে হবে");
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
    alert("কোর্স সফলভাবে আপডেট হয়েছে!");
  }

  function generateCourseCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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
          message: "কোর্স সিস্টেমে খুঁজে পাওয়া যায়নি",
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

      return { success: true, message: "সফলভাবে কোর্সে যোগদান করেছেন" };
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
    let courses = dashboard.courses || [];

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

    const headerClass = getHeaderClass(course.subject);
    const userRole = getUserRole();
    const isTeacher = course.teacher === currentUser;

    // Archived badge
    if (course.archived) {
      const archivedBadge = document.createElement("div");
      archivedBadge.className = "archived-badge";
      archivedBadge.textContent = "আর্কাইভ";
      card.appendChild(archivedBadge);
    }

    // Course Header
    const courseHeader = document.createElement("div");
    courseHeader.className = `course-header ${headerClass}`;

    const headerContent = document.createElement("div");
    headerContent.className = "course-header-content";

    const courseTitle = document.createElement("h3");
    courseTitle.className = "course-title";
    courseTitle.textContent = course.name;

    const courseSection = document.createElement("p");
    courseSection.className = "course-section";
    courseSection.textContent = `সেকশন: ${course.section}`;

    headerContent.appendChild(courseTitle);
    headerContent.appendChild(courseSection);

    // Header Menu (only for teachers/course creators)
    const headerMenu = document.createElement("div");
    headerMenu.className = "course-header-menu";

    if (isTeacher) {
      const cardMenu = document.createElement("div");
      cardMenu.className = "course-card-menu";

      const menuIcon = document.createElement("span");
      menuIcon.className = "material-icons course-menu";
      menuIcon.textContent = "more_vert";
      menuIcon.onclick = (e) => {
        e.stopPropagation();
        toggleCourseMenu(course.id);
      };

      const menuDropdown = document.createElement("div");
      menuDropdown.className = "course-menu-dropdown";
      menuDropdown.id = `courseMenu_${course.id}`;

      // Edit option
      const editItem = document.createElement("div");
      editItem.className = "course-menu-item";
      editItem.onclick = () => editCourse(course.id);
      const editIcon = document.createElement("span");
      editIcon.className = "material-icons";
      editIcon.textContent = "edit";
      const editText = document.createTextNode("সম্পাদনা");
      editItem.appendChild(editIcon);
      editItem.appendChild(editText);

      // Archive option
      const archiveItem = document.createElement("div");
      archiveItem.className = "course-menu-item archive";
      archiveItem.onclick = () => toggleArchiveCourse(course.id);
      const archiveIcon = document.createElement("span");
      archiveIcon.className = "material-icons";
      archiveIcon.textContent = course.archived ? "unarchive" : "archive";
      const archiveText = document.createTextNode(
        course.archived ? "আনআর্কাইভ" : "আর্কাইভ"
      );
      archiveItem.appendChild(archiveIcon);
      archiveItem.appendChild(archiveText);

      // Delete option
      const deleteItem = document.createElement("div");
      deleteItem.className = "course-menu-item delete";
      deleteItem.onclick = () => deleteCourse(course.id);
      const deleteIcon = document.createElement("span");
      deleteIcon.className = "material-icons";
      deleteIcon.textContent = "delete";
      const deleteText = document.createTextNode("মুছুন");
      deleteItem.appendChild(deleteIcon);
      deleteItem.appendChild(deleteText);

      menuDropdown.appendChild(editItem);
      menuDropdown.appendChild(archiveItem);
      menuDropdown.appendChild(deleteItem);

      cardMenu.appendChild(menuIcon);
      cardMenu.appendChild(menuDropdown);
      headerMenu.appendChild(cardMenu);
    }

    courseHeader.appendChild(headerContent);
    courseHeader.appendChild(headerMenu);

    // Course Body - Different content based on user role
    const courseBody = document.createElement("div");
    courseBody.className = "course-body";

    const bodyContent = document.createElement("div");
    bodyContent.className = "course-body-content";

    const courseInfo = document.createElement("div");
    courseInfo.className = "course-info";

    if (isTeacher) {
      // For teachers: Show course code only
      const courseCode = document.createElement("p");
      courseCode.className = "course-code";
      courseCode.textContent = `কোড: ${course.code}`;
      courseInfo.appendChild(courseCode);
    }
    // For students: Show nothing extra in the card

    bodyContent.appendChild(courseInfo);
    courseBody.appendChild(bodyContent);

    card.appendChild(courseHeader);
    card.appendChild(courseBody);

    return card;
  }

  function getHeaderClass(subject) {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes("math") || subjectLower.includes("গণিত"))
      return "math";
    if (subjectLower.includes("science") || subjectLower.includes("বিজ্ঞান"))
      return "science";
    if (subjectLower.includes("bangla") || subjectLower.includes("বাংলা"))
      return "bangla";
    if (subjectLower.includes("english") || subjectLower.includes("ইংরেজি"))
      return "english";
    if (
      subjectLower.includes("programming") ||
      subjectLower.includes("প্রোগ্রামিং")
    )
      return "programming";
    return "";
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
      ? "আপনি কি এই কোর্সটি আর্কাইভ করতে চান?"
      : "আপনি কি এই কোর্সটি আনআর্কাইভ করতে চান?";

    if (!confirm(confirmMessage)) return;

    updateCourse(courseId, { archived: newArchivedStatus });
    loadUserCourses();
  }

  function deleteCourse(courseId) {
    if (
      !confirm(
        "আপনি কি নিশ্চিত যে এই কোর্সটি স্থায়ীভাবে মুছে দিতে চান?\n\nএটি পুনরুদ্ধার করা যাবে না।"
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
    alert("কোর্স সফলভাবে মুছে দেওয়া হয়েছে।");
  }

  function openCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    window.location.href = "stream.html";
  }

  function debugCourses() {
    const allCourses = JSON.parse(localStorage.getItem("allCourses") || "[]");
    console.log("=== Debug: Available Courses ===");
    console.log(`Total courses: ${allCourses.length}`);

    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. Name: "${course.name}"`);
      console.log(`   Code: "${course.code}"`);
      console.log(`   Teacher: "${course.teacher}"`);
      console.log(
        `   Students: ${course.students ? course.students.length : 0}`
      );
      console.log(`   Created: ${course.created}`);
      console.log(`   ---`);
    });
    console.log("=== End Debug ===");

    const dashboard = getUserDashboard();
    console.log("=== Current User Dashboard ===");
    console.log(`User: ${currentUser}`);
    console.log(`Role: ${dashboard.role}`);
    console.log(`Courses: ${dashboard.courses.length}`);
    dashboard.courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} (${course.code})`);
    });
    console.log("=== End Dashboard ===");
  }

  // Global functions for debugging
  window.debugCourses = debugCourses;
  window.clearAllCourses = function () {
    if (
      confirm(
        "আপনি কি সব কোর্স মুছে দিতে চান? এটি সিস্টেম থেকে সব কোর্স সরিয়ে দেবে।"
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
