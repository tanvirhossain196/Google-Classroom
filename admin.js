document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");
  const adminName = document.getElementById("adminName");
  const manageUsers = document.getElementById("manageUsers");
  const monitorCourses = document.getElementById("monitorCourses");
  const platformConfig = document.getElementById("platformConfig");
  const usageStats = document.getElementById("usageStats");
  const usersSection = document.getElementById("usersSection");
  const usersTableBody = document.getElementById("usersTableBody");

  // Load admin data
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (userEmail) {
    adminName.textContent = userEmail.split("@")[0];
  }

  // Check if user is admin
  if (userRole !== "admin") {
    window.location.href = "dashboard.html";
  }

  // Logout functionality
  logoutBtn.addEventListener("click", function () {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      window.location.href = "index.html";
    }
  });

  // Admin card click handlers
  manageUsers.addEventListener("click", function () {
    showUsersManagement();
  });

  monitorCourses.addEventListener("click", function () {
    window.location.href = "courses.html";
  });

  platformConfig.addEventListener("click", function () {
    window.location.href = "settings.html";
  });

  usageStats.addEventListener("click", function () {
    window.location.href = "reports.html";
  });

  function showUsersManagement() {
    usersSection.style.display = "block";
    loadUsers();
  }

  function loadUsers() {
    const users = [
      {
        id: 1,
        name: "আহমেদ আলী",
        email: "ahmed@email.com",
        role: "teacher",
        status: "active",
      },
      {
        id: 2,
        name: "ফাতেমা খাতুন",
        email: "fatema@email.com",
        role: "student",
        status: "active",
      },
      {
        id: 3,
        name: "করিম উদ্দিন",
        email: "karim@email.com",
        role: "teacher",
        status: "inactive",
      },
      {
        id: 4,
        name: "রহিমা বেগম",
        email: "rahima@email.com",
        role: "student",
        status: "active",
      },
      {
        id: 5,
        name: "নাসির হোসেন",
        email: "nasir@email.com",
        role: "student",
        status: "active",
      },
    ];

    usersTableBody.innerHTML = "";
    users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role === "teacher" ? "শিক্ষক" : "ছাত্র"}</td>
                <td class="status-${user.status}">${
        user.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"
      }</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editUser(${
                      user.id
                    })">সম্পাদনা</button>
                    <button class="action-btn delete-btn" onclick="deleteUser(${
                      user.id
                    })">মুছুন</button>
                </td>
            `;
      usersTableBody.appendChild(row);
    });
  }

  // Global functions for user management
  window.editUser = function (userId) {
    alert(`ব্যবহারকারী ${userId} সম্পাদনা করা হবে`);
  };

  window.deleteUser = function (userId) {
    if (confirm("আপনি কি এই ব্যবহারকারীকে মুছে ফেলতে চান?")) {
      alert(`ব্যবহারকারী ${userId} মুছে ফেলা হয়েছে`);
      loadUsers();
    }
  };
});
