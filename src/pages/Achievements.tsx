import { useStudySessions } from "@/hooks/useStudySessions";
import { usePomodoroSessions } from "@/hooks/usePomodoroSessions";
import { getUserStats, getWeeklyStats } from "@/lib/calculations";
import { AppLayout } from "@/components/AppLayout";
import { BadgeGrid } from "@/components/BadgeGrid";
import { LevelProgress } from "@/components/LevelProgress";
import { StreakBadge } from "@/components/StreakBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, parseISO } from "date-fns";

export default function Achievements() {
  const { sessions, isLoading: sessionsLoading } = useStudySessions();
  const { sessions: pomodoroSessions, isLoading: pomodoroLoading } = usePomodoroSessions();

  const isLoading = sessionsLoading || pomodoroLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  const stats = getUserStats(sessions, pomodoroSessions);
  const weeklyStats = getWeeklyStats(sessions);
  const earnedBadges = stats.badges.filter((b) => b.earned).length;

  // Generate streak calendar data (last 30 days)
  const streakCalendarData: { date: string; hasStudy: boolean; minutes: number }[] = [];
  const studyDates = new Set(sessions.map((s) => s.study_date));
  
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    const dayMinutes = sessions
      .filter((s) => s.study_date === date)
      .reduce((sum, s) => sum + s.duration_minutes, 0);
    streakCalendarData.push({
      date,
      hasStudy: studyDates.has(date),
      minutes: dayMinutes,
    });
  }

  // Find favorite subject
  const subjectCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + s.duration_minutes;
  });
  const favoriteSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet";

  // Find best study day
  const dayStudy: Record<string, number> = {};
  sessions.forEach((s) => {
    const day = format(parseISO(s.study_date), "EEEE");
    dayStudy[day] = (dayStudy[day] || 0) + s.duration_minutes;
  });
  const bestDay = Object.entries(dayStudy).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Achievements & Progress <span>🏆</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your milestones and celebrate your learning journey
          </p>
        </div>

        {/* Streak Showcase */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 text-center">
            <StreakBadge streak={stats.currentStreak} size="lg" />
            <p className="mt-4 text-sm text-muted-foreground">
              Longest streak: <span className="font-bold">{stats.longestStreak} days</span>
            </p>
          </div>
        </Card>

        {/* Level Progress */}
        <LevelProgress
          level={stats.level}
          xp={stats.xp}
          xpToNextLevel={stats.xpToNextLevel}
        />

        {/* Badges Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🎖️</span> Badges
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {earnedBadges} / {stats.badges.length} earned
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeGrid badges={stats.badges} />
          </CardContent>
        </Card>

        {/* Streak Calendar Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>📅</span> Study Streak Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {streakCalendarData.map((day) => {
                const intensity = day.minutes > 0 
                  ? Math.min(1, day.minutes / 120) 
                  : 0;
                return (
                  <div
                    key={day.date}
                    title={`${format(parseISO(day.date), "MMM d")}: ${day.minutes} min`}
                    className="h-6 w-6 rounded-sm transition-all hover:scale-110"
                    style={{
                      backgroundColor: day.hasStudy
                        ? `hsl(var(--study-green) / ${0.3 + intensity * 0.7})`
                        : "hsl(var(--secondary))",
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="h-4 w-4 rounded-sm bg-secondary" />
                <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "hsl(var(--study-green) / 0.3)" }} />
                <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "hsl(var(--study-green) / 0.6)" }} />
                <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "hsl(var(--study-green) / 1)" }} />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>📊</span> Study Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-3xl font-bold text-study-purple">
                  {(stats.totalMinutes / 60).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-3xl font-bold text-study-blue">
                  {stats.totalSessions}
                </p>
                <p className="text-sm text-muted-foreground">Study Sessions</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-xl font-bold text-study-pink">
                  {favoriteSubject}
                </p>
                <p className="text-sm text-muted-foreground">Favorite Subject</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-xl font-bold text-study-orange">
                  {bestDay}
                </p>
                <p className="text-sm text-muted-foreground">Best Study Day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pomodoro Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>🍅</span> Focus Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-study-green">
                  {stats.pomodoroCount}
                </p>
                <p className="text-sm text-muted-foreground">Pomodoros Completed</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-study-cyan">
                  {Math.round(stats.pomodoroCount * 25 / 60)}h
                </p>
                <p className="text-sm text-muted-foreground">Focus Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
