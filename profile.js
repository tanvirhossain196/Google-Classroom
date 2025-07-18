document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");
  const savePreferences = document.getElementById("savePreferences");
  const avatarUpload = document.getElementById("avatarUpload");
  const avatarImg = document.getElementById("avatarImg");
  const avatarText = document.getElementById("avatarText");
  const headerUserInitial = document.getElementById("headerUserInitial");

  // User data
  const currentUserEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  // Check authentication
  if (!currentUserEmail) {
    window.location.href = "index.html";
    return;
  }

  // Initialize page
  initializePage();

  // Event listeners
  menuToggle.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  profileForm.addEventListener("submit", handleProfileSubmit);
  passwordForm.addEventListener("submit", handlePasswordSubmit);
  savePreferences.addEventListener("click", handlePreferencesSubmit);
  avatarUpload.addEventListener("change", handleAvatarUpload);

  // Close sidebar on mobile when clicking outside
  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove("show");
      }
    }
  });

  // Responsive sidebar handling
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("show");
    }
  });

  function initializePage() {
    // Set user info
    const userName = currentUserEmail.split("@")[0];
    const userInitial = currentUserEmail.charAt(0).toUpperCase();

    document.getElementById("profileName").textContent = userName;
    document.getElementById("profileEmail").textContent = currentUserEmail;
    document.getElementById("email").value = currentUserEmail;
    headerUserInitial.textContent = userInitial;
    avatarText.textContent = userInitial;

    // Load saved data
    loadProfileData();
    loadPreferences();
    loadAvatar();
    updateStats();

    // Add fade-in animation
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

  function handleProfileSubmit(e) {
    e.preventDefault();

    const profileData = {
      fullName: document.getElementById("fullName").value,
      phone: document.getElementById("phone").value,
      dateOfBirth: document.getElementById("dateOfBirth").value,
      address: document.getElementById("address").value,
      bio: document.getElementById("bio").value,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `profileData_${currentUserEmail}`,
      JSON.stringify(profileData)
    );

    // Update display name
    if (profileData.fullName) {
      document.getElementById("profileName").textContent = profileData.fullName;
    }

    showNotification("প্রোফাইল সফলভাবে আপডেট হয়েছে!", "success");
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification("সব ফিল্ড পূরণ করুন!", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("নতুন পাসওয়ার্ড মিলছে না!", "error");
      return;
    }

    if (newPassword.length < 6) {
      showNotification("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে!", "error");
      return;
    }

    // Save password
    localStorage.setItem(`userPassword_${currentUserEmail}`, newPassword);
    passwordForm.reset();
    showNotification("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!", "success");
  }

  function handlePreferencesSubmit() {
    const preferences = {
      language: document.getElementById("language").value,
      timezone: document.getElementById("timezone").value,
      emailNotifications: document.getElementById("emailNotifications").checked,
      smsNotifications: document.getElementById("smsNotifications").checked,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `preferences_${currentUserEmail}`,
      JSON.stringify(preferences)
    );
    showNotification("প্রাথমিকতা সংরক্ষণ করা হয়েছে!", "success");
  }

  function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("শুধুমাত্র ছবি ফাইল আপলোড করুন!", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("ফাইল সাইজ ৫ MB এর কম হতে হবে!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;

      // Update avatar display
      avatarImg.src = imageData;
      avatarImg.classList.remove("d-none");
      avatarText.style.display = "none";

      // Save to localStorage
      localStorage.setItem(`userAvatar_${currentUserEmail}`, imageData);

      showNotification("প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!", "success");
    };

    reader.readAsDataURL(file);
  }

  function loadProfileData() {
    const savedProfile = localStorage.getItem(
      `profileData_${currentUserEmail}`
    );
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);

      document.getElementById("fullName").value = profileData.fullName || "";
      document.getElementById("phone").value = profileData.phone || "";
      document.getElementById("dateOfBirth").value =
        profileData.dateOfBirth || "";
      document.getElementById("address").value = profileData.address || "";
      document.getElementById("bio").value = profileData.bio || "";

      // Update display name
      if (profileData.fullName) {
        document.getElementById("profileName").textContent =
          profileData.fullName;
      }
    }
  }

  function loadPreferences() {
    const savedPreferences = localStorage.getItem(
      `preferences_${currentUserEmail}`
    );
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);

      document.getElementById("language").value = preferences.language || "bn";
      document.getElementById("timezone").value =
        preferences.timezone || "Asia/Dhaka";
      document.getElementById("emailNotifications").checked =
        preferences.emailNotifications || false;
      document.getElementById("smsNotifications").checked =
        preferences.smsNotifications || false;
    }
  }

  function loadAvatar() {
    const savedAvatar = localStorage.getItem(`userAvatar_${currentUserEmail}`);
    if (savedAvatar) {
      avatarImg.src = savedAvatar;
      avatarImg.classList.remove("d-none");
      avatarText.style.display = "none";
    }
  }

  function updateStats() {
    const courses = JSON.parse(localStorage.getItem("courses") || "[]");
    let userCourseCount = 0;
    let totalAssignments = 0;
    let totalStudents = 0;

    if (userRole === "teacher") {
      const userCourses = courses.filter(
        (course) => course.teacher === currentUserEmail.split("@")[0]
      );
      userCourseCount = userCourses.length;
      totalAssignments = userCourses.reduce(
        (sum, course) => sum + (course.assignments || 0),
        0
      );
      totalStudents = userCourses.reduce(
        (sum, course) => sum + (course.students || 0),
        0
      );
    } else {
      userCourseCount = courses.length;
      totalAssignments = courses.reduce(
        (sum, course) => sum + (course.assignments || 0),
        0
      );
      totalStudents = courses.length; // Student count for student view
    }

    document.getElementById("totalCourses").textContent = userCourseCount;
    document.getElementById("totalAssignments").textContent = totalAssignments;
    document.getElementById("totalStudents").textContent = totalStudents;

    // Update join date
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - 6);
    document.getElementById("joinDate").textContent =
      joinDate.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
      });
  }

  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <i class="fas fa-${
              type === "success" ? "check-circle" : "exclamation-circle"
            } me-2"></i>
            ${message}
        `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    // Hide notification
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
});
