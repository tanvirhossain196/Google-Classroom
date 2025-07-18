document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const contentWrapper = document.getElementById("contentWrapper");
  const navTabs = document.querySelectorAll(".nav-tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const announcementTrigger = document.getElementById("announcementTrigger");
  const announcementFormExpanded = document.getElementById(
    "announcementFormExpanded"
  );
  const cancelAnnouncement = document.getElementById("cancelAnnouncement");
  const postAnnouncement = document.getElementById("postAnnouncement");
  const editorContent = document.getElementById("editorContent");
  const userInitial = document.getElementById("userInitial");
  const teacherInitial = document.getElementById("teacherInitial");
  const streamPosts = document.getElementById("streamPosts");
  const noPosts = document.getElementById("noPosts");
  const classesLink = document.getElementById("classesLink");
  const settingsLink = document.getElementById("settingsLink");
  const currentCourseName = document.getElementById("currentCourseName");

  // Load user data
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!userEmail) {
    window.location.href = "index.html";
    return;
  }

  // Set user initials
  userInitial.textContent = userEmail.charAt(0).toUpperCase();
  teacherInitial.textContent = userEmail.charAt(0).toUpperCase();

  // Load course data
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("id");
  const courses = JSON.parse(localStorage.getItem("courses")) || [];
  const currentCourse = courses.find((c) => c.id == courseId);

  if (currentCourse) {
    document.getElementById("courseTitle").textContent = currentCourse.name;
    document.getElementById("courseSection").textContent =
      currentCourse.section;
    document.title = `${currentCourse.name} - Classroom`;

    // Update current course name in sidebar
    currentCourseName.textContent = currentCourse.name;

    // Set banner color based on course type
    const courseBanner = document.getElementById("courseBanner");
    courseBanner.className = `course-banner ${currentCourse.type}`;

    // Update teacher avatar
    if (currentCourse.teacher) {
      teacherInitial.textContent = currentCourse.teacher
        .charAt(0)
        .toUpperCase();
    }
  } else {
    window.location.href = "dashboard.html";
    return;
  }

  // Load enrolled classes in sidebar
  loadEnrolledClassesInSidebar();

  // Add tooltips for sidebar items
  addTooltips();

  // Sidebar navigation
  classesLink.addEventListener("click", function () {
    window.location.href = "dashboard.html";
  });

  settingsLink.addEventListener("click", function () {
    window.location.href = "settings.html";
  });

  // Sidebar toggle functionality
  menuBtn.addEventListener("click", function () {
    sidebar.classList.toggle("open");
    contentWrapper.classList.toggle("sidebar-open");
  });

  // Close sidebar when clicking outside (only on mobile)
  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 1024) {
      if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove("open");
        contentWrapper.classList.remove("sidebar-open");
      }
    }
  });

  // Tab navigation
  navTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all tabs
      navTabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });

  // Announcement functionality
  announcementTrigger.addEventListener("click", function () {
    if (userRole === "teacher" || userRole === "admin") {
      expandAnnouncementForm();
    } else {
      showNotification("Only teachers can create announcements", "error");
    }
  });

  cancelAnnouncement.addEventListener("click", function () {
    collapseAnnouncementForm();
  });

  postAnnouncement.addEventListener("click", function () {
    createAnnouncement();
  });

  // Rich text editor toolbar
  const toolbarButtons = document.querySelectorAll(".toolbar-btn");
  toolbarButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const command = this.getAttribute("data-command");
      if (command) {
        document.execCommand(command, false, null);
        this.classList.toggle("active");
        editorContent.focus();
      }
    });
  });

  // Load posts on page load
  loadPosts();

  // Functions
  function loadEnrolledClassesInSidebar() {
    const enrolledClasses = document.getElementById("enrolledClasses");
    const userEmail = localStorage.getItem("userEmail");
    const courses = JSON.parse(localStorage.getItem("courses")) || [];

    // Filter courses based on user enrollment
    const userCourses = courses.filter((course) => {
      return course.students && course.students.includes(userEmail);
    });

    if (userCourses.length === 0) {
      enrolledClasses.innerHTML = `
                <div class="sidebar-item" data-tooltip="No classes enrolled">
                    <span class="material-icons">info</span>
                    <span class="sidebar-text">No classes enrolled</span>
                </div>
            `;
      return;
    }

    enrolledClasses.innerHTML = userCourses
      .map(
        (course) => `
            <div class="sidebar-item ${course.id == courseId ? "active" : ""}" 
                 onclick="window.location.href='course-detail.html?id=${
                   course.id
                 }'"
                 data-tooltip="${course.name}">
                <div class="sidebar-avatar">${course.name
                  .charAt(0)
                  .toUpperCase()}</div>
                <span class="sidebar-text">${course.name}</span>
            </div>
        `
      )
      .join("");
  }

  function addTooltips() {
    const sidebarItems = document.querySelectorAll(
      ".sidebar-item, .sidebar-header"
    );

    sidebarItems.forEach((item) => {
      const text = item.querySelector(".sidebar-text");
      if (text && !item.getAttribute("data-tooltip")) {
        item.setAttribute("data-tooltip", text.textContent);
      }
    });
  }

  function expandAnnouncementForm() {
    announcementFormExpanded.style.display = "block";
    editorContent.focus();
  }

  function collapseAnnouncementForm() {
    announcementFormExpanded.style.display = "none";
    editorContent.innerHTML = "";
  }

  function createAnnouncement() {
    const content = editorContent.innerHTML.trim();
    if (!content) {
      showNotification("Please enter some content", "error");
      return;
    }

    const announcement = {
      id: Date.now(),
      author: userEmail.split("@")[0],
      content: content,
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      comments: [],
    };

    // Save to localStorage
    let posts = JSON.parse(localStorage.getItem(`posts_${courseId}`)) || [];
    posts.unshift(announcement);
    localStorage.setItem(`posts_${courseId}`, JSON.stringify(posts));

    // Reload posts
    loadPosts();
    collapseAnnouncementForm();
    showNotification("Announcement posted successfully!", "success");
  }

  function addComment(postId, text) {
    let posts = JSON.parse(localStorage.getItem(`posts_${courseId}`)) || [];
    const post = posts.find((p) => p.id === postId);

    if (post) {
      const comment = {
        id: Date.now(),
        author: userEmail.split("@")[0],
        text: text,
        timestamp: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };

      post.comments.push(comment);
      localStorage.setItem(`posts_${courseId}`, JSON.stringify(posts));
      loadPosts();
      showNotification("Comment added successfully!", "success");
    }
  }

  function loadPosts() {
    const posts = JSON.parse(localStorage.getItem(`posts_${courseId}`)) || [];

    if (posts.length === 0) {
      streamPosts.innerHTML = "";
      noPosts.style.display = "block";
      return;
    }

    noPosts.style.display = "none";
    streamPosts.innerHTML = posts
      .map(
        (post) => `
            <div class="stream-post">
                <div class="post-header">
                    <div class="post-avatar">${post.author
                      .charAt(0)
                      .toUpperCase()}</div>
                    <div class="post-info">
                        <div class="post-author">${post.author}</div>
                        <div class="post-date">${post.timestamp}</div>
                    </div>
                    <div class="post-menu">
                        <span class="material-icons">more_vert</span>
                    </div>
                </div>
                <div class="post-content">
                    <div>${post.content}</div>
                </div>
                <div class="post-actions">
                    <div class="comment-count" onclick="toggleComments(${
                      post.id
                    })">
                        ${post.comments.length} class comments
                    </div>
                </div>
                <div class="post-comments" id="comments-${
                  post.id
                }" style="display: none;">
                    ${post.comments
                      .map(
                        (comment) => `
                        <div class="comment">
                            <div class="comment-avatar">${comment.author
                              .charAt(0)
                              .toUpperCase()}</div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <div class="comment-author">${
                                      comment.author
                                    }</div>
                                    <div class="comment-date">${
                                      comment.timestamp
                                    }</div>
                                </div>
                                <div class="comment-text">${comment.text}</div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                    <div class="add-comment">
                        <div class="comment-input">
                            <input type="text" placeholder="Add a class comment..." 
                                   onkeypress="handleCommentKeyPress(event, ${
                                     post.id
                                   })">
                        </div>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  // Global functions for comment handling
  window.toggleComments = function (postId) {
    const commentsDiv = document.getElementById(`comments-${postId}`);
    commentsDiv.style.display =
      commentsDiv.style.display === "none" ? "block" : "none";
  };

  window.handleCommentKeyPress = function (event, postId) {
    if (event.key === "Enter") {
      const text = event.target.value.trim();
      if (text) {
        addComment(postId, text);
        event.target.value = "";
      }
    }
  };

  function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === "success" ? "#4caf50" : "#f44336"};
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Add CSS for notification animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
  document.head.appendChild(style);
});
