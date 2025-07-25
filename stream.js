class StreamManager {
  constructor() {
    this.attachments = [];
    this.availableCourses = []; // ব্যবহারকারীর তৈরি করা কোর্সগুলো এখানে থাকবে
    this.availableStudents = []; // সমস্ত উপলব্ধ শিক্ষার্থী এখানে থাকবে
    this.selectedCourses = [];
    this.selectedStudents = [];
    this.assignToAll = true; // For classwork assignment
    this.isAnnouncementExpanded = false;
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
    this.loadAvailableCoursesAndStudents(); // এই ফাংশনটি ব্যবহারকারীর কোর্স এবং শিক্ষার্থীদের লোড করবে
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
      selectedCourse: document.getElementById("selectedCourse"),
      attachedFilesDisplay: document.getElementById("attachedFilesDisplay"),
      attachedFilesList: document.getElementById("attachedFilesList"),
      // Add elements for student selector modal
      studentSelectorModal: document.getElementById("studentSelectorModal"),
      allStudentsRadio: document.getElementById("allStudents"),
      specificStudentsRadio: document.getElementById("specificStudents"),
      specificStudentsList: document.getElementById("specificStudentsList"),
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

    // Course code display click
    if (this.elements.courseCodeDisplay) {
      this.elements.courseCodeDisplay.addEventListener("click", () => {
        this.showCourseCodeModal();
      });
    }

    // Enhanced announcement functionality
    if (this.elements.announcementPlaceholder) {
      this.elements.announcementPlaceholder.addEventListener("click", () =>
        this.expandAnnouncement()
      );
    }

    // Enhanced click outside detection
    document.addEventListener("click", (e) => this.handleClickOutside(e));

    // Enhanced resize handling
    window.addEventListener("resize", () => this.handleResize());

    // Setup rich text editor
    this.setupRichTextEditor();

    // Student selector radio button change listener
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
    this.setupAutoSave();
    this.setupThemeDetection();
    this.setupProgressIndicators();
    this.setupAccessibility(); // Added accessibility setup
    this.setupPerformanceOptimizations(); // Added performance optimizations
  }

  toggleSidebar() {
    this.elements.sidebar.classList.toggle("open");
    this.elements.contentWrapper.classList.toggle("sidebar-open");
    this.elements.courseTopNav.classList.toggle("sidebar-open");

    // Add smooth animation effect
    this.elements.sidebar.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    this.elements.contentWrapper.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    this.elements.courseTopNav.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
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

  // New announcement expansion method
  expandAnnouncement() {
    this.isAnnouncementExpanded = true;
    this.elements.announcementPlaceholder.style.display = "none";
    this.elements.announcementEditorExpanded.style.display = "block";
    this.elements.announcementActions.style.display = "flex";

    // Focus on editor content
    if (this.elements.editorContent) {
      this.elements.editorContent.focus();
    }

    // Add animation
    this.elements.announcementEditorExpanded.style.animation =
      "fadeIn 0.3s ease";
    this.elements.announcementActions.style.animation =
      "fadeIn 0.3s ease 0.1s both";
  }

  // Cancel announcement method
  cancelAnnouncement() {
    this.isAnnouncementExpanded = false;
    this.elements.announcementPlaceholder.style.display = "block";
    this.elements.announcementEditorExpanded.style.display = "none";
    this.elements.announcementActions.style.display = "none";

    // Clear content
    if (this.elements.editorContent) {
      this.elements.editorContent.innerHTML = "";
    }

    // Clear attachments
    this.attachments = [];
    this.updateAttachedFilesDisplay();

    this.showNotification("Announcement cancelled", "info");
  }

  // Post announcement method
  postAnnouncement() {
    const content = this.elements.editorContent.innerHTML.trim();

    if (!content) {
      this.showNotification("Please write something", "error");
      return;
    }

    // Show loading state
    const postBtn = document.querySelector(".post-btn");
    if (postBtn) {
      postBtn.textContent = "Posting...";
      postBtn.disabled = true;
    }

    // Determine target students
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
      targetStudents = ["all"]; // Default to all if no selection is made
    }

    // Simulate API call delay
    setTimeout(() => {
      const announcement = {
        id: Date.now(),
        author: this.currentUser,
        content: content,
        attachments: [...this.attachments],
        timestamp: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        targetCourses: [this.courseId],
        targetStudents: targetStudents, // Use selected students
        comments: [],
        likes: 0,
      };

      // Save announcement
      this.saveAnnouncementToCourse(announcement, this.courseId);
      this.loadPosts();
      this.cancelAnnouncement();

      // Reset button
      if (postBtn) {
        postBtn.textContent = "Post";
        postBtn.disabled = false;
      }

      this.showNotification("Announcement posted successfully!", "success");
    }, 1000);
  }

  // Course code related methods
  showCourseCodeModal() {
    const modal = new bootstrap.Modal(
      document.getElementById("courseCodeModal")
    );
    modal.show();
  }

  copyCourseCode() {
    const courseCode = this.elements.courseCodeText.textContent;
    navigator.clipboard
      .writeText(courseCode)
      .then(() => {
        this.showNotification("Course code copied to clipboard!", "success");
      })
      .catch(() => {
        this.showNotification("Failed to copy course code", "error");
      });
  }

  // Course selection methods
  selectCourse(courseName) {
    if (this.elements.selectedCourse) {
      this.elements.selectedCourse.textContent = courseName;
    }
  }

  // Student selector methods
  openStudentSelector() {
    this.populateStudentList();
    const modal = new bootstrap.Modal(
      document.getElementById("studentSelectorModal")
    );
    modal.show();
  }

  populateStudentList() {
    if (!this.elements.specificStudentsList) return;

    this.elements.specificStudentsList.innerHTML = ""; // Clear previous list

    // Get students for the current course
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

  // Attachment methods
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

  // Schedule post method
  schedulePost() {
    this.showNotification("Schedule feature coming soon!", "info");
  }

  loadAvailableCoursesAndStudents() {
    // ব্যবহারকারীর ড্যাশবোর্ড থেকে সমস্ত কোর্স লোড করুন
    const userDashboard = this.getUserDashboard();
    this.availableCourses = userDashboard.courses || [];

    // সমস্ত কোর্স থেকে সমস্ত শিক্ষার্থী সংগ্রহ করুন
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

        // Toggle active class for visual feedback
        button.classList.toggle("active");
        if (this.elements.editorContent) {
          this.elements.editorContent.focus();
        }
      });
    });

    // Ensure active state is maintained when content is selected/deselected
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

    // Course code display করুন (only in the dedicated section, not in banner)
    if (this.elements.courseCodeText && this.currentCourse.code) {
      this.elements.courseCodeText.textContent = this.currentCourse.code;
      document.getElementById("courseCodeLarge").textContent =
        this.currentCourse.code;
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

    // Always display subject and room if available
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
      // Teacher sees: student count
      const studentCount = document.createElement("p");
      studentCount.innerHTML = `Students: ${
        this.currentCourse.students ? this.currentCourse.students.length : 0
      }`;
      additionalInfo.appendChild(studentCount);
    } else {
      // Student sees: teacher name
      const teacher = document.createElement("p");
      teacher.innerHTML = `Teacher: ${this.currentCourse.teacher}`;
      additionalInfo.appendChild(teacher);
    }
  }

  loadEnrolledClasses() {
    const enrolledClasses = document.getElementById("enrolledClasses");
    if (!enrolledClasses) return;

    const userDashboard = this.getUserDashboard();
    const userCourses = userDashboard.courses || [];

    if (userCourses.length === 0) {
      enrolledClasses.innerHTML = "";
      return;
    }

    enrolledClasses.innerHTML = "";

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
      courseItem.appendChild(courseName);
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

  loadPosts() {
    const posts = this.getCourseAnnouncements();

    if (posts.length === 0) {
      if (this.elements.noPosts) this.elements.noPosts.style.display = "block";
      if (this.elements.streamPosts) this.elements.streamPosts.innerHTML = "";
      return;
    }

    if (this.elements.noPosts) this.elements.noPosts.style.display = "none";
    this.renderPosts(posts);
  }

  getCourseAnnouncements() {
    const courseKey = `announcements_${this.courseId}`;
    return JSON.parse(localStorage.getItem(courseKey) || "[]");
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

    const postHeader = document.createElement("div");
    postHeader.className = "post-header";

    const avatar = document.createElement("div");
    avatar.className = "post-avatar";
    avatar.textContent = post.author.charAt(0).toUpperCase();

    const postInfo = document.createElement("div");
    postInfo.className = "post-info";

    const author = document.createElement("div");
    author.className = "post-author";
    author.textContent = post.author;

    const date = document.createElement("div");
    date.className = "post-date";
    date.textContent = post.timestamp;

    postInfo.appendChild(author);
    postInfo.appendChild(date);

    const postMenu = document.createElement("div");
    postMenu.className = "post-menu";
    postMenu.innerHTML = '<span class="material-icons">more_vert</span>';

    postHeader.appendChild(avatar);
    postHeader.appendChild(postInfo);
    postHeader.appendChild(postMenu);

    const postContent = document.createElement("div");
    postContent.className = "post-content";
    postContent.innerHTML = post.content;

    // Add attachments if any
    if (post.attachments && post.attachments.length > 0) {
      const attachmentsDiv = document.createElement("div");
      attachmentsDiv.className = "post-attachments";

      post.attachments.forEach((attachment) => {
        const attachmentElement = this.createAttachmentElement(attachment);
        attachmentsDiv.appendChild(attachmentElement);
      });

      postDiv.appendChild(attachmentsDiv);
    }

    const postActions = document.createElement("div");
    postActions.className = "post-actions";

    const likeCount = document.createElement("span");
    likeCount.className = "like-count";
    likeCount.innerHTML =
      '<span class="material-icons">thumb_up</span> ' + post.likes;

    const commentCount = document.createElement("span");
    commentCount.className = "comment-count";
    commentCount.innerHTML =
      '<span class="material-icons">comment</span> ' + post.comments.length;

    postActions.appendChild(likeCount);
    postActions.appendChild(commentCount);

    postDiv.appendChild(postHeader);
    postDiv.appendChild(postContent);
    postDiv.appendChild(postActions);

    return postDiv;
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

    // Add click handler for links
    if (attachment.url) {
      attachmentDiv.addEventListener("click", () => {
        window.open(attachment.url, "_blank");
      });

      attachmentDiv.addEventListener("mouseenter", () => {
        attachmentDiv.style.transform = "translateY(-1px)"; // Reduced translateY
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
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  setupTooltips() {
    // Tooltip functionality for enhanced UX
    const tooltipElements = document.querySelectorAll("[title]"); // Use title attribute for simplicity
    tooltipElements.forEach((element) => {
      element.addEventListener("mouseenter", (e) => {
        const tooltipText = e.target.getAttribute("title");
        if (!tooltipText) return; // Skip if no title

        // Store original title and remove it to prevent default browser tooltip
        e.target._originalTitle = tooltipText;
        e.target.removeAttribute("title");

        const tooltip = document.createElement("div");
        tooltip.className = "custom-tooltip"; // Use a custom class
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
        // Restore original title
        if (e.target._originalTitle) {
          e.target.setAttribute("title", e.target._originalTitle);
          delete e.target._originalTitle;
        }
      });
    });

    // Add CSS for custom-tooltip
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
        pointer-events: none; /* Allow clicks through tooltip */
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
    // Enhanced keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Enter to post announcement
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        this.isAnnouncementExpanded
      ) {
        e.preventDefault();
        this.postAnnouncement();
      }

      // Escape to cancel announcement
      if (e.key === "Escape" && this.isAnnouncementExpanded) {
        this.cancelAnnouncement();
      }

      // Ctrl/Cmd + K to focus on search (example, assuming a search input exists)
      // if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      //   e.preventDefault();
      //   const searchInput = document.getElementById("searchInput"); // Replace with your search input ID
      //   if (searchInput) {
      //     searchInput.focus();
      //   }
      // }
    });
  }

  setupAutoSave() {
    // Auto-save announcement draft functionality
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

      // Load draft on page load
      const draft = localStorage.getItem("announcement_draft");
      if (draft && this.elements.editorContent) {
        this.elements.editorContent.innerHTML = draft;
        // If there's a draft, expand the announcement input area
        if (draft.trim() !== "") {
          this.expandAnnouncement();
        }
      }
    }
  }

  setupThemeDetection() {
    // Dark/Light theme detection and application
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    // No dark theme application as per request, but keeping the listener for future extensibility
    // if (prefersDarkScheme.matches) {
    //   document.body.classList.add("dark-theme");
    // }

    prefersDarkScheme.addEventListener("change", (e) => {
      // if (e.matches) {
      //   document.body.classList.add("dark-theme");
      // } else {
      //   document.body.classList.remove("dark-theme");
      // }
    });
  }

  setupProgressIndicators() {
    // Loading progress indicators for better UX
    const showLoading = (element) => {
      element.classList.add("loading");
      // Example: Add a spinner or overlay
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

    // Add loading states to various elements
    this.showLoading = showLoading;
    this.hideLoading = hideLoading;

    // Add CSS for loading spinner
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
    // Real-time notification system
    this.notificationQueue = [];
    this.isShowingNotification = false;

    // Function to show notifications from queue
    const processQueue = () => {
      if (this.notificationQueue.length > 0 && !this.isShowingNotification) {
        this.isShowingNotification = true;
        const { message, type } = this.notificationQueue.shift();
        this.showNotification(message, type);
        setTimeout(() => {
          this.isShowingNotification = false;
          processQueue(); // Process next notification after current one finishes
        }, 3500); // Notification display time + a small delay
      }
    };

    // Override showNotification to use queue
    const originalShowNotification = this.showNotification.bind(this);
    this.showNotification = (message, type) => {
      this.notificationQueue.push({ message, type });
      processQueue();
    };
  }

  handleClickOutside(e) {
    // Enhanced click outside handling
    if (this.isAnnouncementExpanded) {
      const announcementCard = e.target.closest(".announcement-input-card");
      const modal = e.target.closest(".modal"); // Check if click is inside a modal
      if (!announcementCard && !modal) {
        // Don't auto-cancel if user has typed content
        const content = this.elements.editorContent?.innerHTML?.trim();
        if (!content) {
          this.cancelAnnouncement();
        }
      }
    }
  }

  handleResize() {
    // Enhanced responsive behavior
    const sidebar = this.elements.sidebar;
    const contentWrapper = this.elements.contentWrapper;
    const courseTopNav = this.elements.courseTopNav;

    if (window.innerWidth <= 1024) {
      sidebar.classList.remove("open");
      contentWrapper.classList.remove("sidebar-open");
      courseTopNav.classList.remove("sidebar-open");
    }
  }

  // Utility methods
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

  // Accessibility improvements
  setupAccessibility() {
    // Add ARIA labels and roles
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], input, textarea, a' // Added 'a' for links
    );
    interactiveElements.forEach((element) => {
      if (
        !element.getAttribute("aria-label") &&
        !element.getAttribute("aria-labelledby") &&
        !element.hasAttribute("title") // Check if title already exists
      ) {
        const text = element.textContent?.trim() || element.placeholder?.trim();
        if (text) {
          element.setAttribute("aria-label", text);
        }
      }
    });

    // Improve focus management (visual outline for keyboard users)
    document.body.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }
    });

    document.body.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-navigation");
    });

    // Add CSS for keyboard-navigation focus outline
    const style = document.createElement("style");
    style.innerHTML = `
      .keyboard-navigation *:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  // Performance optimization
  setupPerformanceOptimizations() {
    // Lazy load images (if any, though not explicitly in this HTML)
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

    // Debounce resize handler
    const debouncedResize = this.debounce(() => {
      this.handleResize();
    }, 250);

    window.addEventListener("resize", debouncedResize);
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
  // Save any unsaved changes
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
      streamManager.loadPosts(); // Refresh posts when user returns
    }
  }
});
