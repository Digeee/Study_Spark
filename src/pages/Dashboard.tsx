import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Target,
  BarChart3,
  Brain,
  Sparkles,
  Plus,
  ArrowRight,
  Trophy,
  History,
  BookOpen,
  Calendar,
  Users,
  Timer,
  GraduationCap,
  MessageSquare
} from "lucide-react";
import {
  ParticleField,
  MorphingBlob,
  GradientText,
  ShimmerButton,
  FloatingCard
} from "@/components/PremiumUI";
import { StatCard } from "@/components/StatCard";
import { RecentActivity } from "@/components/RecentActivity";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats] = useState({
    studyHours: "124.5",
    streak: "12",
    completedTasks: "48",
    xpPoints: "2,450",
    level: 5,
    xpToNext: 500,
    currentXP: 320
  });

  const quickActions = [
    { label: "New Study Session", icon: Plus, color: "bg-study-purple", path: "/add-study", desc: "Track your progress manually" },
    { label: "Start Focus Mode", icon: Timer, color: "bg-study-orange", path: "/focus-mode", desc: "Deep work with Pomodoro" },
    { label: "AI Quiz", icon: Brain, color: "bg-study-rose", path: "/quiz-generator", desc: "Test your knowledge" },
    { label: "Check Planner", icon: Calendar, color: "bg-study-cyan", path: "/study-planner", desc: "View your schedule" }
  ];

  const features = [
    { title: "Smart Notebook", icon: Sparkles, path: "/notebook" },
    { title: "Study Buddy", icon: Users, path: "/study-buddy" },
    { title: "AI Coach", icon: Zap, path: "/ai-coach" },
    { title: "Flashcards", icon: GraduationCap, path: "/flashcards" }
  ];

  return (
    <div className="space-y-10 relative">
      <MorphingBlob
        className="fixed top-20 right-20 -z-10 opacity-30"
        color="from-purple-300 via-blue-300 to-pink-300"
        size="lg"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 text-white p-8 md:p-12 shadow-2xl">
        <ParticleField className="absolute inset-0 opacity-40" density="low" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-2xl text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 animate-in slide-in-from-bottom duration-500">
                <Sparkles className="h-4 w-4 text-study-purple fill-current" />
                <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Personalized Learning Path
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-[1.1]">
                Master Your Studies with <br />
                <GradientText variant="rainbow" className="text-5xl md:text-7xl">Study Spark</GradientText>
              </h1>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                Supercharge your learning journey with AI-powered insights, smart organization, and focused study tools designed for modern scholars.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <ShimmerButton
                variant="primary"
                onClick={() => navigate('/focus-mode')}
                className="shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              >
                Start Focusing Now
              </ShimmerButton>
              <Button
                variant="ghost"
                onClick={() => navigate('/documents')}
                className="text-white hover:bg-white/10 rounded-xl px-6 py-6 h-auto font-black uppercase tracking-widest text-xs border border-white/10"
              >
                Enter Library <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative md:block">
            <div className="absolute inset-0 bg-study-purple blur-[80px] opacity-20" />
            <FloatingCard className="relative bg-zinc-800/80 border-white/10 w-72 h-80 flex flex-col items-center justify-center gap-6">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-700" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-study-purple border-t-transparent animate-spin-slow"
                  style={{ '--tw-bg-opacity': '0.5' } as any}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">74%</span>
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Goal</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold opacity-60">Daily Progress</p>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-1.5 w-6 rounded-full ${i <= 3 ? 'bg-study-purple' : 'bg-zinc-700'}`} />
                  ))}
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Study Hours"
          value={stats.studyHours}
          icon={<History className="h-6 w-6" />}
          subtitle="Keep pushing!"
          colorClass="text-study-purple"
        />
        <StatCard
          title="Current Streak"
          value={`${stats.streak} Days`}
          icon={<Zap className="h-6 w-6" />}
          subtitle="Maintain momentum"
          colorClass="text-study-orange"
        />
        <StatCard
          title="Sessions Completed"
          value={stats.completedTasks}
          icon={<Target className="h-6 w-6" />}
          subtitle="Milestones reached"
          colorClass="text-study-green"
        />
        <StatCard
          title="Learning XP"
          value={stats.xpPoints}
          icon={<Trophy className="h-6 w-6" />}
          subtitle="Top 5% this week"
          colorClass="text-study-rose"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Progress Overview */}
          <section className="glass-card rounded-[2rem] p-8 border-none overflow-hidden relative">
            <div className="absolute -top-20 -right-20 h-64 w-64 bg-study-purple blur-[100px] opacity-10" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2">Learning XP Progress</h3>
                <p className="text-muted-foreground font-medium">You're leveling up faster than 80% of users!</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black tracking-tighter text-study-purple">Lvl {stats.level}</span>
                <p className="text-xs font-black uppercase tracking-widest opacity-40 mt-1">{stats.xpToNext - stats.currentXP} XP to go</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-study-purple to-study-blue rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(stats.currentXP / stats.xpToNext) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-40">
                <span>Silver Scholar</span>
                <span>Gold Master</span>
              </div>
            </div>
          </section>

          {/* Core Tools */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black tracking-tight">Core Study Tools</h3>
              <Button variant="link" className="text-study-purple font-black uppercase tracking-widest text-xs">Explore All Tools</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature) => (
                <button
                  key={feature.path}
                  onClick={() => navigate(feature.path)}
                  className="group relative flex flex-col items-center gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/5 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-study-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <feature.icon className="h-6 w-6 text-study-purple" />
                  </div>
                  <span className="text-sm font-black tracking-tight">{feature.title}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <RecentActivity sessions={[]} />
          </section>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <section className="glass-card rounded-[2rem] p-6 border-none">
            <h3 className="text-lg font-black tracking-tight mb-6">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className={`h-10 w-10 rounded-xl ${action.color}/10 flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <action.icon className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold leading-none mb-1">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* AI Insights Widget */}
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-study-purple to-study-indigo p-6 text-white text-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <Brain className="h-10 w-10 mx-auto mb-4 animate-pulse opacity-80" />
            <h3 className="text-lg font-black tracking-tight mb-2 text-white">Ask your AI Coach</h3>
            <p className="text-white/70 text-xs font-medium mb-6 leading-relaxed">
              Feeling stuck on a complex topic? Get instant explanations and study tips from your dedicated AI advisor.
            </p>
            <Button
              className="w-full bg-white text-study-purple hover:bg-white/90 rounded-xl font-black uppercase tracking-widest text-[10px] h-11"
              onClick={() => navigate('/ai-coach')}
            >
              Start Chat <MessageSquare className="ml-2 h-3 w-3" />
            </Button>
          </section>

          <section className="glass-card rounded-[2rem] p-6 border-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-widest opacity-40">System Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="opacity-60">Database Link</span>
                <span className="text-green-500">Connected</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="opacity-60">AI Gateway</span>
                <span className="text-green-500">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="opacity-60">Sync Frequency</span>
                <span className="text-study-purple">Instant</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

