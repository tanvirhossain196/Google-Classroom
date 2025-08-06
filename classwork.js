// Global variables
let attachments = [];
let selectedStudents = [];
let assignToAll = true;

// Format text in instructions editor
function formatText(command) {
  document.execCommand(command, false, null);
  document.getElementById("instructionsEditor").focus();
}

// File upload handler
function handleFileUpload(event) {
  const files = event.target.files;
  for (let file of files) {
    attachments.push({
      type: "file",
      name: file.name,
      size: file.size,
      file: file,
    });
  }
  updateAttachments();
}

// Open file upload dialog
function openFileUpload() {
  document.getElementById("fileInput").click();
}

// Open link attachment modal
function openLinkAttach() {
  const linkModal = new bootstrap.Modal(document.getElementById("linkModal"));
  linkModal.show();
}

// Open YouTube attachment modal
function openYouTubeAttach() {
  const youtubeModal = new bootstrap.Modal(
    document.getElementById("youtubeModal")
  );
  youtubeModal.show();
}

// Open Drive attachment (simulated)
function openDriveAttach() {
  // Create a toast notification instead of alert
  showToast(
    "Google Drive integration would open here in a real implementation",
    "info"
  );
}

// Open create new document (simulated)
function openCreateNew() {
  const options = [
    "Google Docs",
    "Google Slides",
    "Google Sheets",
    "Google Forms",
  ];
  const choice = prompt(
    "What would you like to create?\n" + options.join("\n")
  );
  if (choice) {
    showToast(`Creating new ${choice} document...`, "success");
  }
}

// Add link attachment
function addLink() {
  const url = document.getElementById("linkUrl").value;
  const title = document.getElementById("linkTitle").value || url;
  if (url) {
    attachments.push({
      type: "link",
      url: url,
      title: title,
    });
    updateAttachments();
    const linkModal = bootstrap.Modal.getInstance(
      document.getElementById("linkModal")
    );
    linkModal.hide();
    document.getElementById("linkUrl").value = "";
    document.getElementById("linkTitle").value = "";
    showToast("Link attached successfully", "success");
  }
}

// Add YouTube video
function addYouTube() {
  const url = document.getElementById("youtubeUrl").value;
  if ((url && url.includes("youtube.com")) || url.includes("youtu.be")) {
    attachments.push({
      type: "youtube",
      url: url,
      title: "YouTube Video",
    });
    updateAttachments();
    const youtubeModal = bootstrap.Modal.getInstance(
      document.getElementById("youtubeModal")
    );
    youtubeModal.hide();
    document.getElementById("youtubeUrl").value = "";
    showToast("YouTube video attached successfully", "success");
  } else {
    showToast("Please enter a valid YouTube URL", "error");
  }
}

// Open student selection modal
function openStudentSelection() {
  const studentModal = new bootstrap.Modal(
    document.getElementById("studentModal")
  );
  studentModal.show();
}

// Update assignment type (all vs specific students)
function updateAssignType() {
  const isSpecific =
    document.querySelector('input[name="assignType"]:checked').value ===
    "specific";
  const studentList = document.getElementById("studentList");
  if (isSpecific) {
    studentList.classList.remove("d-none");
  } else {
    studentList.classList.add("d-none");
  }
}

// Update student assignment
function updateStudentAssignment() {
  const assignType = document.querySelector(
    'input[name="assignType"]:checked'
  ).value;
  if (assignType === "all") {
    assignToAll = true;
    document.getElementById("assignToText").textContent = "All students";
  } else {
    const checkboxes = document.querySelectorAll(
      '#studentList input[type="checkbox"]:checked'
    );
    selectedStudents = Array.from(checkboxes).map((cb) =>
      cb.nextSibling.textContent.trim()
    );
    if (selectedStudents.length > 0) {
      assignToAll = false;
      const text =
        selectedStudents.length === 1
          ? selectedStudents[0]
          : `${selectedStudents.length} students`;
      document.getElementById("assignToText").textContent = text;
    } else {
      showToast("Please select at least one student", "error");
      return;
    }
  }
  const studentModal = bootstrap.Modal.getInstance(
    document.getElementById("studentModal")
  );
  studentModal.hide();
}

