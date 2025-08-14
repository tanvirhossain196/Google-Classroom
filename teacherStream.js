// teacherStream.js
class StreamManager {
  constructor() {
    this.attachments = [];
    this.availableCourses = [];
    this.availableStudents = [];
    this.selectedCourses = [];
    this.assignToAll = true;
    this.isAnnouncementExpanded = false;
    this.currentEditingId = null;
    this.pendingDeleteId = null;
    this.isCourseCodeExpanded = false;
    this.init();
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.loadUserData();
    this.loadCourseData();
    this.setupProfessionalFeatures();
    this.loadPosts();
    this.setupNotificationSystem();
    this.loadAvailableCoursesAndStudents();
    this.loadUpcomingAssignments();
    this.initializeAnnouncementEditorState();
    this.populateAnnouncementCourseDropdown(); // New: Populate announcement dropdown
  }

  setupElements() {
    this.elements = {
      menuBtn: document.getElementById("menuBtn"),
      sidebar: document.getElementById("sidebar"),
      contentWrapper: document.getElementById("contentWrapper"),
      courseTopNav: document.getElementById("courseTopNav"),
      announcementPlaceholder: document.getElementById(
        "announcementPlaceholder"
      ),
      announcementEditorExpanded: document.getElementById(
        "announcementEditorExpanded"
      ),
      announcementActions: document.getElementById("announcementActions"),
      announcementHeader: document.getElementById("announcementHeader"),
      editorContent: document.getElementById("editorContent"),
      userInitial: document.getElementById("userInitial"),
      streamPosts: document.getElementById("streamPosts"),
      noPosts: document.getElementById("noPosts"),
      classesLink: document.getElementById("classesLink"),
      settingsLink: document.getElementById("settingsLink"),
      currentCourseName: document.getElementById("currentCourseName"),
      courseHeaderSection: document.querySelector(".course-header-section"),
      courseCodeText: document.getElementById("courseCodeText"),
      courseCodeDisplay: document.getElementById("courseCodeDisplay"),
      // Removed courseCodeMenuBtn as per requirement 1
      // Removed courseCodeDropdown as per requirement 1
      courseCodeLarge: document.getElementById("courseCodeLarge"),
      selectedCourse: document.getElementById("selectedCourse"),
      announcementCourseDropdown: document.getElementById(
        "announcementCourseDropdown"
      ), // New: Announcement course dropdown
      attachedFilesDisplay: document.getElementById("attachedFilesDisplay"),
      attachedFilesList: document.getElementById("attachedFilesList"),
      upcomingContent: document.getElementById("upcomingContent"),
      studentSelectorModal: document.getElementById("studentSelectorModal"),
      allStudentsRadio: document.getElementById("allStudents"),
      specificStudentsRadio: document.getElementById("specificStudents"),
      specificStudentsList: document.getElementById("specificStudentsList"),
      enrolledClassesDropdownToggle: document.getElementById(
        "enrolledClassesDropdownToggle"
      ),
      enrolledClasses: document.getElementById("enrolledClasses"),
      confirmationModal: document.getElementById("confirmationModal"),
      confirmationMessage: document.getElementById("confirmationMessage"),
      confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
    };
  }

