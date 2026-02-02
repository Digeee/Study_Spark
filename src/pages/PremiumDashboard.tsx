import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { OnboardingModal } from "@/components/OnboardingModal";
import { ParticleField, MorphingBlob, GradientText, ShimmerButton, FloatingCard } from "@/components/PremiumUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Clock, Target, Zap, BookOpen, WandSparkles, Brain, FileText, BarChart3, 
  Sparkles, Plus, TrendingUp, Award, Lightbulb, Calendar, Users, 
  MessageSquare, Settings, Bell, Search, Filter
} from "lucide-react";
import { format } from "date-fns";
import { SmartInsight } from "@/types/study";
import { generateAiInsights } from "@/integrations/ai/huggingface";

export default function PremiumDashboard() {
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
            <h2 className="text-xl font-semibold mb-2">Preparing your premium dashboard...</h2>
            <p className="text-muted-foreground">Setting up your enhanced study environment</p>
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
        {/* Premium Welcome Hero Section */}
        <ParticleField className="rounded-3xl overflow-hidden" density="high" interaction={true}>
          <div className="relative bg-gradient-to-br from-study-purple via-study-indigo to-study-blue p-8 md:p-12 text-white shadow-hard">
            {/* Decorative floating elements */}
            <MorphingBlob className="top-6 right-6 opacity-30" size="sm" speed="slow" />
            <MorphingBlob className="bottom-6 left-6 opacity-25" size="sm" speed="normal" color="from-blue-400/30 via-cyan-400/30 to-teal-400/30" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-sm font-semibold shadow-lg">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <GradientText variant="rainbow" size="sm" className="text-white">
                    AI-Powered Learning Assistant
                  </GradientText>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  <span className="block mb-2">
                    <GradientText variant="primary" size="2xl" className="text-white">
                      Ready to excel today?
                    </GradientText>
                  </span>
                  <span className="block text-white/90 font-light">
                    Keep the momentum flowing! 🚀
                  </span>
                </h1>
                
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-md">
                  <div className="flex-1">
                    <p className="text-white/90">
                      You've studied for <span className="font-bold text-white">{formatStudyTime(stats.totalMinutes)}</span> total.
                    </p>
                    <p className="text-sm text-white/70 mt-1">
                      {stats.currentStreak > 0
                        ? `🔥 ${stats.currentStreak}-day streak - amazing job!`
                        : "✨ Start your first session to begin building your streak!"}
                    </p>
                  </div>
                  {stats.currentStreak > 0 && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <ShimmerButton 
                  onClick={() => navigate('/documents')}
                  className="h-14 px-8 text-lg font-bold rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40"
                >
                  <Plus className="mr-2 h-5 w-5" /> New Study Session
                </ShimmerButton>
                
                <ShimmerButton 
                  variant="secondary"
                  onClick={() => navigate('/notebook')}
                  className="h-14 px-8 text-lg font-semibold rounded-2xl border-2 border-white/30 backdrop-blur-md hover:bg-white/20 hover:border-white/40"
                >
                  <Brain className="mr-2 h-5 w-5" /> Notebook LLM
                </ShimmerButton>
              </div>
            </div>
          </div>
        </ParticleField>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FloatingCard delay={0.1} variant="glass">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-foreground">{formatStudyTime(todayStats.totalMinutes)}</p>
                <p className="text-xs text-muted-foreground">{todayStats.sessions} session{todayStats.sessions !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={0.2} variant="glass">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold text-foreground">{stats.currentStreak} days</p>
                <p className="text-xs text-muted-foreground">
                  {stats.currentStreak > 0 ? "Keep it up! 🔥" : "Start today!"}
                </p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={0.3} variant="glass">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold text-foreground">{stats.level}</p>
                <p className="text-xs text-muted-foreground">{stats.xpToNextLevel} XP to next</p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={0.4} variant="glass">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-foreground">{(stats.totalMinutes / 60).toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">{stats.totalSessions} sessions</p>
              </div>
            </div>
          </FloatingCard>
        </div>

        {/* Enhanced Level Progress */}
        <FloatingCard variant="glass">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Level Progress</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  Level {stats.level}
                </span>
                <span className="text-muted-foreground">{stats.xp} XP</span>
              </div>
            </div>
            <LevelProgress
              level={stats.level}
              xp={stats.xp}
              xpToNextLevel={stats.xpToNextLevel}
            />
          </div>
        </FloatingCard>

        {/* Premium AI Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Smart Insights */}
            <FloatingCard variant="glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  AI Insights
                </h3>
                <ShimmerButton 
                  variant="ghost" 
                  onClick={refreshAI} 
                  disabled={aiLoading}
                  className="text-sm"
                >
                  <WandSparkles className="h-4 w-4 mr-2" />
                  {aiLoading ? "Analyzing..." : "Refresh"}
                </ShimmerButton>
              </div>
              <SmartInsights insights={(aiInsights.length ? aiInsights : baseInsights) as SmartInsight[]} />
            </FloatingCard>

            {/* Recent Activity */}
            <FloatingCard variant="glass">
              <RecentActivity sessions={sessions} />
            </FloatingCard>
          </div>

          <div className="space-y-6">
            {/* Badges Showcase */}
            <FloatingCard variant="glass">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Your Badges</h3>
                </div>
                <BadgeGrid badges={stats.badges} />
              </div>
            </FloatingCard>

            {/* Quick Actions */}
            <FloatingCard variant="glass">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <ShimmerButton 
                    variant="secondary" 
                    onClick={() => navigate('/focus-mode')}
                    className="h-12 text-sm"
                  >
                    <Zap className="h-4 w-4 mr-2" /> Focus Mode
                  </ShimmerButton>
                  <ShimmerButton 
                    variant="secondary" 
                    onClick={() => navigate('/analytics')}
                    className="h-12 text-sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" /> Analytics
                  </ShimmerButton>
                  <ShimmerButton 
                    variant="secondary" 
                    onClick={() => navigate('/flashcards')}
                    className="h-12 text-sm"
                  >
                    <Brain className="h-4 w-4 mr-2" /> Flashcards
                  </ShimmerButton>
                  <ShimmerButton 
                    variant="secondary" 
                    onClick={() => navigate('/study-planner')}
                    className="h-12 text-sm"
                  >
                    <Calendar className="h-4 w-4 mr-2" /> Planner
                  </ShimmerButton>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>

        {/* Enhanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FloatingCard variant="glass">
            <StudyChart data={weeklyStats.days} />
          </FloatingCard>
          <FloatingCard variant="glass">
            <SubjectChart sessions={sessions} />
          </FloatingCard>
        </div>

        {/* Onboarding Modal */}
        <OnboardingModal 
          isOpen={showOnboarding} 
          onClose={() => setShowOnboarding(false)} 
        />
      </div>
    </AppLayout>
  );
}