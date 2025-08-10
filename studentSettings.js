document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const settingsNavItems = document.querySelectorAll(".settings-nav-item");
  const settingsSections = document.querySelectorAll(".settings-section");
  const saveSettingsBtn = document.getElementById("saveSettings");
  const cancelSettingsBtn = document.getElementById("cancelSettings");
  const headerUserInitial = document.getElementById("headerUserInitial");
  const currentTimeElement = document.getElementById("currentTime");
  const previewTimeElement = document.getElementById("previewTime");
  const previewDateElement = document.getElementById("previewDate");
  const previewTextElement = document.getElementById("previewText");
  const mainBody = document.getElementById("mainBody");

  const currentUserEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole"); // This variable can be used for student-specific logic if needed

  const translations = {
    bn: {
      classroom: "ক্লাসরুম",
      profile: "প্রোফাইল",
      settings: "সেটিংস",
      logout: "লগআউট",
      menu: "মেনু",
      dashboard: "ড্যাশবোর্ড",
      courses: "কোর্স",
      reports: "রিপোর্ট",
      help: "সাহায্য",
      settings_menu: "সেটিংস মেনু",
      general_settings: "সাধারণ সেটিংস",
      notifications: "বিজ্ঞপ্তি",
      security: "নিরাপত্তা",
      privacy: "গোপনীয়তা",
      system: "সিস্টেম",
      backup: "ব্যাকআপ",
      language_region: "ভাষা এবং অঞ্চল",
      system_language: "সিস্টেম ভাষা",
      date_format: "তারিখ ফরম্যাট",
      time_format: "সময় ফরম্যাট",
      display: "প্রদর্শন",
      theme: "থিম",
      font_size: "ফন্ট সাইজ",
      font_family: "ফন্ট ফ্যামিলি",
      preview: "প্রিভিউ",
      current_time: "বর্তমান সময়",
      current_date: "বর্তমান তারিখ",
      sample_text: "নমুনা টেক্সট",
      cancel: "বাতিল",
      save_settings: "সেটিংস সংরক্ষণ করুন",
    },
    en: {
      classroom: "Classroom",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      menu: "Menu",
      dashboard: "Dashboard",
      courses: "Courses",
      reports: "Reports",
      help: "Help",
      settings_menu: "Settings Menu",
      general_settings: "General Settings",
      notifications: "Notifications",
      security: "Security",
      privacy: "Privacy",
      system: "System",
      backup: "Backup",
      language_region: "Language & Region",
      system_language: "System Language",
      date_format: "Date Format",
      time_format: "Time Format",
      display: "Display",
      theme: "Theme",
      font_size: "Font Size",
      font_family: "Font Family",
      preview: "Preview",
      current_time: "Current Time",
      current_date: "Current Date",
      sample_text: "Sample Text",
      cancel: "Cancel",
      save_settings: "Save Settings",
    },
  };

  if (!currentUserEmail) {
    window.location.href = "index.html";
    return;
  }

  initializePage();

  menuToggle.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
  saveSettingsBtn.addEventListener("click", handleSaveSettings);
  cancelSettingsBtn.addEventListener("click", handleCancelSettings);

  settingsNavItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const targetSection = this.dataset.section;
      switchSettingsSection(targetSection);
    });
  });

  document
    .getElementById("systemLanguage")
    .addEventListener("change", updateLanguage);
  document
    .getElementById("dateFormat")
    .addEventListener("change", updatePreview);
  document
    .getElementById("timeFormat")
    .addEventListener("change", updatePreview);
  document.getElementById("theme").addEventListener("change", updateTheme);
  document
    .getElementById("fontSize")
    .addEventListener("change", updateFontSize);
  document
    .getElementById("fontFamily")
    .addEventListener("change", updateFontFamily);

  document
    .getElementById("checkUpdates")
    .addEventListener("click", handleCheckUpdates);
  document
    .getElementById("clearCache")
    .addEventListener("click", handleClearCache);
  document
    .getElementById("resetSettings")
    .addEventListener("click", handleResetSettings);
  document
    .getElementById("clearSessions")
    .addEventListener("click", handleClearSessions);
  document
    .getElementById("createBackup")
    .addEventListener("click", handleCreateBackup);
  document
    .getElementById("restoreBackup")
    .addEventListener("click", handleRestoreBackup);
  document
    .getElementById("downloadBackup")
    .addEventListener("click", handleDownloadBackup);

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

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", function (e) {
      if (document.getElementById("theme").value === "auto") {
        updateTheme();
      }
    });
  }

  function initializePage() {
    const userInitial = currentUserEmail.charAt(0).toUpperCase();
    headerUserInitial.textContent = userInitial;

    if (
      !mainBody.classList.contains("light-theme") &&
      !mainBody.classList.contains("dark-theme")
    ) {
      mainBody.classList.add("light-theme", "font-medium", "font-inter");
    }

    loadSettings();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    updatePreview();

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

  function switchSettingsSection(targetSection) {
    settingsNavItems.forEach((item) => {
      item.classList.remove("active");
    });
    document
      .querySelector(`[data-section="${targetSection}"]`)
      .classList.add("active");

    settingsSections.forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(targetSection).classList.add("active");
  }

  function updateLanguage() {
    const selectedLanguage = document.getElementById("systemLanguage").value;

    document.querySelectorAll("[data-translate]").forEach((element) => {
      const key = element.getAttribute("data-translate");
      if (
        translations[selectedLanguage] &&
        translations[selectedLanguage][key]
      ) {
        element.textContent = translations[selectedLanguage][key];
      }
    });

    document.documentElement.lang = selectedLanguage;
    updatePreview();
    showNotification("ভাষা পরিবর্তন করা হয়েছে!", "success");
  }

  function updateTheme() {
    mainBody.className = mainBody.className.replace(
      /\b(light|dark)-theme\b/g,
      ""
    );
    mainBody.classList.add("light-theme");

    const currentClasses = mainBody.className.split(" ");
    const fontClasses = currentClasses.filter((cls) => cls.startsWith("font-"));
    mainBody.className = `light-theme ${fontClasses.join(" ")}`;

    document.getElementById("theme").value = "light";
    showNotification("থিম সবসময় হালকা থাকবে!", "success");
  }

  function updateFontSize() {
    const selectedSize = document.getElementById("fontSize").value;
    mainBody.className = mainBody.className.replace(
      /\bfont-(small|medium|large)\b/g,
      ""
    );
    mainBody.classList.add(`font-${selectedSize}`);
    updatePreview();
    showNotification("ফন্ট সাইজ পরিবর্তন করা হয়েছে!", "success");
  }

  function updateFontFamily() {
    const selectedFamily = document.getElementById("fontFamily").value;
    mainBody.className = mainBody.className.replace(
      /\bfont-(inter|poppins|roboto|system)\b/g,
      ""
    );
    mainBody.classList.add(`font-${selectedFamily}`);
    updatePreview();
    showNotification("ফন্ট ফ্যামিলি পরিবর্তন করা হয়েছে!", "success");
  }

  function updateCurrentTime() {
    const now = new Date();
    const timeFormat = document.getElementById("timeFormat").value;

    let timeString;
    if (timeFormat === "12") {
      timeString = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      timeString = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (currentTimeElement) {
      currentTimeElement.textContent = timeString;
    }
  }

  function updatePreview() {
    const now = new Date();
    const timeFormat = document.getElementById("timeFormat").value;
    const dateFormat = document.getElementById("dateFormat").value;
    const language = document.getElementById("systemLanguage").value;

    let timeString;
    if (timeFormat === "12") {
      timeString = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      timeString = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (previewTimeElement) {
      previewTimeElement.textContent = timeString;
    }

    let dateString;
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();

    switch (dateFormat) {
      case "dd/mm/yyyy":
        dateString = `${day}/${month}/${year}`;
        break;
      case "mm/dd/yyyy":
        dateString = `${month}/${day}/${year}`;
        break;
      case "yyyy-mm-dd":
        dateString = `${year}-${month}-${day}`;
        break;
      default:
        dateString = `${day}/${month}/${year}`;
    }

    if (previewDateElement) {
      previewDateElement.textContent = dateString;
    }

    if (previewTextElement) {
      const sampleText =
        language === "en" ? "This is a sample text" : "এটি একটি নমুনা টেক্সট";
      previewTextElement.textContent = sampleText;
    }
  }

  function handleSaveSettings() {
    const saveButton = saveSettingsBtn;
    const originalText = saveButton.innerHTML;

    saveButton.innerHTML =
      '<span class="loading me-2"></span>সংরক্ষণ করা হচ্ছে...';
    saveButton.disabled = true;

    setTimeout(() => {
      const settings = {
        systemLanguage: document.getElementById("systemLanguage").value,
        dateFormat: document.getElementById("dateFormat").value,
        timeFormat: document.getElementById("timeFormat").value,
        theme: document.getElementById("theme").value,
        fontSize: document.getElementById("fontSize").value,
        fontFamily: document.getElementById("fontFamily").value,
        emailCourse: document.getElementById("emailCourse").checked,
        emailAssignment: document.getElementById("emailAssignment").checked,
        emailSystem: document.getElementById("emailSystem").checked,
        pushMessages: document.getElementById("pushMessages").checked,
        pushDeadlines: document.getElementById("pushDeadlines").checked,
        twoFactor: document.getElementById("twoFactor").checked,
        loginNotifications:
          document.getElementById("loginNotifications").checked,
        sessionTimeout: document.getElementById("sessionTimeout").value,
        profileVisibility: document.getElementById("profileVisibility").value,
        showEmail: document.getElementById("showEmail").checked,
        showPhone: document.getElementById("showPhone").checked,
        analytics: document.getElementById("analytics").checked,
        autoBackup: document.getElementById("autoBackup").checked,
        backupFrequency: document.getElementById("backupFrequency").value,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        `systemSettings_${currentUserEmail}`,
        JSON.stringify(settings)
      );

      saveButton.innerHTML = originalText;
      saveButton.disabled = false;

      showNotification("সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!", "success");
    }, 1500);
  }

  function handleCancelSettings() {
    if (confirm("আপনি কি পরিবর্তনগুলি বাতিল করতে চান?")) {
      loadSettings();
      showNotification("পরিবর্তনসমূহ বাতিল করা হয়েছে।", "error");
    }
  }

  function handleCheckUpdates() {
    showNotification("আপডেট চেক করা হচ্ছে...", "success");
    setTimeout(() => {
      showNotification("আপনার সিস্টেম সর্বশেষ ভার্সনে আপডেট!", "success");
    }, 2000);
  }

  function handleClearCache() {
    if (confirm("আপনি কি ক্যাশ পরিষ্কার করতে চান?")) {
      showNotification("ক্যাশ পরিষ্কার করা হচ্ছে...", "success");
      setTimeout(() => {
        showNotification("ক্যাশ সফলভাবে পরিষ্কার করা হয়েছে!", "success");
      }, 1500);
    }
  }

  function handleResetSettings() {
    if (
      confirm(
        "আপনি কি সব সেটিংস রিসেট করতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।"
      )
    ) {
      localStorage.removeItem(`systemSettings_${currentUserEmail}`);

      document.getElementById("systemLanguage").value = "bn";
      document.getElementById("dateFormat").value = "dd/mm/yyyy";
      document.getElementById("timeFormat").value = "24";
      document.getElementById("theme").value = "light";
      document.getElementById("fontSize").value = "medium";
      document.getElementById("fontFamily").value = "inter";

      updateLanguage();
      updateTheme();
      updateFontSize();
      updateFontFamily();

      showNotification("সেটিংস রিসেট করা হয়েছে!", "success");
    }
  }

  function handleClearSessions() {
    if (confirm("আপনি কি সব সেশন বাতিল করতে চান?")) {
      showNotification("সব সেশন বাতিল করা হয়েছে!", "success");
    }
  }

  function handleCreateBackup() {
    showNotification("ব্যাকআপ তৈরি করা হচ্ছে...", "success");
    setTimeout(() => {
      showNotification("ব্যাকআপ সফলভাবে তৈরি হয়েছে!", "success");
      updateBackupStatus();
    }, 3000);
  }

  function handleRestoreBackup() {
    if (confirm("আপনি কি ব্যাকআপ পুনরুদ্ধার করতে চান?")) {
      showNotification("ব্যাকআপ পুনরুদ্ধার করা হচ্ছে...", "success");
      setTimeout(() => {
        showNotification("ব্যাকআপ সফলভাবে পুনরুদ্ধার করা হয়েছে!", "success");
      }, 3000);
    }
  }

  function handleDownloadBackup() {
    const backupData = {
      user: currentUserEmail,
      settings: localStorage.getItem(`systemSettings_${currentUserEmail}`),
      profile: localStorage.getItem(`profileData_${currentUserEmail}`),
      courses: localStorage.getItem("courses"),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `classroom_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    showNotification("ব্যাকআপ ডাউনলোড সম্পন্ন হয়েছে!", "success");
  }

  function loadSettings() {
    const savedSettings = localStorage.getItem(
      `systemSettings_${currentUserEmail}`
    );

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      document.getElementById("systemLanguage").value =
        settings.systemLanguage || "bn";
      document.getElementById("dateFormat").value =
        settings.dateFormat || "dd/mm/yyyy";
      document.getElementById("timeFormat").value = settings.timeFormat || "24";
      document.getElementById("theme").value = "light";
      document.getElementById("fontSize").value = settings.fontSize || "medium";
      document.getElementById("fontFamily").value =
        settings.fontFamily || "inter";

      document.getElementById("emailCourse").checked =
        settings.emailCourse !== false;
      document.getElementById("emailAssignment").checked =
        settings.emailAssignment || false;
      document.getElementById("emailSystem").checked =
        settings.emailSystem || false;
      document.getElementById("pushMessages").checked =
        settings.pushMessages !== false;
      document.getElementById("pushDeadlines").checked =
        settings.pushDeadlines || false;

      document.getElementById("twoFactor").checked =
        settings.twoFactor || false;
      document.getElementById("loginNotifications").checked =
        settings.loginNotifications !== false;
      document.getElementById("sessionTimeout").value =
        settings.sessionTimeout || "60";

      document.getElementById("profileVisibility").value =
        settings.profileVisibility || "everyone";
      document.getElementById("showEmail").checked =
        settings.showEmail || false;
      document.getElementById("showPhone").checked =
        settings.showPhone || false;
      document.getElementById("analytics").checked =
        settings.analytics || false;

      document.getElementById("autoBackup").checked =
        settings.autoBackup !== false;
      document.getElementById("backupFrequency").value =
        settings.backupFrequency || "weekly";

      updateLanguage();
      updateTheme();
      updateFontSize();
      updateFontFamily();
    } else {
      document.getElementById("systemLanguage").value = "bn";
      document.getElementById("dateFormat").value = "dd/mm/yyyy";
      document.getElementById("timeFormat").value = "24";
      document.getElementById("theme").value = "light";
      document.getElementById("fontSize").value = "medium";
      document.getElementById("fontFamily").value = "inter";

      updateLanguage();
      updateTheme();
      updateFontSize();
      updateFontFamily();
    }
  }

  function updateBackupStatus() {
    const now = new Date();
    const timeString = now.toLocaleString("bn-BD");
    document.getElementById("backupStatus").innerHTML = `
            <div class="text-muted">সর্বশেষ ব্যাকআপ: ${timeString}</div>
        `;
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

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
});
