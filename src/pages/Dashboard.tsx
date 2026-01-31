import { useStudySessions } from "@/hooks/useStudySessions";
import { usePomodoroSessions } from "@/hooks/usePomodoroSessions";
import { getUserStats, getWeeklyStats, getDailyStats, generateInsights } from "@/lib/calculations";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { StreakBadge } from "@/components/StreakBadge";
import { ProductivityScore } from "@/components/ProductivityScore";
import { StudyChart } from "@/components/StudyChart";
import { SubjectChart } from "@/components/SubjectChart";
import { RecentActivity } from "@/components/RecentActivity";
import { SmartInsights } from "@/components/SmartInsights";
import { BadgeGrid } from "@/components/BadgeGrid";
import { LevelProgress } from "@/components/LevelProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Target, Zap, BookOpen } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { sessions, isLoading: sessionsLoading } = useStudySessions();
  const { sessions: pomodoroSessions, isLoading: pomodoroLoading } = usePomodoroSessions();

  const isLoading = sessionsLoading || pomodoroLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  const stats = getUserStats(sessions, pomodoroSessions);
  const weeklyStats = getWeeklyStats(sessions);
  const today = format(new Date(), "yyyy-MM-dd");
  const todayStats = getDailyStats(sessions, today);
  const insights = generateInsights(
    todayStats.totalMinutes,
    stats.currentStreak,
    stats.productivityScore,
    weeklyStats
  );

  const formatStudyTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = (minutes / 60).toFixed(1);
      return `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Welcome back! <span className="inline-block animate-bounce-slow">👋</span>
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <StreakBadge streak={stats.currentStreak} size="sm" />
            <ProductivityScore score={stats.productivityScore} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Today's Study"
            value={formatStudyTime(todayStats.totalMinutes)}
            icon={<Clock className="h-5 w-5" />}
            subtitle={`${todayStats.sessions} session${todayStats.sessions !== 1 ? "s" : ""}`}
            colorClass="text-study-purple"
          />
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            icon={<Zap className="h-5 w-5" />}
            subtitle={stats.currentStreak > 0 ? "Keep it up! 🔥" : "Start today!"}
            colorClass="text-study-orange"
          />
          <StatCard
            title="Level"
            value={stats.level}
            icon={<Target className="h-5 w-5" />}
            subtitle={`${stats.xpToNextLevel} XP to next`}
            colorClass="text-study-blue"
          />
          <StatCard
            title="Total Hours"
            value={(stats.totalMinutes / 60).toFixed(1)}
            icon={<BookOpen className="h-5 w-5" />}
            subtitle={`${stats.totalSessions} sessions total`}
            colorClass="text-study-green"
          />
        </div>

        {/* Level Progress */}
        <LevelProgress
          level={stats.level}
          xp={stats.xp}
          xpToNextLevel={stats.xpToNextLevel}
        />

        {/* Smart Insights */}
        <SmartInsights insights={insights} />

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <StudyChart data={weeklyStats.days} />
          <SubjectChart sessions={sessions} />
        </div>

        {/* Badges Showcase */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>🏆</span> Your Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeGrid badges={stats.badges} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <RecentActivity sessions={sessions} />
      </div>
    </AppLayout>
  );
}
