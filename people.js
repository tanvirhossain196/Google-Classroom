class PeopleManager {
  constructor() {
    this.teachers = [];
    this.students = [];
    this.currentSort = "name";
    this.currentFilter = "all";
    this.isEnrolledClassesOpen = false; // New state for dropdown
    this.init();
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.loadUserData();
    this.loadCourseData();
    this.setupProfessionalFeatures();
    this.setupNotificationSystem();
    this.loadPeopleData();
    this.generateClassCode();
    this.handleResize(); // Call on init to set initial state
  }

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
      courseTopNav: document.getElementById("courseTopNav"), // Added for responsive adjustment

      // People specific elements
      invitePeopleBtn: document.getElementById("invitePeopleBtn"),
      inviteFirstPersonBtn: document.getElementById("inviteFirstPersonBtn"),
      teachersSection: document.getElementById("teachersSection"),
      studentsSection: document.getElementById("studentsSection"),
      teachersList: document.getElementById("teachersList"),
      studentsList: document.getElementById("studentsList"),
      teachersCount: document.getElementById("teachersCount"),
      studentsCount: document.getElementById("studentsCount"),
      peopleEmpty: document.getElementById("peopleEmpty"),
      peopleContent: document.getElementById("peopleContent"),

      // Modal elements
      inviteModal: document.getElementById("inviteModal"),
      closeInviteModal: document.getElementById("closeInviteModal"),
      cancelInvite: document.getElementById("cancelInvite"),
      sendInvites: document.getElementById("sendInvites"),
      inviteEmails: document.getElementById("inviteEmails"),
      classCode: document.getElementById("classCode"),
      copyCodeBtn: document.getElementById("copyCodeBtn"),
      regenerateCodeBtn: document.getElementById("regenerateCodeBtn"),

      // Sort/Filter elements
      sortStudentsBtn: document.getElementById("sortStudentsBtn"),
      filterStudentsBtn: document.getElementById("filterStudentsBtn"),
      sortFilterModal: document.getElementById("sortFilterModal"),
      closeSortFilter: document.getElementById("closeSortFilter"),

      // Person detail modal
      personDetailModal: document.getElementById("personDetailModal"),
      closePersonDetail: document.getElementById("closePersonDetail"),
      personDetailBody: document.getElementById("personDetailBody"),

      // Enrolled Classes Dropdown elements
      enrolledClassesHeader: document.getElementById("enrolledClassesHeader"),
      enrolledClassesList: document.getElementById("enrolledClasses"),
      enrolledClassesDropdownIcon: document.getElementById(
        "enrolledClassesDropdownIcon"
      ),
    };
  }

  setupEventListeners() {
    // Enhanced menu functionality
    this.elements.menuBtn.addEventListener("click", () => this.toggleSidebar());

    // Enhanced navigation
    this.elements.classesLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.goToDashboard();
    });

    this.elements.settingsLink.addEventListener("click", () =>
      this.navigateWithAnimation("settings.html")
    );

    // Enhanced resize handling
    window.addEventListener("resize", () => this.handleResize());

    // People specific event listeners
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

    // Modal event listeners
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

    // Sort/Filter event listeners
    if (this.elements.sortStudentsBtn) {
      this.elements.sortStudentsBtn.addEventListener("click", () =>
        this.showSortFilterModal()
      );
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

    // Person detail modal
    if (this.elements.closePersonDetail) {
      this.elements.closePersonDetail.addEventListener("click", () =>
        this.hidePersonDetailModal()
      );
    }

    // Close modals on backdrop click
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

    // Enrolled Classes Dropdown event listener
    if (this.elements.enrolledClassesHeader) {
      this.elements.enrolledClassesHeader.addEventListener("click", () =>
        this.toggleEnrolledClasses()
      );
    }
  }

  loadUserData() {
    this.currentUser = localStorage.getItem("currentUser");
    this.userRole = localStorage.getItem("userRole");

    if (!this.currentUser) {
      this.navigateWithAnimation("index.html");
      return;
    }

    this.setUserInitials();
  }

  loadCourseData() {
    const selectedCourse = localStorage.getItem("selectedCourse");

    if (!selectedCourse) {
      this.showErrorAndRedirect("কোন কোর্স নির্বাচিত নয়");
      return;
    }

    try {
      this.currentCourse = JSON.parse(selectedCourse);

      if (!this.currentCourse.id) {
        this.showErrorAndRedirect("কোর্স ডেটা সঠিক নয়");
        return;
      }

      this.courseId = this.currentCourse.id;
      this.updateCourseDisplay();
      this.loadEnrolledClasses();
    } catch (error) {
      this.showErrorAndRedirect("কোর্স লোড করতে সমস্যা হয়েছে");
    }
  }

  showErrorAndRedirect(message) {
    alert(message);
    this.navigateWithAnimation("dashboard.html");
  }

  setupProfessionalFeatures() {
    this.setupTooltips();
    this.setupKeyboardShortcuts();
    this.setupThemeDetection();
  }

  toggleSidebar() {
    this.elements.sidebar.classList.toggle("open");
    this.elements.contentWrapper.classList.toggle("sidebar-open");
    this.elements.courseTopNav.classList.toggle("sidebar-open"); // Adjust top nav

    // Add smooth animation effect
    this.elements.sidebar.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    this.elements.contentWrapper.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    this.elements.courseTopNav.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    // If sidebar is closed, collapse enrolled classes
    if (!this.elements.sidebar.classList.contains("open")) {
      this.isEnrolledClassesOpen = false;
      this.elements.enrolledClassesList.classList.remove("open");
      this.elements.enrolledClassesDropdownIcon.style.transform =
        "rotate(0deg)";
    }
    this.loadEnrolledClasses(); // Re-render to adjust for collapsed state
  }

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

  navigateWithAnimation(url) {
    // Add fade out animation before navigation
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.3s ease";

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }

  goToDashboard() {
    // Selected course clear করুন
    localStorage.removeItem("selectedCourse");
    this.navigateWithAnimation("dashboard.html");
  }

  setUserInitials() {
    const initial = this.currentUser.charAt(0).toUpperCase();
    if (this.elements.userInitial) {
      this.elements.userInitial.textContent = initial;
    }
  }

  updateCourseDisplay() {
    // Course title এবং section update করুন
    const courseTitle = document.getElementById("courseTitle");
    const courseSection = document.getElementById("courseSection");

    if (courseTitle) courseTitle.textContent = this.currentCourse.name;
    if (courseSection) courseSection.textContent = this.currentCourse.section;

    // Page title update করুন
    document.title = `${this.currentCourse.name} - ক্লাসরুম`;

    // Sidebar এ current course name update করুন
    if (this.elements.currentCourseName) {
      this.elements.currentCourseName.textContent = this.currentCourse.name;
    }

    // Course banner theme set করুন
    const courseBanner = document.getElementById("courseBanner");
    if (courseBanner) {
      const courseType = this.getCourseType(this.currentCourse.subject);
      courseBanner.className = `course-banner ${courseType}`;
    }

    // Course info update করুন
    this.updateCourseInfo();
  }

  getCourseType(subject) {
    if (!subject) return "science"; // default

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

    return "science"; // default
  }

  updateCourseInfo() {
    const isTeacher = this.currentCourse.teacher === this.currentUser;

    // Create additional course info section
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

    // Clear previous content
    additionalInfo.innerHTML = "";

    if (isTeacher) {
      // Teacher sees: course code, subject, room, student count
      if (this.currentCourse.code) {
        const courseCode = document.createElement("p");
        courseCode.innerHTML = `কোর্স কোড: ${this.currentCourse.code}`;
        additionalInfo.appendChild(courseCode);
      }

      if (this.currentCourse.subject) {
        const subject = document.createElement("p");
        subject.innerHTML = `বিষয়: ${this.currentCourse.subject}`;
        additionalInfo.appendChild(subject);
      }

      if (this.currentCourse.room) {
        const room = document.createElement("p");
        room.innerHTML = `রুম: ${this.currentCourse.room}`;
        additionalInfo.appendChild(room);
      }

      const studentCount = document.createElement("p");
      studentCount.innerHTML = `: ${
        this.currentCourse.students ? this.currentCourse.students.length : 0
      } জন`;
      additionalInfo.appendChild(studentCount);
    } else {
      // Student sees: subject, room, teacher name
      if (this.currentCourse.subject) {
        const subject = document.createElement("p");
        subject.innerHTML = `বিষয়: ${this.currentCourse.subject}`;
        additionalInfo.appendChild(subject);
      }

      if (this.currentCourse.room) {
        const room = document.createElement("p");
        room.innerHTML = `রুম: ${this.currentCourse.room}`;
        additionalInfo.appendChild(room);
      }

      const teacher = document.createElement("p");
      teacher.innerHTML = `শিক্ষক: ${this.currentCourse.teacher}`;
      additionalInfo.appendChild(teacher);
    }
  }

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
        // Only append text if sidebar is open
        courseItem.appendChild(courseName);
      }
      enrolledClasses.appendChild(courseItem);
    });
  }

  getUserDashboard() {
    const dashboardKey = `dashboard_${this.currentUser}`;
    return JSON.parse(localStorage.getItem(dashboardKey) || '{"courses": []}');
  }

  switchToCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    location.reload();
  }

  // People specific methods
  loadPeopleData() {
    // Load teachers and students from course data
    this.teachers = [this.currentCourse.teacher]; // Course creator is always a teacher
    this.students = this.currentCourse.students || [];

    // Add any additional teachers if they exist
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

  renderStudents() {
    if (!this.elements.studentsList) return;

    this.elements.studentsList.innerHTML = "";

    // Sort students based on current sort option
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

    // View details button
    const viewBtn = document.createElement("button");
    viewBtn.className = "action-btn";
    viewBtn.innerHTML =
      '<span class="material-icons">visibility</span> বিস্তারিত';
    viewBtn.onclick = () => this.showPersonDetails(name, role);

    // Message button
    const messageBtn = document.createElement("button");
    messageBtn.className = "action-btn";
    messageBtn.innerHTML = '<span class="material-icons">message</span> বার্তা';
    messageBtn.onclick = () => this.sendMessage(name);

    actions.appendChild(viewBtn);
    actions.appendChild(messageBtn);

    // Only show remove button for teachers and if current user is the course creator
    if (
      this.currentUser === this.currentCourse.teacher &&
      name !== this.currentUser
    ) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "action-btn";
      removeBtn.innerHTML =
        '<span class="material-icons">remove_circle</span> সরান';
      removeBtn.onclick = () => this.removePerson(name, role);
      actions.appendChild(removeBtn);
    }

    personDiv.appendChild(avatar);
    personDiv.appendChild(info);
    personDiv.appendChild(actions);

    return personDiv;
  }

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

  generateEmail(name) {
    // Generate a fake email for demonstration
    const domain = "";
    const username = name.toLowerCase().replace(/\s+/g, ".");
    return username + domain;
  }

  updateCounts() {
    if (this.elements.teachersCount) {
      this.elements.teachersCount.textContent = this.teachers.length;
    }
    if (this.elements.studentsCount) {
      this.elements.studentsCount.textContent = this.students.length;
    }
  }

  sortStudents(students) {
    switch (this.currentSort) {
      case "name":
        return students.sort((a, b) => a.localeCompare(b));
      case "recent":
        // For demonstration, we'll reverse the array to simulate recent activity
        return students.reverse();
      case "alphabetical":
        return students.sort((a, b) => a.localeCompare(b));
      default:
        return students;
    }
  }

  // Modal methods
  showInviteModal() {
    if (this.elements.inviteModal) {
      this.elements.inviteModal.classList.add("active");
    }
  }

  hideInviteModal() {
    if (this.elements.inviteModal) {
      this.elements.inviteModal.classList.remove("active");
    }
    // Clear form
    if (this.elements.inviteEmails) {
      this.elements.inviteEmails.value = "";
    }
  }

  showPersonDetails(name, role) {
    if (!this.elements.personDetailModal || !this.elements.personDetailBody)
      return;

    // Create person detail content
    const detailContent = this.createPersonDetailContent(name, role);
    this.elements.personDetailBody.innerHTML = detailContent;

    this.elements.personDetailModal.classList.add("active");
  }

  hidePersonDetailModal() {
    if (this.elements.personDetailModal) {
      this.elements.personDetailModal.classList.remove("active");
    }
  }

  createPersonDetailContent(name, role) {
    const email = this.generateEmail(name);
    const joinDate = this.generateJoinDate();
    const lastActive = this.generateLastActive();

    return `
      <div class="person-detail-profile">
        <div class="person-detail-avatar" style="background: ${this.getAvatarColor(
          name
        )}">
          ${name.charAt(0).toUpperCase()}
        </div>
        <div class="person-detail-info">
          <h3 class="person-detail-name">${name}</h3>
          <p class="person-detail-role">${role === "teacher" ? "" : ""}</p>
          <p class="person-detail-email">${email}</p>
        </div>
      </div>
      
      <div class="person-detail-stats">
        <div class="stat-item">
          <span class="stat-label">যোগদানের তারিখ:</span>
          <span class="stat-value">${joinDate}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">শেষ সক্রিয়:</span>
          <span class="stat-value">${lastActive}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">জমা দেওয়া কাজ:</span>
          <span class="stat-value">${
            role === "student" ? this.generateAssignmentCount() : "প্রযোজ্য নয়"
          }</span>
        </div>
      </div>

      <div class="person-detail-actions">
        <button class="detail-action-btn primary" onclick="peopleManager.sendMessage('${name}')">
          <span class="material-icons">message</span>
          বার্তা পাঠান
        </button>
        <button class="detail-action-btn secondary" onclick="peopleManager.viewProfile('${name}')">
          <span class="material-icons">person</span>
          প্রোফাইল দেখুন
        </button>
        ${
          this.currentUser === this.currentCourse.teacher &&
          name !== this.currentUser
            ? `<button class="detail-action-btn danger" onclick="peopleManager.removePerson('${name}', '${role}')">
            <span class="material-icons">remove_circle</span>
            সরান
          </button>`
            : ""
        }
      </div>
    `;
  }

  generateJoinDate() {
    const dates = [
      "১৫ জানুয়ারি, ২০২৪",
      "২৮ ফেব্রুয়ারি, ২০২৪",
      "১২ মার্চ, ২০২৪",
      "০৫ এপ্রিল, ২০২৪",
      "২০ মে, ২০২৪",
    ];
    return dates[Math.floor(Math.random() * dates.length)];
  }

  generateLastActive() {
    const activities = [
      "২ ঘন্টা আগে",
      "১ দিন আগে",
      "৩ দিন আগে",
      "১ সপ্তাহ আগে",
      "২ সপ্তাহ আগে",
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  }

  generateAssignmentCount() {
    return Math.floor(Math.random() * 15) + 1;
  }

  showSortFilterModal() {
    if (!this.elements.sortFilterModal) return;

    // Create sort/filter content
    const sortFilterContent = this.createSortFilterContent();
    const modalBody =
      this.elements.sortFilterModal.querySelector(".sort-filter-body");
    if (modalBody) {
      modalBody.innerHTML = sortFilterContent;
    }

    this.elements.sortFilterModal.classList.add("active");
  }

  hideSortFilterModal() {
    if (this.elements.sortFilterModal) {
      this.elements.sortFilterModal.classList.remove("active");
    }
  }

  createSortFilterContent() {
    return `
      <div class="filter-section">
        <h4>সাজান</h4>
        <div class="sort-options">
          <label class="sort-option">
            <input type="radio" name="sortBy" value="name" ${
              this.currentSort === "name" ? "checked" : ""
            }>
            নাম অনুযায়ী
          </label>
          <label class="sort-option">
            <input type="radio" name="sortBy" value="recent" ${
              this.currentSort === "recent" ? "checked" : ""
            }>
            সাম্প্রতিক কার্যকলাপ
          </label>
          <label class="sort-option">
            <input type="radio" name="sortBy" value="alphabetical" ${
              this.currentSort === "alphabetical" ? "checked" : ""
            }>
            বর্ণানুক্রমিক
          </label>
        </div>
      </div>

      <div class="filter-section">
        <h4>ফিল্টার</h4>
        <div class="sort-options">
          <label class="sort-option">
            <input type="radio" name="filterBy" value="all" ${
              this.currentFilter === "all" ? "checked" : ""
            }>
            সকল সদস্য
          </label>
          <label class="sort-option">
            <input type="radio" name="filterBy" value="active" ${
              this.currentFilter === "active" ? "checked" : ""
            }>
            সক্রিয় সদস্য
          </label>
          <label class="sort-option">
            <input type="radio" name="filterBy" value="inactive" ${
              this.currentFilter === "inactive" ? "checked" : ""
            }>
            নিষ্ক্রিয় সদস্য
          </label>
        </div>
      </div>

      <div class="sort-filter-actions">
        <button class="modal-btn-cancel" onclick="peopleManager.hideSortFilterModal()">
          বাতিল করুন
        </button>
        <button class="modal-btn-confirm" onclick="peopleManager.applySortFilter()">
          প্রয়োগ করুন
        </button>
      </div>
    `;
  }

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
    this.showNotification("সাজানো এবং ফিল্টার প্রয়োগ করা হয়েছে", "success");
  }

  // Action methods
  sendInvitations() {
    const emails = this.elements.inviteEmails?.value.trim();
    const selectedRole = document.querySelector(
      'input[name="inviteRole"]:checked'
    )?.value;

    if (!emails) {
      this.showNotification(
        "অনুগ্রহ করে কমপক্ষে একটি ইমেইল ঠিকানা দিন",
        "error"
      );
      return;
    }

    // Simulate sending invitations
    const emailList = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    // Add to appropriate list (for demonstration)
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

    // Update course data
    this.updateCourseData();
    this.renderPeopleData();
    this.hideInviteModal();

    this.showNotification(
      `${emailList.length}টি আমন্ত্রণ সফলভাবে পাঠানো হয়েছে`,
      "success"
    );
  }

  updateCourseData() {
    // Update the course data in localStorage
    this.currentCourse.students = this.students;
    this.currentCourse.teachers = this.teachers;

    localStorage.setItem("selectedCourse", JSON.stringify(this.currentCourse));

    // Also update in user dashboard
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

  sendMessage(name) {
    // Simulate sending a message
    this.showNotification(`${name} কে বার্তা পাঠানোর জন্য প্রস্তুত`, "info");
    this.hidePersonDetailModal();
  }

  viewProfile(name) {
    // Simulate viewing profile
    this.showNotification(`${name} এর প্রোফাইল দেখানো হচ্ছে`, "info");
    this.hidePersonDetailModal();
  }

  removePerson(name, role) {
    if (confirm(`আপনি কি নিশ্চিত যে ${name} কে এই ক্লাস থেকে সরাতে চান?`)) {
      if (role === "teacher") {
        this.teachers = this.teachers.filter((teacher) => teacher !== name);
      } else {
        this.students = this.students.filter((student) => student !== name);
      }

      this.updateCourseData();
      this.renderPeopleData();
      this.hidePersonDetailModal();
      this.showNotification(`${name} কে সফলভাবে সরানো হয়েছে`, "success");
    }
  }

  // Class code methods
  generateClassCode() {
    const existingCode = this.currentCourse.classCode;
    if (existingCode) {
      if (this.elements.classCode) {
        this.elements.classCode.textContent = existingCode;
      }
      return;
    }

    // Generate new class code
    const code = this.createRandomCode();
    this.currentCourse.classCode = code;
    this.updateCourseData();

    if (this.elements.classCode) {
      this.elements.classCode.textContent = code;
    }
  }

  createRandomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  copyClassCode() {
    const code = this.elements.classCode?.textContent;
    if (code) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          this.showNotification("ক্লাস কোড কপি করা হয়েছে", "success");
        })
        .catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = code;
          document.body.appendChild(textArea);
          textArea.select();
          document.body.removeChild(textArea);
          this.showNotification("ক্লাস কোড কপি করা হয়েছে", "success");
        });
    }
  }

  regenerateClassCode() {
    if (
      confirm(
        "আপনি কি নিশ্চিত যে নতুন ক্লাস কোড তৈরি করতে চান? পুরানো কোডটি আর কাজ করবে না।"
      )
    ) {
      const newCode = this.createRandomCode();
      this.currentCourse.classCode = newCode;
      this.updateCourseData();

      if (this.elements.classCode) {
        this.elements.classCode.textContent = newCode;
      }

      this.showNotification("নতুন ক্লাস কোড তৈরি করা হয়েছে", "success");
    }
  }

  // Utility methods
  setupTooltips() {
    // Enhanced tooltip functionality
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Escape to close modals
      if (e.key === "Escape") {
        this.hideInviteModal();
        this.hidePersonDetailModal();
        this.hideSortFilterModal();
      }

      // Ctrl/Cmd + I to open invite modal
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        this.showInviteModal();
      }
    });
  }

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

  setupNotificationSystem() {
    // Real-time notification system setup
  }

  showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  handleResize() {
    // Enhanced responsive behavior
    const sidebar = this.elements.sidebar;
    const contentWrapper = this.elements.contentWrapper;
    const courseTopNav = this.elements.courseTopNav;

    if (window.innerWidth <= 768) {
      // Adjusted breakpoint for mobile
      sidebar.classList.remove("open");
      contentWrapper.classList.remove("sidebar-open");
      courseTopNav.classList.remove("sidebar-open");
    } else {
      // For larger screens, ensure correct positioning if sidebar is open
      if (sidebar.classList.contains("open")) {
        contentWrapper.classList.add("sidebar-open");
        courseTopNav.classList.add("sidebar-open");
      } else {
        contentWrapper.classList.remove("sidebar-open");
        courseTopNav.classList.remove("sidebar-open");
      }
    }
    this.loadEnrolledClasses(); // Re-render to adjust for collapsed state on resize
  }

  // Advanced people management methods
  searchPeople(query) {
    const allPeople = [...this.teachers, ...this.students];
    return allPeople.filter((person) =>
      person.toLowerCase().includes(query.toLowerCase())
    );
  }

  exportPeopleList() {
    const peopleData = {
      course: this.currentCourse.name,
      teachers: this.teachers,
      students: this.students,
      exportDate: new Date().toLocaleDateString("bn-BD"),
    };

    const dataStr = JSON.stringify(peopleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${this.currentCourse.name}_people_list.json`;
    link.click();

    this.showNotification("সদস্য তালিকা ডাউনলোড করা হয়েছে", "success");
  }

  importPeopleList(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.teachers && Array.isArray(data.teachers)) {
          data.teachers.forEach((teacher) => {
            if (!this.teachers.includes(teacher)) {
              this.teachers.push(teacher);
            }
          });
        }

        if (data.students && Array.isArray(data.students)) {
          data.students.forEach((student) => {
            if (!this.students.includes(student)) {
              this.students.push(student);
            }
          });
        }

        this.updateCourseData();
        this.renderPeopleData();
        this.showNotification(
          "সদস্য তালিকা সফলভাবে আমদানি করা হয়েছে",
          "success"
        );
      } catch (error) {
        this.showNotification("ফাইল আমদানিতে সমস্যা হয়েছে", "error");
      }
    };
    reader.readAsText(file);
  }

  bulkInvite(emailList) {
    // Enhanced bulk invitation functionality
    const validEmails = emailList.filter((email) => this.validateEmail(email));
    const invalidEmails = emailList.filter(
      (email) => !this.validateEmail(email)
    );

    if (invalidEmails.length > 0) {
      this.showNotification(
        `${invalidEmails.length}টি অবৈধ ইমেইল ঠিকানা পাওয়া গেছে`,
        "error"
      );
      return false;
    }

    // Process valid emails
    validEmails.forEach((email) => {
      const name = this.extractNameFromEmail(email);
      if (!this.students.includes(name)) {
        this.students.push(name);
      }
    });

    this.updateCourseData();
    this.renderPeopleData();
    this.showNotification(
      `${validEmails.length}টি আমন্ত্রণ সফলভাবে পাঠানো হয়েছে`,
      "success"
    );
    return true;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  extractNameFromEmail(email) {
    return email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Analytics and reporting
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

  calculateAverageNameLength() {
    const allNames = [...this.teachers, ...this.students];
    const totalLength = allNames.reduce((sum, name) => sum + name.length, 0);
    return (totalLength / allNames.length).toFixed(1);
  }

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

  // Accessibility enhancements
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

  announceToScreenReader(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  // Performance optimizations
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

  // Lazy loading for large lists
  setupVirtualScrolling() {
    if (this.students.length > 100) {
      this.renderStudentsVirtual();
    }
  }

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

  // Error handling and recovery
  handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    this.showNotification(
      `একটি সমস্যা হয়েছে: ${context}। অনুগ্রহ করে আবার চেষ্টা করুন।`,
      "error"
    );
  }

  // Cleanup and memory management
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

  // Auto-refresh functionality
  setupAutoRefresh() {
    this.refreshTimer = setInterval(() => {
      this.loadPeopleData();
    }, 30000);
  }

  // Offline support
  setupOfflineSupport() {
    window.addEventListener("online", () => {
      this.showNotification("ইন্টারনেট সংযোগ পুনরুদ্ধার হয়েছে", "success");
      this.syncOfflineChanges();
    });

    window.addEventListener("offline", () => {
      this.showNotification("ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে", "info");
    });
  }

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
