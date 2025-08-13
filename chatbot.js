document.addEventListener("DOMContentLoaded", function() {
    const chatbotToggleBtn = document.getElementById("chatbot-toggle-btn");
    const chatbotModal = document.getElementById("chatbot-modal");
    const chatbotCloseBtn = document.getElementById("chatbot-close-btn");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotSendBtn = document.getElementById("chatbot-send-btn");

    // Toggle chatbot modal visibility
    chatbotToggleBtn.addEventListener("click", () => {
        chatbotModal.classList.toggle("show");
        if (chatbotModal.classList.contains("show")) {
            chatbotInput.focus();
            scrollToBottom();
        }
    });

    // Close chatbot modal
    chatbotCloseBtn.addEventListener("click", () => {
        chatbotModal.classList.remove("show");
    });

    // Send message on button click
    chatbotSendBtn.addEventListener("click", sendMessage);

    // Send message on Enter key press
    chatbotInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    function sendMessage() {
        const messageText = chatbotInput.value.trim();
        if (messageText === "") return;

        // Add user message to chat
        appendMessage(messageText, "user");
        chatbotInput.value = ""; // Clear input

        // Simulate bot response
        setTimeout(() => {
            appendMessage("Thank you for your message! We'll get back to you shortly.", "bot");
        }, 500);
    }

    function appendMessage(text, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("chatbot-message", sender);
        messageDiv.textContent = text;
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Optional: Add a welcome message when the chatbot is first opened
    // This could be triggered once or on every open, depending on preference.
    // For this example, let's add it when the modal is shown for the first time.
    let welcomeMessageShown = false;
    chatbotModal.addEventListener('transitionend', () => {
        if (chatbotModal.classList.contains('show') && !welcomeMessageShown) {
            appendMessage("Hi there! How can I help you today?", "bot");
            welcomeMessageShown = true;
        }
    }, { once: false }); // Set to true if you only want it once per page load
});
