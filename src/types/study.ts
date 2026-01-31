export interface StudySession {
  id: string;
  subject: string;
  duration_minutes: number;
  goal: string | null;
  study_date: string;
  created_at: string;
}

export interface PomodoroSession {
  id: string;
  duration_minutes: number;
  completed_at: string;
  study_date: string;
}

export interface DailyStats {
  date: string;
  totalMinutes: number;
  sessions: number;
  subjects: string[];
}

export interface WeeklyStats {
  days: DailyStats[];
  totalMinutes: number;
  avgMinutesPerDay: number;
  mostStudiedSubject: string;
  sessionsWithGoals: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: string;
  earned: boolean;
  earnedAt?: string;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  totalSessions: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  productivityScore: number;
  badges: Badge[];
  pomodoroCount: number;
}

export interface SmartInsight {
  id: string;
  type: 'warning' | 'success' | 'tip' | 'encouragement';
  title: string;
  message: string;
  emoji: string;
}
