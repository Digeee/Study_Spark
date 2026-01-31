import { StudySession, DailyStats, WeeklyStats, UserStats, Badge, SmartInsight, PomodoroSession } from "@/types/study";
import { format, subDays, parseISO, isYesterday, isToday, differenceInDays, startOfDay } from "date-fns";

export function getDailyStats(sessions: StudySession[], date: string): DailyStats {
  const daySessions = sessions.filter((s) => s.study_date === date);
  const subjects = [...new Set(daySessions.map((s) => s.subject))];
  const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration_minutes, 0);

  return {
    date,
    totalMinutes,
    sessions: daySessions.length,
    subjects,
  };
}

export function getWeeklyStats(sessions: StudySession[]): WeeklyStats {
  const days: DailyStats[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    days.push(getDailyStats(sessions, date));
  }

  const totalMinutes = days.reduce((sum, d) => sum + d.totalMinutes, 0);
  const avgMinutesPerDay = Math.round(totalMinutes / 7);

  // Find most studied subject
  const subjectCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + s.duration_minutes;
  });
  const mostStudiedSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  const sessionsWithGoals = sessions.filter((s) => s.goal && s.goal.trim().length > 0).length;

  return {
    days,
    totalMinutes,
    avgMinutesPerDay,
    mostStudiedSubject,
    sessionsWithGoals,
  };
}

export function calculateStreak(sessions: StudySession[]): { current: number; longest: number } {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  // Get unique study dates sorted descending
  const studyDates = [...new Set(sessions.map((s) => s.study_date))].sort((a, b) => b.localeCompare(a));

  if (studyDates.length === 0) return { current: 0, longest: 0 };

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  // Check if streak is active (studied today or yesterday)
  const streakActive = studyDates[0] === today || studyDates[0] === yesterday;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate streaks
  for (let i = 0; i < studyDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = parseISO(studyDates[i - 1]);
      const currDate = parseISO(studyDates[i]);
      const dayDiff = differenceInDays(prevDate, currDate);

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        if (i <= 1 || (i === 1 && streakActive)) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  
  if (streakActive) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }

  return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) };
}

export function calculateProductivityScore(
  todayMinutes: number,
  currentStreak: number,
  hasGoalToday: boolean
): number {
  let score = 0;

  // Study time component (up to 40 points)
  if (todayMinutes >= 120) {
    score += 40;
  } else {
    score += Math.round((todayMinutes / 120) * 40);
  }

  // Streak component (up to 30 points)
  if (currentStreak >= 3) {
    score += 30;
  } else {
    score += currentStreak * 10;
  }

  // Goal component (30 points)
  if (hasGoalToday) {
    score += 30;
  }

  return Math.min(100, score);
}

export function calculateLevel(totalMinutes: number): { level: number; xp: number; xpToNextLevel: number } {
  const xp = totalMinutes; // 1 XP per minute
  const xpPerLevel = 60; // 60 minutes per level
  const level = Math.floor(xp / xpPerLevel) + 1;
  const xpInCurrentLevel = xp % xpPerLevel;
  const xpToNextLevel = xpPerLevel - xpInCurrentLevel;

  return { level, xp, xpToNextLevel };
}

export function calculateBadges(
  currentStreak: number,
  totalHours: number,
  sessionsWithGoals: number,
  pomodoroCount: number
): Badge[] {
  return [
    {
      id: "bronze-streak",
      name: "Bronze Streak",
      emoji: "🥉",
      description: "Achieved a 3-day study streak",
      requirement: "3-day streak",
      earned: currentStreak >= 3,
    },
    {
      id: "silver-streak",
      name: "Silver Streak",
      emoji: "🥈",
      description: "Achieved a 5-day study streak",
      requirement: "5-day streak",
      earned: currentStreak >= 5,
    },
    {
      id: "gold-streak",
      name: "Gold Streak",
      emoji: "🥇",
      description: "Achieved a 7-day study streak",
      requirement: "7-day streak",
      earned: currentStreak >= 7,
    },
    {
      id: "bookworm",
      name: "Bookworm",
      emoji: "📚",
      description: "Studied for 10 total hours",
      requirement: "10 hours studied",
      earned: totalHours >= 10,
    },
    {
      id: "goal-getter",
      name: "Goal Getter",
      emoji: "🎯",
      description: "Completed 5 sessions with goals",
      requirement: "5 sessions with goals",
      earned: sessionsWithGoals >= 5,
    },
    {
      id: "focus-master",
      name: "Focus Master",
      emoji: "⚡",
      description: "Completed 5 pomodoro sessions",
      requirement: "5 pomodoro sessions",
      earned: pomodoroCount >= 5,
    },
  ];
}

