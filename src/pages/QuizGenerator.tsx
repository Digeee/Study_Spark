import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useDocuments } from '@/hooks/useDocuments';
import {
  FileText,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Plus,
  Sparkles,
  RotateCw,
  MessageSquare
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function QuizGenerator() {
  const {
    quizzes,
    currentQuiz,
    currentQuestionIndex,
    quizStarted,
    quizCompleted,
    createQuiz,
    startQuiz,
    submitAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    resetQuiz,
    getQuizResults,
    getCurrentQuestion,
    isAnswered,
    getAnswer,
    getStats
  } = useQuizzes();

  const { documents } = useDocuments();
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    subject: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionCount: 5
  });
  const [userAnswer, setUserAnswer] = useState('');

  const currentQuestion = getCurrentQuestion();
  const results = getQuizResults();
  const stats = getStats();

  const handleCreateQuiz = () => {
    if (!quizForm.title.trim() || !quizForm.subject.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and subject for your quiz",
        variant: "destructive"
      });
      return;
    }

    // Create mock questions for demo
    const mockQuestions = Array.from({ length: quizForm.questionCount }, (_, i) => ({
      id: `q_${Date.now()}_${i}`,
      type: 'short_answer' as const,
      question: `Sample question ${i + 1} about ${quizForm.subject}?`,
      correctAnswer: `Sample answer ${i + 1}`,
      explanation: `This is a sample explanation for question ${i + 1}`,
      difficulty: quizForm.difficulty
    }));

    const newQuiz = createQuiz({
      title: quizForm.title,
      subject: quizForm.subject,
      questions: mockQuestions,
      difficulty: quizForm.difficulty,
      estimatedTime: quizForm.questionCount * 2
    });

    toast({
      title: "Quiz Created",
      description: `Created "${newQuiz.title}" with ${mockQuestions.length} questions`
    });

    setQuizForm({
      title: '',
      subject: '',
      difficulty: 'medium',
      questionCount: 5
    });
    setCreatingQuiz(false);
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    submitAnswer(currentQuestion.id, userAnswer.trim());
    setUserAnswer('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-700';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700';
      case 'hard': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  if (quizStarted && currentQuiz && !quizCompleted) {
    return (
      <div className="container mx-auto py-8">
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{currentQuiz.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </p>
          </div>
          <Badge className={getDifficultyColor(currentQuiz.difficulty)}>
            {currentQuiz.difficulty} • {currentQuiz.estimatedTime} min
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{currentQuestionIndex + 1}/{currentQuiz.questions.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Question {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg">
                {currentQuestion?.question}
              </div>

              <div className="space-y-4">
                <Label>Your Answer</Label>
                <Textarea
                  placeholder="Type your answer here..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="glass-input min-h-[120px]"
                  disabled={isAnswered(currentQuestion?.id || '')}
                />

                <div className="flex gap-3">
                  {!isAnswered(currentQuestion?.id || '') ? (
                    <>
                      <Button
                        onClick={handleAnswerSubmit}
                        disabled={!userAnswer.trim()}
                        className="gradient-primary text-white"
                      >
                        Submit Answer
                      </Button>
                      {currentQuestionIndex > 0 && (
                        <Button
                          variant="outline"
                          onClick={goToPreviousQuestion}
                        >
                          Previous
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={goToNextQuestion}
                        className="gradient-primary text-white"
                      >
                        {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                      </Button>
                      {currentQuestionIndex > 0 && (
                        <Button
                          variant="outline"
                          onClick={goToPreviousQuestion}
                        >
                          Previous
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Submitted Answer */}
              {isAnswered(currentQuestion?.id || '') && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-2">Your Answer:</p>
                  <p className="text-muted-foreground">{getAnswer(currentQuestion?.id || '')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (quizCompleted && results) {
    return (
      <div className="container mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="mb-8">
            {results.passed ? (
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold mb-2">
              Quiz Completed!
            </h1>
            <p className="text-muted-foreground">
              {currentQuiz?.title}
            </p>
          </div>

          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-3xl font-bold">{results.score}%</p>
                  <p className="text-muted-foreground">Score</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-3xl font-bold">{results.correctAnswers}/{results.totalQuestions}</p>
                  <p className="text-muted-foreground">Correct Answers</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className={`text-lg font-medium ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {results.passed ? '🎉 Congratulations! You passed!' : '📚 Keep studying and try again!'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={resetQuiz}
              variant="outline"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Take Another Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz Library View
  return (
    <div className="w-full">
      <div className="container mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
              <FileText className="h-8 w-8" />
              Quiz Generator
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and take AI-powered practice quizzes
            </p>
          </div>

          <Button
            onClick={() => setCreatingQuiz(!creatingQuiz)}
            className="gradient-primary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {creatingQuiz ? 'Cancel' : 'Create Quiz'}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.taken}</p>
              <p className="text-sm text-muted-foreground">Quizzes Taken</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Quiz Form */}
        {creatingQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Create New Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Quiz Title</Label>
                    <Input
                      placeholder="e.g., Biology Chapter 1 Review"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      className="glass-input mt-1"
                    />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input
                      placeholder="e.g., Biology, History, Mathematics"
                      value={quizForm.subject}
                      onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                      className="glass-input mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={quizForm.difficulty}
                      onValueChange={(value: any) => setQuizForm({ ...quizForm, difficulty: value })}
                    >
                      <SelectTrigger className="glass-input mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Number of Questions</Label>
                    <Select
                      value={quizForm.questionCount.toString()}
                      onValueChange={(value: string) => setQuizForm({ ...quizForm, questionCount: parseInt(value) })}
                    >
                      <SelectTrigger className="glass-input mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Questions</SelectItem>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleCreateQuiz}
                  className="gradient-primary text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Quiz
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quiz Library */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Quizzes</h2>

          {quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Quizzes Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first quiz to start practicing
              </p>
              <Button onClick={() => setCreatingQuiz(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Quiz
              </Button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card className="glass-card h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>{quiz.subject}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{quiz.questions.length} questions</span>
                        <span>{quiz.estimatedTime} min</span>
                      </div>

                      <Button
                        onClick={() => startQuiz(quiz.id)}
                        className="w-full gradient-primary text-white"
                        disabled={quizStarted}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
