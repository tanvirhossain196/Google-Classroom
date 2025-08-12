// studentStream.js
class StreamManager {
  constructor() {
    this.attachments = [];
    this.availableCourses = []; // ব্যবহারকারীর তৈরি করা কোর্সগুলো এখানে থাকবে
    this.selectedCourses = [];
    this.isAnnouncementExpanded = false;
    this.currentEditingId = null; // Track which post is being edited
    this.pendingDeleteId = null; // Track which post is pending deletion
    this.pendingDeleteType = null; // 'announcement' or 'comment'
    this.pendingDeleteCommentInfo = null; // { postId, commentId } for comments
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
    this.loadAvailableCourses(); // এই ফাংশনটি ব্যবহারকারীর কোর্স এবং শিক্ষার্থীদের লোড করবে
    this.loadUpcomingAssignments(); // Load upcoming assignments
    this.initializeAnnouncementEditor(); // Initialize announcement editor
  }

  setupElements() {
    this.elements = {
      menuBtn: document.getElementById("menuBtn"),
      sidebar: document.getElementById("sidebar"),
      contentWrapper: document.getElementById("contentWrapper"),
      courseTopNav: document.getElementById("courseTopNav"),
      userInitial: document.getElementById("userInitial"),
      streamPosts: document.getElementById("streamPosts"),
      noPosts: document.getElementById("noPosts"),
      classesLink: document.getElementById("classesLink"),
      settingsLink: document.getElementById("settingsLink"),
      currentCourseName: document.getElementById("currentCourseName"),
      courseHeaderSection: document.querySelector(".course-header-section"),
      upcomingContent: document.getElementById("upcomingContent"),
      // Enrolled Classes Dropdown
      enrolledClassesDropdownToggle: document.getElementById(
        "enrolledClassesDropdownToggle"
      ),
      enrolledClasses: document.getElementById("enrolledClasses"),

      // Announcement elements
      announcementInputCard: document.getElementById("announcementInputCard"),
      announcementPlaceholder: document.getElementById(
        "announcementPlaceholder"
      ),
      announcementHeader: document.getElementById("announcementHeader"),
      announcementEditorExpanded: document.getElementById(
        "announcementEditorExpanded"
      ),
      announcementEditorContent: document.getElementById(
        "announcementEditorContent"
      ),
      announcementActions: document.getElementById("announcementActions"),
      cancelAnnouncementBtn: document.getElementById("cancelAnnouncementBtn"),
      postAnnouncementBtn: document.getElementById("postAnnouncementBtn"),
      attachedFilesDisplay: document.getElementById("attachedFilesDisplay"),
      attachedFilesList: document.getElementById("attachedFilesList"),

      // Toolbar buttons
      boldBtn: document.querySelector('[data-command="bold"]'),
      italicBtn: document.querySelector('[data-command="italic"]'),
      numberedListBtn: document.querySelector(
        '[data-command="insertOrderedList"]'
      ),

      // Attachment buttons
      attachVideoLinkBtn: document.getElementById("attachVideoLinkBtn"),
      attachFileBtn: document.getElementById("attachFileBtn"),
      attachLinkBtn: document.getElementById("attachLinkBtn"),
      attachDriveBtn: document.getElementById("attachDriveBtn"),

      // Attachment Modals
      attachVideoLinkModal: new bootstrap.Modal(
        document.getElementById("attachVideoLinkModal")
      ),
      videoLinkInput: document.getElementById("videoLinkInput"),
      addVideoLinkBtn: document.getElementById("addVideoLinkBtn"),

      // attachFileModal: new bootstrap.Modal( // Removed as per requirements
      //   document.getElementById("attachFileModal")
      // ),
      fileAttachmentInput: document.getElementById("fileAttachmentInput"),
      // addFileAttachmentBtn: document.getElementById("addFileAttachmentBtn"), // Removed as per requirements

      attachLinkModal: new bootstrap.Modal(
        document.getElementById("attachLinkModal")
      ),
      linkInput: document.getElementById("linkInput"),
      addLinkBtn: document.getElementById("addLinkBtn"),

      attachDriveModal: new bootstrap.Modal(
        document.getElementById("attachDriveModal")
      ),
      driveLinkInput: document.getElementById("driveLinkInput"),
      addDriveLinkBtn: document.getElementById("addDriveLinkBtn"),

      // Student Selector Modal (Removed as per requirements)
      // confirmationModal
      confirmationModal: document.getElementById("confirmationModal"),
      confirmationMessage: document.getElementById("confirmationMessage"),
      cancelConfirmationBtn: document.getElementById("cancelConfirmationBtn"),
      confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
    };
  }

