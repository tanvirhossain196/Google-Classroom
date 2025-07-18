document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const headerUserInitial = document.getElementById("headerUserInitial");
  const reportPeriod = document.getElementById("reportPeriod");
  const exportReport = document.getElementById("exportReport");

  const currentUserEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!currentUserEmail) {
    window.location.href = "index.html";
    return;
  }

  initializePage();

  menuToggle.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  reportPeriod.addEventListener("change", handlePeriodChange);
  exportReport.addEventListener("click", handleExportReport);

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
    const userInitial = currentUserEmail.charAt(0).toUpperCase();
    headerUserInitial.textContent = userInitial;

    updateReportData("month");
    createCourseChart();

    document.querySelectorAll(".card").forEach((card) => {
      card.classList.add("fade-in");
    });
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

  function handlePeriodChange() {
    const selectedPeriod = reportPeriod.value;
    updateReportData(selectedPeriod);
    showNotification(
      `রিপোর্ট ${getPeriodText(selectedPeriod)} এ আপডেট করা হয়েছে`,
      "success"
    );
  }

  function handleExportReport() {
    const reportData = {
      period: reportPeriod.value,
      generatedAt: new Date().toISOString(),
      stats: {
        totalStudents: document.getElementById("totalStudents").textContent,
        activeCourses: document.getElementById("activeCourses").textContent,
        completedAssignments: document.getElementById("completedAssignments")
          .textContent,
        averageRating: document.getElementById("averageRating").textContent,
      },
      popularCourses: [
        { name: "প্রোগ্রামিং বেসিক", students: 45 },
        { name: "ওয়েব ডেভেলপমেন্ট", students: 38 },
        { name: "ডেটা সায়েন্স", students: 32 },
        { name: "গ্রাফিক ডিজাইন", students: 28 },
      ],
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `classroom_report_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    showNotification("রিপোর্ট সফলভাবে ডাউনলোড হয়েছে!", "success");
  }

  function updateReportData(period) {
    const data = getReportData(period);

    document.getElementById("totalStudents").textContent = data.totalStudents;
    document.getElementById("activeCourses").textContent = data.activeCourses;
    document.getElementById("completedAssignments").textContent =
      data.completedAssignments;
    document.getElementById("averageRating").textContent = data.averageRating;

    updateActivities(data);
  }

  function getReportData(period) {
    const data = {
      week: {
        totalStudents: "৮৫",
        activeCourses: "১২",
        completedAssignments: "৪৮",
        averageRating: "ৄ.৩",
      },
      month: {
        totalStudents: "১২৫",
        activeCourses: "১৮",
        completedAssignments: "৮৪",
        averageRating: "ৄ.৬",
      },
      quarter: {
        totalStudents: "২৮৫",
        activeCourses: "৩৫",
        completedAssignments: "২৪৫",
        averageRating: "ৄ.৪",
      },
      year: {
        totalStudents: "৯৮৫",
        activeCourses: "৮৫",
        completedAssignments: "১,২৪৫",
        averageRating: "ৄ.৫",
      },
    };

    return data[period] || data.month;
  }

  function getPeriodText(period) {
    const periods = {
      week: "সাপ্তাহিক",
      month: "মাসিক",
      quarter: "ত্রৈমাসিক",
      year: "বার্ষিক",
    };
    return periods[period] || "মাসিক";
  }

  function updateActivities(data) {
    const activities = [
      {
        time: "২ ঘণ্টা আগে",
        text: `${Math.floor(
          Math.random() * 50 + 10
        )} জন শিক্ষার্থী নতুন কোর্সে যোগ দিয়েছেন`,
      },
      {
        time: "৫ ঘণ্টা আগে",
        text: 'নতুন কোর্স "ডেটা সায়েন্স" চালু করা হয়েছে',
      },
      {
        time: "১ দিন আগে",
        text: `${Math.floor(
          Math.random() * 100 + 20
        )}টি অ্যাসাইনমেন্ট সফলভাবে জমা দেওয়া হয়েছে`,
      },
    ];

    const activitiesContainer = document.querySelector(".recent-activities");
    activitiesContainer.innerHTML = "";

    activities.forEach((activity) => {
      const activityElement = document.createElement("div");
      activityElement.className = "activity-item";
      activityElement.innerHTML = `
                <div class="activity-time">${activity.time}</div>
                <div class="activity-text">${activity.text}</div>
            `;
      activitiesContainer.appendChild(activityElement);
    });
  }

  function createCourseChart() {
    const ctx = document.getElementById("courseChart");
    if (!ctx) return;

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["সম্পন্ন", "চলমান", "অসম্পন্ন"],
        datasets: [
          {
            data: [60, 30, 10],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        cutout: "70%",
      },
    });
  }

  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background: ${
              type === "success"
                ? "linear-gradient(135deg, #10b981, #34d399)"
                : "linear-gradient(135deg, #ef4444, #f87171)"
            };
        `;

    notification.innerHTML = `
            <i class="fas fa-${
              type === "success" ? "check-circle" : "exclamation-circle"
            } me-2"></i>
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
