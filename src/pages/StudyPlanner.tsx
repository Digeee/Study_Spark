import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useStudySessions } from '@/hooks/useStudySessions';
import { useDocuments } from '@/hooks/useDocuments';
import { generateStudyPlan } from '@/integrations/ai/huggingface';
import { StudyPlan, PlannedSession } from '@/types/study';
import {
  Calendar as CalendarIcon,
  Clock,
  Target,
  Brain,
  Plus,
  Trash2,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';

export default function StudyPlanner() {
  const { sessions } = useStudySessions();
  const { documents } = useDocuments();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [availableHours, setAvailableHours] = useState(10);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 7));
  const [goals, setGoals] = useState<string[]>(['']);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PlannedSession | null>(null);

  const addSubject = () => setSubjects([...subjects, '']);
  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const addGoal = () => setGoals([...goals, '']);
  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const generatePlan = async () => {
    const validSubjects = subjects.filter(s => s.trim());
    const validGoals = goals.filter(g => g.trim());

    if (validSubjects.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one subject",
        variant: "destructive"
      });
      return;
    }

    if (startDate >= endDate) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);

      const plan = await generateStudyPlan(
        validSubjects,
        availableHours,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        validGoals.length > 0 ? validGoals : [`Master ${validSubjects.join(', ')}`]
      );

      setGeneratedPlan(plan);
      setStep(2);

      toast({
        title: "Plan Generated!",
        description: `Created a ${plan.totalTime} minute study plan across ${plan.dailySchedule.length} days`
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSessionPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getTotalPlanHours = () => {
    if (!generatedPlan) return 0;
    return Math.ceil(generatedPlan.totalTime / 60);
  };

  const getSessionsForDate = (date: string) => {
    if (!generatedPlan) return [];
    const daySchedule = generatedPlan.dailySchedule.find(d => d.date === date);
    return daySchedule ? daySchedule.sessions : [];
  };

  const formatDateRange = () => {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  if (step === 1) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gradient flex items-center justify-center gap-3">
              <Brain className="h-8 w-8" />
              AI Study Planner
            </h1>
            <p className="text-muted-foreground mt-2">
              Create a personalized study schedule powered by artificial intelligence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Your Subjects
                  </CardTitle>
                  <CardDescription>
                    What topics do you want to study?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Subject ${index + 1}`}
                        value={subject}
                        onChange={(e) => updateSubject(index, e.target.value)}
                        className="flex-1 glass-input"
                      />
                      {subjects.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeSubject(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addSubject}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Study Period
                  </CardTitle>
                  <CardDescription>
                    When do you want to study?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Start Date</Label>
                      <div className="mt-2">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          className="rounded-xl border glass-card mx-auto"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <div className="mt-2">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          className="rounded-xl border glass-card mx-auto"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - More Inputs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Available Time
                  </CardTitle>
                  <CardDescription>
                    How many hours can you dedicate per week?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Total Hours</Label>
                      <Input
                        type="number"
                        min="1"
                        max="40"
                        value={availableHours}
                        onChange={(e) => setAvailableHours(Number(e.target.value))}
                        className="glass-input mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Distribute {availableHours} hours across your study period
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Learning Goals</CardTitle>
                  <CardDescription>
                    What do you want to achieve? (Optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        placeholder={`Goal ${index + 1} (e.g., "Understand calculus fundamentals")`}
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                        className="flex-1 glass-input"
                        rows={2}
                      />
                      {goals.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeGoal(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addGoal}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </CardContent>
              </Card>

              <Button
                onClick={generatePlan}
                disabled={isGenerating}
                className="w-full gradient-primary text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Generate AI Study Plan
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Step 2 - Plan Review
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Your Study Plan</h1>
            <p className="text-muted-foreground mt-2">
              {generatedPlan?.title} • {formatDateRange()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {getTotalPlanHours()} hours total
            </Badge>
            <Button
              variant="outline"
              onClick={() => setStep(1)}
            >
              Edit Plan
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2 space-y-6">
            {generatedPlan?.dailySchedule.map((daySchedule) => (
              <motion.div
                key={daySchedule.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
              >
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg">
                    {format(new Date(daySchedule.date), 'EEEE, MMMM d')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {daySchedule.sessions.length} sessions • {
                      daySchedule.sessions.reduce((total, s) => total + s.estimatedDuration, 0)
                    } minutes
                  </p>
                </div>

                <div className="p-4 space-y-3">
                  {daySchedule.sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${selectedSession?.id === session.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                      onClick={() => setSelectedSession(
                        selectedSession?.id === session.id ? null : session
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{session.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {session.startTime} - {session.endTime} • {session.estimatedDuration} min
                          </p>
                        </div>
                        <Badge className={getSessionPriorityColor(session.priority)}>
                          {session.priority} priority
                        </Badge>
                      </div>
                      {session.goal && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          Goal: {session.goal}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Session Details Sidebar */}
          <div className="space-y-6">
            <Card className="glass-card sticky top-4">
              <CardHeader>
                <CardTitle>Plan Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{generatedPlan?.dailySchedule.length}</p>
                    <p className="text-sm text-muted-foreground">Days</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {generatedPlan?.dailySchedule.reduce((total, day) =>
                        total + day.sessions.length, 0
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Sessions</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Subjects Included</h4>
                  <div className="flex flex-wrap gap-1">
                    {generatedPlan?.subjects.map((subject, idx) => (
                      <Badge key={idx} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full gradient-primary text-white">
                  <Play className="h-4 w-4 mr-2" />
                  Start Studying
                </Button>
              </CardContent>
            </Card>

            {selectedSession && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Session Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">{selectedSession.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedSession.startTime} - {selectedSession.endTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Goal</p>
                    <p className="text-sm text-muted-foreground">{selectedSession.goal}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Duration</span>
                    <Badge>{selectedSession.estimatedDuration} minutes</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Priority</span>
                    <Badge className={getSessionPriorityColor(selectedSession.priority)}>
                      {selectedSession.priority}
                    </Badge>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}