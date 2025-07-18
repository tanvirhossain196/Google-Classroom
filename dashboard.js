document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const menuIcon = document.getElementById("menuIcon");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInitial = document.getElementById("userInitial");
  const coursesGrid = document.getElementById("coursesGrid");
  const emptyState = document.getElementById("emptyState");
  const addCourseBtn = document.getElementById("addCourseBtn");
  const createCourseBtn = document.getElementById("createCourseBtn");
  const joinCourseBtn = document.getElementById("joinCourseBtn");

  // Modals
  const createCourseModal = document.getElementById("createCourseModal");
  const joinCourseModal = document.getElementById("joinCourseModal");
  const closeCreateModal = document.getElementById("closeCreateModal");
  const closeJoinModal = document.getElementById("closeJoinModal");
  const createCourseForm = document.getElementById("createCourseForm");
  const joinCourseForm = document.getElementById("joinCourseForm");
  const cancelCreate = document.getElementById("cancelCreate");
  const cancelJoin = document.getElementById("cancelJoin");

  // Load user data
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!userEmail) {
    window.location.href = "index.html";
    return;
  }

  // Set user initial
  userInitial.textContent = userEmail.charAt(0).toUpperCase();

  // Load courses
  let courses = JSON.parse(localStorage.getItem("courses")) || [];

  // Default courses if none exist
  if (courses.length === 0) {
    courses = [
      {
        id: 1,
        name: "Mathematics 101",
        section: "undefined",
        subject: "mathematics",
        teacher: "Prof. Johnson",
        code: "MATH101",
        students: 0,
        assignments: 0,
        type: "math",
        room: "undefined",
      },
      {
        id: 2,
        name: "Science 201",
        section: "undefined",
        subject: "science",
        teacher: "Dr. Smith",
        code: "SCI201",
        students: 0,
        assignments: 0,
        type: "science",
        room: "undefined",
      },
      {
        id: 3,
        name: "English Literature",
        section: "undefined",
        subject: "english",
        teacher: "Ms. Davis",
        code: "ENG101",
        students: 0,
        assignments: 0,
        type: "english",
        room: "undefined",
      },
      {
        id: 4,
        name: "Web Programming",
        section: "undefined",
        subject: "programming",
        teacher: "Demo User",
        code: "CSE479",
        students: 0,
        assignments: 0,
        type: "programming",
        room: "undefined",
      },
      {
        id: 5,
        name: "Web Programming",
        section: "1",
        subject: "General",
        teacher: "rakib",
        code: "SQL817",
        students: 630,
        assignments: 0,
        type: "programming",
        room: "undefined",
      },
    ];
    saveCourses();
  }

  // Menu toggle
  menuIcon.addEventListener("click", function () {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", function (e) {
    if (!sidebar.contains(e.target) && !menuIcon.contains(e.target)) {
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
    }
  });

  // Logout
  logoutBtn.addEventListener("click", function () {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      window.location.href = "index.html";
    }
  });

  // Modal controls
  addCourseBtn.addEventListener("click", showCreateModal);
  createCourseBtn.addEventListener("click", showCreateModal);
  joinCourseBtn.addEventListener("click", showJoinModal);

  closeCreateModal.addEventListener("click", hideCreateModal);
  closeJoinModal.addEventListener("click", hideJoinModal);
  cancelCreate.addEventListener("click", hideCreateModal);
  cancelJoin.addEventListener("click", hideJoinModal);

  // Close modal when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target === createCourseModal) {
      hideCreateModal();
    }
    if (e.target === joinCourseModal) {
      hideJoinModal();
    }
  });

  // Form submissions
  createCourseForm.addEventListener("submit", function (e) {
    e.preventDefault();
    createCourse();
  });

  joinCourseForm.addEventListener("submit", function (e) {
    e.preventDefault();
    joinCourse();
  });

  // Functions
  function showCreateModal() {
    createCourseModal.style.display = "block";
  }

  function hideCreateModal() {
    createCourseModal.style.display = "none";
    createCourseForm.reset();
  }

  function showJoinModal() {
    joinCourseModal.style.display = "block";
  }

  function hideJoinModal() {
    joinCourseModal.style.display = "none";
    joinCourseForm.reset();
  }

  function createCourse() {
    const name = document.getElementById("courseName").value;
    const section =
      document.getElementById("courseSection").value || "Section-1";
    const subject = document.getElementById("courseSubject").value || "General";
    const room = document.getElementById("courseRoom").value || "Room-101";

    const newCourse = {
      id: Date.now(),
      name: name,
      section: section,
      subject: subject,
      teacher: userEmail.split("@")[0],
      code: generateCourseCode(),
      students: 0,
      assignments: 0,
      type: getSubjectType(subject),
      room: room,
    };

    courses.push(newCourse);
    saveCourses();
    renderCourses();
    hideCreateModal();
    showNotification("কোর্স সফলভাবে তৈরি হয়েছে!", "success");
  }

  function joinCourse() {
    const code = document.getElementById("courseCode").value;
    const course = courses.find((c) => c.code === code);

    if (course) {
      course.students++;
      saveCourses();
      renderCourses();
      hideJoinModal();
      showNotification("সফলভাবে কোর্সে যোগ দিয়েছেন!", "success");
    } else {
      showNotification("অবৈধ কোর্স কোড!", "error");
    }
  }

  function generateCourseCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function getSubjectType(subject) {
    const types = {
      Mathematics: "math",
      Math: "math",
      গণিত: "math",
      Science: "science",
      Physics: "science",
      Chemistry: "science",
      Biology: "science",
      বিজ্ঞান: "science",
      Bangla: "bangla",
      বাংলা: "bangla",
      English: "english",
      ইংরেজি: "english",
      Programming: "programming",
      Computer: "programming",
      CSE: "programming",
      IT: "programming",
    };

    for (const key in types) {
      if (subject.toLowerCase().includes(key.toLowerCase())) {
        return types[key];
      }
    }
    return "programming";
  }

  function saveCourses() {
    localStorage.setItem("courses", JSON.stringify(courses));
  }

  function renderCourses() {
    if (courses.length === 0) {
      coursesGrid.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    coursesGrid.style.display = "grid";
    emptyState.style.display = "none";

    coursesGrid.innerHTML = "";

    courses.forEach((course) => {
      const courseCard = document.createElement("div");
      courseCard.className = "course-card";
      courseCard.innerHTML = `
                <div class="course-header ${course.type}">
                    <div>
                        <div class="course-title">${course.name}</div>
                        <div class="course-section">${course.section}</div>
                    </div>
                    <div class="course-teacher">${course.teacher}</div>
                </div>
                <div class="course-body">
                    <div class="course-info">
                        <div class="course-subject">${course.subject}</div>
                        <div class="course-menu">⋮</div>
                    </div>
                    <div class="course-code">কোড: ${course.code}</div>
                    <div class="course-stats">
                        <div class="course-stat">
                            <span>👥</span>
                            <span>${course.students} জন</span>
                        </div>
                        <div class="course-stat">
                            <span>📝</span>
                            <span>${course.assignments} টি</span>
                        </div>
                        <div class="course-stat">
                            <span>🏠</span>
                            <span>${course.room}</span>
                        </div>
                    </div>
                </div>
            `;

      // Course menu click prevention
      const courseMenu = courseCard.querySelector(".course-menu");
      courseMenu.addEventListener("click", function (e) {
        e.stopPropagation();
        console.log("Course menu clicked for:", course.name);
      });

      // Course card click handler - Navigate to course detail
      courseCard.addEventListener("click", function () {
        window.location.href = `course-detail.html?id=${course.id}`;
      });

      coursesGrid.appendChild(courseCard);
    });
  }

  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            ${
              type === "success"
                ? "background: #4caf50;"
                : "background: #f44336;"
            }
        `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Initialize
  renderCourses();

  // Hide/show add course button based on role
  if (userRole === "student") {
    addCourseBtn.style.display = "none";
  }
});
