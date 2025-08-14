class PeopleManager {
  constructor() {
    this.teachers = [];
    this.students = [];
    this.currentSort = "name";
    this.currentFilter = "all";
    this.isEnrolledClassesOpen = false;
    this.init();
  }

  /**
   * Initializes the PeopleManager, setting up user data, course data, and event listeners.
   */
  init() {
    this.currentUser = localStorage.getItem("currentUser");
    this.userRole = localStorage.getItem("userRole");

    if (!this.currentUser || this.userRole !== "student") {
      window.location.href = "index.html";
      return;
    }

    if (!localStorage.getItem("selectedCourse")) {
      const dummyCourse = {
        id: "course123",
        name: "Advanced Math",
        section: "Section A",
        teacher: "Teacher User",
        students: ["Student One", "Student Two", this.currentUser],
        subject: "Math",
        room: "101",
        code: "MATH101",
      };
      localStorage.setItem("selectedCourse", JSON.stringify(dummyCourse));
      let studentDashboard = JSON.parse(
        localStorage.getItem(`dashboard_${this.currentUser}`) ||
          '{"courses": []}'
      );
      if (!studentDashboard.courses.find((c) => c.id === dummyCourse.id)) {
        studentDashboard.courses.push(dummyCourse);
        localStorage.setItem(
          `dashboard_${this.currentUser}`,
          JSON.stringify(studentDashboard)
        );
      }
    }

    this.setupElements();
    this.setupEventListeners();
    this.loadUserData();
    this.loadCourseData();
    this.setupProfessionalFeatures();
    this.setupNotificationSystem();
    this.loadPeopleData();
    this.handleResize();

    this.hideTeacherSpecificElements();
  }

  /**
   * Sets up references to all necessary DOM elements.
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
      studentsCount: document.getElementById("studentsCount"), // This is the old one, keeping for now
      liveStudentsCount: document.getElementById("liveStudentsCount"), // New element for live count
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

      sortFilterModal: document.getElementById("sortFilterModal"),
      closeSortFilter: document.getElementById("closeSortFilter"),

      personDetailModal: document.getElementById("personDetailModal"),
      closePersonDetail: document.getElementById("closePersonDetail"),
      personDetailBody: document.getElementById("personDetailBody"),
      detailAvatar: document.getElementById("detailAvatar"),
      detailName: document.getElementById("detailName"),
      detailRole: document.getElementById("detailRole"),
      detailEmail: document.getElementById("detailEmail"),
      detailJoinDate: document.getElementById("detailJoinDate"),
      detailLastActive: document.getElementById("detailLastActive"),
      detailAssignments: document.getElementById("detailAssignments"),

      sortByName: document.getElementById("sortByName"),
      sortByRecent: document.getElementById("sortByRecent"),
      sortByAlphabetical: document.getElementById("sortByAlphabetical"),
      filterByAll: document.getElementById("filterByAll"),
      filterByActive: document.getElementById("filterByActive"),
      filterByInactive: document.getElementById("filterByInactive"),

      enrolledClassesHeader: document.getElementById("enrolledClassesHeader"),
      enrolledClassesList: document.getElementById("enrolledClasses"),
      enrolledClassesDropdownIcon: document.getElementById(
        "enrolledClassesDropdownIcon"
      ),
    };
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

    window.addEventListener("resize", () => this.handleResize());

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

    if (this.elements.closeSortFilter) {
      this.elements.closeSortFilter.addEventListener("click", () =>
        this.hideSortFilterModal()
      );
    }

    if (this.elements.closePersonDetail) {
      this.elements.closePersonDetail.addEventListener("click", () =>
        this.hidePersonDetailModal()
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

    if (this.elements.personDetailModal) {
      this.elements.personDetailModal.addEventListener("click", (e) => {
        if (e.target === this.elements.personDetailModal) {
          this.hidePersonDetailModal();
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
   * Hides elements that are specific to teacher functionality.
   */
  hideTeacherSpecificElements() {
    if (this.elements.invitePeopleBtn) {
      this.elements.invitePeopleBtn.style.display = "none";
    }
    if (this.elements.inviteFirstPersonBtn) {
      this.elements.inviteFirstPersonBtn.style.display = "none";
    }
    if (this.elements.inviteModal) {
      this.elements.inviteModal.style.display = "none";
    }
  }

  /**
   * Loads user data from local storage and sets user initials.
   */
  loadUserData() {
    if (!this.currentUser) {
      this.navigateWithAnimation("index.html");
      return;
    }

    this.setUserInitials();
  }

  /**
   * Loads the selected course data from local storage.
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
   * Displays an error message and redirects to the student dashboard.
   * @param {string} message - The error message to display.
   */
  showErrorAndRedirect(message) {
    alert(message);
    window.location.href = "student.html";
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
   * Toggles the visibility and width of the sidebar.
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
   * Navigates to a given URL with a fade-out animation.
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
   * Navigates back to the student dashboard.
   */
  goToDashboard() {
    this.navigateWithAnimation("student.html");
  }

  /**
   * Sets the user's initials in the avatar display.
   */
  setUserInitials() {
    const initial = this.currentUser.charAt(0).toUpperCase();
    if (this.elements.userInitial) {
      this.elements.userInitial.textContent = initial;
    }
  }

  /**
   * Updates the display of the current course information.
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
   * Determines the CSS class for the course banner based on the subject.
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
    const isTeacher = false;

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
      studentCount.innerHTML = `: ${
        this.currentCourse.students ? this.currentCourse.students.length : 0
      } members`;
      additionalInfo.appendChild(studentCount);
    } else {
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

      const teacher = document.createElement("p");
      teacher.innerHTML = `Teacher: ${this.currentCourse.teacher}`;
      additionalInfo.appendChild(teacher);
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
   * Loads teacher and student data for the current course.
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
   * Renders the teacher and student lists based on loaded data.
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
   * Renders the list of students, applying current sort and filter options.
   */
  renderStudents() {
    if (!this.elements.studentsList) return;

    this.elements.studentsList.innerHTML = "";

    const sortedStudents = this.sortStudents([...this.students]);

    sortedStudents.forEach((student, index) => {
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
   * @returns {HTMLElement} The created person element.
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
    roleElement.textContent = role === "teacher" ? "" : "";

    const emailElement = document.createElement("div");
    emailElement.className = "person-email";
    emailElement.textContent = this.generateEmail(name);

    info.appendChild(nameElement);
    info.appendChild(roleElement);
    info.appendChild(emailElement);

    const actions = document.createElement("div");
    actions.className = "person-actions";

    personDiv.appendChild(avatar);
    personDiv.appendChild(info);
    personDiv.appendChild(actions);

    return personDiv;
  }

  /**
   * Generates a consistent background color for a person's avatar based on their name.
   * @param {string} name - The name of the person.
   * @returns {string} A CSS linear-gradient string for the avatar background.
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
   * Generates a fake email address for a given name.
   * @param {string} name - The name of the person.
   * @returns {string} A generated email address.
   */
  generateEmail(name) {
    const domain = "";
    const username = name.toLowerCase().replace(/\s+/g, ".");
    return username + domain;
  }

  /**
   * Updates the displayed counts of teachers and students.
   */
  updateCounts() {
    if (this.elements.teachersCount) {
      this.elements.teachersCount.textContent = this.teachers.length;
    }
    if (this.elements.liveStudentsCount) {
      this.elements.liveStudentsCount.textContent = this.students.length;
    }
  }

  /**
   * Sorts a list of students based on the current sort option.
   * @param {Array<string>} students - The array of student names to sort.
   * @returns {Array<string>} The sorted array of student names.
   */
  sortStudents(students) {
    switch (this.currentSort) {
      case "name":
        return students.sort((a, b) => a.localeCompare(b));
      case "recent":
        return students.reverse();
      case "alphabetical":
        return students.sort((a, b) => a.localeCompare(b));
      default:
        return students;
    }
  }

  /**
   * Displays the invite modal (not functional for students).
   */
  showInviteModal() {
    this.showNotification("Invite functionality for teachers", "info");
  }

  /**
   * Hides the invite modal (not functional for students).
   */
  hideInviteModal() {}

  /**
   * Displays the person detail modal with information about a specific person.
   * @param {string} name - The name of the person.
   * @param {string} role - The role of the person.
   */
  showPersonDetails(name, role) {
    if (!this.elements.personDetailModal || !this.elements.personDetailBody)
      return;

    this.elements.detailAvatar.textContent = name.charAt(0).toUpperCase();
    this.elements.detailAvatar.style.background = this.getAvatarColor(name);
    this.elements.detailName.textContent = name;
    this.elements.detailRole.textContent = role === "teacher" ? "" : "";
    this.elements.detailEmail.textContent = this.generateEmail(name);
    this.elements.detailJoinDate.textContent = this.generateJoinDate();
    this.elements.detailLastActive.textContent = this.generateLastActive();
    this.elements.detailAssignments.textContent =
      role === "student" ? this.generateAssignmentCount() : "N/A";

    this.elements.personDetailModal.classList.add("active");
  }

  /**
   * Hides the person detail modal.
   */
  hidePersonDetailModal() {
    if (this.elements.personDetailModal) {
      this.elements.personDetailModal.classList.remove("active");
    }
  }

  /**
   * Generates a random join date for demonstration purposes.
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
   * Generates a random last active time for demonstration purposes.
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
   * Generates a random number of submitted assignments for demonstration purposes.
   * @returns {number} A random integer representing assignment count.
   */
  generateAssignmentCount() {
    return Math.floor(Math.random() * 15) + 1;
  }

  /**
   * Displays the sort and filter modal.
   */
  showSortFilterModal() {
    if (!this.elements.sortFilterModal) return;

    if (this.elements.sortByName)
      this.elements.sortByName.checked = this.currentSort === "name";
    if (this.elements.sortByRecent)
      this.elements.sortByRecent.checked = this.currentSort === "recent";
    if (this.elements.sortByAlphabetical)
      this.elements.sortByAlphabetical.checked =
        this.currentSort === "alphabetical";

    if (this.elements.filterByAll)
      this.elements.filterByAll.checked = this.currentFilter === "all";
    if (this.elements.filterByActive)
      this.elements.filterByActive.checked = this.currentFilter === "active";
    if (this.elements.filterByInactive)
      this.elements.filterByInactive.checked =
        this.currentFilter === "inactive";

    this.elements.sortFilterModal.classList.add("active");
  }

  /**
   * Hides the sort and filter modal.
   */
  hideSortFilterModal() {
    if (this.elements.sortFilterModal) {
      this.elements.sortFilterModal.classList.remove("active");
    }
  }

  /**
   * Applies the selected sort and filter options and re-renders the student list.
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
   * Simulates sending invitations (not allowed for students).
   */
  sendInvitations() {
    this.showNotification(
      "Students are not allowed to send invitations",
      "error"
    );
  }

  /**
   * Updates course data in local storage (minimal functionality for students).
   */
  updateCourseData() {
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
   * Simulates sending a message to a person.
   * @param {string} name - The name of the person to message.
   */
  sendMessage(name) {
    this.showNotification(`Ready to send message to ${name}`, "info");
    this.hidePersonDetailModal();
  }

  /**
   * Simulates viewing a person's profile.
   * @param {string} name - The name of the person whose profile to view.
   */
  viewProfile(name) {
    this.showNotification(`Showing profile of ${name}`, "info");
    this.hidePersonDetailModal();
  }

  /**
   * Simulates removing a person (not allowed for students).
   * @param {string} name - The name of the person to remove.
   * @param {string} role - The role of the person.
   */
  removePerson(name, role) {
    this.showNotification(
      "Students are not allowed to remove members",
      "error"
    );
  }

  /**
   * Placeholder for generating class code (not applicable for students).
   */
  generateClassCode() {}

  /**
   * Placeholder for creating a random code (not applicable for students).
   * @returns {string} An empty string.
   */
  createRandomCode() {
    return "";
  }

  /**
   * Simulates copying class code (not applicable for students).
   */
  copyClassCode() {
    this.showNotification(
      "Students are not allowed to copy class code",
      "error"
    );
  }

  /**
   * Simulates regenerating class code (not applicable for students).
   */
  regenerateClassCode() {
    this.showNotification(
      "Students are not allowed to regenerate class code",
      "error"
    );
  }

  /**
   * Sets up tooltip functionality.
   */
  setupTooltips() {}

  /**
   * Sets up keyboard shortcuts for modal control.
   */
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideInviteModal();
        this.hidePersonDetailModal();
        this.hideSortFilterModal();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        this.showNotification(
          "Invite functionality not available for students",
          "info"
        );
      }
    });
  }

  /**
   * Detects user's preferred color scheme and applies dark theme if necessary.
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
   * Sets up a real-time notification system.
   */
  setupNotificationSystem() {}

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
   * Handles responsive adjustments based on window size.
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

  /**
   * Searches for people (teachers or students) based on a query.
   * @param {string} query - The search query.
   * @returns {Array<string>} An array of matching person names.
   */
  searchPeople(query) {
    const allPeople = [...this.teachers, ...this.students];
    return allPeople.filter((person) =>
      person.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Simulates exporting the people list (not allowed for students).
   */
  exportPeopleList() {
    this.showNotification(
      "Students are not allowed to download member list",
      "error"
    );
  }

  /**
   * Simulates importing a people list (not allowed for students).
   * @param {File} file - The file to import.
   */
  importPeopleList(file) {
    this.showNotification(
      "Students are not allowed to import member list",
      "error"
    );
  }

  /**
   * Simulates bulk inviting people (not allowed for students).
   * @param {string} emailList - A comma-separated string of emails.
   * @returns {boolean} Always returns false.
   */
  bulkInvite(emailList) {
    this.showNotification(
      "Students are not allowed to send bulk invitations",
      "error"
    );
    return false;
  }

  /**
   * Validates an email address format.
   * @param {string} email - The email address to validate.
   * @returns {boolean} True if the email is valid, false otherwise.
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Extracts a capitalized name from an email address.
   * @param {string} email - The email address.
   * @returns {string} The extracted name.
   */
  extractNameFromEmail(email) {
    return email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Gathers analytics data about the people in the class.
   * @returns {object} An object containing various analytics metrics.
   */
  getPeopleAnalytics() {
    return {
      totalPeople: this.teachers.length + this.students.length,
      teacherCount: this.teachers.length,
      studentCount: this.students.length,
      teacherPercentage: (
        (this.teachers.length / (this.teachers.length + this.students.length)) *
        100
      ).toFixed(1),
      studentPercentage: (
        (this.students.length / (this.teachers.length + this.students.length)) *
        100
      ).toFixed(1),
      averageNameLength: this.calculateAverageNameLength(),
      mostCommonFirstLetter: this.getMostCommonFirstLetter(),
    };
  }

  /**
   * Calculates the average length of names among all members.
   * @returns {string} The average name length, formatted to one decimal place.
   */
  calculateAverageNameLength() {
    const allNames = [...this.teachers, ...this.students];
    const totalLength = allNames.reduce((sum, name) => sum + name.length, 0);
    return (totalLength / allNames.length).toFixed(1);
  }

  /**
   * Finds the most common first letter among all member names.
   * @returns {string} The most common first letter.
   */
  getMostCommonFirstLetter() {
    const allNames = [...this.teachers, ...this.students];
    const letterCount = {};

    allNames.forEach((name) => {
      const firstLetter = name.charAt(0).toUpperCase();
      letterCount[firstLetter] = (letterCount[firstLetter] || 0) + 1;
    });

    return Object.keys(letterCount).reduce((a, b) =>
      letterCount[a] > letterCount[b] ? a : b
    );
  }

  /**
   * Sets up accessibility features for the people list.
   */
  setupAccessibility() {
    const peopleList = document.querySelectorAll(".person-item");
    peopleList.forEach((item, index) => {
      item.setAttribute("role", "listitem");
      item.setAttribute("aria-label", `Person ${index + 1}`);
      item.setAttribute("tabindex", "0");

      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const viewBtn = item.querySelector(".action-btn");
          if (viewBtn) viewBtn.click();
        }
      });
    });

    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    document.body.appendChild(announcer);
    this.announcer = announcer;
  }

  /**
   * Announces a message to screen readers.
   * @param {string} message - The message to announce.
   */
  announceToScreenReader(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  /**
   * Debounces a function call to limit its execution rate.
   * @param {Function} func - The function to debounce.
   * @param {number} wait - The debounce time in milliseconds.
   * @returns {Function} The debounced function.
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Sets up virtual scrolling for large student lists.
   */
  setupVirtualScrolling() {
    if (this.students.length > 100) {
      this.renderStudentsVirtual();
    }
  }

  /**
   * Renders students using virtual scrolling for performance optimization.
   */
  renderStudentsVirtual() {
    const container = this.elements.studentsList;
    const itemHeight = 80;
    const containerHeight = container.clientHeight;
    const visibleItems = Math.ceil(containerHeight / itemHeight) + 2;

    let scrollTop = 0;
    let startIndex = 0;

    const updateVisibleItems = () => {
      startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + visibleItems,
        this.students.length
      );

      container.innerHTML = "";
      container.style.height = `${this.students.length * itemHeight}px`;
      container.style.paddingTop = `${startIndex * itemHeight}px`;

      for (let i = startIndex; i < endIndex; i++) {
        const studentElement = this.createPersonElement(
          this.students[i],
          "student",
          i
        );
        container.appendChild(studentElement);
      }
    };

    container.addEventListener(
      "scroll",
      this.debounce(() => {
        scrollTop = container.scrollTop;
        updateVisibleItems();
      }, 16)
    );

    updateVisibleItems();
  }

  /**
   * Handles errors by logging and displaying a notification.
   * @param {Error} error - The error object.
   * @param {string} context - The context where the error occurred.
   */
  handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    this.showNotification(
      `An issue occurred: ${context}. Please try again.`,
      "error"
    );
  }

  /**
   * Cleans up event listeners and timers before the page unloads.
   */
  destroy() {
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("keydown", this.setupKeyboardShortcuts);

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
    }
  }

  /**
   * Sets up auto-refresh functionality for people data.
   */
  setupAutoRefresh() {
    this.refreshTimer = setInterval(() => {
      this.loadPeopleData();
    }, 30000);
  }

  /**
   * Sets up offline support by listening for online/offline events.
   */
  setupOfflineSupport() {
    window.addEventListener("online", () => {
      this.showNotification("Internet connection restored", "success");
      this.syncOfflineChanges();
    });

    window.addEventListener("offline", () => {
      this.showNotification("Internet connection disconnected", "info");
    });
  }

  /**
   * Synchronizes offline changes to the people data.
   */
  syncOfflineChanges() {
    const offlineChanges = localStorage.getItem("offline_people_changes");
    if (offlineChanges) {
      try {
        const changes = JSON.parse(offlineChanges);
        this.processOfflineChanges(changes);
        localStorage.removeItem("offline_people_changes");
      } catch (error) {
        this.handleError(error, "offline sync");
      }
    }
  }

  /**
   * Processes a list of offline changes to update people data.
   * @param {Array<object>} changes - An array of change objects.
   */
  processOfflineChanges(changes) {
    changes.forEach((change) => {
      switch (change.type) {
        case "add_student":
          if (!this.students.includes(change.name)) {
            this.students.push(change.name);
          }
          break;
        case "remove_student":
          this.students = this.students.filter((s) => s !== change.name);
          break;
        case "add_teacher":
          if (!this.teachers.includes(change.name)) {
            this.teachers.push(change.name);
          }
          break;
        case "remove_teacher":
          this.teachers = this.teachers.filter((t) => t !== change.name);
          break;
      }
    });

    this.updateCourseData();
    this.renderPeopleData();
  }
}

let peopleManager;

document.addEventListener("DOMContentLoaded", () => {
  peopleManager = new PeopleManager();
});

window.addEventListener("beforeunload", (e) => {
  if (peopleManager) {
    peopleManager.destroy();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

window.addEventListener("load", () => {
  if (window.performance && window.performance.getEntriesByType) {
    const navigationEntries = window.performance.getEntriesByType("navigation");
    if (navigationEntries.length > 0) {
      console.log(
        "Page load time:",
        navigationEntries[0].loadEventEnd - navigationEntries[0].loadEventStart,
        "ms"
      );
    }
  }
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = PeopleManager;
}
