class PeopleManager {
  /**
   * Initializes the PeopleManager with default states and sets up the application.
   */
  constructor() {
    this.teachers = [];
    this.students = [];
    this.currentSort = "az"; // Changed default sort to 'az'
    this.currentFilter = "all";
    this.isEnrolledClassesOpen = false;
    this.personDetailBootstrapModal = null;
    this.init();
  }

  /**
   * Sets up initial elements, event listeners, and loads data.
   */
  init() {
    this.setupElements();
    this.setupEventListeners();
    this.loadUserData();
    this.loadCourseData();
    this.setupProfessionalFeatures();
    this.setupNotificationSystem();
    this.loadPeopleData();
    this.generateClassCode();
    this.handleResize();
  }

  /**
   * Retrieves and stores references to key DOM elements.
   */
  setupElements() {
    this.elements = {
      menuBtn: document.getElementById("menuBtn"),
      sidebar: document.getElementById("sidebar"),
      contentWrapper: document.getElementById("contentWrapper"),
      userInitial: document.getElementById("userInitial"),
      classesLink: document.getElementById("classesLink"),
      settingsLink: document.getElementById("settingsLink"),
      currentCourseName: document.getElementById("currentCourseName"),
      courseHeaderSection: document.querySelector(".course-header-section"),
      courseTopNav: document.getElementById("courseTopNav"),

      invitePeopleBtn: document.getElementById("invitePeopleBtn"),
      inviteFirstPersonBtn: document.getElementById("inviteFirstPersonBtn"),
      teachersSection: document.getElementById("teachersSection"),
      studentsSection: document.getElementById("studentsSection"),
      teachersList: document.getElementById("teachersList"),
      studentsList: document.getElementById("studentsList"),
      teachersCount: document.getElementById("teachersCount"),
      studentsCount: document.getElementById("studentsCount"),
      studentsTotalCount: document.getElementById("studentsTotalCount"), // Added for total student count
      peopleEmpty: document.getElementById("peopleEmpty"),
      peopleContent: document.getElementById("peopleContent"),

      inviteModal: document.getElementById("inviteModal"),
      closeInviteModal: document.getElementById("closeInviteModal"),
      cancelInvite: document.getElementById("cancelInvite"),
      sendInvites: document.getElementById("sendInvites"),
      inviteEmails: document.getElementById("inviteEmails"),
      classCode: document.getElementById("classCode"),
      copyCodeBtn: document.getElementById("copyCodeBtn"),
      regenerateCodeBtn: document.getElementById("regenerateCodeBtn"),

      sortStudentsBtn: document.getElementById("sortStudentsBtn"),
      filterStudentsBtn: document.getElementById("filterStudentsBtn"),
      sortFilterModal: document.getElementById("sortFilterModal"),
      closeSortFilter: document.getElementById("closeSortFilter"),

      personDetailBootstrapModalElement: document.getElementById(
        "personDetailBootstrapModal"
      ),
      personDetailBootstrapBody: document.getElementById(
        "personDetailBootstrapBody"
      ),

      enrolledClassesHeader: document.getElementById("enrolledClassesHeader"),
      enrolledClassesList: document.getElementById("enrolledClasses"),
      enrolledClassesDropdownIcon: document.getElementById(
        "enrolledClassesDropdownIcon"
      ),
    };

    if (this.elements.personDetailBootstrapModalElement) {
      this.personDetailBootstrapModal = new bootstrap.Modal(
        this.elements.personDetailBootstrapModalElement
      );
    }
  }

