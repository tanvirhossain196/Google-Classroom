// Cross-browser storage management
class CrossBrowserStorage {
  constructor() {
    this.storageKey = "classroom_global_data";
    this.initializeGlobalStorage();
  }

  initializeGlobalStorage() {
    // Initialize global storage if not exists
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          courses: [],
          users: [],
        })
      );
    }
  }

  // Get all courses from global storage
  getAllCourses() {
    const data = JSON.parse(
      localStorage.getItem(this.storageKey) || '{"courses":[]}'
    );
    return data.courses || [];
  }

  // Add course to global storage
  addCourse(course) {
    const data = JSON.parse(
      localStorage.getItem(this.storageKey) || '{"courses":[]}'
    );
    if (!data.courses) data.courses = [];

    data.courses.push(course);
    localStorage.setItem(this.storageKey, JSON.stringify(data));

    // Broadcast to other tabs/windows
    this.broadcastUpdate("courseAdded", course);
  }

  // Find course by code
  findCourseByCode(code) {
    const courses = this.getAllCourses();
    return courses.find(
      (course) =>
        course.code &&
        course.code.toUpperCase().trim() === code.toUpperCase().trim()
    );
  }

  // Update course
  updateCourse(courseId, updates) {
    const data = JSON.parse(
      localStorage.getItem(this.storageKey) || '{"courses":[]}'
    );
    const courseIndex = data.courses.findIndex((c) => c.id === courseId);

    if (courseIndex !== -1) {
      data.courses[courseIndex] = { ...data.courses[courseIndex], ...updates };
      localStorage.setItem(this.storageKey, JSON.stringify(data));

      // Broadcast update
      this.broadcastUpdate("courseUpdated", data.courses[courseIndex]);
    }
  }

  // Cross-tab communication
  broadcastUpdate(type, data) {
    const updateEvent = new CustomEvent("classroomUpdate", {
      detail: { type, data, timestamp: Date.now() },
    });

    // Store in a temporary key for cross-tab sync
    const syncKey = "classroom_sync_" + Date.now();
    localStorage.setItem(syncKey, JSON.stringify({ type, data }));

    // Clean up sync key after a short delay
    setTimeout(() => {
      localStorage.removeItem(syncKey);
    }, 1000);

    window.dispatchEvent(updateEvent);
  }

  // Listen for updates from other tabs
  listenForUpdates(callback) {
    // Listen for storage events (cross-tab)
    window.addEventListener("storage", (e) => {
      if (e.key && e.key.startsWith("classroom_sync_")) {
        const updateData = JSON.parse(e.newValue || "{}");
        callback(updateData.type, updateData.data);
      }
    });

    // Listen for custom events (same tab)
    window.addEventListener("classroomUpdate", (e) => {
      callback(e.detail.type, e.detail.data);
    });
  }
}

// Global instance
window.crossBrowserStorage = new CrossBrowserStorage();