// Update attachments display
function updateAttachments() {
  console.log("Attachments updated:", attachments);
}

// Create rubric
function createRubric() {
  showToast(
    "Rubric creation interface would open here in a real implementation",
    "info"
  );
}

// Toggle assign menu
function toggleAssignMenu() {
  showToast(
    "Assign menu options:\n• Save as draft\n• Schedule for later\n• Assign immediately",
    "info"
  );
}

// Go back to classroom
function goBack() {
  if (
    confirm("Are you sure you want to leave? Any unsaved changes will be lost.")
  ) {
    window.history.back();
  }
}

// Get current user and course info
function getCurrentUserAndCourse() {
  const currentUser = localStorage.getItem("currentUser");
  const selectedCourse = localStorage.getItem("selectedCourse");

  if (!currentUser || !selectedCourse) {
    showToast("User or course information not found", "error");
    return null;
  }

  try {
    const course = JSON.parse(selectedCourse);
    return { currentUser, course };
  } catch (error) {
    showToast("Invalid course data", "error");
    return null;
  }
}

// Save assignment to localStorage
function saveAssignmentToStorage(assignment) {
  const userAndCourse = getCurrentUserAndCourse();
  if (!userAndCourse) return false;

  const { course } = userAndCourse;
  const assignmentsKey = `assignments_${course.id}`;

  // Get existing assignments
  const existingAssignments = JSON.parse(
    localStorage.getItem(assignmentsKey) || "[]"
  );

  // Add new assignment
  existingAssignments.unshift(assignment);

  // Save back to localStorage
  localStorage.setItem(assignmentsKey, JSON.stringify(existingAssignments));

  return true;
}

// Create assignment
function createAssignment() {
  const title = document.getElementById("assignmentTitle").value.trim();
  const instructions = document.getElementById("instructionsEditor").innerHTML;
  const course = document.getElementById("courseSelect").value;
  const points = document.getElementById("pointsSelect").value;
  const dueDate = document.getElementById("dueDate").value;
  const topic = document.getElementById("topicSelect").value;

  // Validate required fields
  const titleError = document.getElementById("titleError");
  if (!title) {
    titleError.classList.remove("d-none");
    document.getElementById("assignmentTitle").focus();
    document
      .getElementById("assignmentTitle")
      .scrollIntoView({ behavior: "smooth" });
    return;
  } else {
    titleError.classList.add("d-none");
  }

  // Get current user and course info
  const userAndCourse = getCurrentUserAndCourse();
  if (!userAndCourse) return;

  const { currentUser, course: selectedCourse } = userAndCourse;

  // Create assignment object
  const assignment = {
    id: Date.now(), // Unique ID based on timestamp
    title: title,
    instructions: instructions,
    course: course,
    points: points,
    dueDate: dueDate,
    topic: topic,
    assignToAll: assignToAll,
    selectedStudents: selectedStudents,
    attachments: attachments,
    createdAt: new Date().toISOString(),
    author: currentUser,
    courseId: selectedCourse.id,
    courseName: selectedCourse.name,
    status: "assigned",
    submissions: [], // For tracking student submissions
  };

  // Save assignment (in localStorage for this implementation)
  const saved = saveAssignmentToStorage(assignment);

  if (saved) {
    console.log("Creating assignment:", assignment);

    // Show success message
    showToast(
      `Assignment "${title}" has been created successfully!`,
      "success"
    );

    // Clear form
    clearForm();

    // Navigate back to stream after a short delay
    setTimeout(() => {
      window.location.href = "stream.html";
    }, 1500);
  } else {
    showToast("Failed to save assignment. Please try again.", "error");
  }
}

