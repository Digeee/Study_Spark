import { StudySession, PomodoroSession } from "@/types/study";

const STUDY_SESSIONS_KEY = "study_sessions";
const POMODORO_SESSIONS_KEY = "pomodoro_sessions";

// LocalStorage fallback for offline mode
export const localStorage = {
  getStudySessions: (): StudySession[] => {
    try {
      const data = window.localStorage.getItem(STUDY_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStudySession: (session: StudySession): void => {
    try {
      const sessions = localStorage.getStudySessions();
      sessions.push(session);
      window.localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  },

  deleteStudySession: (id: string): void => {
    try {
      const sessions = localStorage.getStudySessions().filter((s) => s.id !== id);
      window.localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to delete from localStorage:", error);
    }
  },

  getPomodoroSessions: (): PomodoroSession[] => {
    try {
      const data = window.localStorage.getItem(POMODORO_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  savePomodoroSession: (session: PomodoroSession): void => {
    try {
      const sessions = localStorage.getPomodoroSessions();
      sessions.push(session);
      window.localStorage.setItem(POMODORO_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save pomodoro to localStorage:", error);
    }
  },
};
