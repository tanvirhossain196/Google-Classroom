document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");
  const userName = document.getElementById("userName");
  const helpLinks = document.querySelectorAll(".help-link");
  const helpSections = document.querySelectorAll(".help-section");
  const helpSearch = document.getElementById("helpSearch");
  const searchBtn = document.getElementById("searchBtn");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const faqItems = document.querySelectorAll(".faq-item");
  const contactForm = document.getElementById("contactForm");
  const chatBtn = document.querySelector(".chat-btn");

  // Load user data
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (userEmail) {
    userName.textContent = userEmail.split("@")[0];
  }

  // Check if user is logged in
  if (!userEmail) {
    window.location.href = "index.html";
  }

  // Logout functionality
  logoutBtn.addEventListener("click", function () {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      window.location.href = "index.html";
    }
  });

  // Help navigation
  helpLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);

      // Update active link
      helpLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      // Show target section
      helpSections.forEach((section) => {
        section.classList.remove("active");
      });
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Search functionality
  searchBtn.addEventListener("click", function () {
    performSearch();
  });

  helpSearch.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  function performSearch() {
    const searchTerm = helpSearch.value.toLowerCase().trim();

    if (!searchTerm) {
      showNotification("অনুসন্ধানের জন্য কিছু লিখুন", "error");
      return;
    }

    // Simple search implementation
    const allText = document
      .querySelector(".help-content")
      .textContent.toLowerCase();

    if (allText.includes(searchTerm)) {
      showNotification(`"${searchTerm}" খুঁজে পাওয়া গেছে`, "success");
      // In a real implementation, you would highlight the found text
    } else {
      showNotification(`"${searchTerm}" খুঁজে পাওয়া যায়নি`, "error");
    }
  }

  // Tab functionality
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Update active button
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Show target tab pane
      tabPanes.forEach((pane) => {
        pane.classList.remove("active");
      });
      document.getElementById(targetTab + "-tab").classList.add("active");
    });
  });

  // FAQ toggle functionality
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", function () {
      const isActive = item.classList.contains("active");

      // Close all FAQ items
      faqItems.forEach((faq) => faq.classList.remove("active"));

      // Toggle current item
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  // Contact form submission
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const subject = document.getElementById("contactSubject").value;
    const message = document.getElementById("contactMessage").value;

    // Basic validation
    if (!name || !email || !subject || !message) {
      showNotification("সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    // Simulate form submission
    showNotification(
      "আপনার বার্তা পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।",
      "success"
    );
    contactForm.reset();
  });

  // Chat button functionality
  chatBtn.addEventListener("click", function () {
    showNotification("লাইভ চ্যাট শীঘ্রই চালু করা হবে", "success");
  });

  // Show notification
  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === "success" ? "#27ae60" : "#e74c3c"};
        `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Auto-populate contact form with user data
  if (userEmail) {
    document.getElementById("contactEmail").value = userEmail;
  }

  // Initialize with getting started section
  document.getElementById("getting-started").classList.add("active");
});
