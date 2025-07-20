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

  // Create assignment object
  const assignment = {
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
  };

  // Save assignment (in real implementation, this would send to server)
  console.log("Creating assignment:", assignment);

  // Show success message
  showToast(`Assignment "${title}" has been created successfully!`, "success");

  // In real implementation, redirect back to classroom
  // window.location.href = 'classroom.html';
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
});

// Enhanced modal backdrop click handling
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("modal")) {
    const modal = bootstrap.Modal.getInstance(event.target);
    if (modal) {
      modal.hide();
    }
  }
});