  setupEventListeners() {
    this.elements.menuBtn.addEventListener("click", () => this.toggleSidebar());

    this.elements.classesLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.navigateWithAnimation("teacher.html");
    });

    this.elements.settingsLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.navigateWithAnimation("teacherSettings.html");
    });

    // Requirement 1: Add copy icon functionality directly to courseCodeDisplay
    if (this.elements.courseCodeDisplay) {
      this.elements.courseCodeDisplay.addEventListener("click", (e) => {
        // Ensure click is not on the copy button itself, as it has its own handler
        if (!e.target.closest(".course-code-copy-btn")) {
          this.copyCourseCode();
        }
      });
    }

    // Enhanced announcement card click handling
    if (this.elements.announcementPlaceholder) {
      this.elements.announcementPlaceholder.addEventListener("click", (e) => {
        e.stopPropagation();
        this.expandAnnouncement();
      });
    }

    // Make entire announcement card clickable when collapsed
    const announcementCard = document.querySelector(".announcement-input-card");
    if (announcementCard) {
      announcementCard.addEventListener("click", (e) => {
        // Only expand if clicked when collapsed and not clicking on buttons
        if (!this.isAnnouncementExpanded && !e.target.closest("button")) {
          e.stopPropagation();
          this.expandAnnouncement();
        }
      });
    }

    // Enhanced click outside detection
    document.addEventListener("click", (e) => this.handleClickOutside(e));
    window.addEventListener("resize", () => this.handleResize());

    this.setupRichTextEditor();
    this.setupAnnouncementButtons(); // New method for button setup

    if (this.elements.allStudentsRadio) {
      this.elements.allStudentsRadio.addEventListener("change", () =>
        this.toggleSpecificStudentsList()
      );
    }
    if (this.elements.specificStudentsRadio) {
      this.elements.specificStudentsRadio.addEventListener("change", () =>
        this.toggleSpecificStudentsList()
      );
    }

    if (this.elements.enrolledClassesDropdownToggle) {
      this.elements.enrolledClassesDropdownToggle.addEventListener(
        "click",
        () => this.toggleEnrolledClassesDropdown()
      );
    }

    if (this.elements.confirmDeleteBtn) {
      this.elements.confirmDeleteBtn.addEventListener("click", () =>
        this.confirmDelete()
      );
    }
  }

  setupAnnouncementButtons() {
    // Setup cancel button
    const cancelBtn = document.querySelector(".cancel-btn");
    if (cancelBtn) {
      // Remove any existing listeners
      cancelBtn.removeEventListener("click", this.handleCancelClick);

      // Add new listener
      this.handleCancelClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Cancel button clicked");
        this.cancelAnnouncement();
      };

      cancelBtn.addEventListener("click", this.handleCancelClick);
    }

    // Setup post button
    const postBtn = document.querySelector(".post-btn");
    if (postBtn) {
      // Remove any existing listeners
      postBtn.removeEventListener("click", this.handlePostClick);

      // Add new listener
      this.handlePostClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Post button clicked");

        // Prevent multiple clicks
        if (postBtn.disabled) {
          console.log("Post button is disabled, ignoring click");
          return;
        }

        this.postAnnouncement();
      };

      postBtn.addEventListener("click", this.handlePostClick);
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
      console.log("Course loaded with ID:", this.courseId);
      console.log("Current course:", this.currentCourse);

      this.updateCourseDisplay();
      this.loadEnrolledClasses();
    } catch (error) {
      console.error("Error loading course data:", error);
      this.showErrorAndRedirect("কোর্স লোড করতে সমস্যা হয়েছে");
    }
  }

  showErrorAndRedirect(message) {
    alert(message);
    this.navigateWithAnimation("teacherStream.html");
  }

  setupProfessionalFeatures() {
    this.setupTooltips();
    this.setupKeyboardShortcuts();
    this.setupAutoSave();
    this.setupThemeDetection();
    this.setupProgressIndicators();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
  }

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
  }

  navigateWithAnimation(url) {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.3s ease";

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }

  goToDashboard() {
    localStorage.removeItem("selectedCourse");
    this.navigateWithAnimation("teacher.html");
  }

  loadUpcomingAssignments() {
    const assignmentsKey = `assignments_${this.courseId}`;
    const assignments = JSON.parse(
      localStorage.getItem(assignmentsKey) || "[]"
    );

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingAssignments = assignments.filter((assignment) => {
      if (!assignment.dueDate) return false;
      const dueDate = new Date(assignment.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    });

    if (this.elements.upcomingContent) {
      if (upcomingAssignments.length === 0) {
        this.elements.upcomingContent.innerHTML = "<p>No work due soon</p>";
      } else {
        let upcomingHTML = "";
        upcomingAssignments.slice(0, 3).forEach((assignment) => {
          const dueDate = new Date(assignment.dueDate);
          const isToday = dueDate.toDateString() === now.toDateString();
          const isTomorrow =
            dueDate.toDateString() ===
            new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

          let dueDateText = "";
          if (isToday) {
            dueDateText = "Due today";
          } else if (isTomorrow) {
            dueDateText = "Due tomorrow";
          } else {
            dueDateText = `Due ${dueDate.toLocaleDateString()}`;
          }

          upcomingHTML += `
            <div style="padding: 8px 0; border-bottom: 1px solid #eee; cursor: pointer;" onclick="streamManager.openAssignment('${assignment.id}')">
              <div style="font-weight: 500; color: #1976d2;">${assignment.title}</div>
              <div style="font-size: 12px; color: #666;">${dueDateText}</div>
            </div>
          `;
        });
        this.elements.upcomingContent.innerHTML = upcomingHTML;
      }
    }
  }

  openAssignment(assignmentId) {
    this.showNotification("Opening assignment...", "info");
  }

  initializeAnnouncementEditorState() {
    this.isAnnouncementExpanded = false;
    this.elements.announcementPlaceholder.classList.remove("hidden");
    this.elements.announcementHeader.classList.remove("expanded");
    this.elements.announcementEditorExpanded.classList.remove("expanded");
    this.elements.announcementEditorExpanded.style.display = "none";
    this.elements.announcementActions.classList.remove("expanded");
  }

  expandAnnouncement() {
    if (this.isAnnouncementExpanded) return;

    this.isAnnouncementExpanded = true;
    this.elements.announcementPlaceholder.classList.add("hidden");

    this.elements.announcementHeader.classList.add("expanded");

    this.elements.announcementEditorExpanded.style.display = "block";
    this.elements.announcementEditorExpanded.classList.add("expanded");

    this.elements.announcementActions.classList.add("expanded");

    setTimeout(() => {
      if (this.elements.editorContent) {
        this.elements.editorContent.focus();
      }
    }, 400);
  }

  cancelAnnouncement() {
    this.isAnnouncementExpanded = false;

    // Remove expanded class from card
    const announcementCard = document.querySelector(".announcement-input-card");
    if (announcementCard) {
      announcementCard.classList.remove("expanded");
    }

    // Collapse header
    this.elements.announcementHeader.classList.remove("expanded");

    // Collapse editor
    this.elements.announcementEditorExpanded.classList.remove("expanded");

    // Collapse actions
    this.elements.announcementActions.classList.remove("expanded");

    // Hide elements after transition
    setTimeout(() => {
      this.elements.announcementPlaceholder.classList.remove("hidden");
      this.elements.announcementEditorExpanded.style.display = "none";
    }, 400); // Match transition duration

    // Clear content
    if (this.elements.editorContent) {
      this.elements.editorContent.innerHTML = "";
      localStorage.removeItem("announcement_draft"); // Clear draft on cancel
    }

    // Clear attachments
    this.attachments = [];
    this.updateAttachedFilesDisplay();

    // Only show notification if manually cancelled (not by outside click)
    if (!this.isCancelledByOutsideClick) {
      this.showNotification("Announcement cancelled", "info");
    }
    this.isCancelledByOutsideClick = false; // Reset flag
  }

  postAnnouncement() {
    const content = this.elements.editorContent.innerHTML.trim();

    if (!content) {
      this.showNotification("Please write something", "error");
      return;
    }

    const postBtn = document.querySelector(".post-btn");
    if (postBtn) {
      postBtn.textContent = "Posting...";
      postBtn.disabled = true;
    }

    let targetStudents = [];
    if (
      this.elements.allStudentsRadio &&
      this.elements.allStudentsRadio.checked
    ) {
      targetStudents = ["all"];
    } else if (
      this.elements.specificStudentsRadio &&
      this.elements.specificStudentsRadio.checked
    ) {
      const selectedStudentCheckboxes =
        this.elements.specificStudentsList.querySelectorAll(
          'input[type="checkbox"]:checked'
        );
      targetStudents = Array.from(selectedStudentCheckboxes).map(
        (cb) => cb.value
      );
      if (targetStudents.length === 0) {
        this.showNotification(
          "Please select at least one student or 'All students'",
          "error"
        );
        if (postBtn) {
          postBtn.textContent = "Post";
          postBtn.disabled = false;
        }
        return;
      }
    } else {
      targetStudents = ["all"];
    }

    // Simulate posting with shorter delay for better UX
    setTimeout(() => {
      const announcement = {
        id: Date.now(),
        author: this.currentUser,
        content: content,
        attachments: [...this.attachments],
        timestamp: new Date().toISOString(),
        targetCourses: [this.courseId],
        targetStudents: targetStudents,
        comments: [],
        likes: 0,
        type: "announcement",
      };

      this.saveAnnouncementToCourse(announcement, this.courseId);
      this.loadPosts();
      this.cancelAnnouncement(); // This will also clear the draft

      if (postBtn) {
        postBtn.textContent = "Post";
        postBtn.disabled = false;
      }

      this.showNotification("Announcement posted successfully!", "success");
    }, 500); // Reduced delay for better responsiveness
  }

  // Requirement 1: Copy Course Code
  copyCourseCode() {
    const courseCode = this.elements.courseCodeText.textContent; // Get text from the display span
    navigator.clipboard
      .writeText(courseCode)
      .then(() => {
        this.showNotification("Copied", "success");
      })
      .catch(() => {
        this.showNotification("Failed to copy course code", "error");
      });
  }

  populateAnnouncementCourseDropdown() {
    const dropdownMenu = this.elements.announcementCourseDropdown;
    if (!dropdownMenu) return;

    dropdownMenu.innerHTML = ""; // Clear existing items

    const userDashboard = this.getUserDashboard();
    const userCourses = userDashboard.courses || [];

    // Add "All courses" option
    const allCoursesItem = document.createElement("li");
    allCoursesItem.innerHTML = `<a class="dropdown-item" href="#" onclick="streamManager.selectAnnouncementCourse('All courses', 'all')">All courses</a>`;
    dropdownMenu.appendChild(allCoursesItem);

    // Add individual courses
    userCourses.forEach((course) => {
      const courseItem = document.createElement("li");
      courseItem.innerHTML = `<a class="dropdown-item" href="#" onclick="streamManager.selectAnnouncementCourse('${course.name}', '${course.id}')">${course.name}</a>`;
      dropdownMenu.appendChild(courseItem);
    });

    // Set initial selected course
    if (this.elements.selectedCourse) {
      this.elements.selectedCourse.textContent = this.currentCourse.name;
      this.selectedAnnouncementCourseId = this.currentCourse.id;
    }
  }

  selectAnnouncementCourse(courseName, courseId) {
    if (this.elements.selectedCourse) {
      this.elements.selectedCourse.textContent = courseName;
      this.selectedAnnouncementCourseId = courseId; // Store the selected course ID
    }
  }

  openStudentSelector() {
    this.populateStudentList();
    const modal = new bootstrap.Modal(
      document.getElementById("studentSelectorModal")
    );
    modal.show();
  }

  populateStudentList() {
    if (!this.elements.specificStudentsList) return;

    this.elements.specificStudentsList.innerHTML = "";

    const currentCourseStudents = this.currentCourse.students || [];

    if (currentCourseStudents.length === 0) {
      this.elements.specificStudentsList.innerHTML =
        "<p>No students in this course.</p>";
      return;
    }

    currentCourseStudents.forEach((student) => {
      const studentDiv = document.createElement("div");
      studentDiv.className = "form-check";
      studentDiv.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${student}" id="student-${student}">
        <label class="form-check-label" for="student-${student}">
          ${student}
        </label>
      `;
      this.elements.specificStudentsList.appendChild(studentDiv);
    });
  }

  toggleSpecificStudentsList() {
    if (
      this.elements.specificStudentsRadio &&
      this.elements.specificStudentsList
    ) {
      if (this.elements.specificStudentsRadio.checked) {
        this.elements.specificStudentsList.style.display = "block";
      } else {
        this.elements.specificStudentsList.style.display = "none";
      }
    }
  }

  confirmStudentSelection() {
    const selectedOption = document.querySelector(
      'input[name="studentSelection"]:checked'
    );
    if (selectedOption) {
      const studentsBtn = document.querySelector(
        ".students-btn span:last-child"
      );
      if (studentsBtn) {
        if (selectedOption.value === "all") {
          studentsBtn.textContent = "All students";
          this.selectedStudents = ["all"];
        } else {
          const selectedStudentCheckboxes =
            this.elements.specificStudentsList.querySelectorAll(
              'input[type="checkbox"]:checked'
            );
          this.selectedStudents = Array.from(selectedStudentCheckboxes).map(
            (cb) => cb.value
          );
          if (this.selectedStudents.length > 0) {
            studentsBtn.textContent = `${this.selectedStudents.length} student(s) selected`;
          } else {
            studentsBtn.textContent = "No students selected";
          }
        }
      }
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("studentSelectorModal")
    );
    modal.hide();
  }

  attachFromDrive() {
    this.showNotification("Google Drive integration coming soon!", "info");
  }

  attachYouTube() {
    const url = prompt("Enter YouTube URL:");
    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      this.addAttachment({
        type: "video",
        name: "YouTube Video",
        url: url,
        icon: "video",
      });
      this.updateAttachedFilesDisplay();
      this.showNotification("YouTube video attached!", "success");
    } else if (url) {
      this.showNotification("Please enter a valid YouTube URL", "error");
    }
  }

  attachFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,application/pdf,.doc,.docx,.ppt,.pptx";
    input.onchange = (e) => this.handleFileSelect(e);
    input.click();
  }

  attachLink() {
    const url = prompt("Enter URL:");
    const title = prompt("Enter link title (optional):") || url;

    if (url) {
      this.addAttachment({
        type: "link",
        name: title,
        url: url,
        icon: "link",
      });
      this.updateAttachedFilesDisplay();
      this.showNotification("Link attached!", "success");
    }
  }

  schedulePost() {
    this.showNotification("Schedule feature coming soon!", "info");
  }

  loadAvailableCoursesAndStudents() {
    const userDashboard = this.getUserDashboard();
    this.availableCourses = userDashboard.courses || [];

    this.availableStudents = [];
    this.availableCourses.forEach((course) => {
      if (course.students && Array.isArray(course.students)) {
        course.students.forEach((student) => {
          if (!this.availableStudents.includes(student)) {
            this.availableStudents.push(student);
          }
        });
      }
    });
  }

  handleFileSelect(event) {
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.addAttachment({
        type: "file",
        name: file.name,
        size: this.formatFileSize(file.size),
        file: file,
        icon: "image",
      });
    }

    this.updateAttachedFilesDisplay();
  }

  addAttachment(attachment) {
    this.attachments.push({
      id: Date.now() + Math.random(),
      ...attachment,
    });
  }

  removeAttachment(attachmentId) {
    this.attachments = this.attachments.filter(
      (att) => att.id !== attachmentId
    );
    this.updateAttachedFilesDisplay();
  }

  updateAttachedFilesDisplay() {
    if (
      !this.elements.attachedFilesDisplay ||
      !this.elements.attachedFilesList
    ) {
      return;
    }

    if (this.attachments.length > 0) {
      this.elements.attachedFilesDisplay.style.display = "block";
      this.elements.attachedFilesList.innerHTML = "";

      this.attachments.forEach((attachment) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";

        fileItem.innerHTML = `
          <div class="file-icon ${attachment.icon}">
            <span class="material-icons">
              ${this.getFileIcon(attachment.type)}
            </span>
          </div>
          <div class="file-info">
            <div class="file-name">${attachment.name}</div>
            <div class="file-size">
              ${attachment.size || attachment.type.toUpperCase()}
            </div>
          </div>
          <button class="remove-file-btn" onclick="streamManager.removeAttachment(${
            attachment.id
          })">
            <span class="material-icons">close</span>
          </button>
        `;

        this.elements.attachedFilesList.appendChild(fileItem);
      });
    } else {
      this.elements.attachedFilesDisplay.style.display = "none";
    }
  }

  getFileIcon(type) {
    switch (type) {
      case "file":
        return "insert_drive_file";
      case "link":
        return "link";
      case "video":
        return "play_circle";
      case "drive":
        return "cloud";
      default:
        return "attachment";
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  saveAnnouncementToCourse(announcement, courseId) {
    const courseKey = `announcements_${courseId}`;
    const announcements = JSON.parse(localStorage.getItem(courseKey) || "[]");

    announcements.unshift(announcement);
    localStorage.setItem(courseKey, JSON.stringify(announcements));
  }

  setupRichTextEditor() {
    const toolbarButtons = document.querySelectorAll(".toolbar-btn");

    toolbarButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const command = button.getAttribute("data-command");

        if (command === "createLink") {
          const url = prompt("Enter URL:");
          if (url) {
            document.execCommand(command, false, url);
          }
        } else {
          document.execCommand(command, false, null);
        }

        button.classList.toggle("active");
        if (this.elements.editorContent) {
          this.elements.editorContent.focus();
        }
      });
    });

    if (this.elements.editorContent) {
      this.elements.editorContent.addEventListener("mouseup", () =>
        this.updateToolbarButtons()
      );
      this.elements.editorContent.addEventListener("keyup", () =>
        this.updateToolbarButtons()
      );
    }
  }

  updateToolbarButtons() {
    const toolbarButtons = document.querySelectorAll(".toolbar-btn");
    toolbarButtons.forEach((button) => {
      const command = button.getAttribute("data-command");
      if (document.queryCommandState(command)) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  setUserInitials() {
    const initial = this.currentUser.charAt(0).toUpperCase();
    if (this.elements.userInitial) {
      this.elements.userInitial.textContent = initial;
    }
  }

  updateCourseDisplay() {
    const courseTitle = document.getElementById("courseTitle");
    const courseSection = document.getElementById("courseSection");

    if (courseTitle) courseTitle.textContent = this.currentCourse.name;
    if (courseSection) courseSection.textContent = this.currentCourse.section;

    document.title = `${this.currentCourse.name} - ক্লাসরুম`;

    if (this.elements.currentCourseName) {
      this.elements.currentCourseName.textContent = this.currentCourse.name;
    }

    const courseBanner = document.getElementById("courseBanner");
    if (courseBanner) {
      const courseType = this.getCourseType(this.currentCourse.subject);
      courseBanner.className = `course-banner ${courseType}`;
    }

    if (this.elements.courseCodeText && this.currentCourse.code) {
      this.elements.courseCodeText.textContent = this.currentCourse.code;
      this.elements.courseCodeLarge.textContent = this.currentCourse.code;
    }

    this.updateCourseInfo();
  }

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

  updateCourseInfo() {
    const isTeacher = this.currentCourse.teacher === this.currentUser;

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

    if (isTeacher) {
      const studentCount = document.createElement("p");
      studentCount.innerHTML = `Students: ${
        this.currentCourse.students ? this.currentCourse.students.length : 0
      }`;
      additionalInfo.appendChild(studentCount);
    } else {
      const teacher = document.createElement("p");
      teacher.innerHTML = `Teacher: ${this.currentCourse.teacher}`;
      additionalInfo.appendChild(teacher);
    }
  }

  loadEnrolledClasses() {
    const enrolledClassesContainer = this.elements.enrolledClasses;
    if (!enrolledClassesContainer) return;

    const userDashboard = this.getUserDashboard();
    const userCourses = userDashboard.courses || [];

    if (userCourses.length === 0) {
      enrolledClassesContainer.innerHTML = "";
      return;
    }

    enrolledClassesContainer.innerHTML = "";

    userCourses.forEach((course) => {
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
      courseItem.appendChild(courseName);
      enrolledClassesContainer.appendChild(courseItem);
    });
  }

  toggleEnrolledClassesDropdown() {
    const dropdownContent = this.elements.enrolledClasses;
    const dropdownToggle = this.elements.enrolledClassesDropdownToggle;

    if (dropdownContent && dropdownToggle) {
      dropdownContent.classList.toggle("open");
      dropdownToggle.classList.toggle("open");
    }
  }

  getUserDashboard() {
    const dashboardKey = `dashboard_${this.currentUser}`;
    return JSON.parse(localStorage.getItem(dashboardKey) || '{"courses": []}');
  }

  switchToCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    location.reload();
  }

  loadPosts() {
    console.log("Loading posts for course ID:", this.courseId);

    const posts = this.getCourseAnnouncements();
    const assignments = this.getCourseAssignments();

    console.log("Found announcements:", posts.length);
    console.log("Announcements data:", posts); // Debug log
    console.log("Found assignments:", assignments.length);

    const allPosts = [...posts];

    assignments.forEach((assignment) => {
      const assignmentPost = {
        id: `assignment_${assignment.id}`,
        type: "assignment",
        author: assignment.author || this.currentUser || "Teacher",
        content: `posted a new assignment: <strong>${assignment.title}</strong>`,
        timestamp: assignment.createdAt,
        assignment: assignment,
        comments: [], // Assignments don't have comments in this context
        likes: 0,
        isEditable: true,
        originalText: assignment.title,
      };
      allPosts.push(assignmentPost);
    });

    console.log("Total posts after combining:", allPosts.length);

    // Sort by timestamp (newest first)
    allPosts.sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      return timeB - timeA;
    });

    if (allPosts.length === 0) {
      if (this.elements.noPosts) this.elements.noPosts.style.display = "block";
      if (this.elements.streamPosts) this.elements.streamPosts.innerHTML = "";
      return;
    }

    if (this.elements.noPosts) this.elements.noPosts.style.display = "none";
    this.renderPosts(allPosts);
  }

  getCourseAnnouncements() {
    const courseKey = `announcements_${this.courseId}`;
    return JSON.parse(localStorage.getItem(courseKey) || "[]");
  }

  getCourseAssignments() {
    if (!this.courseId) {
      console.log("No course ID found");
      return [];
    }

    const assignmentsKey = `assignments_${this.courseId}`;
    console.log("Looking for assignments with key:", assignmentsKey);

    const assignments = JSON.parse(
      localStorage.getItem(assignmentsKey) || "[]"
    );
    console.log("Retrieved assignments:", assignments);

    return assignments;
  }

  formatTimestamp(isoString) {
    if (!isoString) return "";

    const date = new Date(isoString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  renderPosts(posts) {
    if (!this.elements.streamPosts) return;

    this.elements.streamPosts.innerHTML = "";

    posts.forEach((post) => {
      const postElement = this.createPostElement(post);
      this.elements.streamPosts.appendChild(postElement);
    });
  }

  createPostElement(post) {
    const postDiv = document.createElement("div");
    postDiv.className = "stream-post";

    if (post.type === "assignment") {
      const notificationHeader = document.createElement("div");
      notificationHeader.className = "notification-header";
      notificationHeader.id = `notification-${post.id}`;

      const notificationContent = document.createElement("div");
      notificationContent.className = "notification-content";
      notificationContent.onclick = () =>
        this.navigateToAssignment(post.assignment);

      const avatar = document.createElement("div");
      avatar.className = "notification-avatar";
      avatar.textContent = "📄";

      const notificationText = document.createElement("div");
      notificationText.className = "notification-text";
      notificationText.id = `notification-text-${post.id}`;
      notificationText.innerHTML = `<strong>${
        post.author
      }</strong> posted a new assignment: <strong>${
        post.originalText || post.assignment.title
      }</strong>`;

      const timeDiv = document.createElement("div");
      timeDiv.className = "time";
      timeDiv.textContent = this.formatTimestamp(post.timestamp);

      notificationText.appendChild(timeDiv);

      notificationContent.appendChild(avatar);
      notificationContent.appendChild(notificationText);

      // Enhanced menu container with proper z-index
      const menuContainer = document.createElement("div");
      menuContainer.className = "notification-menu-container";

      const menuButton = document.createElement("button");
      menuButton.className = "notification-menu-dots";
      menuButton.innerHTML = '<span class="material-icons">more_vert</span>';
      menuButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.toggleNotificationMenu(post.id);
      };

      const dropdownMenu = document.createElement("div");
      dropdownMenu.className = "notification-dropdown-menu";
      dropdownMenu.id = `dropdown-${post.id}`;

      const editButton = document.createElement("button");
      editButton.className = "notification-dropdown-item";
      editButton.innerHTML = '<span class="material-icons">edit</span> Edit';
      editButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.editNotification(
          post.id,
          post.originalText || post.assignment.title
        );
      };

      const deleteButton = document.createElement("button");
      deleteButton.className = "notification-dropdown-item delete";
      deleteButton.innerHTML =
        '<span class="material-icons">delete</span> Delete';
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.deleteNotification(post.id);
      };

      dropdownMenu.appendChild(editButton);
      dropdownMenu.appendChild(deleteButton);

      menuContainer.appendChild(menuButton);
      menuContainer.appendChild(dropdownMenu);

      notificationHeader.appendChild(notificationContent);
      notificationHeader.appendChild(menuContainer);

      postDiv.appendChild(notificationHeader);

      postDiv.setAttribute(
        "data-original-text",
        post.originalText || post.assignment.title
      );
      postDiv.setAttribute("data-assignment-id", post.assignment.id);
    } else {
      // Regular announcement post - Google Classroom style
      postDiv.id = `post-${post.id}`;

      const postHeader = document.createElement("div");
      postHeader.className = "post-header";
      postHeader.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid #dadce0;
      `;

      // User avatar
      const avatar = document.createElement("div");
      avatar.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #1976d2;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 16px;
      `;
      avatar.textContent = (post.author || "T").charAt(0).toUpperCase();

      // Post info
      const postInfo = document.createElement("div");
      postInfo.style.cssText = "flex: 1;";

      const author = document.createElement("div");
      author.style.cssText =
        "font-weight: 500; color: #202124; font-size: 14px;";
      author.textContent = post.author || "Teacher";

      const timestamp = document.createElement("div");
      timestamp.style.cssText =
        "font-size: 12px; color: #5f6368; margin-top: 2px;";
      timestamp.textContent = this.formatTimestamp(post.timestamp);
      // Add edited indicator if post was edited
      if (post.editedAt) {
        timestamp.textContent += " (edited)";
      }

      postInfo.appendChild(author);
      postInfo.appendChild(timestamp);

      // Menu container for announcements
      const menuContainer = document.createElement("div");
      menuContainer.className = "notification-menu-container";

      const menuButton = document.createElement("button");
      menuButton.className = "notification-menu-dots";
      menuButton.innerHTML = '<span class="material-icons">more_vert</span>';
      menuButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.toggleNotificationMenu(`announcement_${post.id}`);
      };

      const dropdownMenu = document.createElement("div");
      dropdownMenu.className = "notification-dropdown-menu";
      dropdownMenu.id = `dropdown-announcement_${post.id}`;

      const editButton = document.createElement("button");
      editButton.className = "notification-dropdown-item";
      editButton.innerHTML = '<span class="material-icons">edit</span> Edit';
      editButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        // Extract text content without HTML tags for editing
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = post.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        this.editAnnouncement(post.id, textContent);
      };

      const deleteButton = document.createElement("button");
      deleteButton.className = "notification-dropdown-item delete";
      deleteButton.innerHTML =
        '<span class="material-icons">delete</span> Delete';
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.deleteAnnouncement(post.id);
      };

      dropdownMenu.appendChild(editButton);
      dropdownMenu.appendChild(deleteButton);

      menuContainer.appendChild(menuButton);
      menuContainer.appendChild(dropdownMenu);

      postHeader.appendChild(avatar);
      postHeader.appendChild(postInfo);
      postHeader.appendChild(menuContainer);

      // Post content
      const postContent = document.createElement("div");
      postContent.className = "post-content";
      postContent.id = `post-content-${post.id}`;
      postContent.style.cssText = `
        padding: 16px 20px;
        font-size: 14px;
        line-height: 1.5;
        color: #202124;
        border-bottom: 1px solid #dadce0;
      `;
      postContent.innerHTML = post.content;

      // Add attachments if any
      if (post.attachments && post.attachments.length > 0) {
        const attachmentsDiv = document.createElement("div");
        attachmentsDiv.className = "post-attachments";
        attachmentsDiv.style.cssText = "padding: 0 20px 16px;";

        post.attachments.forEach((attachment) => {
          const attachmentElement = this.createAttachmentElement(attachment);
          attachmentsDiv.appendChild(attachmentElement);
        });

        postDiv.appendChild(attachmentsDiv);
      }

      // Comment input field
      const commentInputContainer = document.createElement("div");
      commentInputContainer.style.cssText = `
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        background: #f8f9fa;
      `;

      const commentInput = document.createElement("input");
      commentInput.type = "text";
      commentInput.placeholder = "Add a class comment...";
      commentInput.id = `comment-input-${post.id}`;
      commentInput.style.cssText = `
        flex: 1;
        padding: 8px 16px;
        border: 1px solid #dadce0;
        border-radius: 20px;
        font-size: 13px;
        outline: none;
      `;
      commentInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.addComment(post.id, commentInput.value);
          commentInput.value = "";
        }
      });

      const commentSubmitBtn = document.createElement("button");
      commentSubmitBtn.innerHTML = '<span class="material-icons">send</span>';
      commentSubmitBtn.style.cssText = `
        background: none;
        border: none;
        color: #1976d2;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      commentSubmitBtn.onclick = () => {
        this.addComment(post.id, commentInput.value);
        commentInput.value = "";
      };

      commentInputContainer.appendChild(commentInput);
      commentInputContainer.appendChild(commentSubmitBtn);

      // Comments section
      const commentsSection = document.createElement("div");
      commentsSection.className = "comments-section";
      commentsSection.id = `comments-section-${post.id}`;
      this.renderComments(post.id, post.comments, commentsSection);

      postDiv.appendChild(postHeader);
      postDiv.appendChild(postContent);
      postDiv.appendChild(commentInputContainer);
      postDiv.appendChild(commentsSection);
    }

    return postDiv;
  }

  addComment(postId, commentText) {
    if (!commentText.trim()) {
      this.showNotification("Comment cannot be empty", "error");
      return;
    }

    const announcements = this.getCourseAnnouncements();
    const postIndex = announcements.findIndex((p) => p.id === postId);

    if (postIndex !== -1) {
      const newComment = {
        author: this.currentUser,
        text: commentText.trim(),
        timestamp: new Date().toISOString(),
        id: Date.now(),
      };
      announcements[postIndex].comments.push(newComment);
      localStorage.setItem(
        `announcements_${this.courseId}`,
        JSON.stringify(announcements)
      );

      const commentsSection = document.getElementById(
        `comments-section-${postId}`
      );
      if (commentsSection) {
        this.renderComments(
          postId,
          announcements[postIndex].comments,
          commentsSection
        );
      }
      this.showNotification("Comment added!", "success");
    }
  }

  renderComments(postId, comments, commentsSectionElement) {
    commentsSectionElement.innerHTML = "";

    comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const commentsListContainer = document.createElement("div");
    commentsListContainer.className = "comments-list-container";
    commentsListContainer.id = `comments-list-container-${postId}`;
    commentsSectionElement.appendChild(commentsListContainer);

    const initialCommentsToShow = 1; // Only first comment visible initially

    comments.forEach((comment, index) => {
      const commentItem = document.createElement("div");
      commentItem.className = "comment-item";
      commentItem.id = `comment-${comment.id}`;
      if (index >= initialCommentsToShow) {
        commentItem.style.display = "none"; // Hide comments beyond the first
      }

      const avatar = document.createElement("div");
      avatar.className = "comment-avatar";
      avatar.textContent = comment.author.charAt(0).toUpperCase();

      const commentContentWrapper = document.createElement("div");
      commentContentWrapper.className = "comment-content-wrapper";

      const authorTime = document.createElement("div");
      authorTime.className = "comment-author-time";
      authorTime.innerHTML = `
        <span class="comment-author">${comment.author}</span>
        <span class="comment-time">${this.formatTimestamp(
          comment.timestamp
        )}</span>
      `;

      const commentText = document.createElement("div");
      commentText.className = "comment-text";
      commentText.textContent = comment.text;

      commentContentWrapper.appendChild(authorTime);
      commentContentWrapper.appendChild(commentText);

      const commentActions = document.createElement("div");
      commentActions.className = "comment-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "comment-action-btn edit";
      editBtn.innerHTML = '<span class="material-icons">edit</span>';
      editBtn.title = "Edit comment";
      editBtn.onclick = () =>
        this.editComment(postId, comment.id, comment.text);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "comment-action-btn delete";
      deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
      deleteBtn.title = "Delete comment";
      deleteBtn.onclick = () => this.deleteComment(postId, comment.id);

      commentActions.appendChild(editBtn);
      commentActions.appendChild(deleteBtn);

      commentItem.appendChild(avatar);
      commentItem.appendChild(commentContentWrapper);
      commentItem.appendChild(commentActions);

      commentsListContainer.appendChild(commentItem);
    });

    // Add "View Comments" button if there are more than initialCommentsToShow
    if (comments.length > initialCommentsToShow) {
      const viewCommentsBtn = document.createElement("button");
      viewCommentsBtn.className = "view-comments-btn";
      viewCommentsBtn.textContent = `View ${
        comments.length - initialCommentsToShow
      } more comments`;
      viewCommentsBtn.onclick = () => this.toggleCommentsVisibility(postId);
      commentsSectionElement.appendChild(viewCommentsBtn);
    }
  }

  toggleCommentsVisibility(postId) {
    const commentsListContainer = document.getElementById(
      `comments-list-container-${postId}`
    );
    const viewCommentsBtn = commentsListContainer.nextElementSibling; // The button is the next sibling

    if (commentsListContainer.classList.contains("expanded")) {
      commentsListContainer.classList.remove("expanded");
      const hiddenComments = commentsListContainer.querySelectorAll(
        ".comment-item:nth-child(n+2)"
      );
      hiddenComments.forEach((comment) => (comment.style.display = "none"));
      if (viewCommentsBtn) {
        const comments =
          this.getCourseAnnouncements().find((p) => p.id === postId)
            ?.comments || [];
        viewCommentsBtn.textContent = `View ${
          comments.length - 1
        } more comments`;
      }
    } else {
      commentsListContainer.classList.add("expanded");
      const hiddenComments =
        commentsListContainer.querySelectorAll(".comment-item");
      hiddenComments.forEach((comment) => (comment.style.display = "flex")); // Show all comments
      if (viewCommentsBtn) {
        viewCommentsBtn.textContent = "Hide comments";
      }
    }
  }

  // Requirement 2: Edit comment
  editComment(postId, commentId, currentText) {
    const commentItem = document.getElementById(`comment-${commentId}`);
    if (!commentItem) return;

    const commentContentWrapper = commentItem.querySelector(
      ".comment-content-wrapper"
    );
    const originalContent = commentContentWrapper.innerHTML;
    commentContentWrapper.setAttribute(
      "data-original-content",
      originalContent
    );

    commentContentWrapper.innerHTML = `
      <input type="text" class="comment-edit-input" id="comment-edit-input-${commentId}" value="${currentText}">
      <div class="comment-edit-actions">
        <button class="comment-edit-btn cancel" onclick="streamManager.cancelCommentEdit('${postId}', '${commentId}')">Cancel</button>
        <button class="comment-edit-btn save" onclick="streamManager.saveCommentEdit('${postId}', '${commentId}')">Save</button>
      </div>
    `;

    const editInput = document.getElementById(
      `comment-edit-input-${commentId}`
    );
    if (editInput) {
      editInput.focus();
      editInput.select();
      editInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.saveCommentEdit(postId, commentId);
        }
      });
    }
  }

  // Requirement 2: Cancel comment edit
  cancelCommentEdit(postId, commentId) {
    const commentItem = document.getElementById(`comment-${commentId}`);
    if (!commentItem) return;

    const commentContentWrapper = commentItem.querySelector(
      ".comment-content-wrapper"
    );
    const originalContent = commentContentWrapper.getAttribute(
      "data-original-content"
    );
    commentContentWrapper.innerHTML = originalContent;
    commentContentWrapper.removeAttribute("data-original-content");
    this.showNotification("Comment edit cancelled", "info");
  }

  // Requirement 2: Save comment edit
  saveCommentEdit(postId, commentId) {
    const editInput = document.getElementById(
      `comment-edit-input-${commentId}`
    );
    if (!editInput) return;

    const newText = editInput.value.trim();
    if (!newText) {
      this.showNotification("Comment cannot be empty", "error");
      return;
    }

    const announcements = this.getCourseAnnouncements();
    const postIndex = announcements.findIndex((p) => p.id === postId);

    if (postIndex !== -1) {
      const commentIndex = announcements[postIndex].comments.findIndex(
        (c) => c.id === commentId
      );
      if (commentIndex !== -1) {
        announcements[postIndex].comments[commentIndex].text = newText;
        localStorage.setItem(
          `announcements_${this.courseId}`,
          JSON.stringify(announcements)
        );

        const commentsSection = document.getElementById(
          `comments-section-${postId}`
        );
        if (commentsSection) {
          this.renderComments(
            postId,
            announcements[postIndex].comments,
            commentsSection
          );
        }
        this.showNotification("Comment updated!", "success");
      }
    }
  }

  // Requirement 2: Delete comment
  deleteComment(postId, commentId) {
    this.pendingDeleteId = { type: "comment", postId, commentId };
    this.showConfirmationModal(
      "Are you sure you want to delete this comment? This action cannot be undone."
    );
  }

  // Enhanced dropdown menu methods with proper z-index handling
  toggleNotificationMenu(id) {
    // Changed postId to id to handle courseCode dropdown
    console.log("Toggling menu for ID:", id);

    const dropdown = document.getElementById(`dropdown-${id}`);
    const allDropdowns = document.querySelectorAll(
      ".notification-dropdown-menu"
    );

    console.log("Found dropdown:", dropdown);

    // Close all other dropdowns first
    allDropdowns.forEach((menu) => {
      if (menu.id !== `dropdown-${id}`) {
        menu.classList.remove("show");
        menu.style.display = "none";
      }
    });

    // Toggle current dropdown
    if (dropdown) {
      const isCurrentlyShowing = dropdown.classList.contains("show");
      console.log("Currently showing:", isCurrentlyShowing);

      if (isCurrentlyShowing) {
        dropdown.classList.remove("show");
        dropdown.style.display = "none";
      } else {
        // Show the dropdown
        dropdown.style.display = "block";
        dropdown.classList.add("show");

        // Position it properly after making it visible
        setTimeout(() => {
          this.positionDropdown(dropdown);
        }, 10); // Small delay to ensure element is rendered

        console.log("Dropdown should now be visible");
      }
    } else {
      console.error("Dropdown not found for ID:", `dropdown-${id}`);
    }
  }

  // Simple positioning exactly like Google Classroom image
  positionDropdown(dropdown) {
    // Reset positioning - let CSS handle the positioning
    dropdown.style.position = "";
    dropdown.style.top = "";
    dropdown.style.left = "";
    dropdown.style.right = "";
    dropdown.style.bottom = "";
    dropdown.style.zIndex = "";

    // Just ensure it's visible
    dropdown.style.display = "block";

    console.log("Dropdown positioned using CSS defaults");
  }

  // UPDATED: Edit notification now redirects to classwork.html
  editNotification(postId, originalText) {
    const dropdown = document.getElementById(`dropdown-${postId}`);
    if (dropdown) {
      dropdown.classList.remove("show");
    }

    // Get the assignment data
    const notificationHeader = document.getElementById(
      `notification-${postId}`
    );
    const streamPost = notificationHeader?.closest(".stream-post");
    const assignmentId = streamPost?.getAttribute("data-assignment-id");

    if (assignmentId) {
      // Store assignment ID for editing
      localStorage.setItem("editingAssignmentId", assignmentId);

      // Navigate to classwork.html for editing
      window.location.href = "classwork.html";
    } else {
      this.showNotification("Assignment not found for editing", "error");
    }
  }

  editAnnouncement(postId, currentContent) {
    const dropdown = document.getElementById(`dropdown-announcement_${postId}`);
    if (dropdown) {
      dropdown.classList.remove("show");
      dropdown.style.display = "none";
    }

    const postContentElement = document.getElementById(
      `post-content-${postId}`
    );
    if (!postContentElement) return;

    this.currentEditingId = postId;

    // Store original content
    const originalHTML = postContentElement.innerHTML;
    postContentElement.setAttribute("data-original-html", originalHTML);

    // Create Google Classroom style edit interface
    postContentElement.innerHTML = `
      <div style="border: 2px solid #1976d2; border-radius: 8px; background: white; overflow: hidden;">
        <div contenteditable="true" 
             id="editContent-${postId}" 
             style="padding: 16px 20px; min-height: 80px; font-size: 14px; line-height: 1.5; outline: none; background: white;"
             placeholder="Edit your announcement...">${currentContent}</div>
        <div style="background: #f8f9fa; padding: 12px 16px; border-top: 1px solid #dadce0; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" 
                  id="cancelEdit-${postId}"
                  style="background: transparent; border: 1px solid #dadce0; color: #5f6368; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer;">
            Cancel
          </button>
          <button type="button" 
                  id="saveEdit-${postId}"
                  style="background: #1976d2; border: none; color: white; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer;">
            Save
          </button>
        </div>
      </div>
    `;

    // Focus on the editable content
    const editContent = document.getElementById(`editContent-${postId}`);
    if (editContent) {
      editContent.focus();

      // Place cursor at the end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editContent);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      // Handle Enter key to save
      editContent.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          streamManager.saveAnnouncementEdit(postId);
        }
        if (e.key === "Escape") {
          e.preventDefault();
          streamManager.cancelEditAnnouncement(postId);
        }
      });
    }

    // Add event listeners to buttons
    const cancelBtn = document.getElementById(`cancelEdit-${postId}`);
    const saveBtn = document.getElementById(`saveEdit-${postId}`);

    if (cancelBtn) {
      cancelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Cancel edit clicked for postId:", postId);
        this.cancelEditAnnouncement(postId);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Save edit clicked for postId:", postId);
        this.saveAnnouncementEdit(postId);
      });
    }
  }

  cancelEditAnnouncement(postId) {
    const postContentElement = document.getElementById(
      `post-content-${postId}`
    );
    if (!postContentElement) return;

    const originalHTML = postContentElement.getAttribute("data-original-html");
    if (originalHTML) {
      postContentElement.innerHTML = originalHTML;
      postContentElement.removeAttribute("data-original-html");
    }

    this.currentEditingId = null;
    this.showNotification("Edit cancelled", "info");
  }

  saveAnnouncementEdit(postId) {
    console.log("Saving announcement edit for postId:", postId); // Debug log

    const editContent = document.getElementById(`editContent-${postId}`);
    if (!editContent) {
      console.error("Edit content element not found");
      return;
    }

    let newContent = editContent.innerHTML.trim();
    console.log("New content:", newContent); // Debug log

    // Clean up content - remove empty tags and normalize
    if (
      newContent === "<br>" ||
      newContent === "<div><br></div>" ||
      newContent === ""
    ) {
      this.showNotification("Announcement content cannot be empty", "error");
      return;
    }

    // Show saving state
    const saveBtn = document.querySelector(
      `button[onclick="streamManager.saveAnnouncementEdit('${postId}')"]`
    );
    if (saveBtn) {
      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;
    }

    try {
      // Get announcements from localStorage
      const courseKey = `announcements_${this.courseId}`;
      let announcements = JSON.parse(localStorage.getItem(courseKey) || "[]");
      console.log("Current announcements:", announcements); // Debug log

      // Find the specific announcement
      const postIndex = announcements.findIndex((p) => p.id == postId); // Use == for type coercion
      console.log("Found post index:", postIndex); // Debug log

      if (postIndex !== -1) {
        // Update the content
        announcements[postIndex].content = newContent;
        announcements[postIndex].editedAt = new Date().toISOString();

        // Save back to localStorage
        localStorage.setItem(courseKey, JSON.stringify(announcements));
        console.log("Updated announcement:", announcements[postIndex]); // Debug log

        // Update the UI immediately - find the post content element
        const postContentElement = document.getElementById(
          `post-content-${postId}`
        );
        if (postContentElement) {
          postContentElement.innerHTML = newContent;
          postContentElement.removeAttribute("data-original-html");
        }

        this.currentEditingId = null;
        this.showNotification("Announcement updated successfully!", "success");

        // Reload posts to ensure everything is synced
        setTimeout(() => {
          this.loadPosts();
        }, 500);
      } else {
        console.error("Post not found in announcements array");
        this.showNotification(
          "Failed to find announcement to update.",
          "error"
        );
        this.cancelEditAnnouncement(postId);
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
      this.showNotification("Error saving announcement", "error");
      this.cancelEditAnnouncement(postId);
    }
  }

  // UPDATED: Enhanced delete with smooth animation
  deleteNotification(postId) {
    const dropdown = document.getElementById(`dropdown-${postId}`);
    if (dropdown) {
      dropdown.classList.remove("show");
    }

    this.pendingDeleteId = { type: "assignment", id: postId };
    this.showConfirmationModal(
      "Are you sure you want to delete this assignment? This action cannot be undone."
    );
  }

  deleteAnnouncement(postId) {
    const dropdown = document.getElementById(`dropdown-announcement_${postId}`);
    if (dropdown) {
      dropdown.classList.remove("show");
    }

    this.pendingDeleteId = { type: "announcement", id: postId };
    this.showConfirmationModal(
      "Are you sure you want to delete this announcement? This action cannot be undone."
    );
  }

  showConfirmationModal(message) {
    if (this.elements.confirmationMessage) {
      this.elements.confirmationMessage.textContent = message;
    }
    if (this.elements.confirmationModal) {
      this.elements.confirmationModal.classList.add("show");
    }
    document.body.style.overflow = "hidden";
  }

  hideConfirmationModal() {
    if (this.elements.confirmationModal) {
      this.elements.confirmationModal.classList.remove("show");
    }
    this.pendingDeleteId = null;
    document.body.style.overflow = "auto";
  }

  // UPDATED: Enhanced deletion with permanent removal and smooth animation
  confirmDelete() {
    if (!this.pendingDeleteId) return;

    const { type, id, postId, commentId } = this.pendingDeleteId;

    if (type === "comment") {
      const announcements = this.getCourseAnnouncements();
      const postIndex = announcements.findIndex((p) => p.id === postId);

      if (postIndex !== -1) {
        announcements[postIndex].comments = announcements[
          postIndex
        ].comments.filter((c) => c.id !== commentId);
        localStorage.setItem(
          `announcements_${this.courseId}`,
          JSON.stringify(announcements)
        );

        const commentsSection = document.getElementById(
          `comments-section-${postId}`
        );
        if (commentsSection) {
          this.renderComments(
            postId,
            announcements[postIndex].comments,
            commentsSection
          );
        }
        this.showNotification("Comment deleted!", "success");
      }
    } else if (type === "assignment") {
      const notificationHeader = document.getElementById(`notification-${id}`);
      const streamPost = notificationHeader?.closest(".stream-post");
      const assignmentId = streamPost?.getAttribute("data-assignment-id");

      if (streamPost) {
        // Apply smooth fade-out animation
        streamPost.classList.add("notification-fade-out");

        setTimeout(() => {
          streamPost.remove();
          if (assignmentId) {
            this.deleteAssignment(assignmentId);
          }
          this.showNotification("Assignment deleted successfully", "success");
          this.checkForNoPosts();
        }, 400); // Match animation duration
      }
    } else if (type === "announcement") {
      const postElement = document.getElementById(`post-${id}`);
      if (postElement) {
        // Apply smooth fade-out animation
        postElement.classList.add("notification-fade-out");

        setTimeout(() => {
          postElement.remove();
          this.deleteAnnouncementFromStorage(id);
          this.showNotification("Announcement deleted successfully", "success");
          this.checkForNoPosts();
        }, 400); // Match animation duration
      }
    }

    this.hideConfirmationModal();
  }

  deleteAssignment(assignmentId) {
    const assignmentsKey = `assignments_${this.courseId}`;
    const assignments = JSON.parse(
      localStorage.getItem(assignmentsKey) || "[]"
    );

    const filteredAssignments = assignments.filter((a) => a.id != assignmentId);
    localStorage.setItem(assignmentsKey, JSON.stringify(filteredAssignments));

    this.loadUpcomingAssignments();
  }

  deleteAnnouncementFromStorage(announcementId) {
    const announcementsKey = `announcements_${this.courseId}`;
    let announcements = JSON.parse(
      localStorage.getItem(announcementsKey) || "[]"
    );
    announcements = announcements.filter((ann) => ann.id !== announcementId);
    localStorage.setItem(announcementsKey, JSON.stringify(announcements));
  }

  checkForNoPosts() {
    const streamPosts = this.elements.streamPosts;
    const noPosts = this.elements.noPosts;

    if (streamPosts && streamPosts.children.length === 0) {
      if (noPosts) noPosts.style.display = "block";
    } else {
      if (noPosts) noPosts.style.display = "none";
    }
  }

  navigateToAssignment(assignment) {
    localStorage.setItem("selectedAssignment", JSON.stringify(assignment));
    window.location.href = "instruction.html";
  }

  createAttachmentElement(attachment) {
    const attachmentDiv = document.createElement("div");
    attachmentDiv.className = "file-item";
    attachmentDiv.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin: 8px 0;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: var(--transition);
    `;

    const icon = document.createElement("div");
    icon.className = `file-icon ${attachment.icon}`;
    icon.innerHTML = `<span class="material-icons">${this.getFileIcon(
      attachment.type
    )}</span>`;

    const info = document.createElement("div");
    info.className = "file-info";
    info.innerHTML = `
      <div class="file-name">${attachment.name}</div>
      <div class="file-size">${
        attachment.size || attachment.type.toUpperCase()
      }</div>
    `;

    attachmentDiv.appendChild(icon);
    attachmentDiv.appendChild(info);

    if (attachment.url) {
      attachmentDiv.addEventListener("click", () => {
        window.open(attachment.url, "_blank");
      });

      attachmentDiv.addEventListener("mouseenter", () => {
        attachmentDiv.style.transform = "translateY(-1px)";
        attachmentDiv.style.boxShadow = "var(--shadow-medium)";
      });

      attachmentDiv.addEventListener("mouseleave", () => {
        attachmentDiv.style.transform = "translateY(0)";
        attachmentDiv.style.boxShadow = "none";
      });
    }

    return attachmentDiv;
  }

  createRippleEffect(element) {
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  showNotification(message, type) {
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => notification.remove());

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  setupTooltips() {
    const tooltipElements = document.querySelectorAll("[title]");
    tooltipElements.forEach((element) => {
      element.addEventListener("mouseenter", (e) => {
        const tooltipText = e.target.getAttribute("title");
        if (!tooltipText) return;

        e.target._originalTitle = tooltipText;
        e.target.removeAttribute("title");

        const tooltip = document.createElement("div");
        tooltip.className = "custom-tooltip";
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);

        const rect = e.target.getBoundingClientRect();
        tooltip.style.left =
          rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";
        tooltip.style.top = rect.bottom + 8 + "px";

        e.target._tooltip = tooltip;
      });

      element.addEventListener("mouseleave", (e) => {
        if (e.target._tooltip) {
          e.target._tooltip.remove();
          delete e.target._tooltip;
        }
        if (e.target._originalTitle) {
          e.target.setAttribute("title", e.target._originalTitle);
          delete e.target._originalTitle;
        }
      });
    });

    const style = document.createElement("style");
    style.innerHTML = `
      .custom-tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10002;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      }
      .custom-tooltip.show {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        this.isAnnouncementExpanded
      ) {
        e.preventDefault();
        this.postAnnouncement();
      }

      if (e.key === "Escape") {
        if (
          this.elements.confirmationModal &&
          this.elements.confirmationModal.classList.contains("show")
        ) {
          this.hideConfirmationModal();
        } else if (this.isAnnouncementExpanded && !this.currentEditingId) {
          this.isCancelledByOutsideClick = true; // Set flag for outside click
          this.cancelAnnouncement();
        }
      }
    });
  }

  setupAutoSave() {
    let autoSaveTimer;

    if (this.elements.editorContent) {
      this.elements.editorContent.addEventListener("input", () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
          const content = this.elements.editorContent.innerHTML;
          if (content.trim()) {
            localStorage.setItem("announcement_draft", content);
          }
        }, 1000);
      });

      const draft = localStorage.getItem("announcement_draft");
      if (draft && this.elements.editorContent) {
        this.elements.editorContent.innerHTML = draft;
        if (draft.trim() !== "") {
          this.expandAnnouncement();
        }
      }
    }
  }

  setupThemeDetection() {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    prefersDarkScheme.addEventListener("change", (e) => {
      // Theme handling if needed in future
    });
  }

  setupProgressIndicators() {
    const showLoading = (element) => {
      element.classList.add("loading");
      const spinner = document.createElement("div");
      spinner.className = "loading-spinner";
      element.appendChild(spinner);
    };

    const hideLoading = (element) => {
      element.classList.remove("loading");
      const spinner = element.querySelector(".loading-spinner");
      if (spinner) {
        spinner.remove();
      }
    };

    this.showLoading = showLoading;
    this.hideLoading = hideLoading;

    const style = document.createElement("style");
    style.innerHTML = `
      .loading {
        position: relative;
        pointer-events: none;
      }
      .loading-spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  setupNotificationSystem() {
    this.notificationQueue = [];
    this.isShowingNotification = false;

    const processQueue = () => {
      if (this.notificationQueue.length > 0 && !this.isShowingNotification) {
        this.isShowingNotification = true;
        const { message, type } = this.notificationQueue.shift();
        this.showNotification(message, type);
        setTimeout(() => {
          this.isShowingNotification = false;
          processQueue();
        }, 3500);
      }
    };

    const originalShowNotification = this.showNotification.bind(this);
    this.showNotification = (message, type) => {
      this.notificationQueue.push({ message, type });
      processQueue();
    };

    // Enhanced click outside handling for dropdowns
    document.addEventListener("click", (e) => {
      // Close all notification dropdowns
      const allNotificationDropdowns = document.querySelectorAll(
        ".notification-dropdown-menu"
      );
      allNotificationDropdowns.forEach((menu) => {
        if (
          !e.target.closest(`#${menu.id}`) &&
          !e.target.closest(
            `[onclick*="toggleNotificationMenu('${menu.id.replace(
              "dropdown-",
              ""
            )}')"]`
          )
        ) {
          menu.classList.remove("show");
          menu.style.display = "none";
        }
      });

      // Close enrolled classes dropdown
      const enrolledClassesDropdown = this.elements.enrolledClasses;
      const enrolledClassesToggle = this.elements.enrolledClassesDropdownToggle;

      if (enrolledClassesDropdown && enrolledClassesToggle) {
        const isClickInsideDropdown =
          enrolledClassesDropdown.contains(e.target) ||
          enrolledClassesToggle.contains(e.target);

        if (
          enrolledClassesDropdown.classList.contains("open") &&
          !isClickInsideDropdown
        ) {
          this.toggleEnrolledClassesDropdown();
        }
      }
    });

    document.addEventListener("scroll", () => {
      const allDropdowns = document.querySelectorAll(
        ".notification-dropdown-menu"
      );
      allDropdowns.forEach((menu) => {
        menu.classList.remove("show");
      });

      const enrolledClassesDropdown = this.elements.enrolledClasses;
      if (
        enrolledClassesDropdown &&
        enrolledClassesDropdown.classList.contains("open")
      ) {
        this.toggleEnrolledClassesDropdown();
      }
    });

    window.addEventListener("resize", () => {
      const allDropdowns = document.querySelectorAll(
        ".notification-dropdown-menu"
      );
      allDropdowns.forEach((menu) => {
        menu.classList.remove("show");
      });

      const enrolledClassesDropdown = this.elements.enrolledClasses;
      if (
        enrolledClassesDropdown &&
        enrolledClassesDropdown.classList.contains("open")
      ) {
        this.toggleEnrolledClassesDropdown();
      }
    });
  }

  handleClickOutside(e) {
    // Handle announcement card collapse on outside click
    if (this.isAnnouncementExpanded) {
      const announcementCard = e.target.closest(".announcement-input-card");
      const modal = e.target.closest(".modal");
      const confirmationModal = e.target.closest(".confirmation-modal");
      const dropdown = e.target.closest(".notification-dropdown-menu");

      // If click is outside the announcement card AND not inside any modal or dropdown
      if (!announcementCard && !modal && !confirmationModal && !dropdown) {
        // Set flag to indicate this is an outside click cancellation
        this.isCancelledByOutsideClick = true;
        this.cancelAnnouncement();
      }
    }

    // Close confirmation modal if clicking outside its content
    if (
      this.elements.confirmationModal &&
      this.elements.confirmationModal.classList.contains("show") &&
      !e.target.closest(".confirmation-modal-content")
    ) {
      this.hideConfirmationModal();
    }

    // Close dropdown menus when clicking outside
    if (
      !e.target.closest(".notification-menu-container") &&
      !e.target.closest(".notification-dropdown-menu")
    ) {
      const allDropdowns = document.querySelectorAll(
        ".notification-dropdown-menu"
      );
      allDropdowns.forEach((menu) => {
        menu.classList.remove("show");
        menu.style.display = "none";
      });
    }
  }

  handleResize() {
    const sidebar = this.elements.sidebar;
    const contentWrapper = this.elements.contentWrapper;
    const courseTopNav = this.elements.courseTopNav;

    if (window.innerWidth <= 1024) {
      sidebar.classList.remove("open");
      contentWrapper.classList.remove("sidebar-open");
      courseTopNav.classList.remove("sidebar-open");
    }
  }

  setupAccessibility() {
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], input, textarea, a'
    );
    interactiveElements.forEach((element) => {
      if (
        !element.getAttribute("aria-label") &&
        !element.getAttribute("aria-labelledby") &&
        !element.hasAttribute("title")
      ) {
        const text = element.textContent?.trim() || element.placeholder?.trim();
        if (text) {
          element.setAttribute("aria-label", text);
        }
      }
    });

    document.body.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }
    });

    document.body.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-navigation");
    });

    const style = document.createElement("style");
    style.innerHTML = `
      .keyboard-navigation *:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  setupPerformanceOptimizations() {
    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          observer.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));

    const debouncedResize = this.debounce(() => {
      this.handleResize();
    }, 250);

    window.addEventListener("resize", debouncedResize);
  }

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

  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// Global reference for easy access
let streamManager;

// Initialize the stream manager
document.addEventListener("DOMContentLoaded", () => {
  streamManager = new StreamManager();
});

// Additional utility functions
window.addEventListener("beforeunload", (e) => {
  if (streamManager && streamManager.elements.editorContent) {
    const content = streamManager.elements.editorContent.innerHTML;
    if (content.trim()) {
      localStorage.setItem("announcement_draft", content);
    }
  }
});

// Service Worker for offline functionality (optional)
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

// Performance monitoring
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
  if (streamManager && !localStorage.getItem("announcement_draft")) {
    streamManager.cancelAnnouncement();
  }
});

// Global error handling
window.addEventListener("error", (e) => {
  console.error("Global error:", e.error);
  if (streamManager) {
    streamManager.showNotification(
      "An error occurred. Please try again.",
      "error"
    );
  }
});

// Network status monitoring
window.addEventListener("online", () => {
  if (streamManager) {
    streamManager.showNotification("Connection restored", "success");
  }
});

window.addEventListener("offline", () => {
  if (streamManager) {
    streamManager.showNotification("You are offline", "info");
  }
});

// Visibility change handling
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Page is hidden - pause auto-refresh if any
  } else {
    // Page is visible - resume operations
    if (streamManager) {
      console.log("Page became visible, refreshing posts...");
      streamManager.loadPosts();
      streamManager.loadUpcomingAssignments();
    }
  }
});

// Add a manual refresh function for testing
window.refreshPosts = function () {
  if (streamManager) {
    console.log("Manual refresh triggered");
    streamManager.loadPosts();
    streamManager.loadUpcomingAssignments();
  }
};

// Debug function to check localStorage
window.checkAssignments = function () {
  if (streamManager && streamManager.courseId) {
    const key = `assignments_${streamManager.courseId}`;
    const assignments = localStorage.getItem(key);
    console.log("Assignment key:", key);
    console.log("Stored assignments:", assignments);
    console.log("Parsed assignments:", JSON.parse(assignments || "[]"));
  } else {
    console.log("No stream manager or course ID found");
    console.log("All localStorage keys:", Object.keys(localStorage));
  }
};
