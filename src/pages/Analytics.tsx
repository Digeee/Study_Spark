import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIAnalytics } from '@/hooks/useAIAnalytics';
import { 
  BarChart3, 
  Brain, 
  Target, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  Lightbulb,
  Calendar,
  Award,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function Analytics() {
  const {
    analytics,
    isLoading,
    lastGenerated,
    generateAnalytics,
    getKnowledgeGapRecommendations,
    getOptimalStudySchedule,
    getSubjectPredictions,
    getLearningStyleRecommendations,
    getProductivityPatterns,
    getDaysSinceLastGeneration,
    stats
  } = useAIAnalytics();
  
  const [activeTab, setActiveTab] = useState('insights');

  const knowledgeGaps = getKnowledgeGapRecommendations();
  const optimalSchedule = getOptimalStudySchedule();
  const predictions = getSubjectPredictions();
  const learningStyle = getLearningStyleRecommendations();
  const productivityPatterns = getProductivityPatterns();
  const daysSinceGenerated = getDaysSinceLastGeneration();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  if (isLoading && !analytics) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Generating your AI insights...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
              <BarChart3 className="h-8 w-8" />
              AI Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Intelligent insights to optimize your study journey
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {lastGenerated && (
              <Badge variant="secondary">
                Updated {daysSinceGenerated === 0 ? 'today' : `${daysSinceGenerated} days ago`}
              </Badge>
            )}
            <Button 
              onClick={generateAnalytics} 
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Insights
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b">
          {[
            { id: 'insights', label: 'Key Insights', icon: Brain },
            { id: 'schedule', label: 'Optimal Times', icon: Clock },
            { id: 'predictions', label: 'Predictions', icon: TrendingUp },
            { id: 'patterns', label: 'Patterns', icon: Zap }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Learning Style */}
            {learningStyle && (
              <Card className="glass-card lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Your Learning Style
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge className="text-lg px-3 py-1">
                    {learningStyle.type.replace('/', '/')}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {learningStyle.confidence}%
                  </p>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommended Techniques</h4>
                    <ul className="space-y-1">
                      {learningStyle.studyTechniques.slice(0, 3).map((technique, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {technique}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Knowledge Gaps */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Knowledge Gaps
                </CardTitle>
                <CardDescription>
                  Areas that need more attention based on your study patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {knowledgeGaps.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-green-500 mb-3" />
                    <p className="font-medium">No significant knowledge gaps detected!</p>
                    <p className="text-sm text-muted-foreground">
                      Your study patterns look balanced and comprehensive
                    </p>
                  </div>
                ) : (
                  knowledgeGaps.slice(0, 3).map((gap, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{gap.subject} - {gap.topic}</h4>
                        <Badge className={getUrgencyColor(gap.urgency)}>
                          {gap.urgency} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{gap.recommendation}</p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${100 - gap.confidence}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {100 - gap.confidence}% to master this topic
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Optimal Schedule Tab */}
        {activeTab === 'schedule' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Best Study Times
                </CardTitle>
                <CardDescription>
                  When you're most productive based on your patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {optimalSchedule.length > 0 ? (
                  optimalSchedule.slice(0, 3).map((daySchedule, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                      <h4 className="font-medium mb-2">{getDayName(daySchedule.day)}</h4>
                      <div className="space-y-2">
                        {daySchedule.bestSlots.map((slot, slotIdx) => (
                          <div key={slotIdx} className="flex items-center justify-between text-sm">
                            <span>
                              {slot.hour}:00 - {slot.hour + 1}:00
                            </span>
                            <Badge variant="secondary">
                              {slot.productivityScore}% efficiency
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">Schedule data not available</p>
                    <p className="text-sm text-muted-foreground">
                      Continue studying to build your productivity patterns
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Productivity Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {productivityPatterns.length > 0 ? (
                  productivityPatterns.map((pattern, idx) => (
                    <div key={idx} className="p-4 rounded-lg border">
                      <Badge className="mb-2">{pattern.patternType.replace('_', ' ')}</Badge>
                      <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                      <p className="text-sm font-medium">Recommendation:</p>
                      <p className="text-sm">{pattern.recommendation}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">Pattern analysis pending</p>
                    <p className="text-sm text-muted-foreground">
                      More study data needed for pattern recognition
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Predictions
                </CardTitle>
                <CardDescription>
                  Forecast of your mastery timeline for different subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {predictions.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {predictions.map((prediction, idx) => (
                      <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                        <h4 className="font-medium mb-2">{prediction.subject}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Current Mastery</span>
                              <span>{prediction.predictedMastery}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${prediction.predictedMastery}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <p>
                              <span className="text-muted-foreground">Time to mastery:</span>{' '}
                              {prediction.weeksToMastery} weeks
                            </p>
                            <p>
                              <span className="text-muted-foreground">Recommended:</span>{' '}
                              {prediction.recommendedHours} hrs/week
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Predictions Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Continue logging your study sessions to enable AI-powered progress predictions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Stats Overview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Your Study Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold">{stats.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-lg">
                    <p className="text-2xl font-bold">{stats.totalSessions}</p>
                    <p className="text-sm text-muted-foreground">Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                    <p className="text-2xl font-bold">{stats.totalMinutes}</p>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                  </div>
                  <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                    <p className="text-2xl font-bold">{stats.productivityScore}</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    {
                      icon: Target,
                      title: "Focus on fundamentals",
                      description: "Spend more time on core concepts before advancing"
                    },
                    {
                      icon: Clock,
                      title: "Optimize your schedule",
                      description: "Study during your peak productivity hours"
                    },
                    {
                      icon: Zap,
                      title: "Vary your subjects",
                      description: "Rotate between different topics to maintain engagement"
                    }
                  ].map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                      <rec.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}