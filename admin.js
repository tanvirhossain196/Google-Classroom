document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const headerUserInitial = document.getElementById("headerUserInitial");
  const adminName = document.getElementById("adminName");
  const navItems = document.querySelectorAll(".nav-item");
  const adminSections = document.querySelectorAll(".admin-section");

  const addUserModal = new bootstrap.Modal(
    document.getElementById("addUserModal")
  );
  const userProfileModal = new bootstrap.Modal(
    document.getElementById("userProfileModal")
  );
  const addUserForm = document.getElementById("addUserForm");
  const saveUserBtn = document.getElementById("saveUserBtn");
  const announcementForm = document.getElementById("announcementForm");

  const currentUserEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!currentUserEmail) {
    window.location.href = "index.html";
    return;
  }

  if (userRole !== "admin") {
    showNotification("প্রশাসনিক প্যানেল অ্যাক্সেস করার অনুমতি নেই!", "error");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
    return;
  }

  initializePage();

  menuToggle.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const section = this.dataset.section;
      switchSection(section);
    });
  });

  document
    .getElementById("addUserBtn")
    .addEventListener("click", () => addUserModal.show());
  document
    .getElementById("bulkUploadBtn")
    .addEventListener("click", handleBulkUpload);
  document
    .getElementById("exportUsersBtn")
    .addEventListener("click", exportUsers);
  document
    .getElementById("createCourseBtn")
    .addEventListener("click", createCourse);
  document
    .getElementById("createAssignmentBtn")
    .addEventListener("click", createAssignment);
  document
    .getElementById("generateReportBtn")
    .addEventListener("click", generateReport);
  document
    .getElementById("sendAnnouncementBtn")
    .addEventListener("click", sendAnnouncement);
  document
    .getElementById("systemBackupBtn")
    .addEventListener("click", createSystemBackup);
  document
    .getElementById("systemMaintenanceBtn")
    .addEventListener("click", toggleMaintenance);
  document
    .getElementById("systemUpdateBtn")
    .addEventListener("click", checkSystemUpdate);

  saveUserBtn.addEventListener("click", saveUser);
  announcementForm.addEventListener("submit", handleAnnouncementSubmit);

  document.getElementById("userSearch").addEventListener("input", filterUsers);
  document.getElementById("roleFilter").addEventListener("change", filterUsers);
  document
    .getElementById("statusFilter")
    .addEventListener("change", filterUsers);

  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove("show");
      }
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("show");
    }
  });

  function initializePage() {
    const userName = currentUserEmail.split("@")[0];
    const userInitial = currentUserEmail.charAt(0).toUpperCase();

    adminName.textContent = userName;
    headerUserInitial.textContent = userInitial;

    loadDashboardStats();
    loadActivityFeed();
    loadUsers();
    loadCourses();
    loadAssignments();
    loadAnalytics();
    loadMessages();
    loadSecurityLogs();

    initializeCharts();
  }

  function toggleSidebar() {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("show");
    } else {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("collapsed");
    }
  }

  function handleLogout() {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      window.location.href = "index.html";
    }
  }

  function switchSection(section) {
    navItems.forEach((item) => item.classList.remove("active"));
    document
      .querySelector(`[data-section="${section}"]`)
      .classList.add("active");

    adminSections.forEach((section) => section.classList.remove("active"));
    document.getElementById(section).classList.add("active");
  }

  function loadDashboardStats() {
    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];

    const totalUsers = allUsers.length;
    const totalCourses = courses.length;
    const activeAssignments = assignments.filter(
      (a) => a.status === "active"
    ).length;

    document.getElementById("totalUsers").textContent = totalUsers;
    document.getElementById("totalCourses").textContent = totalCourses;
    document.getElementById("activeAssignments").textContent =
      activeAssignments;
    document.getElementById("systemHealth").textContent = "100%";

    const userGrowth = Math.floor(totalUsers * 0.1);
    const courseGrowth = Math.floor(totalCourses * 0.15);

    document.getElementById(
      "userGrowth"
    ).textContent = `+${userGrowth} নতুন এই মাসে`;
    document.getElementById(
      "courseGrowth"
    ).textContent = `+${courseGrowth} নতুন কোর্স`;
  }

  function loadActivityFeed() {
    const auditLogs = JSON.parse(localStorage.getItem("auditLogs")) || [];
    const recentLogs = auditLogs.slice(0, 5);

    const activityFeed = document.getElementById("activityFeed");
    activityFeed.innerHTML = "";

    if (recentLogs.length === 0) {
      activityFeed.innerHTML =
        '<div class="text-center text-muted">কোনো সাম্প্রতিক কার্যকলাপ নেই</div>';
      return;
    }

    recentLogs.forEach((log) => {
      const activityItem = document.createElement("div");
      activityItem.className = "activity-item";
      activityItem.innerHTML = `
                <div class="activity-time">${log.timestamp}</div>
                <div class="activity-text">${log.action}: ${log.userEmail}</div>
            `;
      activityFeed.appendChild(activityItem);
    });
  }

  function loadUsers() {
    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];

    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    if (allUsers.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center">কোনো ব্যবহারকারী নেই</td></tr>';
      return;
    }

    allUsers.forEach((user) => {
      const row = document.createElement("tr");
      const profileData =
        JSON.parse(localStorage.getItem(`profileData_${user.email}`)) || {};
      const lastActivity =
        localStorage.getItem(`lastActivity_${user.email}`) || "কখনো নয়";

      row.innerHTML = `
                <td><input type="checkbox" class="user-checkbox" data-email="${
                  user.email
                }"></td>
                <td>
                    <div class="user-info">
                        <strong>${
                          profileData.fullName || user.email.split("@")[0]
                        }</strong>
                        <br><small class="text-muted">${user.email}</small>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="badge badge-${getRoleBadgeClass(
                  user.role
                )}">${getRoleText(user.role)}</span></td>
                <td><span class="badge badge-${
                  user.status === "active" ? "success" : "danger"
                }">${
        user.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"
      }</span></td>
                <td>${user.joinDate || "N/A"}</td>
                <td>${lastActivity}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="viewUserProfile('${
                      user.email
                    }')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-info me-1" onclick="editUser('${
                      user.email
                    }')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${
                      user.email
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });
  }

  function loadCourses() {
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];

    const coursesGrid = document.getElementById("coursesGrid");
    coursesGrid.innerHTML = "";

    if (courses.length === 0) {
      coursesGrid.innerHTML =
        '<div class="text-center text-muted">কোনো কোর্স নেই</div>';
      return;
    }

    courses.forEach((course) => {
      const teacher = allUsers.find((user) => user.email === course.createdBy);
      const teacherName = teacher
        ? teacher.name || teacher.email.split("@")[0]
        : "Unknown";

      const courseCard = document.createElement("div");
      courseCard.className = "course-card";
      courseCard.innerHTML = `
                <div class="course-header">
                    <div class="course-title">${course.title}</div>
                    <div class="course-teacher">শিক্ষক: ${teacherName}</div>
                    <div class="course-email">
                        <small>${course.createdBy}</small>
                    </div>
                </div>
                <div class="course-body">
                    <div class="course-stats">
                        <div class="course-stat">
                            <div class="course-stat-number">${
                              course.students ? course.students.length : 0
                            }</div>
                            <div class="course-stat-label">শিক্ষার্থী</div>
                        </div>
                        <div class="course-stat">
                            <div class="course-stat-number">${
                              course.assignments ? course.assignments.length : 0
                            }</div>
                            <div class="course-stat-label">অ্যাসাইনমেন্ট</div>
                        </div>
                        <div class="course-stat">
                            <span class="badge badge-success">সক্রিয়</span>
                        </div>
                    </div>
                    <div class="course-description">
                        <p>${course.description || "কোর্সের বিবরণ নেই"}</p>
                    </div>
                    <div class="course-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewCourseDetails('${
                          course.id
                        }')">বিস্তারিত</button>
                        <button class="btn btn-sm btn-warning" onclick="editCourse('${
                          course.id
                        }')">সম্পাদনা</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCourse('${
                          course.id
                        }')">মুছুন</button>
                    </div>
                </div>
            `;
      coursesGrid.appendChild(courseCard);
    });
  }

  function loadAssignments() {
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];

    const tbody = document.getElementById("assignmentsTableBody");
    tbody.innerHTML = "";

    if (assignments.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center">কোনো অ্যাসাইনমেন্ট নেই</td></tr>';
      return;
    }

    assignments.forEach((assignment) => {
      const course = courses.find((c) => c.id === assignment.courseId);
      const teacher = allUsers.find((u) => u.email === assignment.createdBy);

      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${assignment.title}</td>
                <td>${course ? course.title : "Unknown Course"}</td>
                <td>${
                  teacher
                    ? teacher.name || teacher.email.split("@")[0]
                    : "Unknown"
                }</td>
                <td>${assignment.dueDate || "N/A"}</td>
                <td>${assignment.submissions || 0}</td>
                <td>${assignment.graded || 0}</td>
                <td><span class="badge badge-success">সক্রিয়</span></td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editAssignment('${
                      assignment.id
                    }')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success me-1" onclick="gradeAssignment('${
                      assignment.id
                    }')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAssignment('${
                      assignment.id
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });
  }

  function loadAnalytics() {
    showNotification("অ্যানালিটিক্স ডেটা লোড হচ্ছে...", "info");
  }

  function loadMessages() {
    const messages = JSON.parse(localStorage.getItem("messages")) || [];

    const messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = "";

    if (messages.length === 0) {
      messagesList.innerHTML =
        '<div class="text-center text-muted">কোনো বার্তা নেই</div>';
      return;
    }

    messages.forEach((message) => {
      const messageItem = document.createElement("div");
      messageItem.className = "message-item";
      messageItem.innerHTML = `
                <div class="message-header">
                    <div class="message-sender">${message.sender}</div>
                    <div class="message-time">${message.timestamp}</div>
                </div>
                <div class="message-content">${message.content}</div>
            `;
      messagesList.appendChild(messageItem);
    });
  }

  function loadSecurityLogs() {
    const auditLogs = JSON.parse(localStorage.getItem("auditLogs")) || [];

    const tbody = document.getElementById("securityLogTableBody");
    tbody.innerHTML = "";

    if (auditLogs.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center">কোনো নিরাপত্তা লগ নেই</td></tr>';
      return;
    }

    auditLogs.slice(0, 20).forEach((log) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${log.timestamp}</td>
                <td>${log.userEmail}</td>
                <td>${log.action}</td>
                <td>${log.ipAddress || "N/A"}</td>
                <td><span class="badge badge-${
                  log.status === "success" ? "success" : "danger"
                }">${log.status === "success" ? "সফল" : "ব্যর্থ"}</span></td>
            `;
      tbody.appendChild(row);
    });
  }

  function initializeCharts() {
    const userActivityCtx = document.getElementById("userActivityChart");
    if (userActivityCtx) {
      new Chart(userActivityCtx, {
        type: "line",
        data: {
          labels: ["জান", "ফেব", "মার", "এপ্রিল", "মে", "জুন", "জুলাই"],
          datasets: [
            {
              label: "সক্রিয় ব্যবহারকারী",
              data: [120, 135, 150, 165, 180, 200, 220],
              borderColor: "#e74c3c",
              backgroundColor: "rgba(231, 76, 60, 0.1)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    const coursePerformanceCtx = document.getElementById(
      "coursePerformanceChart"
    );
    if (coursePerformanceCtx) {
      new Chart(coursePerformanceCtx, {
        type: "doughnut",
        data: {
          labels: ["সম্পন্ন", "চলমান", "আর্কাইভ"],
          datasets: [
            {
              data: [45, 30, 10],
              backgroundColor: ["#10b981", "#f59e0b", "#64748b"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    }
  }

  function getRoleText(role) {
    const roles = {
      admin: "প্রশাসক",
      teacher: "শিক্ষক",
      student: "শিক্ষার্থী",
    };
    return roles[role] || role;
  }

  function getRoleBadgeClass(role) {
    const classes = {
      admin: "primary",
      teacher: "warning",
      student: "info",
    };
    return classes[role] || "secondary";
  }

  function filterUsers() {
    const search = document.getElementById("userSearch").value.toLowerCase();
    const roleFilter = document.getElementById("roleFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;

    const rows = document.querySelectorAll("#usersTableBody tr");
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length > 1) {
        const name = cells[1].textContent.toLowerCase();
        const email = cells[2].textContent.toLowerCase();
        const role = cells[3].textContent.toLowerCase();
        const status = cells[4].textContent.toLowerCase();

        const matchesSearch = name.includes(search) || email.includes(search);
        const matchesRole =
          !roleFilter || role.includes(getRoleText(roleFilter).toLowerCase());
        const matchesStatus =
          !statusFilter ||
          status.includes(statusFilter === "active" ? "সক্রিয়" : "নিষ্ক্রিয়");

        if (matchesSearch && matchesRole && matchesStatus) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      }
    });
  }

  function saveUser() {
    const name = document.getElementById("newUserName").value;
    const email = document.getElementById("newUserEmail").value;
    const role = document.getElementById("newUserRole").value;

    if (!name || !email || !role) {
      showNotification("সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
    const existingUser = allUsers.find((user) => user.email === email);

    if (existingUser) {
      showNotification("এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে", "error");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name,
      email: email,
      role: role,
      status: "active",
      joinDate: new Date().toLocaleDateString("bn-BD"),
    };

    allUsers.push(newUser);
    localStorage.setItem("allUsers", JSON.stringify(allUsers));

    const profileData = {
      fullName: name,
      email: email,
      phone: "",
      address: "",
      bio: "",
    };
    localStorage.setItem(`profileData_${email}`, JSON.stringify(profileData));

    logUserActivity(currentUserEmail, "নতুন ব্যবহারকারী তৈরি", "User", email);

    showNotification("নতুন ব্যবহারকারী যোগ করা হয়েছে", "success");
    addUserModal.hide();
    addUserForm.reset();
    loadUsers();
    loadDashboardStats();
  }

  function handleAnnouncementSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("announcementTitle").value;
    const message = document.getElementById("announcementMessage").value;
    const recipients = document.getElementById("announcementRecipients").value;

    if (!title || !message || !recipients) {
      showNotification("সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    const announcements =
      JSON.parse(localStorage.getItem("announcements")) || [];
    const newAnnouncement = {
      id: Date.now(),
      title: title,
      message: message,
      recipients: recipients,
      createdBy: currentUserEmail,
      createdAt: new Date().toLocaleString("bn-BD"),
    };

    announcements.push(newAnnouncement);
    localStorage.setItem("announcements", JSON.stringify(announcements));

    logUserActivity(currentUserEmail, "ঘোষণা পাঠানো", "Announcement", title);

    showNotification("ঘোষণা পাঠানো হয়েছে", "success");
    announcementForm.reset();
  }

  function handleBulkUpload() {
    showNotification("বাল্ক আপলোড ফিচার শীঘ্রই আসছে", "info");
  }

  function exportUsers() {
    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
    const dataStr = JSON.stringify(allUsers, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `users_export_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    showNotification("ব্যবহারকারীদের তথ্য এক্সপোর্ট সম্পন্ন", "success");
  }

  function createCourse() {
    showNotification("নতুন কোর্স তৈরি করার পেজে যাচ্ছেন...", "info");
    window.location.href = "dashboard.html";
  }

  function createAssignment() {
    showNotification("নতুন অ্যাসাইনমেন্ট তৈরি করার পেজে যাচ্ছেন...", "info");
    window.location.href = "dashboard.html";
  }

  function generateReport() {
    const reportData = {
      users: JSON.parse(localStorage.getItem("allUsers")) || [],
      courses: JSON.parse(localStorage.getItem("courses")) || [],
      assignments: JSON.parse(localStorage.getItem("assignments")) || [],
      generatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `admin_report_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    showNotification("রিপোর্ট তৈরি এবং ডাউনলোড সম্পন্ন", "success");
  }

  function sendAnnouncement() {
    document.getElementById("announcementTitle").focus();
  }

  function createSystemBackup() {
    const backupData = {
      users: localStorage.getItem("allUsers"),
      courses: localStorage.getItem("courses"),
      assignments: localStorage.getItem("assignments"),
      auditLogs: localStorage.getItem("auditLogs"),
      messages: localStorage.getItem("messages"),
      announcements: localStorage.getItem("announcements"),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `system_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    showNotification("সিস্টেম ব্যাকআপ তৈরি এবং ডাউনলোড সম্পন্ন", "success");
  }

  function toggleMaintenance() {
    const isMaintenanceMode =
      localStorage.getItem("maintenanceMode") === "true";
    localStorage.setItem("maintenanceMode", !isMaintenanceMode);

    if (!isMaintenanceMode) {
      showNotification("রক্ষণাবেক্ষণ মোড সক্রিয় করা হয়েছে", "warning");
    } else {
      showNotification("রক্ষণাবেক্ষণ মোড নিষ্ক্রিয় করা হয়েছে", "success");
    }
  }

  function checkSystemUpdate() {
    showNotification("সিস্টেম আপডেট চেক করা হচ্ছে...", "info");
    setTimeout(() => {
      showNotification(
        "সিস্টেম আপডেট হয়েছে! কোনো নতুন আপডেট পাওয়া যায়নি।",
        "success"
      );
    }, 2000);
  }

  function logUserActivity(userEmail, action, resource, details = "") {
    const auditLogs = JSON.parse(localStorage.getItem("auditLogs")) || [];

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString("bn-BD"),
      userEmail: userEmail,
      action: action,
      resource: resource,
      details: details,
      status: "success",
      ipAddress: "127.0.0.1",
    };

    auditLogs.unshift(newLog);

    if (auditLogs.length > 100) {
      auditLogs.splice(100);
    }

    localStorage.setItem("auditLogs", JSON.stringify(auditLogs));
  }

  window.viewUserProfile = function (email) {
    const userProfile =
      JSON.parse(localStorage.getItem(`profileData_${email}`)) || {};
    const userCourses = JSON.parse(localStorage.getItem("courses")) || [];

    document.getElementById("profileUserEmail").textContent = email;
    document.getElementById("profileUserName").textContent =
      userProfile.fullName || "N/A";
    document.getElementById("profileUserPhone").textContent =
      userProfile.phone || "N/A";
    document.getElementById("profileUserAddress").textContent =
      userProfile.address || "N/A";
    document.getElementById("profileUserBio").textContent =
      userProfile.bio || "N/A";

    const createdCourses = userCourses.filter(
      (course) => course.createdBy === email
    );
    const enrolledCourses = userCourses.filter(
      (course) => course.students && course.students.includes(email)
    );

    document.getElementById("userCreatedCourses").textContent =
      createdCourses.length;
    document.getElementById("userEnrolledCourses").textContent =
      enrolledCourses.length;

    userProfileModal.show();
  };

  window.editUser = function (email) {
    showNotification(
      `ব্যবহারকারী ${email} সম্পাদনা করার ফিচার শীঘ্রই আসছে`,
      "info"
    );
  };

  window.deleteUser = function (email) {
    if (
      confirm(`আপনি কি ${email} ব্যবহারকারীকে সম্পূর্ণভাবে মুছে ফেলতে চান?`)
    ) {
      const allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
      const updatedUsers = allUsers.filter((user) => user.email !== email);
      localStorage.setItem("allUsers", JSON.stringify(updatedUsers));

      localStorage.removeItem(`profileData_${email}`);
      localStorage.removeItem(`loginHistory_${email}`);
      localStorage.removeItem(`lastActivity_${email}`);

      const courses = JSON.parse(localStorage.getItem("courses")) || [];
      const updatedCourses = courses.filter(
        (course) => course.createdBy !== email
      );
      localStorage.setItem("courses", JSON.stringify(updatedCourses));

      logUserActivity(currentUserEmail, "ব্যবহারকারী মুছে ফেলা", "User", email);

      showNotification("ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে", "success");
      loadUsers();
      loadCourses();
      loadDashboardStats();
    }
  };

  window.viewCourseDetails = function (courseId) {
    showNotification(
      `কোর্স ${courseId} এর বিস্তারিত দেখার ফিচার শীঘ্রই আসছে`,
      "info"
    );
  };

  window.editCourse = function (courseId) {
    showNotification(
      `কোর্স ${courseId} সম্পাদনা করার ফিচার শীঘ্রই আসছে`,
      "info"
    );
  };

  window.deleteCourse = function (courseId) {
    if (confirm("আপনি কি এই কোর্সটি সম্পূর্ণভাবে মুছে ফেলতে চান?")) {
      const courses = JSON.parse(localStorage.getItem("courses")) || [];
      const course = courses.find((c) => c.id === courseId);
      const updatedCourses = courses.filter((course) => course.id !== courseId);
      localStorage.setItem("courses", JSON.stringify(updatedCourses));

      if (course) {
        logUserActivity(
          currentUserEmail,
          "কোর্স মুছে ফেলা",
          "Course",
          course.title
        );
      }

      showNotification("কোর্স সফলভাবে মুছে ফেলা হয়েছে", "success");
      loadCourses();
      loadDashboardStats();
    }
  };

  window.editAssignment = function (assignmentId) {
    showNotification(
      `অ্যাসাইনমেন্ট ${assignmentId} সম্পাদনা করার ফিচার শীঘ্রই আসছে`,
      "info"
    );
  };

  window.gradeAssignment = function (assignmentId) {
    showNotification(
      `অ্যাসাইনমেন্ট ${assignmentId} গ্রেড করার ফিচার শীঘ্রই আসছে`,
      "info"
    );
  };

  window.deleteAssignment = function (assignmentId) {
    if (confirm("আপনি কি এই অ্যাসাইনমেন্টটি মুছে ফেলতে চান?")) {
      const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
      const assignment = assignments.find((a) => a.id === assignmentId);
      const updatedAssignments = assignments.filter(
        (a) => a.id !== assignmentId
      );
      localStorage.setItem("assignments", JSON.stringify(updatedAssignments));

      if (assignment) {
        logUserActivity(
          currentUserEmail,
          "অ্যাসাইনমেন্ট মুছে ফেলা",
          "Assignment",
          assignment.title
        );
      }

      showNotification("অ্যাসাইনমেন্ট মুছে ফেলা হয়েছে", "success");
      loadAssignments();
      loadDashboardStats();
    }
  };

  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.top = "90px";
    notification.style.right = "20px";
    notification.style.padding = "1rem 1.5rem";
    notification.style.borderRadius = "12px";
    notification.style.color = "white";
    notification.style.fontWeight = "600";
    notification.style.zIndex = "9999";
    notification.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";
    notification.style.transform = "translateX(100%)";
    notification.style.transition = "transform 0.3s ease";

    const colors = {
      success: "linear-gradient(135deg, #10b981, #34d399)",
      error: "linear-gradient(135deg, #ef4444, #f87171)",
      warning: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      info: "linear-gradient(135deg, #06b6d4, #22d3ee)",
    };

    notification.style.background = colors[type] || colors.info;

    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };

    notification.innerHTML = `
            <i class="fas fa-${icons[type] || icons.info} me-2"></i>
            ${message}
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
});
