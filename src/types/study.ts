export interface StudySession {
  id: string;
  subject: string;
  duration_minutes: number;
  goal: string | null;
  study_date: string;
  created_at: string;
  documentIds?: string[];
  aiGenerated?: boolean;
}

export interface PomodoroSession {
  id: string;
  duration_minutes: number;
  completed_at: string;
  study_date: string;
}

export interface DailyStats {
  date: string;
  totalMinutes: number;
  sessions: number;
  subjects: string[];
}

export interface WeeklyStats {
  days: DailyStats[];
  totalMinutes: number;
  avgMinutesPerDay: number;
  mostStudiedSubject: string;
  sessionsWithGoals: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: string;
  earned: boolean;
  earnedAt?: string;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  totalSessions: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  productivityScore: number;
  badges: Badge[];
  pomodoroCount: number;
  documentsUploaded: number;
  aiInsightsGenerated: number;
  quizzesTaken: number;
  flashcardsStudied: number;
}

export interface SmartInsight {
  id: string;
  type: 'warning' | 'success' | 'tip' | 'encouragement';
  title: string;
  message: string;
  emoji: string;
}

// PDF & Document Management Types
export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'doc';
  content: string;
  summary: string;
  uploadDate: string;
  fileSize: number;
  pageCount?: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  keyPoints: string[];
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedStudyTime: number;
  createdAt: string;
  questionsGenerated: number;
  flashcardsGenerated: number;
}

// Study Planning Types
export interface StudyPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  dailySchedule: DailySchedule[];
  subjects: string[];
  goals: string[];
  createdAt: string;
  totalTime: number;
}

export interface DailySchedule {
  date: string;
  sessions: PlannedSession[];
}

export interface PlannedSession {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  goal: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number;
  documentIds?: string[];
}

// AI Analytics Types
export interface AIAnalytics {
  knowledgeGaps: KnowledgeGap[];
  optimalStudyTimes: TimeSlot[];
  progressPredictions: ProgressPrediction[];
  learningStyle: LearningStyle;
  productivityPatterns: ProductivityPattern[];
}

export interface KnowledgeGap {
  subject: string;
  topic: string;
  confidence: number; // 0-100
  recommendation: string;
  relatedDocuments: string[];
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  productivityScore: number; // 0-100
  recommendedFor: string[];
}

export interface ProgressPrediction {
  subject: string;
  currentDate: string;
  predictedMastery: number; // 0-100
  weeksToMastery: number;
  recommendedHours: number;
}

export interface LearningStyle {
  type: 'visual' | 'auditory' | 'kinesthetic' | 'reading/writing';
  confidence: number; // 0-100
  recommendations: string[];
}

export interface ProductivityPattern {
  patternType: 'consistent' | 'peak_morning' | 'peak_evening' | 'variable';
  description: string;
  recommendation: string;
}

// Q&A Types
export interface DocumentQAConversation {
  id: string;
  documentId: string;
  messages: QAMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface Citation {
  text: string;
  pageNumber?: number;
  relevance: number; // 0-1
}

// Flashcard Types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: string;
  interval: number; // days
  easeFactor: number;
  documentId?: string;
}

// Quiz Types
export interface GeneratedQuiz {
  id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  documentId?: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
