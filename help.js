document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const headerUserInitial = document.getElementById("headerUserInitial");
  const helpLinks = document.querySelectorAll(".help-link");
  const helpSections = document.querySelectorAll(".help-section");
  const helpSearch = document.getElementById("helpSearch");
  const searchBtn = document.getElementById("searchBtn");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const faqItems = document.querySelectorAll(".faq-item");
  const contactForm = document.getElementById("contactForm");
  const chatBtn = document.querySelector(".chat-btn");

  const currentUserEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!currentUserEmail) {
    window.location.href = "index.html";
    return;
  }

  initializePage();

  menuToggle.addEventListener("click", toggleSidebar);
  logoutBtn.addEventListener("click", handleLogout);
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

    if (currentUserEmail) {
      document.getElementById("contactEmail").value = currentUserEmail;
    }

    document.getElementById("getting-started").classList.add("active");

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

    if (currentUserEmail) {
      document.getElementById("contactEmail").value = currentUserEmail;
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
