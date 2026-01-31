import { StudySession, PomodoroSession } from "@/types/study";

/**
 * Initialize default data for new users
 * This ensures new users have a good starting experience
 */
export function initializeUserData() {
  const userDataInitialized = localStorage.getItem("userDataInitialized");
  
  if (userDataInitialized) {
    return false; // Already initialized
  }

  try {
    // Initialize with sample data to demonstrate features
    const sampleSessions: StudySession[] = [
      {
        id: "sample-1",
        subject: "Mathematics",
        duration_minutes: 45,
        goal: "Review calculus derivatives",
        study_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        aiGenerated: false
      },
      {
        id: "sample-2",
        subject: "Physics",
        duration_minutes: 30,
        goal: "Complete chapter 5 exercises",
        study_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        created_at: new Date(Date.now() - 86400000).toISOString(),
        aiGenerated: false
      }
    ];

    const samplePomodoroSessions: PomodoroSession[] = [
      {
        id: "pomo-sample-1",
        duration_minutes: 25,
        completed_at: new Date().toISOString(),
        study_date: new Date().toISOString().split('T')[0]
      }
    ];

    // Save to localStorage
    localStorage.setItem("study_sessions", JSON.stringify(sampleSessions));
    localStorage.setItem("pomodoro_sessions", JSON.stringify(samplePomodoroSessions));
    
    // Mark as initialized
    localStorage.setItem("userDataInitialized", "true");
    
    console.log("✅ User data initialized with sample sessions");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize user data:", error);
    return false;
  }
}

/**
 * Reset all user data (for testing purposes)
 */
export function resetUserData() {
  const keysToRemove = [
    "study_sessions",
    "pomodoro_sessions",
    "study-documents",
    "document-analyses",
    "document-flashcards",
    "userDataInitialized",
    "hasSeenOnboarding"
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log("🔄 User data reset completed");
}

/**
 * Get initialization status
 */
export function isUserDataInitialized(): boolean {
  return localStorage.getItem("userDataInitialized") === "true";
}

/**
 * Create a welcome session for brand new users
 */
export function createWelcomeSession(): StudySession {
  return {
    id: `welcome-${Date.now()}`,
    subject: "Getting Started",
    duration_minutes: 15,
    goal: "Explore Study Spark features",
    study_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    aiGenerated: true
  };
}