export function generateInsights(
  todayMinutes: number,
  currentStreak: number,
  productivityScore: number,
  weeklyStats: WeeklyStats
): SmartInsight[] {
  const insights: SmartInsight[] = [];

  // Low study time warning
  if (todayMinutes < 60 && todayMinutes > 0) {
    insights.push({
      id: "low-time",
      type: "tip",
      title: "Boost Your Focus",
      message: "Try increasing your study time to at least 1 hour for better results.",
      emoji: "💡",
    });
  }

  // No study today
  if (todayMinutes === 0) {
    insights.push({
      id: "no-study",
      type: "warning",
      title: "Start Your Day",
      message: "You haven't studied yet today. Even 15 minutes can make a difference!",
      emoji: "⏰",
    });
  }

  // Streak encouragement
  if (currentStreak >= 5) {
    insights.push({
      id: "great-streak",
      type: "success",
      title: "Amazing Streak!",
      message: `You're on fire! ${currentStreak} days and counting 🔥`,
      emoji: "🏆",
    });
  } else if (currentStreak >= 3) {
    insights.push({
      id: "good-streak",
      type: "encouragement",
      title: "Keep It Going!",
      message: `${currentStreak}-day streak! You're building great habits.`,
      emoji: "💪",
    });
  } else if (currentStreak === 0) {
    insights.push({
      id: "restart-streak",
      type: "encouragement",
      title: "Fresh Start",
      message: "Every expert was once a beginner. Start your streak today! 💪",
      emoji: "🌟",
    });
  }

  // Productivity score feedback
  if (productivityScore < 50) {
    insights.push({
      id: "improve-productivity",
      type: "tip",
      title: "Room to Grow",
      message: "Try shorter, focused sessions with clear goals to boost your score.",
      emoji: "📈",
    });
  } else if (productivityScore >= 80) {
    insights.push({
      id: "high-productivity",
      type: "success",
      title: "Top Performer!",
      message: "Your productivity is excellent. Keep up the amazing work!",
      emoji: "⭐",
    });
  }

  // Weekly pattern insights
  if (weeklyStats.totalMinutes > 0) {
    const avgDaily = weeklyStats.avgMinutesPerDay;
    if (avgDaily >= 60) {
      insights.push({
        id: "consistent-learner",
        type: "success",
        title: "Consistent Learner",
        message: `You average ${Math.round(avgDaily)} minutes daily. That's dedication!`,
        emoji: "📊",
      });
    }
  }

  return insights.slice(0, 4); // Return max 4 insights
}

export function getUserStats(
  sessions: StudySession[],
  pomodoroSessions: PomodoroSession[]
): UserStats {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayStats = getDailyStats(sessions, today);
  const weeklyStats = getWeeklyStats(sessions);
  const { current: currentStreak, longest: longestStreak } = calculateStreak(sessions);
  
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const { level, xp, xpToNextLevel } = calculateLevel(totalMinutes);
  
  const todayHasGoal = sessions.some((s) => s.study_date === today && s.goal && s.goal.trim().length > 0);
  const productivityScore = calculateProductivityScore(todayStats.totalMinutes, currentStreak, todayHasGoal);
  
  const badges = calculateBadges(
    currentStreak,
    totalMinutes / 60,
    weeklyStats.sessionsWithGoals,
    pomodoroSessions.length
  );

  return {
    currentStreak,
    longestStreak,
    totalMinutes,
    totalSessions: sessions.length,
    level,
    xp,
    xpToNextLevel,
    productivityScore,
    badges,
    pomodoroCount: pomodoroSessions.length,
  };
}
