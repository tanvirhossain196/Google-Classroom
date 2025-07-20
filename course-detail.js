class CourseDetailManager {
  constructor() {
    this.attachments = [];
    this.availableCourses = []; // ব্যবহারকারীর তৈরি করা কোর্সগুলো এখানে থাকবে
    this.availableStudents = []; // সমস্ত উপলব্ধ শিক্ষার্থী এখানে থাকবে
    this.selectedCourses = [];
    this.selectedStudents = [];
    this.assignToAll = true; // For classwork assignment
    this.init();
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.loadUserData();
    this.loadCourseData();
    this.setupProfessionalFeatures();
    this.loadPosts();
    this.setupNotificationSystem();
    this.loadAvailableCoursesAndStudents(); // এই ফাংশনটি ব্যবহারকারীর কোর্স এবং শিক্ষার্থীদের লোড করবে
    this.initialTabLoad(); // Added for initial tab state
  }

  setupElements() {
    this.elements = {
      menuBtn: document.getElementById("menuBtn"),
      sidebar: document.getElementById("sidebar"),
      contentWrapper: document.getElementById("contentWrapper"),
      navTabs: document.querySelectorAll(".nav-tab"), // Old nav tabs, might not be used
      tabContents: document.querySelectorAll(".tab-content"),
      announcementTrigger: document.getElementById("announcementTrigger"),
      announcementFormExpanded: document.getElementById(
        "announcementFormExpanded"
      ),
      cancelAnnouncement: document.getElementById("cancelAnnouncement"),
      postAnnouncement: document.getElementById("postAnnouncement"),
      editorContent: document.getElementById("editorContent"),
      userInitial: document.getElementById("userInitial"),
      teacherInitial: document.getElementById("teacherInitial"),
      streamPosts: document.getElementById("streamPosts"),
      noPosts: document.getElementById("noPosts"),
      classesLink: document.getElementById("classesLink"),
      settingsLink: document.getElementById("settingsLink"),
      currentCourseName: document.getElementById("currentCourseName"),
      courseHeaderSection: document.querySelector(".course-header-section"), // Added

      // New elements for Classwork tab
      createClassworkBtn: document.getElementById("createClassworkBtn"),
      createClassworkBtnEmpty: document.getElementById(
        "createClassworkBtnEmpty"
      ),
      createOptionsOverlay: document.getElementById("createOptionsOverlay"),
      closeCreateOptions: document.getElementById("closeCreateOptions"),
      createOptionItems: document.querySelectorAll(".create-option-item"),
      assignmentCreationPage: document.getElementById("assignmentCreationPage"),
      classworkContent: document.getElementById("classworkContent"),
      noClasswork: document.getElementById("noClasswork"),
      assignmentsList: document.getElementById("assignmentsList"),

      // Elements for assignment creation form (from classwork.html)
      assignmentTitle: document.getElementById("assignmentTitle"),
      instructionsEditor: document.getElementById("instructionsEditor"),
      fileInput: document.getElementById("fileInput"),
      linkModal: new bootstrap.Modal(document.getElementById("linkModal")),
      youtubeModal: new bootstrap.Modal(
        document.getElementById("youtubeModal")
      ),
      studentModal: new bootstrap.Modal(
        document.getElementById("studentModal")
      ),
      linkUrl: document.getElementById("linkUrl"),
      linkTitle: document.getElementById("linkTitle"),
      youtubeUrl: document.getElementById("youtubeUrl"),
      courseSelect: document.getElementById("courseSelect"),
      pointsSelect: document.getElementById("pointsSelect"),
      dueDate: document.getElementById("dueDate"),
      topicSelect: document.getElementById("topicSelect"),
      assignToText: document.getElementById("assignToText"),
      titleError: document.getElementById("titleError"),
    };
  }

  setupEventListeners() {
    // Enhanced menu functionality
    this.elements.menuBtn.addEventListener("click", () => this.toggleSidebar());

    // Enhanced navigation
    this.elements.classesLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.goToDashboard();
    });

    this.elements.settingsLink.addEventListener("click", () =>
      this.navigateWithAnimation("settings.html")
    );

    // Enhanced tab navigation (old, likely replaced by top-nav-tab)
    this.elements.navTabs.forEach((tab) => {
      tab.addEventListener("click", () => this.switchTab(tab));
    });

    // Enhanced announcement functionality
    this.elements.announcementTrigger.addEventListener("click", () =>
      this.handleAnnouncementClick()
    );

    // Enhanced click outside detection
    document.addEventListener("click", (e) => this.handleClickOutside(e));

    // Enhanced resize handling
    window.addEventListener("resize", () => this.handleResize());

    // Enhanced top navigation
    const topNavTabs = document.querySelectorAll(".top-nav-tab");
    topNavTabs.forEach((tab) => {
      tab.addEventListener("click", () => this.switchTopTab(tab));
    });

    // New Classwork tab functionality
    if (this.elements.createClassworkBtn) {
      this.elements.createClassworkBtn.addEventListener("click", () =>
        this.showCreateOptions()
      );
    }
    if (this.elements.createClassworkBtnEmpty) {
      this.elements.createClassworkBtnEmpty.addEventListener("click", () =>
        this.showCreateOptions()
      );
    }
    if (this.elements.closeCreateOptions) {
      this.elements.closeCreateOptions.addEventListener("click", () =>
        this.hideCreateOptions()
      );
    }
    this.elements.createOptionItems.forEach((item) => {
      item.addEventListener("click", (e) => this.handleCreateOptionClick(e));
    });

    // Add event listener for courseSelect change to update student list
    if (this.elements.courseSelect) {
      this.elements.courseSelect.addEventListener("change", () => {
        // If student modal is open and specific students are selected, repopulate
        if (this.elements.studentModal._isShown && !this.assignToAll) {
          this.populateStudentSelectionModal();
        }
      });
    }
  }

  initialTabLoad() {
    // Ensure 'stream' tab is active and course header is visible on initial load
    const streamTab = document.querySelector('.top-nav-tab[data-tab="stream"]');
    if (streamTab) {
      this.switchTopTab(streamTab);
    }
    // Also ensure classwork content is loaded correctly on initial load
    this.loadClassworkContent();
  }

  switchTopTab(activeTab) {
    const targetTab = activeTab.getAttribute("data-tab");

    // Remove active class from all top nav tabs
    document
      .querySelectorAll(".top-nav-tab")
      .forEach((tab) => tab.classList.remove("active"));

    // Remove active class from all tab contents
    this.elements.tabContents.forEach((content) =>
      content.classList.remove("active")
    );

    // Add active class to clicked tab
    activeTab.classList.add("active");
    document.getElementById(targetTab).classList.add("active");

    // Control visibility of course header section
    if (targetTab === "stream") {
      if (this.elements.courseHeaderSection) {
        this.elements.courseHeaderSection.style.display = "block";
      }
    } else {
      if (this.elements.courseHeaderSection) {
        this.elements.courseHeaderSection.style.display = "none";
      }
    }

    // Load specific tab content
    if (targetTab === "people") {
      this.loadClassList();
    } else if (targetTab === "classwork") {
      this.loadClassworkContent(); // Ensure classwork content is loaded
    } else if (targetTab === "grades") {
      this.loadGradesContent(); // Ensure grades content is empty
    }

    // Add ripple effect
    this.createRippleEffect(activeTab);
  }

  // New method to ensure classwork content is empty
  loadClassworkContent() {
    const classworkTabContent = document.getElementById("classwork");
    if (classworkTabContent) {
      // Re-initialize Bootstrap tooltips for classwork tab
      const tooltipTriggerList = [].slice.call(
        classworkTabContent.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });

      // Set default due date (tomorrow)
      const dueDateInput = classworkTabContent.querySelector("#dueDate");
      if (dueDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueDateInput.value = tomorrow.toISOString().split("T")[0];
      }

      // Add smooth scrolling for focus events
      const assignmentTitleInput =
        classworkTabContent.querySelector("#assignmentTitle");
      if (assignmentTitleInput) {
        assignmentTitleInput.addEventListener("focus", function () {
          this.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    }
    this.loadAssignments(); // Load assignments when classwork tab is opened
    this.hideAssignmentCreationPage(); // Ensure assignment creation page is hidden
  }

  // New method to ensure grades content is empty
  loadGradesContent() {
    const gradesTabContent = document.getElementById("grades");
    if (gradesTabContent) {
      // No specific content to load for grades tab in this context, just ensure it's active.
    }
  }

  loadUserData() {
    this.currentUser = localStorage.getItem("currentUser");
    this.userRole = localStorage.getItem("userRole");

    if (!this.currentUser) {
      this.navigateWithAnimation("index.html");
      return;
    }

    this.setUserInitials();
  }

  loadCourseData() {
    const selectedCourse = localStorage.getItem("selectedCourse");

    if (!selectedCourse) {
      this.showErrorAndRedirect("কোন কোর্স নির্বাচিত নয়");
      return;
    }

    try {
      this.currentCourse = JSON.parse(selectedCourse);

      if (!this.currentCourse.id) {
        this.showErrorAndRedirect("কোর্স ডেটা সঠিক নয়");
        return;
      }

      this.courseId = this.currentCourse.id;
      this.updateCourseDisplay();
      this.loadEnrolledClasses();
    } catch (error) {
      this.showErrorAndRedirect("কোর্স লোড করতে সমস্যা হয়েছে");
    }
  }

  showErrorAndRedirect(message) {
    alert(message);
    this.navigateWithAnimation("dashboard.html");
  }

  setupProfessionalFeatures() {
    this.setupTooltips();
    this.setupKeyboardShortcuts();
    this.setupAutoSave();
    this.setupThemeDetection();
    this.setupProgressIndicators();
  }

  toggleSidebar() {
    this.elements.sidebar.classList.toggle("open");
    this.elements.contentWrapper.classList.toggle("sidebar-open");

    // Add smooth animation effect
    this.elements.sidebar.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    this.elements.contentWrapper.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  }

  navigateWithAnimation(url) {
    // Add fade out animation before navigation
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.3s ease";

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }

  goToDashboard() {
    // Selected course clear করুন
    localStorage.removeItem("selectedCourse");
    this.navigateWithAnimation("dashboard.html");
  }

  switchTab(activeTab) {
    const targetTab = activeTab.getAttribute("data-tab");

    // Remove active class from all tabs
    this.elements.navTabs.forEach((tab) => tab.classList.remove("active"));
    this.elements.tabContents.forEach((content) =>
      content.classList.remove("active")
    );

    // Add active class to clicked tab
    activeTab.classList.add("active");
    document.getElementById(targetTab).classList.add("active");

    // Load specific tab content
    if (targetTab === "people") {
      this.loadClassList();
    }

    // Add ripple effect
    this.createRippleEffect(activeTab);
  }

  loadClassList() {
    const peopleTabContent = document.getElementById("people");

    if (!peopleTabContent) return;

    // Create class list container
    let classListContainer = peopleTabContent.querySelector(
      ".class-list-container"
    );

    if (!classListContainer) {
      classListContainer = document.createElement("div");
      classListContainer.className = "class-list-container";

      // Clear existing content and add new container
      peopleTabContent.innerHTML = "";
      peopleTabContent.appendChild(classListContainer);
    }

    // Teacher section
    const teacherSection = document.createElement("div");
    teacherSection.className = "teacher-section";
    teacherSection.style.cssText = `
            background: var(--surface-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
            padding: 24px;
            margin-bottom: 24px;
            transition: var(--transition);
        `;

    const teacherHeader = document.createElement("h3");
    teacherHeader.textContent = "শিক্ষক";
    teacherHeader.style.cssText = `
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
    teacherHeader.innerHTML =
      '<span class="material-icons">school</span> শিক্ষক';

    const teacherInfo = document.createElement("div");
    teacherInfo.className = "teacher-info";
    teacherInfo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: var(--border-radius);
            transition: var(--transition);
        `;

    const teacherAvatar = document.createElement("div");
    teacherAvatar.className = "teacher-avatar";
    teacherAvatar.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: 600;
            box-shadow: var(--shadow-light);
        `;
    teacherAvatar.textContent = this.currentCourse.teacher
      .charAt(0)
      .toUpperCase();

    const teacherDetails = document.createElement("div");
    teacherDetails.className = "teacher-details";

    const teacherName = document.createElement("div");
    teacherName.className = "teacher-name";
    teacherName.textContent = this.currentCourse.teacher;
    teacherName.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
        `;

    const teacherRole = document.createElement("div");
    teacherRole.className = "teacher-role";
    teacherRole.textContent = "কোর্স প্রশিক্ষক";
    teacherRole.style.cssText = `
            font-size: 14px;
            color: var(--text-secondary);
        `;

    teacherDetails.appendChild(teacherName);
    teacherDetails.appendChild(teacherRole);
    teacherInfo.appendChild(teacherAvatar);
    teacherInfo.appendChild(teacherDetails);
    teacherSection.appendChild(teacherHeader);
    teacherSection.appendChild(teacherInfo);

    // HR divider
    const hrDivider = document.createElement("hr");
    hrDivider.style.cssText = `
            border: none;
            height: 2px;
            background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            margin: 32px 0;
            border-radius: 2px;
        `;

    // Students section
    const studentsSection = document.createElement("div");
    studentsSection.className = "students-section";
    studentsSection.style.cssText = `
            background: var(--surface-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
            padding: 24px;
            transition: var(--transition);
        `;

    const studentsHeader = document.createElement("h3");
    studentsHeader.style.cssText = `
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

    // Get students list
    const students = this.getEnrolledStudents();
    studentsHeader.innerHTML = `<span class="material-icons">group</span> শিক্ষার্থী (${students.length} জন)`;

    const studentsList = document.createElement("div");
    studentsList.className = "students-list";
    studentsList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

    if (students.length === 0) {
      const noStudents = document.createElement("div");
      noStudents.className = "no-students";
      noStudents.textContent = "এখনো কোন শিক্ষার্থী যোগদান করেনি";
      noStudents.style.cssText = `
                text-align: center;
                color: var(--text-secondary);
                padding: 40px 20px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: var(--border-radius);
                font-style: italic;
            `;
      studentsList.appendChild(noStudents);
    } else {
      students.forEach((student, index) => {
        const studentItem = document.createElement("div");
        studentItem.className = "student-item";
        studentItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                    border-radius: var(--border-radius);
                    transition: var(--transition);
                    border: 1px solid var(--border-color);
                `;

        const studentSerial = document.createElement("div");
        studentSerial.className = "student-serial";
        studentSerial.textContent = (index + 1).toString();
        studentSerial.style.cssText = `
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 600;
                    flex-shrink: 0;
                `;

        const studentAvatar = document.createElement("div");
        studentAvatar.className = "student-avatar";
        studentAvatar.style.cssText = `
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    box-shadow: var(--shadow-light);
                    flex-shrink: 0;
                `;
        studentAvatar.textContent = student.charAt(0).toUpperCase();

        const studentName = document.createElement("div");
        studentName.className = "student-name";
        studentName.textContent = student;
        studentName.style.cssText = `
                    flex: 1;
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--text-primary);
                `;

        // Add hover effect
        studentItem.addEventListener("mouseenter", () => {
          studentItem.style.transform = "translateY(-2px)";
          studentItem.style.boxShadow = "var(--shadow-medium)";
        });

        studentItem.addEventListener("mouseleave", () => {
          studentItem.style.transform = "translateY(0)";
          studentItem.style.boxShadow = "none";
        });

        studentItem.appendChild(studentSerial);
        studentItem.appendChild(studentAvatar);
        studentItem.appendChild(studentName);
        studentsList.appendChild(studentItem);
      });
    }

    studentsSection.appendChild(studentsHeader);
    studentsSection.appendChild(studentsList);

    // Add all sections to container
    classListContainer.appendChild(teacherSection);
    classListContainer.appendChild(hrDivider);
    classListContainer.appendChild(studentsSection);
  }

  // Method to get enrolled students
  getEnrolledStudents() {
    // Get students from course data
    if (
      this.currentCourse.students &&
      Array.isArray(this.currentCourse.students)
    ) {
      return this.currentCourse.students;
    }

    // Fallback: get from localStorage
    const courseKey = `course_students_${this.courseId}`;
    const studentsData = localStorage.getItem(courseKey);

    if (studentsData) {
      try {
        return JSON.parse(studentsData);
      } catch (error) {
        console.error("Error parsing students data:", error);
      }
    }

    return [];
  }

  handleAnnouncementClick() {
    this.elements.announcementFormExpanded.style.display = "block";

    // Add enhanced announcement form with attachments
    this.createEnhancedAnnouncementForm();

    // Add smooth expand animation
    this.elements.announcementFormExpanded.style.animation =
      "expandDown 0.5s ease";
  }

  createEnhancedAnnouncementForm() {
    const formExpanded = this.elements.announcementFormExpanded;

    if (formExpanded.querySelector(".enhanced-announcement-form")) {
      return;
    }

    const enhancedForm = document.createElement("div");
    enhancedForm.className = "enhanced-announcement-form";

    enhancedForm.innerHTML = `
            <!-- Recipients Display -->
            <div class="recipient-display" onclick="courseManager.openRecipientModal()">
                <div class="recipient-header">
                    <div class="recipient-title">
                        <span class="material-icons">send</span>
                        প্রাপক নির্বাচন করুন
                    </div>
                    <button class="change-recipient-btn" type="button">
                        পরিবর্তন করুন
                    </button>
                </div>
                <div class="recipient-summary" id="recipientSummary">
                    <div class="course-count">
                        <span class="material-icons">class</span>
                        <span class="count-badge" id="courseCountBadge">1</span>
                        টি কোর্স নির্বাচিত
                    </div>
                    <div class="student-count">
                        <span class="material-icons">group</span>
                        <span class="count-badge" id="studentCountBadge">সকল</span>
                        শিক্ষার্থী নির্বাচিত
                    </div>
                </div>
            </div>

            <!-- Rich Text Editor -->
            <div class="rich-editor">
                <div class="editor-toolbar">
                    <button type="button" class="toolbar-btn" data-command="bold">
                        <span class="material-icons">format_bold</span>
                    </button>
                    <button type="button" class="toolbar-btn" data-command="italic">
                        <span class="material-icons">format_italic</span>
                    </button>
                    <button type="button" class="toolbar-btn" data-command="underline">
                        <span class="material-icons">format_underlined</span>
                    </button>
                    <button type="button" class="toolbar-btn" data-command="insertUnorderedList">
                        <span class="material-icons">format_list_bulleted</span>
                    </button>
                    <button type="button" class="toolbar-btn" data-command="createLink">
                        <span class="material-icons">link</span>
                    </button>
                </div>
                <div
                    class="editor-content"
                    contenteditable="true"
                    placeholder="আপনার ঘোষণা লিখুন..."
                    id="editorContent"
                ></div>
            </div>

            <!-- Attachment Options (Original - Hidden by default) -->
            <div class="attachment-options" id="fullAttachmentOptions" style="display: none;">
                <h4 style="margin-bottom: 16px; color: var(--text-primary); font-weight: 600;">
                    <span class="material-icons" style="vertical-align: middle; margin-right: 8px;">attach_file</span>
                    সংযুক্তি যোগ করুন
                </h4>
                <div class="attachment-grid">
                    <div class="attachment-option file" onclick="courseManager.handleFileUpload()">
                        <div class="attachment-icon">
                            <span class="material-icons">upload_file</span>
                        </div>
                        <div class="attachment-title">ফাইল আপলোড</div>
                        <div class="attachment-desc">কম্পিউটার থেকে ফাইল আপলোড করুন</div>
                        <input type="file" id="fileInput" multiple style="display: none;" accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx">
                    </div>
                    
                    <div class="attachment-option link" onclick="courseManager.handleLinkAdd()">
                        <div class="attachment-icon">
                            <span class="material-icons">link</span>
                        </div>
                        <div class="attachment-title">লিংক যোগ করুন</div>
                        <div class="attachment-desc">ওয়েবসাইট বা রিসোর্স লিংক</div>
                    </div>
                    
                    <div class="attachment-option youtube" onclick="courseManager.handleYouTubeAdd()">
                        <div class="attachment-icon">
                            <span class="material-icons">play_circle</span>
                        </div>
                        <div class="attachment-title">YouTube ভিডিও</div>
                        <div class="attachment-desc">YouTube ভিডিও URL যোগ করুন</div>
                    </div>
                    
                    <div class="attachment-option drive" onclick="courseManager.handleDriveAdd()">
                        <div class="attachment-icon">
                            <span class="material-icons">cloud</span>
                        </div>
                        <div class="attachment-title">Google Drive</div>
                        <div class="attachment-desc">Drive থেকে ফাইল শেয়ার করুন</div>
                    </div>
                </div>
            </div>

            <!-- Attached Files Display -->
            <div class="attached-files" id="attachedFiles" style="display: none;">
                <div class="attached-files-title">
                    <span class="material-icons">attachment</span>
                    সংযুক্ত ফাইল (<span id="attachedFilesCount">0</span>)
                </div>
                <div class="file-list" id="attachedFilesList"></div>
            </div>

            <!-- Form Actions with Quick Attachment Icons -->
            <div class="form-actions">
                <div class="form-actions-left">
                    <div class="quick-attachment-icons">
                        <div class="quick-attachment-icon file" 
                             data-tooltip="ফাইল আপলোড"
                             onclick="courseManager.handleFileUpload()">
                            <span class="material-icons">upload_file</span>
                            <span class="attachment-count-badge" id="fileCountBadge" style="display: none;">0</span>
                            <input type="file" id="quickFileInput" multiple style="display: none;" accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx">
                        </div>
                        
                        <div class="quick-attachment-icon link" 
                             data-tooltip="লিংক যোগ করুন"
                             onclick="courseManager.handleLinkAdd()">
                            <span class="material-icons">link</span>
                            <span class="attachment-count-badge" id="linkCountBadge" style="display: none;">0</span>
                        </div>
                        
                        <div class="quick-attachment-icon youtube" 
                             data-tooltip="YouTube ভিডিও"
                             onclick="courseManager.handleYouTubeAdd()">
                            <span class="material-icons">play_circle</span>
                            <span class="attachment-count-badge" id="youtubeCountBadge" style="display: none;">0</span>
                        </div>
                        
                        <div class="quick-attachment-icon drive" 
                             data-tooltip="Google Drive"
                             onclick="courseManager.handleDriveAdd()">
                            <span class="material-icons">cloud</span>
                            <span class="attachment-count-badge" id="driveCountBadge" style="display: none;">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions-right">
                    <button type="button" class="btn-cancel" id="cancelAnnouncement">
                        <span class="material-icons">close</span>
                        বাতিল করুন
                    </button>
                    <button type="button" class="btn-primary" id="postAnnouncement">
                        <span class="material-icons">send</span>
                        পোস্ট করুন
                    </button>
                </div>
            </div>
        `;

    // Initialize default selection
    this.selectedCourses = [this.courseId];
    this.selectedStudents = ["all"];

    formExpanded.innerHTML = "";
    formExpanded.appendChild(enhancedForm);

    this.elements.editorContent = document.getElementById("editorContent");
    this.elements.cancelAnnouncement =
      document.getElementById("cancelAnnouncement");
    this.elements.postAnnouncement =
      document.getElementById("postAnnouncement");

    this.setupEnhancedEventListeners();
    this.updateRecipientSummary();
    this.setupRichTextEditor();
  }

  // Updated file input handler for quick icons
  handleFileUpload() {
    const quickFileInput = document.getElementById("quickFileInput");
    const regularFileInput = document.getElementById("fileInput");

    if (quickFileInput) {
      quickFileInput.click();
    } else if (regularFileInput) {
      regularFileInput.click();
    }
  }

  setupEnhancedEventListeners() {
    // File input change listener for both inputs
    const fileInput = document.getElementById("fileInput");
    const quickFileInput = document.getElementById("quickFileInput");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    }

    if (quickFileInput) {
      quickFileInput.addEventListener("change", (e) =>
        this.handleFileSelect(e)
      );
    }

    // Re-setup cancel and post buttons
    this.elements.cancelAnnouncement.addEventListener("click", () =>
      this.cancelAnnouncement()
    );
    this.elements.postAnnouncement.addEventListener("click", () =>
      this.postAnnouncement()
    );
  }

  // Updated attachment display to show counts
  updateAttachedFilesDisplay() {
    const attachedFiles = document.getElementById("attachedFiles");
    const attachedFilesList = document.getElementById("attachedFilesList");
    const attachedFilesCount = document.getElementById("attachedFilesCount");

    if (this.attachments.length > 0) {
      attachedFiles.style.display = "block";
      attachedFilesList.innerHTML = "";

      // Update total count
      if (attachedFilesCount) {
        attachedFilesCount.textContent = this.attachments.length;
      }

      this.attachments.forEach((attachment) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";

        fileItem.innerHTML = `
                    <div class="file-icon ${attachment.icon}">
                        <span class="material-icons">
                            ${this.getFileIcon(attachment.type)}
                        </span>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${attachment.name}</div>
                        <div class="file-size">
                            ${attachment.size || attachment.type.toUpperCase()}
                        </div>
                    </div>
                    <button class="remove-file-btn" onclick="courseManager.removeAttachment(${
                      attachment.id
                    })">
                        <span class="material-icons">close</span>
                    </button>
                `;

        attachedFilesList.appendChild(fileItem);
      });

      // Update individual type counts
      this.updateAttachmentCounts();
    } else {
      attachedFiles.style.display = "none";
      if (attachedFilesCount) {
        attachedFilesCount.textContent = "0";
      }
      this.hideAllAttachmentCounts();
    }
  }

  // New method to update individual attachment type counts
  updateAttachmentCounts() {
    const counts = {
      file: 0,
      link: 0,
      youtube: 0,
      drive: 0,
    };

    // Count attachments by type
    this.attachments.forEach((attachment) => {
      if (counts.hasOwnProperty(attachment.type)) {
        counts[attachment.type]++;
      }
    });

    // Update badges
    Object.keys(counts).forEach((type) => {
      const badge = document.getElementById(`${type}CountBadge`);
      if (badge) {
        if (counts[type] > 0) {
          badge.textContent = counts[type];
          badge.style.display = "flex";
        } else {
          badge.style.display = "none";
        }
      }
    });
  }

  // Hide all attachment count badges
  hideAllAttachmentCounts() {
    ["file", "link", "youtube", "drive"].forEach((type) => {
      const badge = document.getElementById(`${type}CountBadge`);
      if (badge) {
        badge.style.display = "none";
      }
    });
  }

  // Update the cancelAnnouncement method to reset counts
  cancelAnnouncement() {
    // Add collapse animation
    this.elements.announcementFormExpanded.style.animation =
      "collapseUp 0.3s ease";

    setTimeout(() => {
      this.elements.announcementFormExpanded.style.display = "none";
      if (this.elements.editorContent) {
        this.elements.editorContent.innerHTML = "";
      }
      this.attachments = [];
      this.updateAttachedFilesDisplay();
      this.hideAllAttachmentCounts();
    }, 300);

    this.showNotification("ঘোষণা বাতিল করা হয়েছে", "info");
  }

  openRecipientModal() {
    // Create recipient selection modal
    const modal = document.createElement("div");
    modal.className = "selection-modal";
    modal.id = "recipientModal";

    modal.innerHTML = `
            <div class="selection-modal-content">
                <div class="selection-modal-header">
                    <div class="selection-modal-title">
                        <span class="material-icons">send</span>
                        প্রাপক নির্বাচন করুন
                    </div>
                    <button class="modal-close-btn" onclick="courseManager.closeRecipientModal()">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                
                <div class="selection-modal-body">
                    <!-- Course Selection Section -->
                    <div class="course-selection-section">
                        <div class="course-selection-header">
                            <div class="course-selection-title">
                                <span class="material-icons">class</span>
                                কোর্স নির্বাচন করুন
                            </div>
                            <button class="select-all-courses-btn" onclick="courseManager.toggleAllCourses()">
                                <span class="material-icons">select_all</span>
                                সব নির্বাচন
                            </button>
                        </div>
                        <div class="course-options-grid" id="courseOptionsGrid">
                            <!-- Course options will be populated here -->
                        </div>
                    </div>

                    <!-- Student Selection Section -->
                    <div class="student-selection-section">
                        <div class="student-selection-header">
                            <div class="student-selection-title">
                                <span class="material-icons">group</span>
                                শিক্ষার্থী নির্বাচন করুন
                            </div>
                            <div class="student-type-toggle">
                                <button class="toggle-option active" id="allStudentsToggle" onclick="courseManager.setStudentSelectionType('all')">
                                    সকল শিক্ষার্থী
                                </button>
                                <button class="toggle-option" id="specificStudentsToggle" onclick="courseManager.setStudentSelectionType('specific')">
                                    নির্দিষ্ট শিক্ষার্থী
                                </button>
                            </div>
                        </div>
                        <div class="student-options-container" id="studentOptionsContainer">
                            <div class="all-students-message">
                                সকল শিক্ষার্থীকে ঘোষণা পাঠানো হবে
                            </div>
                        </div>
                    </div>
                </div>

                <div class="selection-modal-footer">
                    <button class="modal-btn-cancel" onclick="courseManager.closeRecipientModal()">
                        বাতিল করুন
                    </button>
                    <button class="modal-btn-confirm" onclick="courseManager.confirmRecipientSelection()">
                        নিশ্চিত করুন
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Populate course options
    this.populateCourseOptions();

    // Show modal with animation
    setTimeout(() => {
      modal.classList.add("active");
    }, 10);

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeRecipientModal();
      }
    });
  }

  populateCourseOptions() {
    const courseGrid = document.getElementById("courseOptionsGrid");
    if (!courseGrid) return;

    courseGrid.innerHTML = "";

    this.availableCourses.forEach((course) => {
      const courseOption = document.createElement("div");
      courseOption.className = "course-option-item";

      const isSelected = this.selectedCourses.includes(course.id);
      if (isSelected) {
        courseOption.classList.add("selected");
      }

      courseOption.innerHTML = `
                <input type="checkbox" class="course-option-checkbox" 
                       id="modal_course_${course.id}" value="${course.id}" ${
        isSelected ? "checked" : ""
      }>
                <div class="course-option-avatar">
                    ${course.name.charAt(0).toUpperCase()}
                </div>
                <div class="course-option-info">
                    <div class="course-option-name">${course.name}</div>
                    <div class="course-option-section">সেকশন: ${
                      course.section
                    }</div>
                    <div class="course-option-teacher">শিক্ষক: ${
                      course.teacher
                    }</div>
                </div>
            `;

      // Add click handler
      courseOption.addEventListener("click", (e) => {
        if (e.target.type !== "checkbox") {
          const checkbox = courseOption.querySelector(
            ".course-option-checkbox"
          );
          checkbox.checked = !checkbox.checked;
        }
        this.updateCourseSelection(courseOption);
      });

      const checkbox = courseOption.querySelector(".course-option-checkbox");
      checkbox.addEventListener("change", () => {
        this.updateCourseSelection(courseOption);
      });

      courseGrid.appendChild(courseOption);
    });
  }

  updateCourseSelection(courseOption) {
    const checkbox = courseOption.querySelector(".course-option-checkbox");
    const courseId = checkbox.value;

    if (checkbox.checked) {
      courseOption.classList.add("selected");
      if (!this.selectedCourses.includes(courseId)) {
        this.selectedCourses.push(courseId);
      }
    } else {
      courseOption.classList.remove("selected");
      this.selectedCourses = this.selectedCourses.filter(
        (id) => id !== courseId
      );
    }
  }

  toggleAllCourses() {
    const allCheckboxes = document.querySelectorAll(".course-option-checkbox");
    const allChecked = Array.from(allCheckboxes).every((cb) => cb.checked);

    allCheckboxes.forEach((checkbox) => {
      checkbox.checked = !allChecked;
      const courseOption = checkbox.closest(".course-option-item");
      this.updateCourseSelection(courseOption);
    });
  }

  setStudentSelectionType(type) {
    const allToggle = document.getElementById("allStudentsToggle");
    const specificToggle = document.getElementById("specificStudentsToggle");
    const container = document.getElementById("studentOptionsContainer");

    // Update toggle buttons
    allToggle.classList.remove("active");
    specificToggle.classList.remove("active");

    if (type === "all") {
      allToggle.classList.add("active");
      this.selectedStudents = ["all"];
      container.innerHTML =
        '<div class="all-students-message">সকল শিক্ষার্থীকে ঘোষণা পাঠানো হবে</div>';
    } else {
      specificToggle.classList.add("active");
      this.selectedStudents = [];
      this.populateStudentOptions(container);
    }
  }

  populateStudentOptions(container) {
    container.innerHTML = "";

    const studentGrid = document.createElement("div");
    studentGrid.className = "student-options-grid";

    this.availableStudents.forEach((student) => {
      const studentOption = document.createElement("div");
      studentOption.className = "student-option-item";

      studentOption.innerHTML = `
                <input type="checkbox" class="student-option-checkbox" 
                       id="modal_student_${student}" value="${student}">
                <div class="student-option-avatar">
                    ${student.charAt(0).toUpperCase()}
                </div>
                <div class="student-option-name">${student}</div>
            `;

      // Add click handler
      studentOption.addEventListener("click", (e) => {
        if (e.target.type !== "checkbox") {
          const checkbox = studentOption.querySelector(
            ".student-option-checkbox"
          );
          checkbox.checked = !checkbox.checked;
        }
        this.updateStudentSelection(studentOption);
      });

      const checkbox = studentOption.querySelector(".student-option-checkbox");
      checkbox.addEventListener("change", () => {
        this.updateStudentSelection(studentOption);
      });

      studentGrid.appendChild(studentOption);
    });

    container.appendChild(studentGrid);
  }

  updateStudentSelection(studentOption) {
    const checkbox = studentOption.querySelector(".student-option-checkbox");
    const student = checkbox.value;

    if (checkbox.checked) {
      studentOption.classList.add("selected");
      if (!this.selectedStudents.includes(student)) {
        this.selectedStudents.push(student);
      }
    } else {
      studentOption.classList.remove("selected");
      this.selectedStudents = this.selectedStudents.filter(
        (s) => s !== student
      );
    }
  }

  confirmRecipientSelection() {
    if (this.selectedCourses.length === 0) {
      this.showNotification(
        "অনুগ্রহ করে কমপক্ষে একটি কোর্স নির্বাচন করুন",
        "error"
      );
      return;
    }

    this.updateRecipientSummary();
    this.closeRecipientModal();
    this.showNotification("প্রাপক সফলভাবে নির্বাচিত হয়েছে", "success");
  }

  updateRecipientSummary() {
    const courseCountBadge = document.getElementById("courseCountBadge");
    const studentCountBadge = document.getElementById("studentCountBadge");

    if (courseCountBadge) {
      courseCountBadge.textContent = this.selectedCourses.length;
    }

    if (studentCountBadge) {
      if (this.selectedStudents.includes("all")) {
        studentCountBadge.textContent = "সকল";
      } else {
        studentCountBadge.textContent = this.selectedStudents.length;
      }
    }
  }

  closeRecipientModal() {
    const modal = document.getElementById("recipientModal");
    if (modal) {
      modal.classList.remove("active");
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    }
  }

  loadAvailableCoursesAndStudents() {
    // ব্যবহারকারীর ড্যাশবোর্ড থেকে সমস্ত কোর্স লোড করুন
    const userDashboard = this.getUserDashboard();
    this.availableCourses = userDashboard.courses || [];

    // সমস্ত কোর্স থেকে সমস্ত শিক্ষার্থী সংগ্রহ করুন
    this.availableStudents = [];
    this.availableCourses.forEach((course) => {
      if (course.students && Array.isArray(course.students)) {
        course.students.forEach((student) => {
          if (!this.availableStudents.includes(student)) {
            this.availableStudents.push(student);
          }
        });
      }
    });

    // অ্যাসাইনমেন্ট তৈরির ফর্মে কোর্স ড্রপডাউন পপুলেট করুন
    this.populateCourseDropdown();
  }

  populateCourseDropdown() {
    const courseSelect = this.elements.courseSelect;
    if (!courseSelect) return;

    courseSelect.innerHTML = ""; // বিদ্যমান অপশনগুলো মুছে ফেলুন

    this.availableCourses.forEach((course) => {
      const option = document.createElement("option");
      option.value = course.id; // কোর্সের ID ব্যবহার করুন
      option.textContent = `${course.name} - ${course.section}`;
      courseSelect.appendChild(option);
    });

    // যদি কোনো কোর্স না থাকে, একটি ডিফল্ট অপশন যোগ করুন
    if (this.availableCourses.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "কোনো কোর্স উপলব্ধ নেই";
      courseSelect.appendChild(option);
      courseSelect.disabled = true; // ড্রপডাউন নিষ্ক্রিয় করুন
    } else {
      courseSelect.disabled = false;
    }
  }

  handleFileSelect(event) {
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.addAttachment({
        type: "file",
        name: file.name,
        size: this.formatFileSize(file.size),
        file: file,
        icon: "image",
      });
    }

    this.updateAttachedFilesDisplay();
  }

  handleLinkAdd() {
    this.showLinkModal();
  }

  handleYouTubeAdd() {
    this.showYouTubeModal();
  }

  handleDriveAdd() {
    this.showDriveModal();
  }

  showLinkModal() {
    const modal = this.createModal(
      "লিংক যোগ করুন",
      `
            <div class="modal-body">
                <input type="url" class="url-input" id="linkUrl" placeholder="https://example.com" style="margin-bottom: 12px;">
                <input type="text" class="url-input" id="linkTitle" placeholder="লিংকের শিরোনাম (ঐচ্ছিক)">
            </div>
        `
    );

    const addButton = document.createElement("button");
    addButton.className = "btn-primary";
    addButton.textContent = "যোগ করুন";
    addButton.onclick = () => {
      const url = document.getElementById("linkUrl").value;
      const title = document.getElementById("linkTitle").value || url;

      if (url) {
        this.addAttachment({
          type: "link",
          name: title,
          url: url,
          icon: "link",
        });
        this.updateAttachedFilesDisplay();
        this.closeModal(modal);
      } else {
        this.showNotification("অনুগ্রহ করে একটি বৈধ URL দিন", "error");
      }
    };

    modal.querySelector(".modal-footer").appendChild(addButton);
    this.showModal(modal);
  }

  showYouTubeModal() {
    const modal = this.createModal(
      "YouTube ভিডিও যোগ করুন",
      `
            <div class="modal-body">
                <input type="url" class="url-input" id="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." style="margin-bottom: 12px;">
                <input type="text" class="url-input" id="youtubeTitle" placeholder="ভিডিওর শিরোনাম (ঐচ্ছিক)">
            </div>
        `
    );

    const addButton = document.createElement("button");
    addButton.className = "btn-primary";
    addButton.textContent = "যোগ করুন";
    addButton.onclick = () => {
      const url = document.getElementById("youtubeUrl").value;
      const title =
        document.getElementById("youtubeTitle").value || "YouTube Video";

      if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
        this.addAttachment({
          type: "youtube",
          name: title,
          url: url,
          icon: "video",
        });
        this.updateAttachedFilesDisplay();
        this.closeModal(modal);
      } else {
        this.showNotification("অনুগ্রহ করে একটি বৈধ YouTube URL দিন", "error");
      }
    };

    modal.querySelector(".modal-footer").appendChild(addButton);
    this.showModal(modal);
  }

  showDriveModal() {
    const modal = this.createModal(
      "Google Drive ফাইল যোগ করুন",
      `
            <div class="modal-body">
                <input type="url" class="url-input" id="driveUrl" placeholder="https://drive.google.com/file/d/..." style="margin-bottom: 12px;">
                <input type="text" class="url-input" id="driveTitle" placeholder="ফাইলের নাম (ঐচ্ছিক)">
            </div>
        `
    );

    const addButton = document.createElement("button");
    addButton.className = "btn-primary";
    addButton.textContent = "যোগ করুন";
    addButton.onclick = () => {
      const url = document.getElementById("driveUrl").value;
      const title =
        document.getElementById("driveTitle").value || "Google Drive File";

      if (url && url.includes("drive.google.com")) {
        this.addAttachment({
          type: "drive",
          name: title,
          url: url,
          icon: "drive",
        });
        this.updateAttachedFilesDisplay();
        this.closeModal(modal);
      } else {
        this.showNotification(
          "অনুগ্রহ করে একটি বৈধ Google Drive URL দিন",
          "error"
        );
      }
    };

    modal.querySelector(".modal-footer").appendChild(addButton);
    this.showModal(modal);
  }

  createModal(title, content) {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="courseManager.closeModal(this.closest('.modal'))">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                ${content}
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="courseManager.closeModal(this.closest('.modal'))">
                        বাতিল করুন
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    return modal;
  }

  showModal(modal) {
    modal.style.display = "block";

    // Close modal on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });
  }

  closeModal(modal) {
    if (modal && modal.parentNode) {
      modal.style.display = "none";
      modal.parentNode.removeChild(modal);
    }
  }

  addAttachment(attachment) {
    this.attachments.push({
      id: Date.now() + Math.random(),
      ...attachment,
    });
  }

  removeAttachment(attachmentId) {
    this.attachments = this.attachments.filter(
      (att) => att.id !== attachmentId
    );
    this.updateAttachedFilesDisplay();
  }

  getFileIcon(type) {
    switch (type) {
      case "file":
        return "insert_drive_file";
      case "link":
        return "link";
      case "youtube":
        return "play_circle";
      case "drive":
        return "cloud";
      default:
        return "attachment";
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  postAnnouncement() {
    const content = this.elements.editorContent.innerHTML.trim();

    if (!content) {
      this.showNotification("অনুগ্রহ করে কিছু লিখুন", "error");
      return;
    }

    // Get selected courses and students
    const selectedCourses = this.getSelectedCourses();
    const selectedStudents = this.getSelectedStudents();

    if (selectedCourses.length === 0) {
      this.showNotification(
        "অনুগ্রহ করে কমপক্ষে একটি কোর্স নির্বাচন করুন",
        "error"
      );
      return;
    }

    // Show loading state
    this.elements.postAnnouncement.textContent = "পোস্ট করা হচ্ছে...";
    this.elements.postAnnouncement.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
      const announcement = {
        id: Date.now(),
        author: this.currentUser,
        content: content,
        attachments: [...this.attachments],
        timestamp: new Date().toLocaleDateString("bn-BD", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        targetCourses: selectedCourses,
        targetStudents: selectedStudents,
        comments: [],
        likes: 0,
      };

      // Save announcement for each selected course
      selectedCourses.forEach((courseId) => {
        this.saveAnnouncementToCourse(announcement, courseId);
      });

      this.loadPosts();
      this.cancelAnnouncement();

      // Reset button
      this.elements.postAnnouncement.innerHTML =
        '<span class="material-icons">send</span> পোস্ট করুন';
      this.elements.postAnnouncement.disabled = false;

      this.showNotification("ঘোষণা সফলভাবে পোস্ট করা হয়েছে!", "success");
    }, 1000);
  }

  getSelectedCourses() {
    return this.selectedCourses || [this.courseId];
  }

  getSelectedStudents() {
    return this.selectedStudents || ["all"];
  }

  saveAnnouncementToCourse(announcement, courseId) {
    const courseKey = `announcements_${courseId}`;
    const announcements = JSON.parse(localStorage.getItem(courseKey) || "[]");

    announcements.unshift(announcement);
    localStorage.setItem(courseKey, JSON.stringify(announcements));
  }

  setupRichTextEditor() {
    const toolbarButtons = document.querySelectorAll(".toolbar-btn");

    toolbarButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const command = button.getAttribute("data-command");

        if (command === "createLink") {
          const url = prompt("URL লিংক দিন:");
          if (url) {
            document.execCommand(command, false, url);
          }
        } else {
          document.execCommand(command, false, null);
        }

        button.classList.toggle("active");
        if (this.elements.editorContent) {
          this.elements.editorContent.focus();
        }
      });
    });
  }

  setUserInitials() {
    const initial = this.currentUser.charAt(0).toUpperCase();
    if (this.elements.userInitial) {
      this.elements.userInitial.textContent = initial;
    }
    if (this.elements.teacherInitial) {
      this.elements.teacherInitial.textContent = initial;
    }
  }

  updateCourseDisplay() {
    // Course title এবং section update করুন
    const courseTitle = document.getElementById("courseTitle");
    const courseSection = document.getElementById("courseSection");

    if (courseTitle) courseTitle.textContent = this.currentCourse.name;
    if (courseSection) courseSection.textContent = this.currentCourse.section;

    // Page title update করুন
    document.title = `${this.currentCourse.name} - ক্লাসরুম`;

    // Sidebar এ current course name update করুন
    if (this.elements.currentCourseName) {
      this.elements.currentCourseName.textContent = this.currentCourse.name;
    }

    // Course banner theme set করুন
    const courseBanner = document.getElementById("courseBanner");
    if (courseBanner) {
      const courseType = this.getCourseType(this.currentCourse.subject);
      courseBanner.className = `course-banner ${courseType}`;
    }

    // Course info update করুন
    this.updateCourseInfo();
  }

  getCourseType(subject) {
    if (!subject) return "science"; // default

    const subjectLower = subject.toLowerCase();

    if (subjectLower.includes("math") || subjectLower.includes("গণিত"))
      return "math";
    if (subjectLower.includes("science") || subjectLower.includes("বিজ্ঞান"))
      return "science";
    if (subjectLower.includes("bangla") || subjectLower.includes("বাংলা"))
      return "bangla";
    if (subjectLower.includes("english") || subjectLower.includes("ইংরেজি"))
      return "english";
    if (
      subjectLower.includes("programming") ||
      subjectLower.includes("প্রোগ্রামিং")
    )
      return "programming";

    return "science"; // default
  }

  updateCourseInfo() {
    const isTeacher = this.currentCourse.teacher === this.currentUser;

    // Create additional course info section
    const courseBanner = document.getElementById("courseBanner");
    if (!courseBanner) return;

    let additionalInfo = courseBanner.querySelector(".course-additional-info");

    if (!additionalInfo) {
      additionalInfo = document.createElement("div");
      additionalInfo.className = "course-additional-info";
      const bannerContent = courseBanner.querySelector(".banner-content");
      if (bannerContent) {
        bannerContent.appendChild(additionalInfo);
      }
    }

    // Clear previous content
    additionalInfo.innerHTML = "";

    if (isTeacher) {
      // Teacher sees: course code, subject, room, student count
      if (this.currentCourse.code) {
        const courseCode = document.createElement("p");
        courseCode.innerHTML = `কোর্স কোড: ${this.currentCourse.code}`;
        additionalInfo.appendChild(courseCode);
      }

      if (this.currentCourse.subject) {
        const subject = document.createElement("p");
        subject.innerHTML = `বিষয়: ${this.currentCourse.subject}`;
        additionalInfo.appendChild(subject);
      }

      if (this.currentCourse.room) {
        const room = document.createElement("p");
        room.innerHTML = `রুম: ${this.currentCourse.room}`;
        additionalInfo.appendChild(room);
      }

      const studentCount = document.createElement("p");
      studentCount.innerHTML = `শিক্ষার্থী: ${
        this.currentCourse.students ? this.currentCourse.students.length : 0
      } জন`;
      additionalInfo.appendChild(studentCount);
    } else {
      // Student sees: subject, room, teacher name
      if (this.currentCourse.subject) {
        const subject = document.createElement("p");
        subject.innerHTML = `বিষয়: ${this.currentCourse.subject}`;
        additionalInfo.appendChild(subject);
      }

      if (this.currentCourse.room) {
        const room = document.createElement("p");
        room.innerHTML = `রুম: ${this.currentCourse.room}`;
        additionalInfo.appendChild(room);
      }

      const teacher = document.createElement("p");
      teacher.innerHTML = `শিক্ষক: ${this.currentCourse.teacher}`;
      additionalInfo.appendChild(teacher);
    }
  }

  loadEnrolledClasses() {
    const enrolledClasses = document.getElementById("enrolledClasses");
    if (!enrolledClasses) return;

    const userDashboard = this.getUserDashboard();
    const userCourses = userDashboard.courses || [];

    if (userCourses.length === 0) {
      enrolledClasses.innerHTML = "";
      return;
    }

    enrolledClasses.innerHTML = "";

    userCourses.slice(0, 5).forEach((course) => {
      const courseItem = document.createElement("div");
      courseItem.className = "sidebar-item";
      courseItem.onclick = () => this.switchToCourse(course);

      const avatar = document.createElement("div");
      avatar.className = "sidebar-avatar";
      avatar.textContent = course.name.charAt(0).toUpperCase();

      const courseName = document.createElement("span");
      courseName.className = "sidebar-text";
      courseName.textContent = course.name;

      courseItem.appendChild(avatar);
      courseItem.appendChild(courseName);
      enrolledClasses.appendChild(courseItem);
    });
  }

  getUserDashboard() {
    const dashboardKey = `dashboard_${this.currentUser}`;
    return JSON.parse(localStorage.getItem(dashboardKey) || '{"courses": []}');
  }

  switchToCourse(course) {
    localStorage.setItem("selectedCourse", JSON.stringify(course));
    location.reload();
  }

  loadPosts() {
    const posts = this.getCourseAnnouncements();

    if (posts.length === 0) {
      if (this.elements.noPosts) this.elements.noPosts.style.display = "block";
      if (this.elements.streamPosts) this.elements.streamPosts.innerHTML = "";
      return;
    }

    if (this.elements.noPosts) this.elements.noPosts.style.display = "none";
    this.renderPosts(posts);
  }

  getCourseAnnouncements() {
    const courseKey = `announcements_${this.courseId}`;
    return JSON.parse(localStorage.getItem(courseKey) || "[]");
  }

  renderPosts(posts) {
    if (!this.elements.streamPosts) return;

    this.elements.streamPosts.innerHTML = "";

    posts.forEach((post) => {
      const postElement = this.createPostElement(post);
      this.elements.streamPosts.appendChild(postElement);
    });
  }

  createPostElement(post) {
    const postDiv = document.createElement("div");
    postDiv.className = "stream-post";

    const postHeader = document.createElement("div");
    postHeader.className = "post-header";

    const avatar = document.createElement("div");
    avatar.className = "post-avatar";
    avatar.textContent = post.author.charAt(0).toUpperCase();

    const postInfo = document.createElement("div");
    postInfo.className = "post-info";

    const author = document.createElement("div");
    author.className = "post-author";
    author.textContent = post.author;

    const date = document.createElement("div");
    date.className = "post-date";
    date.textContent = post.timestamp;

    postInfo.appendChild(author);
    postInfo.appendChild(date);

    const postMenu = document.createElement("div");
    postMenu.className = "post-menu";
    postMenu.innerHTML = '<span class="material-icons">more_vert</span>';

    postHeader.appendChild(avatar);
    postHeader.appendChild(postInfo);
    postHeader.appendChild(postMenu);

    const postContent = document.createElement("div");
    postContent.className = "post-content";
    postContent.innerHTML = post.content;

    // Add attachments if any
    if (post.attachments && post.attachments.length > 0) {
      const attachmentsDiv = document.createElement("div");
      attachmentsDiv.className = "post-attachments";

      post.attachments.forEach((attachment) => {
        const attachmentElement = this.createAttachmentElement(attachment);
        attachmentsDiv.appendChild(attachmentElement);
      });

      postDiv.appendChild(attachmentsDiv);
    }

    const postActions = document.createElement("div");
    postActions.className = "post-actions";

    const likeCount = document.createElement("span");
    likeCount.className = "like-count";
    likeCount.innerHTML =
      '<span class="material-icons">thumb_up</span> ' + post.likes;

    const commentCount = document.createElement("span");
    commentCount.className = "comment-count";
    commentCount.innerHTML =
      '<span class="material-icons">comment</span> ' + post.comments.length;

    postActions.appendChild(likeCount);
    postActions.appendChild(commentCount);

    postDiv.appendChild(postHeader);
    postDiv.appendChild(postContent);
    postDiv.appendChild(postActions);

    return postDiv;
  }

  createAttachmentElement(attachment) {
    const attachmentDiv = document.createElement("div");
    attachmentDiv.className = "file-item";
    attachmentDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            margin: 8px 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 8px;
            border: 1px solid var(--border-color);
            cursor: pointer;
            transition: var(--transition);
        `;

    const icon = document.createElement("div");
    icon.className = `file-icon ${attachment.icon}`;
    icon.innerHTML = `<span class="material-icons">${this.getFileIcon(
      attachment.type
    )}</span>`;

    const info = document.createElement("div");
    info.className = "file-info";
    info.innerHTML = `
            <div class="file-name">${attachment.name}</div>
            <div class="file-size">${
              attachment.size || attachment.type.toUpperCase()
            }</div>
        `;

    attachmentDiv.appendChild(icon);
    attachmentDiv.appendChild(info);

    // Add click handler for links
    if (attachment.url) {
      attachmentDiv.addEventListener("click", () => {
        window.open(attachment.url, "_blank");
      });

      attachmentDiv.addEventListener("mouseenter", () => {
        attachmentDiv.style.transform = "translateY(-2px)";
        attachmentDiv.style.boxShadow = "var(--shadow-medium)";
      });

      attachmentDiv.addEventListener("mouseleave", () => {
        attachmentDiv.style.transform = "translateY(0)";
        attachmentDiv.style.boxShadow = "none";
      });
    }

    return attachmentDiv;
  }

  createRippleEffect(element) {
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  setupTooltips() {
    // Tooltip functionality for enhanced UX
  }

  setupKeyboardShortcuts() {
    // Enhanced keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Enter to post announcement
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        this.elements.editorContent
      ) {
        e.preventDefault();
        this.postAnnouncement();
      }

      // Escape to cancel announcement
      if (
        e.key === "Escape" &&
        this.elements.announcementFormExpanded?.style.display === "block"
      ) {
        this.cancelAnnouncement();
      }
    });
  }

  setupAutoSave() {
    // Auto-save announcement draft functionality
    let autoSaveTimer;

    if (this.elements.editorContent) {
      this.elements.editorContent.addEventListener("input", () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
          const content = this.elements.editorContent.innerHTML;
          if (content.trim()) {
            localStorage.setItem("announcement_draft", content);
          }
        }, 1000);
      });
    }
  }

  setupThemeDetection() {
    // Dark/Light theme detection and application
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    if (prefersDarkScheme.matches) {
      document.body.classList.add("dark-theme");
    }

    prefersDarkScheme.addEventListener("change", (e) => {
      if (e.matches) {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    });
  }

  setupProgressIndicators() {
    // Loading progress indicators for better UX
  }

  setupNotificationSystem() {
    // Real-time notification system
  }

  handleClickOutside(e) {
    // Enhanced click outside handling
    const modal = document.querySelector(".selection-modal.active");
    if (modal && e.target === modal) {
      this.closeRecipientModal();
    }

    // Handle click outside for create options overlay
    if (
      this.elements.createOptionsOverlay &&
      this.elements.createOptionsOverlay.classList.contains("active")
    ) {
      const createOptionsCard =
        this.elements.createOptionsOverlay.querySelector(
          ".create-options-card"
        );
      if (
        createOptionsCard &&
        !createOptionsCard.contains(e.target) &&
        e.target !== this.elements.createClassworkBtn &&
        e.target !== this.elements.createClassworkBtnEmpty
      ) {
        this.hideCreateOptions();
      }
    }
  }

  handleResize() {
    // Enhanced responsive behavior
    const sidebar = this.elements.sidebar;
    const contentWrapper = this.elements.contentWrapper;

    if (window.innerWidth <= 1024) {
      sidebar.classList.remove("open");
      contentWrapper.classList.remove("sidebar-open");
    }
  }

  // Classwork Tab related methods
  showCreateOptions() {
    if (this.elements.createOptionsOverlay) {
      this.elements.createOptionsOverlay.classList.add("active");
    }
  }

  hideCreateOptions() {
    if (this.elements.createOptionsOverlay) {
      this.elements.createOptionsOverlay.classList.remove("active");
    }
  }

  handleCreateOptionClick(event) {
    const type = event.currentTarget.dataset.type;
    this.hideCreateOptions(); // Hide the overlay first

    switch (type) {
      case "assignment":
        this.showAssignmentCreationPage();
        break;
      case "quiz":
        this.showNotification("কুইজ অ্যাসাইনমেন্ট তৈরি করা হবে", "info");
        break;
      case "question":
        this.showNotification("প্রশ্ন তৈরি করা হবে", "info");
        break;
      case "material":
        this.showNotification("উপকরণ তৈরি করা হবে", "info");
        break;
      case "reuse":
        this.showNotification("পোস্ট পুনরায় ব্যবহার করুন", "info");
        break;
      case "topic":
        this.showNotification("বিষয় তৈরি করা হবে", "info");
        break;
      default:
        this.showNotification("অজানা বিকল্প", "error");
    }
  }

  showAssignmentCreationPage() {
    if (this.elements.assignmentCreationPage) {
      this.elements.assignmentCreationPage.style.display = "block";
      this.elements.classworkContent.style.display = "none"; // Hide the main classwork content

      // Initialize Bootstrap tooltips for assignment creation page
      const tooltipTriggerList = [].slice.call(
        this.elements.assignmentCreationPage.querySelectorAll(
          '[data-bs-toggle="tooltip"]'
        )
      );
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });

      // Set default due date (tomorrow)
      if (this.elements.dueDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.elements.dueDate.value = tomorrow.toISOString().split("T")[0];
      }

      // Add smooth scrolling for focus events
      if (this.elements.assignmentTitle) {
        this.elements.assignmentTitle.addEventListener("focus", () => {
          this.elements.assignmentTitle.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      }
      // অ্যাসাইনমেন্ট তৈরির ফর্ম খোলার সময় কোর্স ড্রপডাউন পপুলেট করুন
      this.populateCourseDropdown();
    }
  }

  hideAssignmentCreationPage() {
    if (this.elements.assignmentCreationPage) {
      this.elements.assignmentCreationPage.style.display = "none";
      this.elements.classworkContent.style.display = "block"; // Show the main classwork content
    }
  }

  // Existing methods from classwork.js, now part of CourseDetailManager
  // Make sure these methods are defined within the CourseDetailManager class
  // and use 'this.elements' for element access.

  formatText(command) {
    document.execCommand(command, false, null);
    if (this.elements.instructionsEditor) {
      this.elements.instructionsEditor.focus();
    }
  }

  // handleFileUpload is already defined above for quick icons, but this is the one for the form
  // It calls handleFileSelect
  // openFileUpload is also defined above

  openLinkAttach() {
    if (this.elements.linkModal) {
      this.elements.linkModal.show();
    }
  }

  openYouTubeAttach() {
    if (this.elements.youtubeModal) {
      this.elements.youtubeModal.show();
    }
  }

  openDriveAttach() {
    this.showNotification(
      "Google Drive integration would open here in a real implementation",
      "info"
    );
  }

  openCreateNew() {
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
      this.showNotification(`Creating new ${choice} document...`, "success");
    }
  }

  addLink() {
    const url = this.elements.linkUrl.value;
    const title = this.elements.linkTitle.value || url;
    if (url) {
      this.attachments.push({
        type: "link",
        url: url,
        title: title,
      });
      this.updateAttachments();
      if (this.elements.linkModal) {
        this.elements.linkModal.hide();
      }
      this.elements.linkUrl.value = "";
      this.elements.linkTitle.value = "";
      this.showNotification("Link attached successfully", "success");
    }
  }

  addYouTube() {
    const url = this.elements.youtubeUrl.value;
    if ((url && url.includes("youtube.com")) || url.includes("youtu.be")) {
      this.attachments.push({
        type: "youtube",
        url: url,
        title: "YouTube Video",
      });
      this.updateAttachments();
      if (this.elements.youtubeModal) {
        this.elements.youtubeModal.hide();
      }
      this.elements.youtubeUrl.value = "";
      this.showNotification("YouTube video attached successfully", "success");
    } else {
      this.showNotification("Please enter a valid YouTube URL", "error");
    }
  }

  openStudentSelection() {
    if (this.elements.studentModal) {
      // স্টুডেন্ট মোডাল খোলার আগে স্টুডেন্ট তালিকা পপুলেট করুন
      this.populateStudentSelectionModal();
      this.elements.studentModal.show();
    }
  }

  populateStudentSelectionModal() {
    const studentListDiv = document.getElementById("studentList");
    if (!studentListDiv) return;

    studentListDiv.innerHTML = ""; // বিদ্যমান চেকবক্সগুলো মুছে ফেলুন

    // বর্তমানে নির্বাচিত কোর্স থেকে শিক্ষার্থীদের ফিল্টার করুন
    const selectedCourseId = this.elements.courseSelect.value;
    const selectedCourse = this.availableCourses.find(
      (course) => course.id === selectedCourseId
    );

    let studentsForSelectedCourse = [];
    if (
      selectedCourse &&
      selectedCourse.students &&
      Array.isArray(selectedCourse.students)
    ) {
      studentsForSelectedCourse = selectedCourse.students;
    }

    if (studentsForSelectedCourse.length === 0) {
      studentListDiv.innerHTML =
        '<p class="text-muted">এই কোর্সে কোনো শিক্ষার্থী নেই।</p>';
      // "Specific students" অপশনটি নিষ্ক্রিয় করুন যদি কোনো শিক্ষার্থী না থাকে
      document.getElementById("specificStudents").disabled = true;
      document.getElementById("allStudents").checked = true; // "All students" নির্বাচন করুন
      this.updateAssignType(); // UI আপডেট করুন
      return;
    } else {
      document.getElementById("specificStudents").disabled = false;
    }

    studentsForSelectedCourse.forEach((studentName, index) => {
      const studentCheckboxDiv = document.createElement("div");
      studentCheckboxDiv.className = "form-check";

      const checkboxId = `student_${index}`;
      studentCheckboxDiv.innerHTML = `
        <input class="form-check-input" type="checkbox" id="${checkboxId}" value="${studentName}">
        <label class="form-check-label" for="${checkboxId}">${studentName}</label>
      `;
      studentListDiv.appendChild(studentCheckboxDiv);

      // পূর্বে নির্বাচিত শিক্ষার্থীদের চেক করুন
      if (!this.assignToAll && this.selectedStudents.includes(studentName)) {
        studentCheckboxDiv.querySelector(`#${checkboxId}`).checked = true;
      }
    });

    // "All students" বা "Specific students" রেডিও বাটনগুলোর অবস্থা সেট করুন
    document.getElementById("allStudents").checked = this.assignToAll;
    document.getElementById("specificStudents").checked = !this.assignToAll;
    this.updateAssignType(); // UI আপডেট করুন
  }

  updateAssignType() {
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

  updateStudentAssignment() {
    const assignType = document.querySelector(
      'input[name="assignType"]:checked'
    ).value;
    if (assignType === "all") {
      this.assignToAll = true;
      this.elements.assignToText.textContent = "All students";
      this.selectedStudents = []; // সমস্ত শিক্ষার্থী নির্বাচিত হলে নির্দিষ্ট তালিকা খালি করুন
    } else {
      const checkboxes = document.querySelectorAll(
        '#studentList input[type="checkbox"]:checked'
      );
      this.selectedStudents = Array.from(checkboxes).map(
        (cb) => cb.value // এখানে value অ্যাট্রিবিউট ব্যবহার করুন যা শিক্ষার্থীর নাম ধারণ করে
      );
      if (this.selectedStudents.length > 0) {
        this.assignToAll = false;
        const text =
          this.selectedStudents.length === 1
            ? this.selectedStudents[0]
            : `${this.selectedStudents.length} জন শিক্ষার্থী`; // বাংলাতে পরিবর্তন
        this.elements.assignToText.textContent = text;
      } else {
        this.showNotification(
          "অনুগ্রহ করে কমপক্ষে একজন শিক্ষার্থী নির্বাচন করুন",
          "error"
        ); // বাংলাতে পরিবর্তন
        return;
      }
    }
    if (this.elements.studentModal) {
      this.elements.studentModal.hide();
    }
  }

  updateAttachments() {
    console.log("Attachments updated:", this.attachments);
  }

  createRubric() {
    this.showNotification(
      "Rubric creation interface would open here in a real implementation",
      "info"
    );
  }

  // This is the main createAssignment function for the form
  createAssignment() {
    const title = this.elements.assignmentTitle.value.trim();
    const instructions = this.elements.instructionsEditor.innerHTML;
    const course = this.elements.courseSelect.value;
    const points = this.elements.pointsSelect.value;
    const dueDate = this.elements.dueDate.value;
    const topic = this.elements.topicSelect.value;

    if (!title) {
      if (this.elements.titleError) {
        this.elements.titleError.classList.remove("d-none");
      }
      if (this.elements.assignmentTitle) {
        this.elements.assignmentTitle.focus();
        this.elements.assignmentTitle.scrollIntoView({ behavior: "smooth" });
      }
      return;
    } else {
      if (this.elements.titleError) {
        this.elements.titleError.classList.add("d-none");
      }
    }

    const assignment = {
      title: title,
      instructions: instructions,
      course: course,
      points: points,
      dueDate: dueDate,
      topic: topic,
      assignToAll: this.assignToAll,
      selectedStudents: this.selectedStudents,
      attachments: this.attachments,
      createdAt: new Date().toISOString(),
    };

    console.log("Creating assignment:", assignment);
    this.showNotification(
      `Assignment "${title}" has been created successfully!`,
      "success"
    );

    // Reset form and hide assignment creation page
    this.resetAssignmentForm();
    this.hideAssignmentCreationPage();
    this.loadAssignments(); // Reload assignments for the classwork tab
  }

  resetAssignmentForm() {
    if (this.elements.assignmentTitle) this.elements.assignmentTitle.value = "";
    if (this.elements.instructionsEditor)
      this.elements.instructionsEditor.innerHTML = "";
    this.attachments = [];
    this.assignToAll = true;
    if (this.elements.assignToText)
      this.elements.assignToText.textContent = "All students";
    if (this.elements.pointsSelect) this.elements.pointsSelect.value = "100";
    if (this.elements.dueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.elements.dueDate.value = tomorrow.toISOString().split("T")[0];
    }
    if (this.elements.topicSelect) this.elements.topicSelect.value = "No topic";

    // অ্যাসাইনমেন্ট ফর্ম রিসেট করার সময় কোর্স ড্রপডাউন পুনরায় পপুলেট করুন
    this.populateCourseDropdown();
  }

  loadAssignments() {
    const assignments = this.getCourseAssignments();

    if (assignments.length === 0) {
      if (this.elements.noClasswork)
        this.elements.noClasswork.style.display = "block";
      if (this.elements.assignmentsList)
        this.elements.assignmentsList.innerHTML = "";
    } else {
      if (this.elements.noClasswork)
        this.elements.noClasswork.style.display = "none";
      this.renderAssignments(assignments);
    }
  }

  getCourseAssignments() {
    const courseKey = `assignments_${this.courseId}`;
    return JSON.parse(localStorage.getItem(courseKey) || "[]");
  }

  renderAssignments(assignments) {
    if (!this.elements.assignmentsList) return;
    this.elements.assignmentsList.innerHTML = "";

    assignments.forEach((assignment) => {
      const assignmentItem = document.createElement("div");
      assignmentItem.className = "assignment-item";
      assignmentItem.innerHTML = `
        <div class="assignment-header">
            <div class="assignment-info">
                <h3>${assignment.title}</h3>
                <div class="assignment-meta">
                    <span>${assignment.points} পয়েন্ট</span>
                    <span>${
                      assignment.dueDate
                        ? `শেষ তারিখ: ${assignment.dueDate}`
                        : "কোন শেষ তারিখ নেই"
                    }</span>
                </div>
            </div>
            <div class="assignment-actions">
                <button class="assignment-btn btn-view">
                    <span class="material-icons">visibility</span>
                    দেখুন
                </button>
                <button class="assignment-btn btn-edit">
                    <span class="material-icons">edit</span>
                    সম্পাদনা করুন
                </button>
            </div>
        </div>
        <div class="assignment-description">
            ${assignment.instructions || "কোন নির্দেশনা নেই।"}
        </div>
      `;
      this.elements.assignmentsList.appendChild(assignmentItem);
    });
  }

  saveAssignmentToCourse(assignment, courseId) {
    const courseKey = `assignments_${courseId}`;
    const assignments = JSON.parse(localStorage.getItem(courseKey) || "[]");
    assignments.unshift(assignment);
    localStorage.setItem(courseKey, JSON.stringify(assignments));
  }
}

// Global reference for easy access
let courseManager;

// Initialize the course detail manager
document.addEventListener("DOMContentLoaded", () => {
  courseManager = new CourseDetailManager();
});

// Additional utility functions
window.addEventListener("beforeunload", (e) => {
  // Save any unsaved changes
  if (courseManager && courseManager.elements.editorContent) {
    const content = courseManager.elements.editorContent.innerHTML;
    if (content.trim()) {
      localStorage.setItem("announcement_draft", content);
    }
  }
});

// Service Worker for offline functionality (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Performance monitoring
window.addEventListener("load", () => {
  if (window.performance && window.performance.getEntriesByType) {
    const navigationEntries = window.performance.getEntriesByType("navigation");
    if (navigationEntries.length > 0) {
      console.log(
        "Page load time:",
        navigationEntries[0].loadEventEnd - navigationEntries[0].loadEventStart,
        "ms"
      );
    }
  }
});