  setupEventListeners() {
    // Enhanced menu functionality
    this.elements.menuBtn.addEventListener("click", () => this.toggleSidebar());

    // Enhanced click outside detection
    document.addEventListener("click", (e) => this.handleClickOutside(e));

    // Enhanced resize handling
    window.addEventListener("resize", () => this.handleResize());

    // Enrolled Classes Dropdown
    if (this.elements.enrolledClassesDropdownToggle) {
      this.elements.enrolledClassesDropdownToggle.addEventListener(
        "click",
        () => this.toggleEnrolledClassesDropdown()
      );
    }

    // Announcement Event Listeners
    this.elements.announcementPlaceholder.addEventListener("click", () =>
      this.expandAnnouncementEditor()
    );
    this.elements.cancelAnnouncementBtn.addEventListener("click", () =>
      this.collapseAnnouncementEditor()
    );
    this.elements.postAnnouncementBtn.addEventListener("click", () =>
      this.postAnnouncement()
    );

    // Toolbar event listeners
    this.elements.boldBtn.addEventListener("click", () =>
      this.applyFormat("bold")
    );
    this.elements.italicBtn.addEventListener("click", () =>
      this.applyFormat("italic")
    );
    this.elements.numberedListBtn.addEventListener("click", () =>
      this.applyFormat("insertOrderedList")
    );

    // Attachment button event listeners
    this.elements.attachVideoLinkBtn.addEventListener("click", () =>
      this.elements.attachVideoLinkModal.show()
    );
    this.elements.addVideoLinkBtn.addEventListener("click", () =>
      this.addAttachment("video")
    );

    // Directly open file input for file attachment
    this.elements.attachFileBtn.addEventListener("click", () => {
      this.elements.fileAttachmentInput.click(); // Trigger file input click
    });
    this.elements.fileAttachmentInput.addEventListener("change", () =>
      this.addAttachment("file")
    );

    this.elements.attachLinkBtn.addEventListener("click", () =>
      this.elements.attachLinkModal.show()
    );
    this.elements.addLinkBtn.addEventListener("click", () =>
      this.addAttachment("link")
    );

    this.elements.attachDriveBtn.addEventListener("click", () =>
      this.elements.attachDriveModal.show()
    );
    this.elements.addDriveLinkBtn.addEventListener("click", () =>
      this.addAttachment("drive")
    );

    // Confirmation modal event listeners
    this.elements.cancelConfirmationBtn.addEventListener("click", () =>
      this.hideConfirmationModal()
    );
    this.elements.confirmDeleteBtn.addEventListener("click", () =>
      this.confirmDelete()
    );
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
      console.log("Course loaded with ID:", this.courseId); // Debug log
      console.log("Current course:", this.currentCourse); // Debug log

      this.updateCourseDisplay();
      this.loadEnrolledClasses(); // Ensure enrolled classes are loaded after current course
    } catch (error) {
      console.error("Error loading course data:", error); // Debug log
      this.showErrorAndRedirect("কোর্স লোড করতে সমস্যা হয়েছে");
    }
  }

  showErrorAndRedirect(message) {
    alert(message);
    this.navigateWithAnimation("student.html");
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
    this.navigateWithAnimation("student.html");
  }

  // Load upcoming assignments from classwork
  loadUpcomingAssignments() {
    const assignmentsKey = `assignments_${this.courseId}`;
    const assignments = JSON.parse(
      localStorage.getItem(assignmentsKey) || "[]"
    );

    // Filter assignments that are due soon (within next 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingAssignments = assignments.filter((assignment) => {
      if (!assignment.dueDate) return false;
      const dueDate = new Date(assignment.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    });

    // Update upcoming section
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

  // Open assignment details
  openAssignment(assignmentId) {
    // Navigate to assignment page or show modal
    this.showNotification("Opening assignment...", "info");
    // In a real implementation, this would navigate to the assignment details
  }

  // Course selection methods
  selectCourse(courseName) {
    if (this.elements.selectedCourse) {
      this.elements.selectedCourse.textContent = courseName;
    }
  }

  // Enrolled Classes Dropdown Toggle
  toggleEnrolledClassesDropdown() {
    const dropdownContent = this.elements.enrolledClasses;
    const dropdownToggle = this.elements.enrolledClassesDropdownToggle;

    if (dropdownContent && dropdownToggle) {
      dropdownContent.classList.toggle("open");
      dropdownToggle.classList.toggle("open");
    }
  }

  loadAvailableCourses() {
    // ব্যবহারকারীর ড্যাশবোর্ড থেকে সমস্ত কোর্স লোড করুন
    const userDashboard = this.getUserDashboard();
    this.availableCourses = userDashboard.courses || [];
  }

  getUserDashboard() {
    const dashboardKey = `dashboard_${this.currentUser}`;
    return JSON.parse(localStorage.getItem(dashboardKey) || '{"courses": []}');
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

  loadPosts() {
    console.log("Loading posts for course ID:", this.courseId); // Debug log

    const posts = this.getCourseAnnouncements();
    const assignments = this.getCourseAssignments();

    console.log("Found announcements:", posts.length); // Debug log
    console.log("Found assignments:", assignments.length); // Debug log
    console.log("Assignments data:", assignments); // Debug log

    // Combine announcements and assignments
    const allPosts = [...posts];

    // Add assignment notifications
    assignments.forEach((assignment) => {
      console.log("Processing assignment:", assignment); // Debug log

      const assignmentPost = {
        id: `assignment_${assignment.id}`,
        type: "assignment",
        author: assignment.author || this.currentUser || "SurePay",
        content: `posted a new assignment: <strong>${assignment.title}</strong>`,
        timestamp: assignment.createdAt, // Use ISO string directly
        assignment: assignment,
        comments: [],
        isEditable: false, // Students cannot edit assignments
        originalText: assignment.title, // Store original title for editing
      };
      allPosts.push(assignmentPost);
    });

    console.log("Total posts after combining:", allPosts.length); // Debug log

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
      console.log("No course ID found"); // Debug log
      return [];
    }

    const assignmentsKey = `assignments_${this.courseId}`;
    console.log("Looking for assignments with key:", assignmentsKey); // Debug log

    const assignments = JSON.parse(
      localStorage.getItem(assignmentsKey) || "[]"
    );
    console.log("Retrieved assignments:", assignments); // Debug log

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
    postDiv.setAttribute("data-post-id", post.id);

    if (post.type === "assignment") {
      // Create notification-style header for assignments
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

      notificationHeader.appendChild(notificationContent);
      postDiv.appendChild(notificationHeader);
    } else {
      // Regular announcement post
      postDiv.classList.add(
        post.attachments && post.attachments.length > 0
          ? "with-attachments"
          : "text-only"
      );

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
      date.textContent = this.formatTimestamp(post.timestamp);

      postInfo.appendChild(author);
      postInfo.appendChild(date);

      const menuContainer = document.createElement("div");
      menuContainer.className = "notification-menu-container";

      const menuDots = document.createElement("button");
      menuDots.className = "notification-menu-dots";
      menuDots.innerHTML = '<span class="material-icons">more_vert</span>';
      menuDots.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent click from closing immediately
        this.togglePostDropdown(post.id, menuDots);
      });

      const dropdownMenu = document.createElement("div");
      dropdownMenu.className = "notification-dropdown-menu";
      dropdownMenu.id = `dropdown-${post.id}`;

      const editItem = document.createElement("button");
      editItem.className = "notification-dropdown-item";
      editItem.innerHTML = '<span class="material-icons">edit</span> Edit';
      editItem.addEventListener("click", () => this.editPost(post.id));

      const deleteItem = document.createElement("button");
      deleteItem.className = "notification-dropdown-item delete";
      deleteItem.innerHTML =
        '<span class="material-icons">delete</span> Delete';
      deleteItem.addEventListener("click", () => this.deletePost(post.id));

      // Only show edit/delete if current user is the author
      if (this.currentUser === post.author) {
        dropdownMenu.appendChild(editItem);
        dropdownMenu.appendChild(deleteItem);
      } else {
        // Optionally, show a "Report" or "Hide" option for other users
        const reportItem = document.createElement("button");
        reportItem.className = "notification-dropdown-item";
        reportItem.innerHTML =
          '<span class="material-icons">flag</span> Report';
        reportItem.addEventListener("click", () =>
          this.showNotification("Post reported!", "info")
        );
        dropdownMenu.appendChild(reportItem);
      }

      menuContainer.appendChild(menuDots);
      menuContainer.appendChild(dropdownMenu);

      postHeader.appendChild(avatar);
      postHeader.appendChild(postInfo);
      postHeader.appendChild(menuContainer);

      const postContent = document.createElement("div");
      postContent.className = "post-content";
      postContent.innerHTML = post.content;
      postContent.id = `post-content-${post.id}`; // Add ID for editing

      postDiv.appendChild(postHeader);
      postDiv.appendChild(postContent);

      // Add attachments if any
      if (post.attachments && post.attachments.length > 0) {
        const attachmentsDiv = document.createElement("div");
        attachmentsDiv.className = "post-attachments";

        post.attachments.forEach((attachment) => {
          const attachmentElement =
            this.createPostAttachmentElement(attachment);
          attachmentsDiv.appendChild(attachmentElement);
        });

        postDiv.appendChild(attachmentsDiv);
      }

      const postActions = document.createElement("div");
      postActions.className = "post-actions";

      postDiv.appendChild(postActions);

      // Add comments section
      const commentsSection = document.createElement("div");
      commentsSection.className = "post-comments-section";

      const commentInputContainer = document.createElement("div");
      commentInputContainer.className = "comment-input-container";

      const commentInputAvatar = document.createElement("div");
      commentInputAvatar.className = "comment-input-avatar";
      commentInputAvatar.textContent = this.currentUser.charAt(0).toUpperCase();

      const commentInputField = document.createElement("input");
      commentInputField.type = "text";
      commentInputField.className = "comment-input-field";
      commentInputField.placeholder = "Add a comment...";
      commentInputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.addComment(post.id, commentInputField.value);
          commentInputField.value = ""; // Clear input
        }
      });

      const commentPostBtn = document.createElement("button");
      commentPostBtn.className = "comment-post-btn";
      commentPostBtn.innerHTML = '<span class="material-icons">send</span>';
      commentPostBtn.addEventListener("click", () => {
        this.addComment(post.id, commentInputField.value);
        commentInputField.value = ""; // Clear input
      });

      commentInputContainer.appendChild(commentInputAvatar);
      commentInputContainer.appendChild(commentInputField);
      commentInputContainer.appendChild(commentPostBtn);
      commentsSection.appendChild(commentInputContainer);

      const commentsListContainer = document.createElement("div");
      commentsListContainer.className = "comments-list";
      commentsListContainer.id = `comments-list-${post.id}`;
      commentsSection.appendChild(commentsListContainer);

      // Render comments
      this.renderComments(post.id, post.comments, commentsListContainer);

      postDiv.appendChild(commentsSection);
    }

    return postDiv;
  }

  // New: Toggle post dropdown menu
  togglePostDropdown(postId, button) {
    const dropdown = document.getElementById(`dropdown-${postId}`);
    if (dropdown) {
      // Close all other dropdowns
      document
        .querySelectorAll(".notification-dropdown-menu.show")
        .forEach((menu) => {
          if (menu.id !== `dropdown-${postId}`) {
            menu.classList.remove("show");
          }
        });
      dropdown.classList.toggle("show");

      // Position the dropdown relative to the button
      const rect = button.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + 5}px`; // 5px below the button
      dropdown.style.left = `${
        rect.left - dropdown.offsetWidth + rect.width
      }px`; // Align right edge with button's right edge
    }
  }

  // New: Edit post
  editPost(postId) {
    this.currentEditingId = postId;
    const postContentDiv = document.getElementById(`post-content-${postId}`);
    const post = this.getCourseAnnouncements().find((p) => p.id === postId);

    if (!postContentDiv || !post) return;

    // Hide the dropdown menu
    const dropdown = document.getElementById(`dropdown-${postId}`);
    if (dropdown) dropdown.classList.remove("show");

    // Create an editable input field
    const editModeDiv = document.createElement("div");
    editModeDiv.className = "notification-edit-mode";

    const editInput = document.createElement("textarea");
    editInput.className = "notification-edit-input";
    editInput.value = post.content; // Use innerHTML for rich text
    editInput.rows = 3; // Adjust rows as needed
    editInput.style.height = "auto"; // Allow textarea to grow
    editInput.addEventListener("input", () => {
      editInput.style.height = "auto";
      editInput.style.height = editInput.scrollHeight + "px";
    });
    setTimeout(() => {
      editInput.style.height = editInput.scrollHeight + "px";
      editInput.focus();
    }, 0);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "notification-edit-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "notification-edit-btn notification-cancel-btn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
      postContentDiv.innerHTML = post.content; // Revert to original content
      postContentDiv.style.display = "block";
      editModeDiv.remove();
      this.currentEditingId = null;
    });

    const saveBtn = document.createElement("button");
    saveBtn.className = "notification-edit-btn notification-save-btn";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
      const newContent = editInput.value;
      this.saveEditedPost(postId, newContent);
      postContentDiv.style.display = "block";
      editModeDiv.remove();
      this.currentEditingId = null;
    });

    actionsDiv.appendChild(cancelBtn);
    actionsDiv.appendChild(saveBtn);
    editModeDiv.appendChild(editInput);
    editModeDiv.appendChild(actionsDiv);

    // Replace content with edit mode
    postContentDiv.style.display = "none";
    postContentDiv.parentNode.insertBefore(
      editModeDiv,
      postContentDiv.nextSibling
    );
  }

  // New: Save edited post
  saveEditedPost(postId, newContent) {
    let announcements = this.getCourseAnnouncements();
    const postIndex = announcements.findIndex((p) => p.id === postId);

    if (postIndex > -1) {
      announcements[postIndex].content = newContent;
      localStorage.setItem(
        `announcements_${this.courseId}`,
        JSON.stringify(announcements)
      );
      this.showNotification("Announcement updated!", "success");
      this.loadPosts(); // Reload posts to reflect changes
    }
  }

  // New: Delete post
  deletePost(postId) {
    // Close dropdown first
    const dropdown = document.getElementById(`dropdown-${postId}`);
    if (dropdown) {
      dropdown.classList.remove("show");
    }

    this.pendingDeleteId = postId; // Store the ID of the post to be deleted
    this.pendingDeleteType = "announcement";
    this.showConfirmationModal(
      "Are you sure you want to delete this announcement? This action cannot be undone."
    );
  }

  // New: Show confirmation modal
  showConfirmationModal(message) {
    if (this.elements.confirmationMessage) {
      this.elements.confirmationMessage.textContent = message;
    }
    if (this.elements.confirmationModal) {
      this.elements.confirmationModal.classList.add("show");
    }
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }

  // New: Hide confirmation modal
  hideConfirmationModal() {
    if (this.elements.confirmationModal) {
      this.elements.confirmationModal.classList.remove("show");
    }
    this.pendingDeleteId = null; // Clear pending delete ID
    this.pendingDeleteType = null;
    this.pendingDeleteCommentInfo = null;
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  // New: Confirm deletion
  confirmDelete() {
    if (this.pendingDeleteType === "announcement") {
      const postIdToDelete = this.pendingDeleteId;
      const postElement = document.querySelector(
        `[data-post-id="${postIdToDelete}"]`
      );

      // Add fade out animation
      if (postElement) {
        postElement.classList.add("notification-fade-out");

        // Remove the notification after animation
        setTimeout(() => {
          postElement.remove();

          // Delete the announcement from localStorage
          let announcements = this.getCourseAnnouncements();
          announcements = announcements.filter((p) => p.id !== postIdToDelete);
          localStorage.setItem(
            `announcements_${this.courseId}`,
            JSON.stringify(announcements)
          );

          // Show success message
          this.showNotification("Announcement deleted successfully", "success");

          // Check if no posts remain
          this.checkForNoPosts();
        }, 400); // Match animation duration
      }
    } else if (
      this.pendingDeleteType === "comment" &&
      this.pendingDeleteCommentInfo
    ) {
      const { postId, commentId } = this.pendingDeleteCommentInfo;
      this.deleteCommentConfirmed(postId, commentId);
    }

    this.hideConfirmationModal(); // Hide the modal after action
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

  // Navigates to the assignment details page for students
  navigateToAssignment(assignment) {
    // Store assignment details
    localStorage.setItem("selectedAssignment", JSON.stringify(assignment));

    // Students are redirected to 'assignment-page.html'
    window.location.href = "assignment-page.html";
  }

  // Show notification method
  showNotification(message, type) {
    // Remove existing notifications to prevent stacking
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => notification.remove());

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      // Add fade out animation before removal
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => notification.remove(), 300); // Remove after animation
    }, 3000);
  }

  // Setup tooltips for enhanced UX
  setupTooltips() {
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

  // Setup keyboard shortcuts
  setupKeyboardShortcuts() {
    // Enhanced keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Escape to close confirmation modal
      if (e.key === "Escape") {
        if (
          this.elements.confirmationModal &&
          this.elements.confirmationModal.classList.contains("show")
        ) {
          this.hideConfirmationModal();
        }
      }
    });
  }

  // Handle click outside to close dropdowns
  handleClickOutside(e) {
    // Close dropdown menus when clicking outside
    document
      .querySelectorAll(".notification-dropdown-menu.show")
      .forEach((menu) => {
        if (!menu.previousElementSibling.contains(e.target)) {
          menu.classList.remove("show");
        }
      });

    document.querySelectorAll(".comment-dropdown-menu.show").forEach((menu) => {
      if (!menu.previousElementSibling.contains(e.target)) {
        menu.classList.remove("show");
      }
    });

    // Close sidebar enrolled classes dropdown if open and clicked outside
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

    // Collapse announcement editor if clicked outside and not expanded
    if (
      this.isAnnouncementExpanded &&
      !this.elements.announcementInputCard.contains(e.target) &&
      !e.target.closest(".modal") // Don't collapse if clicking inside a modal
    ) {
      this.collapseAnnouncementEditor();
    }
  }

  // Handle window resize
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

  // Other methods remain unchanged...

  // Announcement Editor Methods
  initializeAnnouncementEditor() {
    this.elements.announcementPlaceholder.classList.remove("hidden");
    this.elements.announcementHeader.classList.remove("expanded");
    this.elements.announcementEditorExpanded.classList.remove("expanded");
    this.elements.announcementActions.classList.remove("expanded");
    this.elements.attachedFilesDisplay.style.display = "none";
    this.elements.announcementEditorContent.innerHTML = "";
    this.attachments = [];
  }

  expandAnnouncementEditor() {
    if (this.isAnnouncementExpanded) return;

    this.isAnnouncementExpanded = true;
    this.elements.announcementPlaceholder.classList.add("hidden");
    this.elements.announcementHeader.classList.add("expanded");
    this.elements.announcementEditorExpanded.classList.add("expanded");
    this.elements.announcementActions.classList.add("expanded");
    this.elements.announcementEditorContent.focus();
  }

  collapseAnnouncementEditor() {
    this.isAnnouncementExpanded = false;
    this.elements.announcementPlaceholder.classList.remove("hidden");
    this.elements.announcementHeader.classList.remove("expanded");
    this.elements.announcementEditorExpanded.classList.remove("expanded");
    this.elements.announcementActions.classList.remove("expanded");
    this.elements.attachedFilesDisplay.style.display = "none";
    this.elements.announcementEditorContent.innerHTML = ""; // Clear content
    this.attachments = []; // Clear attachments
  }

  postAnnouncement() {
    const content = this.elements.announcementEditorContent.innerHTML.trim();

    if (!content && this.attachments.length === 0) {
      this.showNotification("Announcement cannot be empty!", "error");
      return;
    }

    const newAnnouncement = {
      id: `announcement_${Date.now()}`, // Unique ID
      type: "announcement",
      author: this.currentUser,
      content: content,
      timestamp: new Date().toISOString(),
      attachments: this.attachments,
      comments: [], // Initialize comments array
      isEditable: true, // Announcements are editable
    };

    let announcements = this.getCourseAnnouncements();
    announcements.unshift(newAnnouncement); // Add to the beginning
    localStorage.setItem(
      `announcements_${this.courseId}`,
      JSON.stringify(announcements)
    );

    this.showNotification("Announcement posted!", "success");
    this.collapseAnnouncementEditor(); // Collapse and clear
    this.loadPosts(); // Reload posts to show the new one
  }

  applyFormat(command) {
    document.execCommand(command, false, null);
    this.elements.announcementEditorContent.focus();
  }

  addAttachment(type) {
    let attachment = {};
    let isValid = true;

    switch (type) {
      case "video":
        const videoLink = this.elements.videoLinkInput.value.trim();
        if (!videoLink || !videoLink.includes("youtube.com/watch")) {
          this.showNotification("Please enter a valid YouTube URL.", "error");
          isValid = false;
        } else {
          attachment = {
            id: `attach_${Date.now()}`,
            type: "video",
            name: "YouTube Video",
            url: videoLink,
            icon: "video",
          };
          this.elements.videoLinkInput.value = "";
          this.elements.attachVideoLinkModal.hide();
        }
        break;
      case "file":
        const fileInput = this.elements.fileAttachmentInput;
        if (fileInput.files.length === 0) {
          // This case might happen if the user opens the dialog and cancels
          isValid = false;
        } else {
          const file = fileInput.files[0];
          attachment = {
            id: `attach_${Date.now()}`,
            type: "file",
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            url: URL.createObjectURL(file), // For demo purposes
            icon: "file",
          };
          fileInput.value = ""; // Clear input
          // No modal to hide for file input
        }
        break;
      case "link":
        const link = this.elements.linkInput.value.trim();
        if (!link || !link.startsWith("http")) {
          this.showNotification("Please enter a valid URL.", "error");
          isValid = false;
        } else {
          attachment = {
            id: `attach_${Date.now()}`,
            type: "link",
            name: link.length > 30 ? link.substring(0, 27) + "..." : link,
            url: link,
            icon: "link",
          };
          this.elements.linkInput.value = "";
          this.elements.attachLinkModal.hide();
        }
        break;
      case "drive":
        const driveLink = this.elements.driveLinkInput.value.trim();
        if (!driveLink || !driveLink.includes("drive.google.com")) {
          this.showNotification(
            "Please enter a valid Google Drive URL.",
            "error"
          );
          isValid = false;
        } else {
          attachment = {
            id: `attach_${Date.now()}`,
            type: "drive",
            name: "Google Drive File",
            url: driveLink,
            icon: "drive",
          };
          this.elements.driveLinkInput.value = "";
          this.elements.attachDriveModal.hide();
        }
        break;
    }

    if (isValid) {
      this.attachments.push(attachment);
      this.renderAttachments();
      this.showNotification("Attachment added!", "success");
    }
  }

  renderAttachments() {
    if (this.attachments.length > 0) {
      this.elements.attachedFilesDisplay.style.display = "block";
      this.elements.attachedFilesList.innerHTML = "";
      this.attachments.forEach((attachment) => {
        const attachmentElement = this.createAttachmentElement(
          attachment,
          true
        ); // true for removable
        this.elements.attachedFilesList.appendChild(attachmentElement);
      });
    } else {
      this.elements.attachedFilesDisplay.style.display = "none";
      this.elements.attachedFilesList.innerHTML = "";
    }
  }

  createAttachmentElement(attachment, removable = false) {
    const attachmentDiv = document.createElement("div");
    attachmentDiv.className = "file-item";

    const icon = document.createElement("div");
    icon.className = `file-icon ${attachment.type}`;
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

    if (removable) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-file-btn";
      removeBtn.innerHTML = '<span class="material-icons">close</span>';
      removeBtn.title = "Remove attachment";
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent file-item click
        this.removeAttachment(attachment.id);
      });
      attachmentDiv.appendChild(removeBtn);
    }

    // Add click handler for links
    if (attachment.url) {
      attachmentDiv.addEventListener("click", () => {
        window.open(attachment.url, "_blank");
      });
    }

    return attachmentDiv;
  }

  // New function to create attachment elements for displayed posts
  createPostAttachmentElement(attachment) {
    const attachmentDiv = document.createElement("div");
    attachmentDiv.className = "post-attachment-item";

    const icon = document.createElement("div");
    icon.className = `post-attachment-icon ${attachment.type}`;
    icon.innerHTML = `<span class="material-icons">${this.getFileIcon(
      attachment.type
    )}</span>`;

    const info = document.createElement("div");
    info.className = "post-attachment-info";
    info.innerHTML = `
      <div class="post-attachment-name">${attachment.name}</div>
      <div class="post-attachment-size">${
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
    }

    return attachmentDiv;
  }

  removeAttachment(id) {
    this.attachments = this.attachments.filter((att) => att.id !== id);
    this.renderAttachments();
    this.showNotification("Attachment removed!", "info");
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

  // Commenting System Methods
  addComment(postId, commentText) {
    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      this.showNotification("Comment cannot be empty!", "error");
      return;
    }

    let announcements = this.getCourseAnnouncements();
    const postIndex = announcements.findIndex((p) => p.id === postId);

    if (postIndex > -1) {
      const newComment = {
        id: `comment_${Date.now()}`,
        author: this.currentUser,
        text: trimmedComment,
        timestamp: new Date().toISOString(),
      };
      announcements[postIndex].comments.push(newComment);
      localStorage.setItem(
        `announcements_${this.courseId}`,
        JSON.stringify(announcements)
      );
      this.showNotification("Comment added!", "success");
      this.renderComments(
        postId,
        announcements[postIndex].comments,
        document.getElementById(`comments-list-${postId}`)
      );
    }
  }

  renderComments(postId, comments, container) {
    container.innerHTML = ""; // Clear existing comments

    if (comments.length === 0) {
      return;
    }

    // Sort comments by timestamp (oldest first)
    comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const firstComment = comments[0];
    const remainingComments = comments.slice(1);

    // Render the first comment
    container.appendChild(this.createCommentElement(postId, firstComment));

    // Render remaining comments in a hidden container
    if (remainingComments.length > 0) {
      const hiddenCommentsDiv = document.createElement("div");
      hiddenCommentsDiv.className = "hidden-comments";
      hiddenCommentsDiv.id = `hidden-comments-${postId}`;

      remainingComments.forEach((comment) => {
        hiddenCommentsDiv.appendChild(
          this.createCommentElement(postId, comment)
        );
      });
      container.appendChild(hiddenCommentsDiv);

      const viewCommentsBtn = document.createElement("button");
      viewCommentsBtn.className = "view-comments-btn";
      viewCommentsBtn.textContent = `View ${remainingComments.length} more comments`;
      viewCommentsBtn.id = `view-comments-btn-${postId}`;
      viewCommentsBtn.addEventListener("click", () =>
        this.toggleCommentsExpansion(postId)
      );
      container.appendChild(viewCommentsBtn);
    }
  }

  createCommentElement(postId, comment) {
    const commentItem = document.createElement("div");
    commentItem.className = "comment-item";
    commentItem.setAttribute("data-comment-id", comment.id);

    const avatar = document.createElement("div");
    avatar.className = "comment-item-avatar";
    avatar.textContent = comment.author.charAt(0).toUpperCase();

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "comment-content-wrapper";
    contentWrapper.id = `comment-content-wrapper-${comment.id}`;

    const commentHeader = document.createElement("div");
    commentHeader.innerHTML = `
      <span class="comment-author">${comment.author}</span>
      <span class="comment-date">${this.formatTimestamp(
        comment.timestamp
      )}</span>
    `;

    const commentText = document.createElement("div");
    commentText.className = "comment-text";
    commentText.textContent = comment.text;
    commentText.id = `comment-text-${comment.id}`;

    contentWrapper.appendChild(commentHeader);
    contentWrapper.appendChild(commentText);

    // Add 3-dot menu for comments
    if (this.currentUser === comment.author) {
      const menuContainer = document.createElement("div");
      menuContainer.className = "comment-menu-container";

      const menuDots = document.createElement("button");
      menuDots.className = "comment-menu-dots";
      menuDots.innerHTML = '<span class="material-icons">more_vert</span>';
      menuDots.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleCommentDropdown(comment.id, menuDots);
      });

      const dropdownMenu = document.createElement("div");
      dropdownMenu.className = "comment-dropdown-menu";
      dropdownMenu.id = `comment-dropdown-${comment.id}`;

      const editItem = document.createElement("button");
      editItem.className = "comment-dropdown-item";
      editItem.innerHTML = '<span class="material-icons">edit</span> Edit';
      editItem.addEventListener("click", () =>
        this.editComment(postId, comment.id)
      );

      const deleteItem = document.createElement("button");
      deleteItem.className = "comment-dropdown-item delete";
      deleteItem.innerHTML =
        '<span class="material-icons">delete</span> Delete';
      deleteItem.addEventListener("click", () =>
        this.deleteComment(postId, comment.id)
      );

      dropdownMenu.appendChild(editItem);
      dropdownMenu.appendChild(deleteItem);

      menuContainer.appendChild(menuDots);
      menuContainer.appendChild(dropdownMenu);
      contentWrapper.appendChild(menuContainer);
    }

    commentItem.appendChild(avatar);
    commentItem.appendChild(contentWrapper);

    return commentItem;
  }

  toggleCommentsExpansion(postId) {
    const hiddenCommentsDiv = document.getElementById(
      `hidden-comments-${postId}`
    );
    const viewCommentsBtn = document.getElementById(
      `view-comments-btn-${postId}`
    );

    if (hiddenCommentsDiv && viewCommentsBtn) {
      const isExpanded = hiddenCommentsDiv.classList.toggle("expanded");
      if (isExpanded) {
        viewCommentsBtn.textContent = "Hide comments";
      } else {
        const comments =
          this.getCourseAnnouncements().find((p) => p.id === postId)
            ?.comments || [];
        const remainingCount = comments.length > 1 ? comments.length - 1 : 0;
        viewCommentsBtn.textContent = `View ${remainingCount} more comments`;
      }
    }
  }

  toggleCommentDropdown(commentId, button) {
    const dropdown = document.getElementById(`comment-dropdown-${commentId}`);
    if (dropdown) {
      document
        .querySelectorAll(".comment-dropdown-menu.show")
        .forEach((menu) => {
          if (menu.id !== `comment-dropdown-${commentId}`) {
            menu.classList.remove("show");
          }
        });
      dropdown.classList.toggle("show");

      const rect = button.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + 5}px`;
      dropdown.style.left = `${
        rect.left - dropdown.offsetWidth + rect.width
      }px`;
    }
  }

  editComment(postId, commentId) {
    const commentTextDiv = document.getElementById(`comment-text-${commentId}`);
    const post = this.getCourseAnnouncements().find((p) => p.id === postId);
    const comment = post?.comments.find((c) => c.id === commentId);

    if (!commentTextDiv || !comment) return;

    const dropdown = document.getElementById(`comment-dropdown-${commentId}`);
    if (dropdown) dropdown.classList.remove("show");

    const originalText = comment.text;

    const editInput = document.createElement("textarea");
    editInput.className = "comment-edit-input";
    editInput.value = originalText;
    editInput.rows = 2;
    editInput.style.height = "auto";
    editInput.addEventListener("input", () => {
      editInput.style.height = "auto";
      editInput.style.height = editInput.scrollHeight + "px";
    });
    setTimeout(() => {
      editInput.style.height = editInput.scrollHeight + "px";
      editInput.focus();
    }, 0);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "comment-edit-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "comment-edit-btn comment-cancel-btn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
      commentTextDiv.textContent = originalText;
      commentTextDiv.style.display = "block";
      editInput.remove();
      actionsDiv.remove();
    });

    const saveBtn = document.createElement("button");
    saveBtn.className = "comment-edit-btn comment-save-btn";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
      const newText = editInput.value.trim();
      if (newText) {
        this.saveEditedComment(postId, commentId, newText);
      } else {
        this.showNotification("Comment cannot be empty!", "error");
      }
      commentTextDiv.style.display = "block";
      editInput.remove();
      actionsDiv.remove();
    });

    actionsDiv.appendChild(cancelBtn);
    actionsDiv.appendChild(saveBtn);

    commentTextDiv.style.display = "none";
    commentTextDiv.parentNode.insertBefore(
      editInput,
      commentTextDiv.nextSibling
    );
    commentTextDiv.parentNode.insertBefore(actionsDiv, editInput.nextSibling);
  }

  saveEditedComment(postId, commentId, newText) {
    let announcements = this.getCourseAnnouncements();
    const postIndex = announcements.findIndex((p) => p.id === postId);

    if (postIndex > -1) {
      const commentIndex = announcements[postIndex].comments.findIndex(
        (c) => c.id === commentId
      );
      if (commentIndex > -1) {
        announcements[postIndex].comments[commentIndex].text = newText;
        localStorage.setItem(
          `announcements_${this.courseId}`,
          JSON.stringify(announcements)
        );
        this.showNotification("Comment updated!", "success");
        // Re-render comments for this post to reflect changes
        this.renderComments(
          postId,
          announcements[postIndex].comments,
          document.getElementById(`comments-list-${postId}`)
        );
      }
    }
  }

  deleteComment(postId, commentId) {
    const dropdown = document.getElementById(`comment-dropdown-${commentId}`);
    if (dropdown) dropdown.classList.remove("show");

    this.pendingDeleteId = commentId;
    this.pendingDeleteType = "comment";
    this.pendingDeleteCommentInfo = { postId, commentId };
    this.showConfirmationModal(
      "Are you sure you want to delete this comment? This action cannot be undone."
    );
  }

  deleteCommentConfirmed(postId, commentId) {
    const commentElement = document.querySelector(
      `[data-comment-id="${commentId}"]`
    );

    if (commentElement) {
      commentElement.classList.add("comment-fade-out");
      setTimeout(() => {
        commentElement.remove();

        let announcements = this.getCourseAnnouncements();
        const postIndex = announcements.findIndex((p) => p.id === postId);

        if (postIndex > -1) {
          announcements[postIndex].comments = announcements[
            postIndex
          ].comments.filter((c) => c.id !== commentId);
          localStorage.setItem(
            `announcements_${this.courseId}`,
            JSON.stringify(announcements)
          );
          this.showNotification("Comment deleted successfully", "success");

          // Re-render comments to update "View more comments" button if needed
          this.renderComments(
            postId,
            announcements[postIndex].comments,
            document.getElementById(`comments-list-${postId}`)
          );
        }
      }, 400); // Match animation duration
    }
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
  if (streamManager && streamManager.elements.announcementEditorContent) {
    const content = streamManager.elements.announcementEditorContent.innerHTML;
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
      console.log("Page became visible, refreshing posts..."); // Debug log
      streamManager.loadPosts(); // Refresh posts when user returns
      streamManager.loadUpcomingAssignments(); // Refresh upcoming assignments
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

// Additional methods for StreamManager class
StreamManager.prototype.switchToCourse = function (course) {
  localStorage.setItem("selectedCourse", JSON.stringify(course));
  location.reload();
};

StreamManager.prototype.setupAutoSave = function () {
  // Auto-save functionality for students (minimal implementation)
  // Students don't have announcement editor, so this is mostly for future use
  console.log("Auto-save setup completed for student");
};

StreamManager.prototype.setupThemeDetection = function () {
  // Dark/Light theme detection and application
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  prefersDarkScheme.addEventListener("change", (e) => {
    // Theme handling if needed in future
    console.log("Theme preference changed:", e.matches ? "dark" : "light");
  });
};

StreamManager.prototype.setupProgressIndicators = function () {
  // Loading progress indicators for better UX
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
};

StreamManager.prototype.setupNotificationSystem = function () {
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
        processQueue();
      }, 3500);
    }
  };

  // Override showNotification to use queue
  const originalShowNotification = this.showNotification.bind(this);
  this.showNotification = (message, type) => {
    this.notificationQueue.push({ message, type });
    processQueue();
  };

  // Close dropdown menus when clicking outside or scrolling
  document.addEventListener("click", (e) => {
    // Close assignment post dropdown menus
    if (
      !e.target.closest(".notification-menu-container") &&
      !e.target.closest(".notification-dropdown-menu")
    ) {
      const allDropdowns = document.querySelectorAll(
        ".notification-dropdown-menu"
      );
      allDropdowns.forEach((menu) => {
        menu.classList.remove("show");
      });
    }

    // Close comment dropdown menus
    if (
      !e.target.closest(".comment-menu-container") &&
      !e.target.closest(".comment-dropdown-menu")
    ) {
      const allCommentDropdowns = document.querySelectorAll(
        ".comment-dropdown-menu"
      );
      allCommentDropdowns.forEach((menu) => {
        menu.classList.remove("show");
      });
    }

    // Close sidebar enrolled classes dropdown if open and clicked outside
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

  // Close dropdowns on scroll
  document.addEventListener("scroll", () => {
    const allDropdowns = document.querySelectorAll(
      ".notification-dropdown-menu"
    );
    allDropdowns.forEach((menu) => {
      menu.classList.remove("show");
    });

    const allCommentDropdowns = document.querySelectorAll(
      ".comment-dropdown-menu"
    );
    allCommentDropdowns.forEach((menu) => {
      menu.classList.remove("show");
    });

    // Close sidebar enrolled classes dropdown on scroll
    const enrolledClassesDropdown = this.elements.enrolledClasses;
    if (
      enrolledClassesDropdown &&
      enrolledClassesDropdown.classList.contains("open")
    ) {
      this.toggleEnrolledClassesDropdown();
    }
  });

  // Close dropdowns on window resize
  window.addEventListener("resize", () => {
    const allDropdowns = document.querySelectorAll(
      ".notification-dropdown-menu"
    );
    allDropdowns.forEach((menu) => {
      menu.classList.remove("show");
    });

    const allCommentDropdowns = document.querySelectorAll(
      ".comment-dropdown-menu"
    );
    allCommentDropdowns.forEach((menu) => {
      menu.classList.remove("show");
    });

    // Close sidebar enrolled classes dropdown on resize
    const enrolledClassesDropdown = this.elements.enrolledClasses;
    if (
      enrolledClassesDropdown &&
      enrolledClassesDropdown.classList.contains("open")
    ) {
      this.toggleEnrolledClassesDropdown();
    }
  });
};

StreamManager.prototype.setupAccessibility = function () {
  // Add ARIA labels and roles
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

  // Improve focus management
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
};

StreamManager.prototype.setupPerformanceOptimizations = function () {
  // Lazy load images
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
};

// Utility methods
StreamManager.prototype.debounce = function (func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

StreamManager.prototype.throttle = function (func, limit) {
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
};
