// studentStream.js
class StreamManager {
  constructor() {
    this.attachments = [];
    this.availableCourses = []; // ব্যবহারকারীর তৈরি করা কোর্সগুলো এখানে থাকবে
    this.availableStudents = []; // সমস্ত উপলব্ধ শিক্ষার্থী এখানে থাকবে
    this.selectedCourses = [];
    this.selectedStudents = [];
    this.assignToAll = true; // For classwork assignment
    this.isAnnouncementExpanded = false;
    this.currentEditingId = null; // Track which post is being edited
    this.pendingDeleteId = null; // Track which post is pending deletion
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
    this.loadUpcomingAssignments(); // Load upcoming assignments
    // No announcement editor for students, so no need to initialize its state
  }

  setupElements() {
    this.elements = {
      menuBtn: document.getElementById("menuBtn"),
      sidebar: document.getElementById("sidebar"),
      contentWrapper: document.getElementById("contentWrapper"),
      courseTopNav: document.getElementById("courseTopNav"),
      // Removed announcement elements for students
      userInitial: document.getElementById("userInitial"),
      streamPosts: document.getElementById("streamPosts"),
      noPosts: document.getElementById("noPosts"),
      classesLink: document.getElementById("classesLink"),
      settingsLink: document.getElementById("settingsLink"),
      currentCourseName: document.getElementById("currentCourseName"),
      courseHeaderSection: document.querySelector(".course-header-section"),
      courseCodeText: document.getElementById("courseCodeText"),
      courseCodeDisplay: document.getElementById("courseCodeDisplay"),
      upcomingContent: document.getElementById("upcomingContent"),
      // Enrolled Classes Dropdown elements
      enrolledClassesDropdownToggle: document.getElementById(
        "enrolledClassesDropdownToggle"
      ),
      enrolledClasses: document.getElementById("enrolledClasses"),
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

    // Enhanced click outside detection
    document.addEventListener("click", (e) => this.handleClickOutside(e));

    // Enhanced resize handling
    window.addEventListener("resize", () => this.handleResize());

    // Enrolled Classes Dropdown Toggle
    if (this.elements.enrolledClassesDropdownToggle) {
      this.elements.enrolledClassesDropdownToggle.addEventListener(
        "click",
        () => this.toggleEnrolledClassesDropdown()
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

  // Enrolled Classes Dropdown Toggle
  toggleEnrolledClassesDropdown() {
    const dropdownContent = this.elements.enrolledClasses;
    const dropdownToggle = this.elements.enrolledClassesDropdownToggle;

    if (dropdownContent && dropdownToggle) {
      dropdownContent.classList.toggle("open");
      dropdownToggle.classList.toggle("open");
    }
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

    // Course code display করুন (only in the dedicated section, not in banner)
    if (this.elements.courseCodeText && this.currentCourse.code) {
      this.elements.courseCodeText.textContent = this.currentCourse.code;
      const courseCodeLarge = document.getElementById("courseCodeLarge");
      if (courseCodeLarge) {
        courseCodeLarge.textContent = this.currentCourse.code;
      }
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
        likes: 0,
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

      postDiv.appendChild(notificationHeader);
    } else {
      // Regular announcement post
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
    }

    return postDiv;
  }

  // New: Show confirmation modal for deletion
  deleteNotification(postId) {
    // Close dropdown first
    const dropdown = document.getElementById(`dropdown-${postId}`);
    if (dropdown) {
      dropdown.classList.remove("show");
    }

    this.pendingDeleteId = postId; // Store the ID of the post to be deleted
    this.showConfirmationModal(
      "Are you sure you want to delete this item? This action cannot be undone."
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
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  // New: Confirm deletion
  confirmDelete() {
    if (!this.pendingDeleteId) return;

    const postIdToDelete = this.pendingDeleteId;
    const notificationHeader = document.getElementById(
      `notification-${postIdToDelete}`
    );
    const streamPost = notificationHeader?.closest(".stream-post");
    const assignmentId = streamPost?.getAttribute("data-assignment-id");

    // Add fade out animation
    if (streamPost) {
      streamPost.classList.add("notification-fade-out");

      // Remove the notification after animation
      setTimeout(() => {
        streamPost.remove();

        // Delete the assignment from localStorage
        if (assignmentId) {
          this.deleteAssignment(assignmentId);
        }

        // Show success message
        this.showNotification("Notification deleted successfully", "success");

        // Check if no posts remain
        this.checkForNoPosts();
      }, 400); // Match animation duration
    }

    this.hideConfirmationModal(); // Hide the modal after action
  }

  deleteAssignment(assignmentId) {
    const assignmentsKey = `assignments_${this.courseId}`;
    const assignments = JSON.parse(
      localStorage.getItem(assignmentsKey) || "[]"
    );

    const filteredAssignments = assignments.filter((a) => a.id != assignmentId);
    localStorage.setItem(assignmentsKey, JSON.stringify(filteredAssignments));

    // Reload upcoming assignments
    this.loadUpcomingAssignments();
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
    const allDropdowns = document.querySelectorAll(
      ".notification-dropdown-menu"
    );
    allDropdowns.forEach((menu) => {
      menu.classList.remove("show");
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

  // Load posts on page load
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
        likes: 0,
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

  // Other methods remain unchanged...
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

StreamManager.prototype.createAttachmentElement = function (attachment) {
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
      attachmentDiv.style.transform = "translateY(-1px)";
      attachmentDiv.style.boxShadow = "var(--shadow-medium)";
    });

    attachmentDiv.addEventListener("mouseleave", () => {
      attachmentDiv.style.transform = "translateY(0)";
      attachmentDiv.style.boxShadow = "none";
    });
  }

  return attachmentDiv;
};

StreamManager.prototype.getFileIcon = function (type) {
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
