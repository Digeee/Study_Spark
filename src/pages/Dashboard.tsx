import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Target, 
  Zap, 
  Calendar,
  Plus,
  BarChart3,
  Brain,
  FileText,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { ParticleField, MorphingBlob, GradientText, ShimmerButton } from "@/components/PremiumUI";

export default function Dashboard() {
  const navigate = useNavigate();
  const [studyStats] = useState({
    totalHours: 24.5,
    streak: 7,
    completedSessions: 42,
    productivityScore: 87,
    level: 3,
    xp: 1250,
    xpToNext: 250
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Particle Background */}
      <ParticleField className="fixed inset-0 -z-10" density="medium">
        <div className="w-full h-full" />
      </ParticleField>
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <GradientText 
            className="text-4xl font-bold"
            variant="rainbow"
          >
            Study Spark
          </GradientText>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/premium')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Premium Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/notebook')}
              variant="outline"
            >
              Notebook
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <MorphingBlob 
            className="absolute -top-20 -right-20 w-96 h-96 opacity-20"
            color="from-purple-400 to-blue-400"
          />
          <div className="relative">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, Scholar! 🌟
            </h2>
            <p className="text-gray-600 text-lg">
              Ready to spark your learning journey today?
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="glass-card hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
              <Zap className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studyStats.totalHours}h</div>
              <p className="text-xs text-gray-500">This week</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Day Streak</CardTitle>
              <Target className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studyStats.streak} 🔥</div>
              <p className="text-xs text-gray-500">Keep it going!</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <BarChart3 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studyStats.completedSessions}</div>
              <p className="text-xs text-gray-500">Completed</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Productivity</CardTitle>
              <Brain className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studyStats.productivityScore}%</div>
              <p className="text-xs text-gray-500">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="mb-12 p-6 glass-card rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Your Learning Journey</h3>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600">Level {studyStats.level}</div>
              <div className="text-sm text-gray-600">{studyStats.xp} XP</div>
              <div className="text-xs text-gray-500">Next level: {studyStats.xpToNext} XP</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full" 
              style={{ width: `${(studyStats.xp / (studyStats.xp + studyStats.xpToNext)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Study Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Quick Study Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ShimmerButton 
                onClick={() => navigate('/add-study')}
                variant="primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Study Session
              </ShimmerButton>
              
              <Button 
                onClick={() => navigate('/focus-mode')}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              >
                <Target className="h-4 w-4 mr-2" />
                Start Focus Mode
              </Button>
              
              <Button 
                onClick={() => navigate('/documents')}
                variant="outline" 
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Browse Documents
              </Button>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                AI-Powered Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/ai-coach')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Brain className="h-4 w-4 mr-2" />
                Chat with AI Coach
              </Button>
              
              <Button 
                onClick={() => navigate('/quiz-generator')}
                variant="outline" 
                className="w-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Practice Quiz
              </Button>
              
              <Button 
                onClick={() => navigate('/notebook')}
                variant="outline" 
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Smart Notebook
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Preview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/achievements')}
                className="text-purple-600 hover:text-purple-700"
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl">🏆</div>
                <div className="text-sm font-medium">7-Day Streak</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl">📚</div>
                <div className="text-sm font-medium">100+ Hours</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl">⭐</div>
                <div className="text-sm font-medium">Level 3</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl">🎯</div>
                <div className="text-sm font-medium">Focus Master</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p>Made with ❤️ for lifelong learners</p>
        </div>
      </main>
    </div>
  );
}