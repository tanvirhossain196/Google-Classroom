document.addEventListener("DOMContentLoaded", function () {
  // Elements from teacher.js
  const menuIcon = document.getElementById("menuIcon");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInitial = document.getElementById("userInitial");
  const currentUserEmail = document.getElementById("currentUserEmail");
  const userRoleBadge = document.getElementById("userRoleBadge");

  // Navigation links
  const navLinks = document.querySelectorAll("[data-nav-link]");

  // Enrolled Classes Dropdown elements
  const enrolledClassesDropdownToggle = document.getElementById(
    "enrolledClassesDropdownToggle"
  );
  const enrolledClassesDropdown = document.getElementById(
    "enrolledClassesDropdown"
  );
  const dropdownArrowIcon = enrolledClassesDropdownToggle.querySelector(
    ".dropdown-arrow-icon"
  );

  // Elements from original help.js
  const helpLinks = document.querySelectorAll(".help-link");
  const helpSections = document.querySelectorAll(".help-section");
  const helpSearch = document.getElementById("helpSearch");
  const searchBtn = document.getElementById("searchBtn");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const faqItems = document.querySelectorAll(".faq-item");
  const contactForm = document.getElementById("contactForm");
  const chatBtn = document.querySelector(".chat-btn");

  // User data
  const currentUser =
    localStorage.getItem("currentUser") || localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  initializePage();

  // Event listeners from teacher.js
  menuIcon.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);

  // Event listeners from original help.js
  searchBtn.addEventListener("click", performSearch);
  contactForm.addEventListener("submit", handleContactSubmit);
  chatBtn.addEventListener("click", handleChatClick);

  helpSearch.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  helpLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetSection = this.dataset.section;
      switchHelpSection(targetSection);
    });
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.dataset.tab;
      switchTab(targetTab);
    });
  });

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", function () {
      toggleFAQ(item);
    });
  });

  // Enrolled Classes Dropdown Toggle
  enrolledClassesDropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent sidebar from closing if clicked inside
    enrolledClassesDropdown.classList.toggle("show");
    this.querySelector(".dropdown-arrow").classList.toggle("rotate"); // Rotate arrow
    renderEnrolledClasses(); // Re-render to ensure up-to-date list
  });

  // Navigation event listeners - Complete navigation fix
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const currentPage =
        window.location.pathname.split("/").pop() || "teacher.html"; // Default for dashboard

      // Prevent default behavior and handle navigation manually
      e.preventDefault();
      e.stopPropagation();

      // If clicking on same page, do nothing
      if (
        href === currentPage ||
        (href === "teacher.html" && currentPage === "")
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

  // Close dropdowns/sidebar when clicking outside
  document.addEventListener("click", function (e) {
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

    // Close sidebar when clicking outside (but don't interfere with navigation)
    const isNavLink = e.target.closest("[data-nav-link]");
    if (
      !isNavLink &&
      !sidebar.contains(e.target) &&
      !menuIcon.contains(e.target)
    ) {
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
      // Ensure dropdown arrow is hidden when sidebar closes
      if (dropdownArrowIcon) {
        dropdownArrowIcon.style.display = "none";
      }
    }
  });

  // Functions from teacher.js
  function initializeDashboardComponents() {
    currentUserEmail.textContent = currentUser;
    userInitial.textContent = currentUser.charAt(0).toUpperCase();

    // Set role badge
    if (userRole === "teacher") {
      userRoleBadge.textContent = "Teacher";
      userRoleBadge.className = "role-badge teacher";
    } else if (userRole === "student") {
      userRoleBadge.textContent = "Student";
      userRoleBadge.className = "role-badge student";
    } else {
      userRoleBadge.textContent = "User";
      userRoleBadge.className = "role-badge new";
    }

    // Handle sidebar state on page load
    const savedSidebarState = localStorage.getItem("sidebarState");
    const intentionalNavigation = localStorage.getItem("intentionalNavigation");

    // If coming from intentional navigation and sidebar was open, restore it
    if (intentionalNavigation === "true" && savedSidebarState === "open") {
      sidebar.classList.add("open");
      mainContent.classList.add("sidebar-open");
      // Show dropdown arrow if sidebar is open
      if (dropdownArrowIcon) {
        dropdownArrowIcon.style.display = "block";
      }
      // Clear the navigation flag
      localStorage.removeItem("intentionalNavigation");
    } else {
      // Default closed state (for refresh or direct access)
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
      localStorage.setItem("sidebarState", "closed");
      // Hide dropdown arrow if sidebar is closed
      if (dropdownArrowIcon) {
        dropdownArrowIcon.style.display = "none";
      }
    }

    // Set active class for current page in sidebar
    const currentPage = window.location.pathname.split("/").pop();
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    renderEnrolledClasses(); // Initial render of enrolled classes
  }

  function toggleSidebar() {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");

    // Save sidebar state
    const sidebarIsOpen = sidebar.classList.contains("open");
    localStorage.setItem("sidebarState", sidebarIsOpen ? "open" : "closed");

    // Toggle visibility of the dropdown arrow icon
    if (dropdownArrowIcon) {
      dropdownArrowIcon.style.display = sidebarIsOpen ? "block" : "none";
    }
  }

  function handleLogout() {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      window.location.href = "index.html";
    }
  }

  function getUserDashboard() {
    const dashboardKey = `dashboard_${currentUser}`;
    const dashboard = JSON.parse(
      localStorage.getItem(dashboardKey) || '{"courses": [], "role": "teacher"}'
    );
    if (!dashboard.courses) {
      dashboard.courses = [];
    }
    return dashboard;
  }

  function renderEnrolledClasses() {
    const dashboard = getUserDashboard();
    let enrolled = [];

    if (userRole === "teacher") {
      enrolled = dashboard.courses.filter(
        (course) => !course.archived && course.teacher === currentUser
      );
    } else if (userRole === "student") {
      enrolled = dashboard.courses.filter(
        (course) => !course.archived && course.students.includes(currentUser)
      );
    }

    enrolledClassesDropdown.innerHTML = ""; // Clear existing list

    if (enrolled.length === 0) {
      const listItem = document.createElement("li");
      listItem.className = "dropdown-item-sidebar no-courses";
      listItem.textContent =
        userRole === "teacher" ? "No classes taught" : "No enrolled classes";
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

  function openCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    if (userRole === "teacher") {
      window.location.href = "teacherStream.html";
    } else if (userRole === "student") {
      window.location.href = "studentStream.html";
    }
  }

  // Functions from original help.js
  function initializePage() {
    initializeDashboardComponents(); // Initialize new navbar/sidebar components

    // Original help.js initialization
    if (currentUser) {
      document.getElementById("contactEmail").value = currentUser;
    }

    document.getElementById("getting-started").classList.add("active");

    document.querySelectorAll(".card").forEach((card) => {
      card.classList.add("fade-in");
    });
  }

  function switchHelpSection(targetSection) {
    helpLinks.forEach((link) => {
      link.classList.remove("active");
    });
    document
      .querySelector(`[data-section="${targetSection}"]`)
      .classList.add("active");

    helpSections.forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(targetSection).classList.add("active");
  }

  function switchTab(targetTab) {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add("active");

    tabPanes.forEach((pane) => {
      pane.classList.remove("active");
    });
    document.getElementById(targetTab + "-tab").classList.add("active");
  }

  function toggleFAQ(item) {
    const isActive = item.classList.contains("active");

    faqItems.forEach((faq) => faq.classList.remove("active"));

    if (!isActive) {
      item.classList.add("active");
    }
  }

  function performSearch() {
    const searchTerm = helpSearch.value.toLowerCase().trim();

    if (!searchTerm) {
      showNotification("অনুসন্ধানের জন্য কিছু লিখুন", "error");
      return;
    }

    const allContent = document
      .querySelector(".main-content")
      .textContent.toLowerCase();

    if (allContent.includes(searchTerm)) {
      showNotification(`"${searchTerm}" খুঁজে পাওয়া গেছে`, "success");
      highlightSearchTerm(searchTerm);
    } else {
      showNotification(`"${searchTerm}" খুঁজে পাওয়া যায়নি`, "error");
    }
  }

  function highlightSearchTerm(term) {
    const helpContent = document.querySelector(".main-content");
    const walker = document.createTreeWalker(
      helpContent,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) {
      if (node.textContent.toLowerCase().includes(term)) {
        textNodes.push(node);
      }
    }

    textNodes.forEach((textNode) => {
      const parent = textNode.parentNode;
      const text = textNode.textContent;
      const regex = new RegExp(`(${term})`, "gi");
      const highlightedText = text.replace(regex, "<mark>$1</mark>");

      if (highlightedText !== text) {
        const span = document.createElement("span");
        span.innerHTML = highlightedText;
        parent.replaceChild(span, textNode);
      }
    });

    setTimeout(() => {
      document.querySelectorAll("mark").forEach((mark) => {
        mark.outerHTML = mark.innerHTML;
      });
    }, 3000);
  }

  function handleContactSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const subject = document.getElementById("contactSubject").value;
    const message = document.getElementById("contactMessage").value;

    if (!name || !email || !subject || !message) {
      showNotification("সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    const contactData = {
      name: name,
      email: email,
      subject: subject,
      message: message,
      timestamp: new Date().toISOString(),
    };

    const existingContacts = JSON.parse(
      localStorage.getItem("contactSubmissions") || "[]"
    );
    existingContacts.push(contactData);
    localStorage.setItem(
      "contactSubmissions",
      JSON.stringify(existingContacts)
    );

    showNotification(
      "আপনার বার্তা পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।",
      "success"
    );
    contactForm.reset();

    if (currentUser) {
      document.getElementById("contactEmail").value = currentUser;
    }
  }

  function handleChatClick() {
    showNotification("লাইভ চ্যাট শীঘ্রই চালু করা হবে", "success");
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