// Clear form after successful submission
function clearForm() {
  document.getElementById("assignmentTitle").value = "";
  document.getElementById("instructionsEditor").innerHTML = "";
  document.getElementById("pointsSelect").value = "100";
  document.getElementById("topicSelect").value = "No topic";

  // Reset due date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("dueDate").value = tomorrow
    .toISOString()
    .split("T")[0];

  // Reset student assignment
  assignToAll = true;
  selectedStudents = [];
  document.getElementById("assignToText").textContent = "All students";
  document.getElementById("allStudents").checked = true;
  document.getElementById("specificStudents").checked = false;
  document.getElementById("studentList").classList.add("d-none");

  // Clear attachments
  attachments = [];
  updateAttachments();

  // Hide title error if visible
  const titleError = document.getElementById("titleError");
  titleError.classList.add("d-none");
}

// Toast notification function
function showToast(message, type = "info") {
  // Create toast element
  const toastContainer =
    document.querySelector(".toast-container") || createToastContainer();

  const toastId = "toast-" + Date.now();
  const iconMap = {
    success: "bi-check-circle-fill text-success",
    error: "bi-exclamation-triangle-fill text-danger",
    info: "bi-info-circle-fill text-primary",
  };

  const toastHtml = `
        <div id="${toastId}" class="toast align-items-center border-0 shadow-lg" role="alert" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center">
                    <i class="bi ${iconMap[type] || iconMap.info} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

  toastContainer.insertAdjacentHTML("beforeend", toastHtml);
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
  toast.show();

  // Remove toast element after it's hidden
  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}

// Create toast container if it doesn't exist
function createToastContainer() {
  const container = document.createElement("div");
  container.className = "toast-container position-fixed bottom-0 end-0 p-3";
  container.style.zIndex = "1050";
  document.body.appendChild(container);
  return container;
}

// Load course information on page load
function loadCourseInfo() {
  const selectedCourse = localStorage.getItem("selectedCourse");
  if (selectedCourse) {
    try {
      const course = JSON.parse(selectedCourse);

      // Update course selector if needed
      const courseSelect = document.getElementById("courseSelect");
      if (courseSelect) {
        // Check if the course is already in the list
        let courseExists = false;
        for (let option of courseSelect.options) {
          if (option.textContent.includes(course.name)) {
            option.selected = true;
            courseExists = true;
            break;
          }
        }

        // If course doesn't exist in the list, add it and select it
        if (!courseExists) {
          const newOption = document.createElement("option");
          newOption.value = course.name;
          newOption.textContent = `${course.name} - ${
            course.section || "Section 1"
          }`;
          newOption.selected = true;
          courseSelect.insertBefore(newOption, courseSelect.firstChild);
        }
      }
    } catch (error) {
      console.error("Error loading course info:", error);
    }
  }
}

// Initialize tooltips and set default due date
window.addEventListener("DOMContentLoaded", function () {
  // Initialize Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Set default due date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("dueDate").value = tomorrow
    .toISOString()
    .split("T")[0];

  // Add smooth scrolling for focus events
  document
    .getElementById("assignmentTitle")
    .addEventListener("focus", function () {
      this.scrollIntoView({ behavior: "smooth", block: "center" });
    });

  // Load course information
  loadCourseInfo();

  // Auto-save functionality
  setupAutoSave();
});

// Auto-save functionality
function setupAutoSave() {
  const titleInput = document.getElementById("assignmentTitle");
  const instructionsEditor = document.getElementById("instructionsEditor");

  // Save draft every 30 seconds
  setInterval(() => {
    saveDraft();
  }, 30000);

  // Save draft on input change (debounced)
  let saveTimeout;

  function debouncedSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveDraft, 2000);
  }

  if (titleInput) {
    titleInput.addEventListener("input", debouncedSave);
  }

  if (instructionsEditor) {
    instructionsEditor.addEventListener("input", debouncedSave);
  }

  // Load draft on page load
  loadDraft();
}

// Save assignment draft
function saveDraft() {
  const title = document.getElementById("assignmentTitle").value.trim();
  const instructions = document.getElementById("instructionsEditor").innerHTML;

  if (title || instructions.trim()) {
    const draft = {
      title: title,
      instructions: instructions,
      points: document.getElementById("pointsSelect").value,
      dueDate: document.getElementById("dueDate").value,
      topic: document.getElementById("topicSelect").value,
      assignToAll: assignToAll,
      selectedStudents: selectedStudents,
      attachments: attachments,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("assignment_draft", JSON.stringify(draft));
  }
}

// Load assignment draft
function loadDraft() {
  const draft = localStorage.getItem("assignment_draft");
  if (draft) {
    try {
      const draftData = JSON.parse(draft);

      // Only load if the draft is less than 24 hours old
      const savedAt = new Date(draftData.savedAt);
      const now = new Date();
      const hoursDiff = (now - savedAt) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        document.getElementById("assignmentTitle").value =
          draftData.title || "";
        document.getElementById("instructionsEditor").innerHTML =
          draftData.instructions || "";
        document.getElementById("pointsSelect").value =
          draftData.points || "100";
        document.getElementById("topicSelect").value =
          draftData.topic || "No topic";

        if (draftData.dueDate) {
          document.getElementById("dueDate").value = draftData.dueDate;
        }

        assignToAll =
          draftData.assignToAll !== undefined ? draftData.assignToAll : true;
        selectedStudents = draftData.selectedStudents || [];
        attachments = draftData.attachments || [];

        // Update UI
        updateStudentAssignmentUI();
        updateAttachments();

        // Show notification about loaded draft
        setTimeout(() => {
          showToast("Draft loaded from previous session", "info");
        }, 1000);
      } else {
        // Remove old draft
        localStorage.removeItem("assignment_draft");
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      localStorage.removeItem("assignment_draft");
    }
  }
}

// Update student assignment UI
function updateStudentAssignmentUI() {
  if (assignToAll) {
    document.getElementById("assignToText").textContent = "All students";
    document.getElementById("allStudents").checked = true;
    document.getElementById("specificStudents").checked = false;
    document.getElementById("studentList").classList.add("d-none");
  } else {
    const text =
      selectedStudents.length === 1
        ? selectedStudents[0]
        : `${selectedStudents.length} students`;
    document.getElementById("assignToText").textContent = text;
    document.getElementById("allStudents").checked = false;
    document.getElementById("specificStudents").checked = true;
    document.getElementById("studentList").classList.remove("d-none");

    // Update checkboxes
    const checkboxes = document.querySelectorAll(
      '#studentList input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => {
      const studentName = checkbox.nextSibling.textContent.trim();
      checkbox.checked = selectedStudents.includes(studentName);
    });
  }
}

// Clear draft when assignment is successfully created
function clearDraft() {
  localStorage.removeItem("assignment_draft");
}

// Enhanced modal backdrop click handling
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("modal")) {
    const modal = bootstrap.Modal.getInstance(event.target);
    if (modal) {
      modal.hide();
    }
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", function (event) {
  // Ctrl/Cmd + S to save draft
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();
    saveDraft();
    showToast("Draft saved", "success");
  }

  // Ctrl/Cmd + Enter to create assignment
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    createAssignment();
  }
});

// Before page unload, save draft
window.addEventListener("beforeunload", function () {
  saveDraft();
});

// Enhanced form validation
function validateForm() {
  const title = document.getElementById("assignmentTitle").value.trim();
  const titleError = document.getElementById("titleError");

  if (!title) {
    titleError.classList.remove("d-none");
    return false;
  } else {
    titleError.classList.add("d-none");
  }

  // Additional validations can be added here

  return true;
}

// Update the createAssignment function to use validation
const originalCreateAssignment = createAssignment;
createAssignment = function () {
  if (validateForm()) {
    originalCreateAssignment();
    // Clear draft after successful creation
    clearDraft();
  }
};
