import { useStudySessions } from "@/hooks/useStudySessions";
import { usePomodoroSessions } from "@/hooks/usePomodoroSessions";
import { useDocuments } from "@/hooks/useDocuments";
import { getUserStats, getWeeklyStats, getDailyStats, generateInsights } from "@/lib/calculations";
import { initializeUserData, isUserDataInitialized } from "@/lib/user-initialization";
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
import { ParticleField, MorphingBlob, GradientText, ShimmerButton, FloatingCard } from "@/components/PremiumUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Target,
  Zap,
  BookOpen,
  WandSparkles,
  Brain,
  FileText,
  BarChart3,
  Sparkles,
  Plus,
  Calendar,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { SmartInsight } from "@/types/study";
import { useNavigate } from "react-router-dom";
import { OnboardingModal } from "@/components/OnboardingModal";
import { generateAiInsights } from "@/integrations/ai/openai";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { sessions, isLoading: sessionsLoading } = useStudySessions();
  const { sessions: pomodoroSessions, isLoading: pomodoroLoading } = usePomodoroSessions();
  const { getTotalDocuments, getReadyDocuments } = useDocuments();

  const isLoading = sessionsLoading || pomodoroLoading;
  const [aiInsights, setAiInsights] = useState<SmartInsight[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Initialize data for new users
  useEffect(() => {
    if (!isUserDataInitialized()) {
      const initialized = initializeUserData();
      setDataInitialized(initialized);

      // Refresh queries after initialization
      if (initialized) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } else {
      setDataInitialized(true);
    }
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding && sessions.length === 0 && pomodoroSessions.length === 0) {
      // Delay showing onboarding slightly to let the app load
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [sessions.length, pomodoroSessions.length]);

  if (isLoading || !dataInitialized) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Preparing your dashboard...</h2>
            <p className="text-muted-foreground">Setting up your study environment</p>
          </div>
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
  const baseInsights = generateInsights(
    todayStats.totalMinutes,
    stats.currentStreak,
    stats.productivityScore,
    weeklyStats
  );

  async function refreshAI() {
    setAiLoading(true);
    try {
      const i = await generateAiInsights(sessions, pomodoroSessions, stats);
      setAiInsights(i);
    } catch {
      setAiInsights(baseInsights);
    } finally {
      setAiLoading(false);
    }
  }

  const formatStudyTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = (minutes / 60).toFixed(1);
      return `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <AppLayout>
      <div className="space-y-10 pb-10">
        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-study-purple via-study-indigo to-study-blue p-8 md:p-12 text-white shadow-hard">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Learning Assistant</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Ready to excel today, <br />
                <span className="text-white/80">Keep the momentum!</span>
              </h1>
              <p className="text-lg text-white/70 max-w-md">
                You've studied for {formatStudyTime(stats.totalMinutes)} total.
                {stats.currentStreak > 0
                  ? ` Your ${stats.currentStreak}-day streak is looking great!`
                  : " Start your first session today to begin your streak!"}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/documents')}
                  className="bg-white text-study-purple hover:bg-white/90 font-bold rounded-2xl shadow-xl h-14 px-8"
                >
                  <Plus className="mr-2 h-5 w-5" /> Start New Session
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/notebook')}
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white font-semibold rounded-2xl backdrop-blur-md h-14 px-8"
                >
                  <BookOpen className="mr-2 h-5 w-5" /> Open Notebook
                </Button>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 min-w-[160px] text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Streak</p>
                <p className="text-4xl font-black">{stats.currentStreak}</p>
                <p className="text-xs font-medium text-white/40 mt-1">Days</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 min-w-[160px] text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Score</p>
                <p className="text-4xl font-black">{stats.productivityScore}</p>
                <p className="text-xs font-medium text-white/40 mt-1">Productivity</p>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-study-pink/20 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* Quick Stats Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Daily Overview</h2>
            <div className="text-sm font-medium text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              title="Today"
              value={formatStudyTime(todayStats.totalMinutes)}
              icon={<Clock className="h-5 w-5" />}
              subtitle={`${todayStats.sessions} session${todayStats.sessions !== 1 ? "s" : ""}`}
              colorClass="text-study-purple"
            />
            <StatCard
              title="Level"
              value={stats.level}
              icon={<Target className="h-5 w-5" />}
              subtitle={`${stats.xpToNextLevel} XP to next`}
              colorClass="text-study-blue"
            />
            <StatCard
              title="Hours"
              value={(stats.totalMinutes / 60).toFixed(1)}
              icon={<BookOpen className="h-5 w-5" />}
              subtitle={`${stats.totalSessions} sessions`}
              colorClass="text-study-green"
            />
            <StatCard
              title="Streak"
              value={`${stats.currentStreak}d`}
              icon={<Zap className="h-5 w-5" />}
              subtitle="Current streak"
              colorClass="text-study-orange"
            />
            <StatCard
              title="Docs"
              value={getTotalDocuments()}
              icon={<FileText className="h-5 w-5" />}
              subtitle="Library size"
              colorClass="text-study-cyan"
            />
            <StatCard
              title="Ready"
              value={getReadyDocuments()}
              icon={<WandSparkles className="h-5 w-5" />}
              subtitle="AI Analyzed"
              colorClass="text-study-pink"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Learning Hub */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Learning Hub</h2>
                  <p className="text-sm text-muted-foreground mt-1">Your personal AI-powered study toolkit</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Document Library",
                    desc: "Upload, analyze and chat with your study materials",
                    path: "/documents",
                    icon: FileText,
                    color: "bg-blue-500",
                    gradient: "from-blue-500/20 to-indigo-500/20",
                    count: `${getTotalDocuments()} Saved`
                  },
                  {
                    title: "Notebook Guide",
                    desc: "Interactive NotebookLM-style study assistance",
                    path: "/notebook",
                    icon: Sparkles,
                    color: "bg-purple-500",
                    gradient: "from-purple-500/20 to-pink-500/20",
                    count: "AI-Powered"
                  },
                  {
                    title: "Study Planner",
                    desc: "Smart schedules tailored to your goals and pace",
                    path: "/study-planner",
                    icon: Calendar,
                    color: "bg-cyan-500",
                    gradient: "from-cyan-500/20 to-teal-500/20",
                    count: "Dynamic"
                  },
                  {
                    title: "Flashcards",
                    desc: "Master concepts with AI-generated repetition",
                    path: "/flashcards",
                    icon: Brain,
                    color: "bg-orange-500",
                    gradient: "from-orange-500/20 to-red-500/20",
                    count: "Smart Learn"
                  }
                ].map((item, i) => (
                  <Card
                    key={i}
                    onClick={() => navigate(item.path)}
                    className="group cursor-pointer border-none shadow-soft hover:shadow-hard transition-all duration-300 overflow-hidden relative"
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br transition-opacity group-hover:opacity-100 opacity-60", item.gradient)} />
                    <CardContent className="relative p-7">
                      <div className="flex items-start gap-5">
                        <div className={cn("p-4 rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", item.color)}>
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/5">{item.count}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                          <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                            Launch Tool <ChevronRight className="ml-1 h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* AI Insights and Analytics Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Personalized Insights</h2>
                  <p className="text-sm text-muted-foreground mt-1">Smart study metrics tailored to you</p>
                </div>
                <Button
                  variant="outline"
                  onClick={refreshAI}
                  disabled={aiLoading}
                  className="rounded-xl border-primary/20 hover:bg-primary/5 h-11"
                >
                  <WandSparkles className={cn("mr-2 h-4 w-4 text-primary", aiLoading && "animate-spin")} />
                  {aiLoading ? "Analyzing..." : "Refresh Intelligence"}
                </Button>
              </div>

              <SmartInsights insights={(aiInsights.length ? aiInsights : baseInsights) as SmartInsight[]} />

              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="border-none shadow-soft overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-bold">Activity Trends</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <StudyChart data={weeklyStats.days} />
                  </CardContent>
                </Card>
                <Card className="border-none shadow-soft overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-bold">Subject Mix</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <SubjectChart sessions={sessions} />
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-10">
            {/* Level & Progress */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Your Progress</h2>
              <Card className="border-none shadow-soft bg-gradient-to-br from-white to-muted/30 overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <LevelProgress
                    level={stats.level}
                    xp={stats.xp}
                    xpToNextLevel={stats.xpToNextLevel}
                  />

                  <Separator className="bg-muted-foreground/10" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <span>🏆</span> Earned Badges
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/achievements')}
                        className="text-xs text-primary"
                      >
                        View All
                      </Button>
                    </div>
                    <BadgeGrid badges={stats.badges.slice(0, 6)} />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Recent Activity */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
              <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] border border-muted/50 p-2">
                <RecentActivity sessions={sessions.slice(0, 5)} />
              </div>
            </section>

            {/* Focus CTA */}
            <Card className="bg-study-orange text-white border-none shadow-lg overflow-hidden relative group">
              <CardContent className="p-8 relative z-10 flex flex-col items-center text-center">
                <div className="bg-white/20 p-4 rounded-3xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-black mb-1">Deep Work Mode?</h3>
                <p className="text-white/70 text-sm mb-6 max-w-[200px]">Eliminate distractions and hit your daily goals.</p>
                <Button
                  onClick={() => navigate('/focus-mode')}
                  className="w-full bg-white text-study-orange hover:bg-white/90 font-bold rounded-2xl h-12"
                >
                  Enter Focus Zone
                </Button>
              </CardContent>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </Card>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </AppLayout>
  );
}
