// Enhanced Professional Chatbot JavaScript with 10 Emoji Categories (200 Total Emojis)
document.addEventListener("DOMContentLoaded", function () {
  // Core chatbot elements
  const chatbotToggleBtn = document.getElementById("chatbot-toggle-btn");
  const chatbotModal = document.getElementById("chatbot-modal");
  const chatbotCloseBtn = document.getElementById("chatbot-close-btn");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSendBtn = document.getElementById("chatbot-send-btn");

  // Plus dropdown elements
  const chatbotPlusBtn = document.getElementById("chatbot-plus-btn");
  const chatbotPlusDropdown = document.getElementById("chatbot-plus-dropdown");

  // Emoji picker elements
  const chatbotEmojiBtn = document.getElementById("chatbot-emoji-btn");
  const chatbotEmojiPicker = document.getElementById("chatbot-emoji-picker");
  const emojiCategoryTabs = document.getElementById("emoji-category-tabs");
  const emojiGrid = document.getElementById("emoji-grid");

  // State management
  let isWelcomeShown = false;
  let currentEmojiCategory = 0;

  // Reduced emoji database - 10 categories with 20 emojis each (200 total)
  const emojiDatabase = {
    "😀": [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
    ],
    "😢": [
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
    ],
    "❤️": [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "♥️",
    ],
    "👋": [
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👌",
      "🤏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "👇",
      "☝️",
      "👍",
      "👎",
      "👏",
    ],
    "🍎": [
      "🍎",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🫐",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
    ],
    "⚽": [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "🪃",
      "🥅",
      "⛳",
    ],
    "🚗": [
      "🚗",
      "🚕",
      "🚙",
      "🚌",
      "🚎",
      "🏎️",
      "🚓",
      "🚑",
      "🚒",
      "🚐",
      "🛻",
      "🚚",
      "🚛",
      "🚜",
      "🏍️",
      "🛵",
      "🚲",
      "🛴",
      "🛺",
      "🚨",
    ],
    "🏠": [
      "🏠",
      "🏡",
      "🏘️",
      "🏚️",
      "🏗️",
      "🏭",
      "🏢",
      "🏬",
      "🏣",
      "🏤",
      "🏥",
      "🏦",
      "🏨",
      "🏪",
      "🏫",
      "🏩",
      "💒",
      "🏛️",
      "⛪",
      "🕌",
    ],
    "🌟": [
      "🌟",
      "⭐",
      "💫",
      "✨",
      "☄️",
      "🌠",
      "🌌",
      "🌃",
      "🌆",
      "🌇",
      "🌉",
      "♨️",
      "🎆",
      "🎇",
      "🌁",
      "🌋",
      "🏔️",
      "⛰️",
      "🗻",
      "🏕️",
    ],
    "🎵": [
      "🎵",
      "🎶",
      "🎼",
      "🎹",
      "🥁",
      "🎷",
      "🎺",
      "🎸",
      "🎻",
      "🎤",
      "🎧",
      "📻",
      "🎙️",
      "🎚️",
      "🎛️",
      "🎪",
      "🎭",
      "🎨",
      "🎬",
      "📽️",
    ],
  };

  // Emoji category names (displayed as emojis in tabs)
  const emojiCategories = Object.keys(emojiDatabase);

  // Enhanced predefined response templates for dropdown actions
  const predefinedResponses = {
    "customer-support":
      "🎯 **Customer Support** 🎯\n\nHello! I'm here to provide comprehensive support for all your needs. Our team is available 24/7 to assist you with:\n\n• Account management and billing\n• Technical troubleshooting\n• Feature guidance and tutorials\n• General inquiries\n\nHow may I help you today?",
    "main-menu":
      "📋 **Main Menu** 📋\n\nWelcome to our comprehensive platform! Here are the available options:\n\n🎓 **Course Management**\n• Create and organize courses\n• Student enrollment\n• Assignment distribution\n\n👥 **Student Support**\n• Progress tracking\n• Grade management\n• Communication tools\n\n🔧 **Technical Help**\n• Platform navigation\n• Troubleshooting\n• System requirements\n\n📚 **Resources**\n• Documentation\n• Video tutorials\n• Best practices\n\nWhat would you like to explore?",
    "classroom-help":
      "🏫 **Classroom Management** 🏫\n\nI can assist you with all classroom management features:\n\n📚 **Course Creation & Setup**\n• Course structure and organization\n• Curriculum planning\n• Resource management\n\n👨‍🎓 **Student Management**\n• Enrollment and invitations\n• Group assignments\n• Progress monitoring\n\n📝 **Assignment & Assessment**\n• Creating assignments\n• Grading and feedback\n• Performance analytics\n\n💬 **Communication Tools**\n• Announcements\n• Discussion forums\n• Direct messaging\n\nWhich area would you like help with?",
    "technical-support":
      "⚙️ **Technical Support** ⚙️\n\nOur technical team is ready to help you with:\n\n🔧 **Common Issues**\n• Login and authentication problems\n• Browser compatibility\n• Performance optimization\n• Mobile app support\n\n💻 **Platform Navigation**\n• Interface guidance\n• Feature tutorials\n• Keyboard shortcuts\n• Accessibility options\n\n📱 **Device Support**\n• Desktop requirements\n• Mobile compatibility\n• Tablet optimization\n• Cross-platform sync\n\n🛡️ **Security & Privacy**\n• Account security\n• Data protection\n• Privacy settings\n\nPlease describe your technical issue in detail.",
    "course-management":
      "📊 **Course Management Hub** 📊\n\nComprehensive course management tools at your fingertips:\n\n🎯 **Course Creation**\n• Template selection\n• Content organization\n• Scheduling and planning\n• Resource integration\n\n📈 **Analytics & Insights**\n• Student engagement metrics\n• Performance dashboards\n• Progress tracking\n• Custom reports\n\n🔄 **Course Operations**\n• Bulk actions\n• Archive/restore courses\n• Data export/import\n• Backup management\n\n👥 **Collaboration Features**\n• Co-teaching support\n• Guest access\n• Parent communication\n• Administrative oversight\n\nWhich course management feature interests you?",
  };

  // Initialize chatbot functionality
  function initializeChatbot() {
    setupEventListeners();
    generateEmojiPicker();
    console.log(
      "✅ Enhanced Professional Chatbot initialized with 10 emoji categories (200 total emojis)"
    );
  }

  // Set up all event listeners with enhanced functionality
  function setupEventListeners() {
    // Toggle chatbot modal
    chatbotToggleBtn.addEventListener("click", toggleChatbot);
    chatbotCloseBtn.addEventListener("click", closeChatbot);

    // Send message functionality with Enter key support
    chatbotSendBtn.addEventListener("click", sendMessage);
    chatbotInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Plus dropdown functionality
    chatbotPlusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlusDropdown();
    });

    // Enhanced dropdown item clicks with smooth animations
    document.querySelectorAll(".chatbot-dropdown-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = item.getAttribute("data-action");
        handleDropdownAction(action);
        closePlusDropdown();
      });
    });

    // Emoji picker functionality
    chatbotEmojiBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleEmojiPicker();
    });

    // Close dropdowns when clicking outside with improved detection
    document.addEventListener("click", (e) => {
      if (
        !chatbotPlusDropdown.contains(e.target) &&
        !chatbotPlusBtn.contains(e.target)
      ) {
        closePlusDropdown();
      }
      if (
        !chatbotEmojiPicker.contains(e.target) &&
        !chatbotEmojiBtn.contains(e.target)
      ) {
        closeEmojiPicker();
      }
    });

    // Prevent modal close when clicking inside
    chatbotModal.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Enhanced accessibility - ESC key support
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (chatbotModal.classList.contains("show")) {
          closeChatbot();
        } else {
          closePlusDropdown();
          closeEmojiPicker();
        }
      }
    });
  }

  // Enhanced toggle chatbot with smooth animations
  function toggleChatbot() {
    const isShowing = chatbotModal.classList.contains("show");

    if (isShowing) {
      closeChatbot();
    } else {
      chatbotModal.style.display = "flex";
      setTimeout(() => {
        chatbotModal.classList.add("show");
        chatbotInput.focus();
        scrollToBottom();
        if (!isWelcomeShown) {
          showWelcomeMessage();
          isWelcomeShown = true;
        }
      }, 10);
    }
  }

  // Enhanced close chatbot
  function closeChatbot() {
    chatbotModal.classList.remove("show");
    setTimeout(() => {
      if (!chatbotModal.classList.contains("show")) {
        chatbotModal.style.display = "none";
      }
    }, 400);
    closePlusDropdown();
    closeEmojiPicker();
  }

  // Enhanced welcome message with professional greeting
  function showWelcomeMessage() {
    setTimeout(() => {
      const welcomeMsg = `👋 **Welcome to Live Chat!**\n\nI'm your dedicated classroom assistant, here to help you with:\n\n🎓 Course management\n👥 Student support\n⚙️ Technical assistance\n📚 Platform guidance\n\nHow can I assist you today?`;
      appendMessage(welcomeMsg, "bot", "welcome-message");
    }, 800);
  }

  // Enhanced send message functionality
  function sendMessage() {
    const messageText = chatbotInput.value.trim();
    if (messageText === "") return;

    // Add user message to chat
    appendMessage(messageText, "user");
    chatbotInput.value = ""; // Clear input

    // Show typing indicator
    showTypingIndicator();

    // Enhanced bot response with contextual intelligence
    setTimeout(() => {
      hideTypingIndicator();
      const response = generateEnhancedBotResponse(messageText);
      appendMessage(response, "bot");
    }, Math.random() * 1000 + 1000); // Random delay for more natural feel
  }

  // Enhanced bot response generation with better intelligence
  function generateEnhancedBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    const timeOfDay = new Date().getHours();
    const greeting =
      timeOfDay < 12
        ? "Good morning"
        : timeOfDay < 18
        ? "Good afternoon"
        : "Good evening";

    // Enhanced keyword-based responses with contextual awareness
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey") ||
      message.includes("good morning") ||
      message.includes("good afternoon") ||
      message.includes("good evening")
    ) {
      return `${greeting}! 😊 Welcome to our premium classroom platform. I'm here to provide you with expert assistance. How may I help you today?`;
    } else if (
      message.includes("course") ||
      message.includes("class") ||
      message.includes("subject")
    ) {
      return `📚 **Course Management Support**\n\nI can help you with comprehensive course management:\n\n• **Creating courses** - Set up new classes with custom settings\n• **Managing content** - Organize lessons, materials, and resources\n• **Student enrollment** - Add/remove students and manage permissions\n• **Course settings** - Customize appearance, grading, and policies\n\nWhat specific aspect of course management would you like assistance with?`;
    } else if (
      message.includes("student") ||
      message.includes("enrollment") ||
      message.includes("grade") ||
      message.includes("assignment")
    ) {
      return `👥 **Student Management Hub**\n\nFor comprehensive student management, I can assist with:\n\n• **Enrollment Management** - Add, remove, or transfer students\n• **Grade Tracking** - View progress, set up gradebooks, export data\n• **Assignment Distribution** - Create, distribute, and collect assignments\n• **Communication** - Send announcements, messages, and notifications\n• **Progress Monitoring** - Track engagement and performance metrics\n\nWhich student management feature do you need help with?`;
    } else if (
      message.includes("help") ||
      message.includes("support") ||
      message.includes("assist") ||
      message.includes("problem")
    ) {
      return `🆘 **Comprehensive Support Available**\n\nI'm here to provide expert assistance with:\n\n🎓 **Academic Features**\n• Course creation and management\n• Assignment and grading tools\n• Student engagement features\n\n⚙️ **Technical Support**\n• Platform navigation\n• Troubleshooting issues\n• Integration assistance\n\n📚 **Resources & Training**\n• Best practices guides\n• Video tutorials\n• Feature documentation\n\nPlease describe your specific need, and I'll provide detailed guidance!`;
    } else if (
      message.includes("technical") ||
      message.includes("bug") ||
      message.includes("error") ||
      message.includes("not working") ||
      message.includes("issue")
    ) {
      return `🔧 **Technical Support Team**\n\nI understand you're experiencing technical difficulties. Let me help resolve this:\n\n**Common Solutions:**\n• Clear your browser cache and cookies\n• Try using an incognito/private browsing window\n• Ensure your browser is up to date\n• Check your internet connection\n\n**For Advanced Issues:**\n• Browser: Chrome, Firefox, Safari (latest versions)\n• Disable browser extensions temporarily\n• Try accessing from a different device\n\nPlease describe the specific error or issue you're encountering for personalized assistance.`;
    } else if (
      message.includes("thanks") ||
      message.includes("thank you") ||
      message.includes("appreciate")
    ) {
      return `🙏 You're very welcome! I'm delighted I could assist you. \n\nIs there anything else I can help you with today? I'm here to ensure you have the best possible experience with our platform. 😊`;
    } else if (
      message.includes("bye") ||
      message.includes("goodbye") ||
      message.includes("see you") ||
      message.includes("farewell")
    ) {
      return `👋 Thank you for using our live chat support! \n\nFeel free to return anytime you need assistance. Our team is available 24/7 to help you succeed. Have a wonderful day! 🌟`;
    } else if (
      message.includes("price") ||
      message.includes("cost") ||
      message.includes("subscription") ||
      message.includes("plan")
    ) {
      return `💰 **Pricing & Plans Information**\n\nI'd be happy to help you with pricing details:\n\n• **Free Plan** - Basic features for individual educators\n• **Professional Plan** - Advanced tools for institutions\n• **Enterprise Plan** - Custom solutions for large organizations\n\nFor detailed pricing and to find the perfect plan for your needs, I recommend scheduling a consultation with our sales team. Would you like me to connect you with a specialist?`;
    } else if (
      message.includes("feature") ||
      message.includes("capability") ||
      message.includes("what can") ||
      message.includes("functions")
    ) {
      return `✨ **Platform Features Overview**\n\nOur comprehensive platform offers:\n\n🎓 **Core Features**\n• Interactive course creation\n• Real-time collaboration tools\n• Advanced analytics dashboard\n• Integrated communication system\n\n📊 **Advanced Capabilities**\n• Automated grading and feedback\n• Custom branding options\n• Third-party integrations\n• Mobile app support\n• Cloud storage and backup\n\nWould you like detailed information about any specific feature?`;
    } else {
      return `🤔 **I understand you're asking about:** "${userMessage}"\n\nThank you for your inquiry! While I process your specific request, here are some quick actions you can take:\n\n• Use the **➕ menu** above for quick access to common topics\n• Try rephrasing your question for more specific help\n• Contact our specialist team for complex technical issues\n\nOur support team will ensure you get the exact assistance you need. Is there a particular area I can help clarify for you?`;
    }
  }

  // Enhanced typing indicator with smooth animations
  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.id = "typing-indicator";

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "typing-dot";
      typingDiv.appendChild(dot);
    }

    chatbotMessages.appendChild(typingDiv);
    scrollToBottom();
  }

  // Hide typing indicator
  function hideTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Enhanced message appending with markdown-like formatting
  function appendMessage(text, sender, additionalClass = "") {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chatbot-message", sender);
    if (additionalClass) {
      messageDiv.classList.add(additionalClass);
    }

    // Enhanced text formatting
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic text
      .replace(/\n/g, "<br>"); // Line breaks

    messageDiv.innerHTML = formattedText;
    chatbotMessages.appendChild(messageDiv);
    scrollToBottom();
  }

  // Enhanced scroll with smooth behavior
  function scrollToBottom() {
    chatbotMessages.scrollTo({
      top: chatbotMessages.scrollHeight,
      behavior: "smooth",
    });
  }

  // Enhanced plus dropdown functionality
  function togglePlusDropdown() {
    const isShowing = chatbotPlusDropdown.classList.contains("show");

    if (isShowing) {
      closePlusDropdown();
    } else {
      chatbotPlusDropdown.classList.add("show");
      closeEmojiPicker(); // Close emoji picker if open
    }
  }

  function closePlusDropdown() {
    chatbotPlusDropdown.classList.remove("show");
  }

  // Enhanced dropdown action handling
  function handleDropdownAction(action) {
    if (predefinedResponses[action]) {
      // Add system message to indicate action was selected
      const actionName = action
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      appendMessage(`🎯 **Selected:** ${actionName}`, "system");

      // Show enhanced typing indicator
      showTypingIndicator();

      // Add predefined response with realistic delay
      setTimeout(() => {
        hideTypingIndicator();
        appendMessage(predefinedResponses[action], "bot");
      }, 1200 + Math.random() * 800);
    }
  }

  // Enhanced emoji picker functionality with smooth animations
  function toggleEmojiPicker() {
    const isShowing = chatbotEmojiPicker.classList.contains("show");

    if (isShowing) {
      closeEmojiPicker();
    } else {
      chatbotEmojiPicker.classList.add("show");
      closePlusDropdown(); // Close plus dropdown if open
    }
  }

  function closeEmojiPicker() {
    chatbotEmojiPicker.classList.remove("show");
  }

  // Enhanced emoji picker generation with 10 categories
  function generateEmojiPicker() {
    console.log(
      `🎨 Generating emoji picker with ${emojiCategories.length} categories`
    );

    // Generate category tabs with enhanced styling
    emojiCategories.forEach((category, index) => {
      const tab = document.createElement("button");
      tab.className = "emoji-category-tab btn btn-sm";
      tab.textContent = category;
      tab.setAttribute(
        "title",
        `Category ${index + 1}: ${getCategoryName(index)}`
      );
      tab.onclick = () => switchEmojiCategory(index);
      if (index === 0) tab.classList.add("active");
      emojiCategoryTabs.appendChild(tab);
    });

    // Generate initial emoji grid
    switchEmojiCategory(0);

    console.log(
      `✅ Emoji picker generated successfully with ${Object.values(
        emojiDatabase
      ).reduce((sum, arr) => sum + arr.length, 0)} total emojis`
    );
  }

  // Get category name for tooltip
  function getCategoryName(index) {
    const names = [
      "Happy Faces",
      "Sad Faces",
      "Hearts",
      "Hands",
      "Food",
      "Sports",
      "Vehicles",
      "Buildings",
      "Nature",
      "Music",
    ];
    return names[index] || `Category ${index + 1}`;
  }

  // Enhanced emoji category switching with smooth transitions
  function switchEmojiCategory(categoryIndex) {
    currentEmojiCategory = categoryIndex;

    // Update active tab with smooth transition
    document.querySelectorAll(".emoji-category-tab").forEach((tab, index) => {
      tab.classList.toggle("active", index === categoryIndex);
    });

    // Generate emoji grid for selected category with fade effect
    const categoryEmojis = emojiDatabase[emojiCategories[categoryIndex]];
    emojiGrid.style.opacity = "0.5";

    setTimeout(() => {
      emojiGrid.innerHTML = "";

      categoryEmojis.forEach((emoji, index) => {
        const emojiButton = document.createElement("button");
        emojiButton.className = "emoji-item";
        emojiButton.textContent = emoji;
        emojiButton.setAttribute("title", `Insert ${emoji}`);
        emojiButton.onclick = () => insertEmoji(emoji);

        // Staggered animation for emoji appearance
        emojiButton.style.opacity = "0";
        emojiButton.style.transform = "scale(0.8)";
        emojiGrid.appendChild(emojiButton);

        setTimeout(() => {
          emojiButton.style.opacity = "1";
          emojiButton.style.transform = "scale(1)";
          emojiButton.style.transition = "all 0.2s ease";
        }, index * 10);
      });

      emojiGrid.style.opacity = "1";
    }, 150);
  }

  // Enhanced emoji insertion with smooth feedback
  function insertEmoji(emoji) {
    const currentValue = chatbotInput.value;
    const cursorPosition = chatbotInput.selectionStart || 0;
    const newValue =
      currentValue.slice(0, cursorPosition) +
      emoji +
      currentValue.slice(cursorPosition);

    chatbotInput.value = newValue;
    chatbotInput.focus();

    // Set cursor position after emoji
    const newCursorPosition = cursorPosition + emoji.length;
    chatbotInput.setSelectionRange(newCursorPosition, newCursorPosition);

    // Visual feedback for emoji insertion
    chatbotInput.style.backgroundColor = "rgba(102, 126, 234, 0.1)";
    setTimeout(() => {
      chatbotInput.style.backgroundColor = "";
    }, 200);

    closeEmojiPicker();
  }

  // Enhanced utility functions
  function getEmojiStats() {
    const totalCategories = emojiCategories.length;
    const totalEmojis = Object.values(emojiDatabase).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    const avgEmojisPerCategory = Math.round(totalEmojis / totalCategories);

    return {
      categories: totalCategories,
      totalEmojis: totalEmojis,
      averagePerCategory: avgEmojisPerCategory,
    };
  }

  // Performance monitoring
  function logPerformanceMetrics() {
    const stats = getEmojiStats();
    console.log("📊 Chatbot Performance Metrics:");
    console.log(`   Categories: ${stats.categories}`);
    console.log(`   Total Emojis: ${stats.totalEmojis}`);
    console.log(`   Average per Category: ${stats.averagePerCategory}`);
    console.log(
      `   Memory Usage: ~${(
        JSON.stringify(emojiDatabase).length / 1024
      ).toFixed(2)}KB`
    );
  }

  // Initialize chatbot when DOM is loaded
  initializeChatbot();

  // Log performance metrics in development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    logPerformanceMetrics();
  }

  // Enhanced public API for external access
  window.chatbot = {
    // Core functions
    toggle: toggleChatbot,
    close: closeChatbot,
    sendMessage: (message) => {
      if (typeof message === "string" && message.trim()) {
        chatbotInput.value = message;
        sendMessage();
      }
    },
    addMessage: appendMessage,

    // Utility functions
    getStats: getEmojiStats,
    clearChat: () => {
      chatbotMessages.innerHTML = "";
      isWelcomeShown = false;
    },

    // Emoji functions
    insertEmoji: insertEmoji,
    switchEmojiCategory: switchEmojiCategory,

    // State management
    isOpen: () => chatbotModal.classList.contains("show"),
    getCurrentCategory: () => currentEmojiCategory,

    // Development utilities
    logMetrics: logPerformanceMetrics,
    emojiDatabase: emojiDatabase, // Read-only access for debugging

    // Version info
    version: "2.0.0-lite",
    features: [
      "10 emoji categories",
      "200 total emojis",
      "Bootstrap integration",
      "Premium animations",
      "Enhanced accessibility",
      "Responsive design",
      "Optimized performance",
    ],
  };

  // Add version info to console
  console.log(
    `🚀 Enhanced Professional Chatbot v${window.chatbot.version} loaded successfully!`
  );
  console.log(`✨ Features: ${window.chatbot.features.join(", ")}`);
  console.log(
    `📊 Emoji Stats: ${getEmojiStats().totalEmojis} emojis in ${
      getEmojiStats().categories
    } categories`
  );
});
