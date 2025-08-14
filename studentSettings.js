document.addEventListener("DOMContentLoaded", function () {
  const menuIcon = document.getElementById("menuIcon");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInitial = document.getElementById("userInitial");
  const currentUserEmailElement = document.getElementById("currentUserEmail");
  const userRoleBadge = document.getElementById("userRoleBadge");

  const navLinks = document.querySelectorAll("[data-nav-link]");

  const enrolledClassesDropdownToggle = document.getElementById(
    "enrolledClassesDropdownToggle"
  );
  const enrolledClassesDropdown = document.getElementById(
    "enrolledClassesDropdown"
  );

  const settingsNavItems = document.querySelectorAll(".settings-nav-item");
  const settingsSections = document.querySelectorAll(".settings-section");
  const saveSettingsBtn = document.getElementById("saveSettings");
  const cancelSettingsBtn = document.getElementById("cancelSettings");
  const previewTimeElement = document.getElementById("previewTime");
  const previewDateElement = document.getElementById("previewDate");
  const previewTextElement = document.getElementById("previewText");
  const mainBody = document.getElementById("mainBody");

  const currentUserEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  const translations = {
    bn: {
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
      email_notifications: "Email Notifications",
      new_course_notifications: "New Course Notifications",
      assignment_notifications: "Assignment Notifications",
      system_updates: "System Updates",
      push_notifications: "Push Notifications",
      new_messages: "New Messages",
      deadline_reminders: "Deadline Reminders",
      security_settings: "Security Settings",
      account_security: "Account Security",
      two_factor_auth: "Two-Factor Authentication",
      two_factor_desc: "Requires SMS code for additional security",
      login_notifications: "Login Notifications",
      login_desc: "Notifications for login from new devices",
      session_management: "Session Management",
      session_timeout: "Session Timeout (minutes)",
      clear_all_sessions: "Clear All Sessions",
      privacy_settings: "Privacy Settings",
      profile_visibility: "Profile Visibility",
      who_can_view: "Who can view profile",
      show_email: "Show Email",
      show_phone: "Show Phone Number",
      data_collection: "Data Collection",
      analytics_data: "Analytics Data",
      analytics_desc: "Collect anonymous data for system improvement",
      system_settings: "System Settings",
      system_info: "System Information",
      system_version: "System Version",
      last_update: "Last Update",
      server_status: "Server Status",
      online: "Online",
      maintenance: "Maintenance",
      check_updates: "Check for Updates",
      clear_cache: "Clear Cache",
      reset_settings: "Reset Settings",
      backup_settings: "Backup Settings",
      auto_backup: "Automatic Backup",
      enable_auto_backup: "Enable Automatic Backup",
      backup_frequency: "Backup Frequency",
      backup_management: "Backup Management",
      create_backup: "Create New Backup",
      restore_backup: "Restore Backup",
      download_backup: "Download Backup",
      last_backup: "Last Backup:",
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
      email_notifications: "Email Notifications",
      new_course_notifications: "New Course Notifications",
      assignment_notifications: "Assignment Notifications",
      system_updates: "System Updates",
      push_notifications: "Push Notifications",
      new_messages: "New Messages",
      deadline_reminders: "Deadline Reminders",
      security_settings: "Security Settings",
      account_security: "Account Security",
      two_factor_auth: "Two-Factor Authentication",
      two_factor_desc: "Requires SMS code for additional security",
      login_notifications: "Login Notifications",
      login_desc: "Notifications for login from new devices",
      session_management: "Session Management",
      session_timeout: "Session Timeout (minutes)",
      clear_all_sessions: "Clear All Sessions",
      privacy_settings: "Privacy Settings",
      profile_visibility: "Profile Visibility",
      who_can_view: "Who can view profile",
      show_email: "Show Email",
      show_phone: "Show Phone Number",
      data_collection: "Data Collection",
      analytics_data: "Analytics Data",
      analytics_desc: "Collect anonymous data for system improvement",
      system_settings: "System Settings",
      system_info: "System Information",
      system_version: "System Version",
      last_update: "Last Update",
      server_status: "Server Status",
      online: "Online",
      maintenance: "Maintenance",
      check_updates: "Check for Updates",
      clear_cache: "Clear Cache",
      reset_settings: "Reset Settings",
      backup_settings: "Backup Settings",
      auto_backup: "Automatic Backup",
      enable_auto_backup: "Enable Automatic Backup",
      backup_frequency: "Backup Frequency",
      backup_management: "Backup Management",
      create_backup: "Create New Backup",
      restore_backup: "Restore Backup",
      download_backup: "Download Backup",
      last_backup: "Last Backup:",
    },
  };

  if (!currentUserEmail || userRole !== "student") {
    window.location.href = "index.html";
    return;
  }

  initializePage();

  // Event listeners for new header/sidebar
  menuIcon.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);

  // Enrolled Classes Dropdown Toggle
  enrolledClassesDropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    enrolledClassesDropdown.classList.toggle("show");
    this.querySelector(".dropdown-arrow").classList.toggle("rotate");
    renderEnrolledClasses();
  });

  // Navigation event listeners - Complete navigation fix
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const currentPage =
        window.location.pathname.split("/").pop() || "student.html";

      // Prevent default behavior and handle navigation manually
      e.preventDefault();
      e.stopPropagation();

      // If clicking on same page, do nothing
      if (
        href === currentPage ||
        (href === "student.html" && currentPage === "")
      ) {
        return;
      }

      // Update active states
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      // Store navigation intent to prevent automatic redirects
      localStorage.setItem("intentionalNavigation", "true");
      localStorage.setItem("targetPage", href);

      // Use window.location.href for proper navigation
      setTimeout(() => {
        window.location.href = href;
      }, 100);
    });
  });

  // Close dropdowns when clicking outside
  window.addEventListener("click", function (e) {
    // Close enrolled classes dropdown if clicked outside
    if (
      !enrolledClassesDropdownToggle.contains(e.target) &&
      !enrolledClassesDropdown.contains(e.target)
    ) {
      enrolledClassesDropdown.classList.remove("show");
      enrolledClassesDropdownToggle
        .querySelector(".dropdown-arrow")
        .classList.remove("rotate");
    }
  });

  // Close sidebar when clicking outside (but don't interfere with navigation)
  document.addEventListener("click", function (e) {
    // Check if click is on a navigation link
    const isNavLink = e.target.closest("[data-nav-link]");

    if (
      !isNavLink &&
      !sidebar.contains(e.target) &&
      !menuIcon.contains(e.target)
    ) {
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
    }
  });

  // Existing settings page event listeners
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

  /**
   * Initializes the page by setting user info, loading settings, and updating UI elements.
   */
  function initializePage() {
    currentUserEmailElement.textContent = currentUserEmail;
    userInitial.textContent = currentUserEmail.charAt(0).toUpperCase();
    userRoleBadge.textContent = "Student";
    userRoleBadge.className = "role-badge student";

    // Handle sidebar state on page load
    const savedSidebarState = localStorage.getItem("sidebarState");
    const intentionalNavigation = localStorage.getItem("intentionalNavigation");

    // If coming from intentional navigation and sidebar was open, restore it
    if (intentionalNavigation === "true" && savedSidebarState === "open") {
      sidebar.classList.add("open");
      mainContent.classList.add("sidebar-open");
      // Clear the navigation flag
      localStorage.removeItem("intentionalNavigation");
    } else {
      // Default closed state (for refresh or direct access)
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
    }

    loadSettings();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    updatePreview();
    renderEnrolledClasses();

    document.querySelectorAll(".card").forEach((card) => {
      card.classList.add("fade-in");
    });
  }

  /**
   * Toggles the sidebar open/closed state and updates main content margin.
   */
  function toggleSidebar() {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");

    // Save sidebar state
    const sidebarIsOpen = sidebar.classList.contains("open");
    localStorage.setItem("sidebarState", sidebarIsOpen ? "open" : "closed");
  }

  /**
   * Handles user logout, clearing session data and redirecting to the login page.
   */
  function handleLogout() {
    if (confirm("Do you want to log out?")) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      window.location.href = "index.html";
    }
  }

  /**
   * Switches the active settings section based on the target section ID.
   * @param {string} targetSection - The ID of the settings section to display.
   */
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

  /**
   * Updates the UI language based on the selected language.
   */
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
    showNotification("Language changed!", "success");
  }

  /**
   * Updates the theme to always be light and shows a notification.
   */
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
    showNotification("Theme will always be light!", "success");
  }

  /**
   * Updates the font size of the body and refreshes the preview.
   */
  function updateFontSize() {
    const selectedSize = document.getElementById("fontSize").value;
    mainBody.className = mainBody.className.replace(
      /\bfont-(small|medium|large)\b/g,
      ""
    );
    mainBody.classList.add(`font-${selectedSize}`);
    updatePreview();
    showNotification("Font size changed!", "success");
  }

  /**
   * Updates the font family of the body and refreshes the preview.
   */
  function updateFontFamily() {
    const selectedFamily = document.getElementById("fontFamily").value;
    mainBody.className = mainBody.className.replace(
      /\bfont-(inter|poppins|roboto|system)\b/g,
      ""
    );
    mainBody.classList.add(`font-${selectedFamily}`);
    updatePreview();
    showNotification("Font family changed!", "success");
  }

  /**
   * Updates the current time displayed in the header (if applicable).
   */
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
  }

  /**
   * Updates the preview section with current time, date, and sample text based on selected settings.
   */
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
        language === "en" ? "This is a sample text" : "This is a sample text";
      previewTextElement.textContent = sampleText;
    }
  }

  /**
   * Handles saving the current settings to local storage.
   */
  function handleSaveSettings() {
    const saveButton = saveSettingsBtn;
    const originalText = saveButton.innerHTML;

    saveButton.innerHTML = '<span class="loading me-2"></span>Saving...';
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

      showNotification("Settings saved successfully!", "success");
    }, 1500);
  }

  /**
   * Handles canceling changes to settings and reloads the previously saved settings.
   */
  function handleCancelSettings() {
    if (confirm("Do you want to cancel changes?")) {
      loadSettings();
      showNotification("Changes canceled.", "error");
    }
  }

  /**
   * Simulates checking for system updates and shows a notification.
   */
  function handleCheckUpdates() {
    showNotification("Checking for updates...", "success");
    setTimeout(() => {
      showNotification("Your system is up to date!", "success");
    }, 2000);
  }

  /**
   * Handles clearing the application cache and shows a notification.
   */
  function handleClearCache() {
    if (confirm("Do you want to clear the cache?")) {
      showNotification("Clearing cache...", "success");
      setTimeout(() => {
        showNotification("Cache cleared successfully!", "success");
      }, 1500);
    }
  }

  /**
   * Handles resetting all settings to their default values.
   */
  function handleResetSettings() {
    if (
      confirm(
        "Do you want to reset all settings? This action cannot be undone."
      )
    ) {
      localStorage.removeItem(`systemSettings_${currentUserEmail}`);

      document.getElementById("systemLanguage").value = "en";
      document.getElementById("dateFormat").value = "dd/mm/yyyy";
      document.getElementById("timeFormat").value = "24";
      document.getElementById("theme").value = "light";
      document.getElementById("fontSize").value = "medium";
      document.getElementById("fontFamily").value = "inter";

      updateLanguage();
      updateTheme();
      updateFontSize();
      updateFontFamily();

      showNotification("Settings reset!", "success");
    }
  }

  /**
   * Handles clearing all active user sessions.
   */
  function handleClearSessions() {
    if (confirm("Do you want to clear all sessions?")) {
      showNotification("All sessions cleared!", "success");
    }
  }

  /**
   * Simulates creating a new backup and updates the backup status.
   */
  function handleCreateBackup() {
    showNotification("Creating backup...", "success");
    setTimeout(() => {
      showNotification("Backup created successfully!", "success");
      updateBackupStatus();
    }, 3000);
  }

  /**
   * Simulates restoring a backup.
   */
  function handleRestoreBackup() {
    if (confirm("Do you want to restore backup?")) {
      showNotification("Restoring backup...", "success");
      setTimeout(() => {
        showNotification("Backup restored successfully!", "success");
      }, 3000);
    }
  }

  /**
   * Handles downloading the current system settings and user data as a JSON backup file.
   */
  function handleDownloadBackup() {
    const backupData = {
      user: currentUserEmail,
      settings: localStorage.getItem(`systemSettings_${currentUserEmail}`),
      profile: localStorage.getItem(`profileData_${currentUserEmail}`),
      courses: localStorage.getItem("allCourses"),
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

    showNotification("Backup download complete!", "success");
  }

  /**
   * Loads saved settings from local storage and applies them to the UI.
   */
  function loadSettings() {
    const savedSettings = localStorage.getItem(
      `systemSettings_${currentUserEmail}`
    );

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      document.getElementById("systemLanguage").value =
        settings.systemLanguage || "en";
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
      // Default settings if none saved
      document.getElementById("systemLanguage").value = "en";
      document.getElementById("dateFormat").value = "dd/mm/yyyy";
      document.getElementById("timeFormat").value = "24";
      document.getElementById("theme").value = "light";
      document.getElementById("fontSize").value = "medium";
      document.getElementById("fontFamily").value = "inter";

      // Default checkboxes
      document.getElementById("emailCourse").checked = true;
      document.getElementById("emailAssignment").checked = false;
      document.getElementById("emailSystem").checked = false;
      document.getElementById("pushMessages").checked = true;
      document.getElementById("pushDeadlines").checked = false;
      document.getElementById("twoFactor").checked = false;
      document.getElementById("loginNotifications").checked = true;
      document.getElementById("sessionTimeout").value = "60";
      document.getElementById("profileVisibility").value = "everyone";
      document.getElementById("showEmail").checked = false;
      document.getElementById("showPhone").checked = false;
      document.getElementById("analytics").checked = false;
      document.getElementById("autoBackup").checked = true;
      document.getElementById("backupFrequency").value = "weekly";

      updateLanguage();
      updateTheme();
      updateFontSize();
      updateFontFamily();
    }
  }

  /**
   * Updates the displayed last backup status with the current time.
   */
  function updateBackupStatus() {
    const now = new Date();
    const timeString = now.toLocaleString("en-US");
    document.getElementById("backupStatus").innerHTML = `
            <div class="text-muted">Last Backup: ${timeString}</div>
        `;
  }

  /**
   * Displays a temporary notification message on the screen.
   * @param {string} message - The message to display.
   * @param {string} type - The type of notification (e.g., "success", "error").
   */
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

  /**
   * Retrieves the user's dashboard data from local storage.
   */
  function getUserDashboard() {
    const dashboardKey = `dashboard_${currentUserEmail}`;
    const dashboard = JSON.parse(
      localStorage.getItem(dashboardKey) || '{"courses": [], "role": "student"}'
    );
    if (!dashboard.courses) {
      dashboard.courses = [];
    }
    return dashboard;
  }

  /**
   * Renders the list of enrolled classes in the sidebar dropdown.
   */
  function renderEnrolledClasses() {
    const dashboard = getUserDashboard();
    const enrolled = dashboard.courses.filter(
      (course) => !course.archived && course.students.includes(currentUserEmail)
    );

    enrolledClassesDropdown.innerHTML = "";

    if (enrolled.length === 0) {
      const listItem = document.createElement("li");
      listItem.className = "dropdown-item-sidebar no-courses";
      listItem.textContent = "No enrolled classes";
      enrolledClassesDropdown.appendChild(listItem);
    } else {
      enrolled.forEach((course) => {
        const listItem = document.createElement("li");
        listItem.className = "dropdown-item-sidebar";
        listItem.textContent = course.name;
        listItem.dataset.courseId = course.id;
        listItem.addEventListener("click", (e) => {
          e.stopPropagation();
          openCourse(course);
        });
        enrolledClassesDropdown.appendChild(listItem);
      });
    }
  }

  /**
   * Navigates to the student stream page for a selected course.
   * @param {object} course - The course object to open.
   */
  function openCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    window.location.href = "studentStream.html";
  }
});