  /**
   * Sets up all event listeners for interactive elements.
   */
  setupEventListeners() {
    this.elements.menuBtn.addEventListener("click", () => this.toggleSidebar());

    this.elements.classesLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.goToDashboard();
    });

    this.elements.settingsLink.addEventListener("click", () =>
      this.navigateWithAnimation("teacherSettings.html")
    );

    window.addEventListener("resize", () => this.handleResize());

    if (this.elements.invitePeopleBtn) {
      this.elements.invitePeopleBtn.addEventListener("click", () =>
        this.showInviteModal()
      );
    }

    if (this.elements.inviteFirstPersonBtn) {
      this.elements.inviteFirstPersonBtn.addEventListener("click", () =>
        this.showInviteModal()
      );
    }

    if (this.elements.closeInviteModal) {
      this.elements.closeInviteModal.addEventListener("click", () =>
        this.hideInviteModal()
      );
    }

    if (this.elements.cancelInvite) {
      this.elements.cancelInvite.addEventListener("click", () =>
        this.hideInviteModal()
      );
    }

    if (this.elements.sendInvites) {
      this.elements.sendInvites.addEventListener("click", () =>
        this.sendInvitations()
      );
    }

    if (this.elements.copyCodeBtn) {
      this.elements.copyCodeBtn.addEventListener("click", () =>
        this.copyClassCode()
      );
    }

    if (this.elements.regenerateCodeBtn) {
      this.elements.regenerateCodeBtn.addEventListener("click", () =>
        this.regenerateClassCode()
      );
    }

    // Event listener for sort dropdown items
    const sortDropdown = document.querySelector(
      "#sortStudentsBtn + .dropdown-menu"
    );
    if (sortDropdown) {
      sortDropdown.addEventListener("click", (e) => {
        if (e.target.classList.contains("dropdown-item")) {
          const sortType = e.target.dataset.sort;
          this.applySort(sortType);
        }
      });
    }

    if (this.elements.filterStudentsBtn) {
      this.elements.filterStudentsBtn.addEventListener("click", () =>
        this.showSortFilterModal()
      );
    }

    if (this.elements.closeSortFilter) {
      this.elements.closeSortFilter.addEventListener("click", () =>
        this.hideSortFilterModal()
      );
    }

    if (this.elements.inviteModal) {
      this.elements.inviteModal.addEventListener("click", (e) => {
        if (e.target === this.elements.inviteModal) {
          this.hideInviteModal();
        }
      });
    }

    if (this.elements.sortFilterModal) {
      this.elements.sortFilterModal.addEventListener("click", (e) => {
        if (e.target === this.elements.sortFilterModal) {
          this.hideSortFilterModal();
        }
      });
    }

    if (this.elements.enrolledClassesHeader) {
      this.elements.enrolledClassesHeader.addEventListener("click", () =>
        this.toggleEnrolledClasses()
      );
    }
  }

  /**
   * Loads current user data from local storage.
   */
  loadUserData() {
    this.currentUser = localStorage.getItem("currentUser");
    this.userRole = localStorage.getItem("userRole");

    if (!this.currentUser) {
      this.navigateWithAnimation("index.html");
      return;
    }

    this.setUserInitials();
  }

  /**
   * Loads current course data from local storage.
   */
  loadCourseData() {
    const selectedCourse = localStorage.getItem("selectedCourse");

    if (!selectedCourse) {
      this.showErrorAndRedirect("No course selected");
      return;
    }

    try {
      this.currentCourse = JSON.parse(selectedCourse);

      if (!this.currentCourse.id) {
        this.showErrorAndRedirect("Course data is incorrect");
        return;
      }

      this.courseId = this.currentCourse.id;
      this.updateCourseDisplay();
      this.loadEnrolledClasses();
    } catch (error) {
      this.showErrorAndRedirect("Problem loading course");
    }
  }

  /**
   * Displays an error message and redirects to the teacher dashboard.
   * @param {string} message - The error message to display.
   */
  showErrorAndRedirect(message) {
    alert(message);
    this.navigateWithAnimation("teacher.html");
  }

  /**
   * Sets up professional features like tooltips and keyboard shortcuts.
   */
  setupProfessionalFeatures() {
    this.setupTooltips();
    this.setupKeyboardShortcuts();
    this.setupThemeDetection();
  }

  /**
   * Toggles the sidebar's open/closed state and adjusts content layout.
   */
  toggleSidebar() {
    this.elements.sidebar.classList.toggle("open");
    this.elements.contentWrapper.classList.toggle("sidebar-open");
    this.elements.courseTopNav.classList.toggle("sidebar-open");

    this.elements.sidebar.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    this.elements.contentWrapper.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    this.elements.courseTopNav.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    if (!this.elements.sidebar.classList.contains("open")) {
      this.isEnrolledClassesOpen = false;
      this.elements.enrolledClassesList.classList.remove("open");
      this.elements.enrolledClassesDropdownIcon.style.transform =
        "rotate(0deg)";
    }
    this.loadEnrolledClasses();
  }

  /**
   * Toggles the visibility of the enrolled classes dropdown in the sidebar.
   */
  toggleEnrolledClasses() {
    this.isEnrolledClassesOpen = !this.isEnrolledClassesOpen;
    this.elements.enrolledClassesList.classList.toggle(
      "open",
      this.isEnrolledClassesOpen
    );
    this.elements.enrolledClassesDropdownIcon.style.transform = this
      .isEnrolledClassesOpen
      ? "rotate(90deg)"
      : "rotate(0deg)";
  }

  /**
   * Navigates to a new URL with a fade-out animation.
   * @param {string} url - The URL to navigate to.
   */
  navigateWithAnimation(url) {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.3s ease";

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }

  /**
   * Navigates back to the teacher dashboard, clearing the selected course.
   */
  goToDashboard() {
    localStorage.removeItem("selectedCourse");
    this.navigateWithAnimation("teacher.html");
  }

  /**
   * Sets the user's initial in the avatar display.
   */
  setUserInitials() {
    const initial = this.currentUser.charAt(0).toUpperCase();
    if (this.elements.userInitial) {
      this.elements.userInitial.textContent = initial;
    }
  }

  /**
   * Updates the course display elements on the page.
   */
  updateCourseDisplay() {
    const courseTitle = document.getElementById("courseTitle");
    const courseSection = document.getElementById("courseSection");

    if (courseTitle) courseTitle.textContent = this.currentCourse.name;
    if (courseSection) courseSection.textContent = this.currentCourse.section;

    document.title = `${this.currentCourse.name} - Classroom`;

    if (this.elements.currentCourseName) {
      this.elements.currentCourseName.textContent = this.currentCourse.name;
    }

    const courseBanner = document.getElementById("courseBanner");
    if (courseBanner) {
      const courseType = this.getCourseType(this.currentCourse.subject);
      courseBanner.className = `course-banner ${courseType}`;
    }

    this.updateCourseInfo();
  }

  /**
   * Determines the course type based on the subject for banner styling.
   * @param {string} subject - The subject of the course.
   * @returns {string} The CSS class name for the course type.
   */
  getCourseType(subject) {
    if (!subject) return "science";

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

    return "science";
  }

  /**
   * Updates additional course information displayed in the banner.
   */
  updateCourseInfo() {
    const isTeacher = true;

    const courseBanner = document.getElementById("courseBanner");
    if (!courseBanner) return;

    let additionalInfo = courseBanner.querySelector(".course-additional-info");

    if (!additionalInfo) {
      additionalInfo = document.createElement("div");
      additionalInfo.className = "course-additional-info";
      const bannerContent = courseBanner.querySelector(".banner-content");
      if (bannerContent) {
        bannerContent.appendChild(additionalInfo);
      }
    }

    additionalInfo.innerHTML = "";

    if (isTeacher) {
      if (this.currentCourse.code) {
        const courseCode = document.createElement("p");
        courseCode.innerHTML = `Course Code: ${this.currentCourse.code}`;
        additionalInfo.appendChild(courseCode);
      }

      if (this.currentCourse.subject) {
        const subject = document.createElement("p");
        subject.innerHTML = `Subject: ${this.currentCourse.subject}`;
        additionalInfo.appendChild(subject);
      }

      if (this.currentCourse.room) {
        const room = document.createElement("p");
        room.innerHTML = `Room: ${this.currentCourse.room}`;
        additionalInfo.appendChild(room);
      }

      const studentCount = document.createElement("p");
      studentCount.innerHTML = `Students: ${
        this.currentCourse.students ? this.currentCourse.students.length : 0
      } people`;
      additionalInfo.appendChild(studentCount);
    }
  }

  /**
   * Loads and displays the list of enrolled classes in the sidebar.
   */
  loadEnrolledClasses() {
    const enrolledClasses = this.elements.enrolledClassesList;
    if (!enrolledClasses) return;

    const userDashboard = this.getUserDashboard();
    const userCourses = userDashboard.courses || [];

    if (userCourses.length === 0) {
      enrolledClasses.innerHTML = "";
      return;
    }

    enrolledClasses.innerHTML = "";

    const isSidebarOpen = this.elements.sidebar.classList.contains("open");

    userCourses.slice(0, 5).forEach((course) => {
      const courseItem = document.createElement("div");
      courseItem.className = "sidebar-item";
      courseItem.onclick = () => this.switchToCourse(course);

      const avatar = document.createElement("div");
      avatar.className = "sidebar-avatar";
      avatar.textContent = course.name.charAt(0).toUpperCase();

      const courseName = document.createElement("span");
      courseName.className = "sidebar-text";
      courseName.textContent = course.name;

      courseItem.appendChild(avatar);
      if (isSidebarOpen) {
        courseItem.appendChild(courseName);
      }
      enrolledClasses.appendChild(courseItem);
    });
  }

  /**
   * Retrieves the user's dashboard data from local storage.
   * @returns {object} The user's dashboard object.
   */
  getUserDashboard() {
    const dashboardKey = `dashboard_${this.currentUser}`;
    return JSON.parse(localStorage.getItem(dashboardKey) || '{"courses": []}');
  }

  /**
   * Switches the current course and reloads the page.
   * @param {object} course - The course object to switch to.
   */
  switchToCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    location.reload();
  }

  /**
   * Loads teacher and student data from the current course.
   */
  loadPeopleData() {
    this.teachers = [this.currentCourse.teacher];
    this.students = this.currentCourse.students || [];

    if (
      this.currentCourse.teachers &&
      Array.isArray(this.currentCourse.teachers)
    ) {
      this.currentCourse.teachers.forEach((teacher) => {
        if (!this.teachers.includes(teacher)) {
          this.teachers.push(teacher);
        }
      });
    }

    this.renderPeopleData();
  }

  /**
   * Renders the teacher and student lists on the page.
   */
  renderPeopleData() {
    const totalPeople = this.teachers.length + this.students.length;

    if (totalPeople === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();
    this.renderTeachers();
    this.renderStudents();
    this.updateCounts();
  }

  /**
   * Displays the empty state message when no members are present.
   */
  showEmptyState() {
    if (this.elements.peopleEmpty) {
      this.elements.peopleEmpty.style.display = "block";
    }
    if (this.elements.teachersSection) {
      this.elements.teachersSection.style.display = "none";
    }
    if (this.elements.studentsSection) {
      this.elements.studentsSection.style.display = "none";
    }
  }

  /**
   * Hides the empty state message.
   */
  hideEmptyState() {
    if (this.elements.peopleEmpty) {
      this.elements.peopleEmpty.style.display = "none";
    }
    if (this.elements.teachersSection) {
      this.elements.teachersSection.style.display = "block";
    }
    if (this.elements.studentsSection) {
      this.elements.studentsSection.style.display = "block";
    }
  }

  /**
   * Renders the list of teachers.
   */
  renderTeachers() {
    if (!this.elements.teachersList) return;

    this.elements.teachersList.innerHTML = "";

    this.teachers.forEach((teacher, index) => {
      const teacherElement = this.createPersonElement(
        teacher,
        "teacher",
        index
      );
      this.elements.teachersList.appendChild(teacherElement);
    });
  }

  /**
   * Renders the list of students, applying current sort and filter.
   */
  renderStudents() {
    if (!this.elements.studentsList) return;

    this.elements.studentsList.innerHTML = "";

    const sortedStudents = this.sortStudents([...this.students]);
    const filteredStudents = this.filterStudents(sortedStudents);

    filteredStudents.forEach((student, index) => {
      const studentElement = this.createPersonElement(
        student,
        "student",
        index
      );
      this.elements.studentsList.appendChild(studentElement);
    });
  }

  /**
   * Creates a DOM element for a single person (teacher or student).
   * @param {string} name - The name of the person.
   * @param {string} role - The role of the person ('teacher' or 'student').
   * @param {number} index - The index of the person in the list for animation delay.
   * @returns {HTMLElement} The created person item element.
   */
  createPersonElement(name, role, index) {
    const personDiv = document.createElement("div");
    personDiv.className = "person-item";
    personDiv.style.animationDelay = `${index * 0.1}s`;

    const avatar = document.createElement("div");
    avatar.className = "person-avatar";
    avatar.textContent = name.charAt(0).toUpperCase();
    avatar.style.background = this.getAvatarColor(name);

    const info = document.createElement("div");
    info.className = "person-info";

    const nameElement = document.createElement("div");
    nameElement.className = "person-name";
    nameElement.textContent = name;

    const roleElement = document.createElement("div");
    roleElement.className = "person-role";
    roleElement.textContent = role === "teacher" ? "Teacher" : "Student";

    const emailElement = document.createElement("div");
    emailElement.className = "person-email";
    emailElement.textContent = this.generateEmail(name);

    info.appendChild(nameElement);
    info.appendChild(roleElement);
    info.appendChild(emailElement);

    const actions = document.createElement("div");
    actions.className = "person-actions";

    const viewBtn = document.createElement("button");
    viewBtn.className = "action-btn";
    viewBtn.innerHTML =
      '<span class="material-icons">visibility</span> Details';
    viewBtn.onclick = () => this.showPersonDetails(name, role);

    actions.appendChild(viewBtn);

    if (
      this.currentUser === this.currentCourse.teacher &&
      name !== this.currentUser
    ) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "action-btn";
      removeBtn.innerHTML =
        '<span class="material-icons">remove_circle</span> Remove';
      removeBtn.onclick = () => this.removePerson(name, role);
      actions.appendChild(removeBtn);
    }

    personDiv.appendChild(avatar);
    personDiv.appendChild(info);
    personDiv.appendChild(actions);

    return personDiv;
  }

  /**
   * Generates a consistent avatar background color based on the person's name.
   * @param {string} name - The name of the person.
   * @returns {string} A CSS linear-gradient string for the background.
   */
  getAvatarColor(name) {
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  /**
   * Generates a mock email address for a given name.
   * @param {string} name - The name of the person.
   * @returns {string} A generated email address.
   */
  generateEmail(name) {
    const domain = "@example.com";
    const username = name.toLowerCase().replace(/\s+/g, ".");
    return username + domain;
  }

  /**
   * Updates the displayed counts for teachers and students.
   */
  updateCounts() {
    if (this.elements.teachersCount) {
      this.elements.teachersCount.textContent = this.teachers.length;
    }
    if (this.elements.studentsCount) {
      this.elements.studentsCount.textContent = this.students.length;
    }
    if (this.elements.studentsTotalCount) {
      this.elements.studentsTotalCount.textContent = `(${this.students.length})`;
    }
  }

  /**
   * Sorts a list of students based on the current sort preference.
   * @param {string[]} students - An array of student names.
   * @returns {string[]} The sorted array of student names.
   */
  sortStudents(students) {
    switch (this.currentSort) {
      case "az":
        return students.sort((a, b) => a.localeCompare(b));
      case "za":
        return students.sort((a, b) => b.localeCompare(a));
      case "oldest":
        // For mock data, we can simulate oldest by original order or a simple reverse
        return students.reverse(); // Simple reverse for mock 'oldest'
      case "newest":
        // For mock data, we can simulate newest by original order or a simple reverse
        return students; // Keep original order for mock 'newest'
      default:
        return students;
    }
  }

  /**
   * Filters a list of students based on the current filter preference.
   * @param {string[]} students - An array of student names.
   * @returns {string[]} The filtered array of student names.
   */
  filterStudents(students) {
    return students;
  }

  /**
   * Displays the invite people modal.
   */
  showInviteModal() {
    if (this.elements.inviteModal) {
      this.elements.inviteModal.classList.add("active");
    }
  }

  /**
   * Hides the invite people modal and clears the email input.
   */
  hideInviteModal() {
    if (this.elements.inviteModal) {
      this.elements.inviteModal.classList.remove("active");
    }
    if (this.elements.inviteEmails) {
      this.elements.inviteEmails.value = "";
    }
  }

  /**
   * Displays the Bootstrap modal with details of the selected person.
   * @param {string} name - The name of the person.
   * @param {string} role - The role of the person ('teacher' or 'student').
   */
  showPersonDetails(name, role) {
    if (
      !this.elements.personDetailBootstrapBody ||
      !this.personDetailBootstrapModal
    )
      return;

    const detailContent = this.createPersonDetailContent(name, role);
    this.elements.personDetailBootstrapBody.innerHTML = detailContent;

    this.personDetailBootstrapModal.show();
  }

  /**
   * Creates the HTML content for the person detail modal.
   * @param {string} name - The name of the person.
   * @param {string} role - The role of the person.
   * @returns {string} HTML string for person details.
   */
  createPersonDetailContent(name, role) {
    const email = this.generateEmail(name);
    const joinDate = this.generateJoinDate();
    const lastActive = this.generateLastActive();

    return `
      <div class="person-detail-profile text-center mb-4">
        <div class="person-detail-avatar mx-auto mb-3" style="background: ${this.getAvatarColor(
          name
        )}; width: 80px; height: 80px; font-size: 36px;">
          ${name.charAt(0).toUpperCase()}
        </div>
        <h3 class="person-detail-name h4 mb-1">${name}</h3>
        <p class="person-detail-role text-muted mb-1">${
          role === "teacher" ? "Teacher" : "Student"
        }</p>
        <p class="person-detail-email text-secondary">${email}</p>
      </div>
      
      <div class="person-detail-stats border-top pt-3">
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <span class="stat-label fw-bold">Join Date:</span>
          <span class="stat-value">${joinDate}</span>
        </div>
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <span class="stat-label fw-bold">Last Active:</span>
          <span class="stat-value">${lastActive}</span>
        </div>
        <div class="d-flex justify-content-between align-items-center py-2">
          <span class="stat-label fw-bold">Assignments Submitted:</span>
          <span class="stat-value">${
            role === "student" ? this.generateAssignmentCount() : "N/A"
          }</span>
        </div>
      </div>

      <div class="person-detail-actions d-grid gap-2 mt-4">
        ${
          this.currentUser === this.currentCourse.teacher &&
          name !== this.currentUser
            ? `<button class="btn btn-danger" onclick="peopleManager.removePerson('${name}', '${role}')">
            <span class="material-icons me-2">remove_circle</span>
            Remove
          </button>`
            : ""
        }
      </div>
    `;
  }

  /**
   * Generates a random join date for mock data.
   * @returns {string} A formatted date string.
   */
  generateJoinDate() {
    const dates = [
      "January 15, 2024",
      "February 28, 2024",
      "March 12, 2024",
      "April 05, 2024",
      "May 20, 2024",
    ];
    return dates[Math.floor(Math.random() * dates.length)];
  }

  /**
   * Generates a random last active time for mock data.
   * @returns {string} A string indicating last active time.
   */
  generateLastActive() {
    const activities = [
      "2 hours ago",
      "1 day ago",
      "3 days ago",
      "1 week ago",
      "2 weeks ago",
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  }

  /**
   * Generates a random assignment count for mock student data.
   * @returns {number} A random number of assignments.
   */
  generateAssignmentCount() {
    return Math.floor(Math.random() * 15) + 1;
  }

  /**
   * Displays the sort/filter modal.
   */
  showSortFilterModal() {
    if (!this.elements.sortFilterModal) return;

    const sortFilterContent = this.createSortFilterContent();
    const modalBody =
      this.elements.sortFilterModal.querySelector(".sort-filter-body");
    if (modalBody) {
      modalBody.innerHTML = sortFilterContent;
    }

    this.elements.sortFilterModal.classList.add("active");
  }

  /**
   * Hides the sort/filter modal.
   */
  hideSortFilterModal() {
    if (this.elements.sortFilterModal) {
      this.elements.sortFilterModal.classList.remove("active");
    }
  }

  /**
   * Creates the HTML content for the sort/filter modal.
   * @returns {string} HTML string for sort and filter options.
   */
  createSortFilterContent() {
    return `
      <div class="filter-section">
        <h4>Sort</h4>
        <div class="sort-options">
          <label class="sort-option">
            <input type="radio" name="sortBy" value="az" ${
              this.currentSort === "az" ? "checked" : ""
            }>
            A-Z by name
          </label>
          <label class="sort-option">
            <input type="radio" name="sortBy" value="za" ${
              this.currentSort === "za" ? "checked" : ""
            }>
            Z-A by name
          </label>
          <label class="sort-option">
            <input type="radio" name="sortBy" value="oldest" ${
              this.currentSort === "oldest" ? "checked" : ""
            }>
            Oldest first
          </label>
          <label class="sort-option">
            <input type="radio" name="sortBy" value="newest" ${
              this.currentSort === "newest" ? "checked" : ""
            }>
            Newest first
          </label>
        </div>
      </div>

      <div class="filter-section">
        <h4>Filter</h4>
        <div class="sort-options">
          <label class="sort-option">
            <input type="radio" name="filterBy" value="all" ${
              this.currentFilter === "all" ? "checked" : ""
            }>
            All Members
          </label>
          <label class="sort-option">
            <input type="radio" name="filterBy" value="active" ${
              this.currentFilter === "active" ? "checked" : ""
            }>
            Active Members
          </label>
          <label class="sort-option">
            <input type="radio" name="filterBy" value="inactive" ${
              this.currentFilter === "inactive" ? "checked" : ""
            }>
            Inactive Members
          </label>
        </div>
      </div>

      <div class="sort-filter-actions">
        <button class="modal-btn-cancel" onclick="peopleManager.hideSortFilterModal()">
          Cancel
        </button>
        <button class="modal-btn-confirm" onclick="peopleManager.applySortFilter()">
          Apply
        </button>
      </div>
    `;
  }

  /**
   * Applies the selected sort and filter options to the student list.
   */
  applySortFilter() {
    const sortBy = document.querySelector(
      'input[name="sortBy"]:checked'
    )?.value;
    const filterBy = document.querySelector(
      'input[name="filterBy"]:checked'
    )?.value;

    if (sortBy) {
      this.currentSort = sortBy;
    }
    if (filterBy) {
      this.currentFilter = filterBy;
    }

    this.renderStudents();
    this.hideSortFilterModal();
    this.showNotification("Sort and filter applied", "success");
  }

  /**
   * Applies the selected sort option to the student list directly from the dropdown.
   * @param {string} sortType - The type of sort to apply (e.g., 'az', 'za', 'oldest', 'newest').
   */
  applySort(sortType) {
    this.currentSort = sortType;
    this.renderStudents();
    this.showNotification(`Sorted by ${sortType}`, "info");
  }

  /**
   * Sends invitations to the entered email addresses with the selected role.
   */
  sendInvitations() {
    const emails = this.elements.inviteEmails?.value.trim();
    const selectedRole = document.querySelector(
      'input[name="inviteRole"]:checked'
    )?.value;

    if (!emails) {
      this.showNotification(
        "Please provide at least one email address",
        "error"
      );
      return;
    }

    const emailList = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    emailList.forEach((email) => {
      const name = email.split("@")[0].replace(/\./g, " ");
      if (selectedRole === "teacher") {
        if (!this.teachers.includes(name)) {
          this.teachers.push(name);
        }
      } else {
        if (!this.students.includes(name)) {
          this.students.push(name);
        }
      }
    });

    this.updateCourseData();
    this.renderPeopleData();
    this.hideInviteModal();

    this.showNotification(
      `${emailList.length} invitations sent successfully`,
      "success"
    );
  }

  /**
   * Updates the current course data in local storage.
   */
  updateCourseData() {
    this.currentCourse.students = this.students;
    this.currentCourse.teachers = this.teachers;

    localStorage.setItem("selectedCourse", JSON.stringify(this.currentCourse));

    const userDashboard = this.getUserDashboard();
    const courseIndex = userDashboard.courses.findIndex(
      (c) => c.id === this.currentCourse.id
    );
    if (courseIndex !== -1) {
      userDashboard.courses[courseIndex] = this.currentCourse;
      const dashboardKey = `dashboard_${this.currentUser}`;
      localStorage.setItem(dashboardKey, JSON.stringify(userDashboard));
    }
  }

  /**
   * Removes a person (teacher or student) from the class.
   * @param {string} name - The name of the person to remove.
   * @param {string} role - The role of the person ('teacher' or 'student').
   */
  removePerson(name, role) {
    if (confirm(`Are you sure you want to remove ${name} from this class?`)) {
      if (role === "teacher") {
        this.teachers = this.teachers.filter((teacher) => teacher !== name);
      } else {
        this.students = this.students.filter((student) => student !== name);
      }

      this.updateCourseData();
      this.renderPeopleData();
      if (this.personDetailBootstrapModal) {
        this.personDetailBootstrapModal.hide();
      }
      this.showNotification(`${name} removed successfully`, "success");
    }
  }

  /**
   * Generates or retrieves the class code and displays it.
   */
  generateClassCode() {
    const existingCode = this.currentCourse.classCode;
    if (existingCode) {
      if (this.elements.classCode) {
        this.elements.classCode.textContent = existingCode;
      }
      return;
    }

    const code = this.createRandomCode();
    this.currentCourse.classCode = code;
    this.updateCourseData();

    if (this.elements.classCode) {
      this.elements.classCode.textContent = code;
    }
  }

  /**
   * Creates a random 6-character alphanumeric code.
   * @returns {string} A random code.
   */
  createRandomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Copies the displayed class code to the clipboard.
   */
  copyClassCode() {
    const code = this.elements.classCode?.textContent;
    if (code) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          this.showNotification("Class code copied", "success");
        })
        .catch(() => {
          const textArea = document.createElement("textarea");
          textArea.value = code;
          document.body.appendChild(textArea);
          textArea.select();
          document.body.removeChild(textArea);
          this.showNotification("Class code copied", "success");
        });
    }
  }

  /**
   * Regenerates a new class code for the current course.
   */
  regenerateClassCode() {
    if (
      confirm(
        "Are you sure you want to generate a new class code? The old code will no longer work."
      )
    ) {
      const newCode = this.createRandomCode();
      this.currentCourse.classCode = newCode;
      this.updateCourseData();

      if (this.elements.classCode) {
        this.elements.classCode.textContent = newCode;
      }

      this.showNotification("New class code generated", "success");
    }
  }

  /**
   * Sets up tooltip functionality.
   */
  setupTooltips() {
    // Tooltip functionality can be added here if needed.
  }

  /**
   * Sets up keyboard shortcuts for modal control.
   */
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideInviteModal();
        if (this.personDetailBootstrapModal) {
          this.personDetailBootstrapModal.hide();
        }
        this.hideSortFilterModal();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        this.showInviteModal();
      }
    });
  }

  /**
   * Detects the user's preferred color scheme and applies a dark theme if applicable.
   */
  setupThemeDetection() {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    if (prefersDarkScheme.matches) {
      document.body.classList.add("dark-theme");
    }

    prefersDarkScheme.addEventListener("change", (e) => {
      if (e.matches) {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    });
  }

  /**
   * Sets up the notification system.
   */
  setupNotificationSystem() {
    // Real-time notification system setup can be added here.
  }

  /**
   * Displays a temporary notification message.
   * @param {string} message - The message to display.
   * @param {string} type - The type of notification ('success', 'error', 'info').
   */
  showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Handles window resize events to adjust layout responsiveness.
   */
  handleResize() {
    const sidebar = this.elements.sidebar;
    const contentWrapper = this.elements.contentWrapper;
    const courseTopNav = this.elements.courseTopNav;

    if (window.innerWidth <= 768) {
      sidebar.classList.remove("open");
      contentWrapper.classList.remove("sidebar-open");
      courseTopNav.classList.remove("sidebar-open");
    } else {
      if (sidebar.classList.contains("open")) {
        contentWrapper.classList.add("sidebar-open");
        courseTopNav.classList.add("sidebar-open");
      } else {
        contentWrapper.classList.remove("sidebar-open");
        courseTopNav.classList.remove("sidebar-open");
      }
    }
    this.loadEnrolledClasses();
  }
}

let peopleManager;

document.addEventListener("DOMContentLoaded", () => {
  peopleManager = new PeopleManager();
});

window.addEventListener("beforeunload", (e) => {
  if (peopleManager) {
    // No specific destroy logic needed for this class, but good practice to include.
  }
});
