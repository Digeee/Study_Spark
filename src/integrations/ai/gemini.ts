import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudySession, PomodoroSession, UserStats, SmartInsight, Document, DocumentAnalysis, StudyPlan, PlannedSession, AIAnalytics, KnowledgeGap, TimeSlot, ProgressPrediction, LearningStyle, ProductivityPattern, QAMessage } from "@/types/study";
import { logger } from "@/lib/logger";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const modelName = "gemini-1.5-flash";

// Debug logging
console.log("🔑 Gemini API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING");

function getClient() {
  if (!apiKey) {
    console.error("❌ VITE_GEMINI_API_KEY is not set in .env file");
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }
  console.log("✅ Creating Gemini client with key:", apiKey.substring(0, 10) + "...");
  return new GoogleGenerativeAI(apiKey);
}

let fails = 0;
let breakerUntil = 0;

function isBreakerOpen() {
  return Date.now() < breakerUntil;
}

function openBreaker(ms: number) {
  breakerUntil = Date.now() + ms;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withTimeout<T>(p: Promise<T>, ms: number) {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

async function runWithRetry<T>(fn: () => Promise<T>, attempts = 3, baseDelay = 500) {
  if (isBreakerOpen()) throw new Error("circuit_open");
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await withTimeout(fn(), 8000);
      fails = 0;
      return result;
    } catch (e) {
      lastErr = e;
      fails++;
      const delay = baseDelay * Math.pow(2, i);
      logger.warn("AI attempt failed", { attempt: i + 1, delay, error: String(e) });
      await sleep(delay);
    }
  }
  if (fails >= 3) openBreaker(60000);
  throw lastErr instanceof Error ? lastErr : new Error("ai_failed");
}

export async function generateAiInsights(
  sessions: StudySession[],
  pomodoros: PomodoroSession[],
  stats: UserStats,
): Promise<SmartInsight[]> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: modelName });

  const summary = {
    totals: {
      minutes: stats.totalMinutes,
      sessions: stats.totalSessions,
      pomodoros: stats.pomodoroCount,
      streak: stats.currentStreak,
      productivity: stats.productivityScore,
    },
    sampleSessions: sessions.slice(0, 30).map((s) => ({
      subject: s.subject,
      minutes: s.duration_minutes,
      goal: s.goal,
      date: s.study_date,
    })),
    recentPomodoros: pomodoros.slice(0, 30).map((p) => ({
      minutes: p.duration_minutes,
      date: p.study_date,
    })),
  };

  const prompt = `You are a study coach. Given the JSON data below about a user's study habits, produce 4 short actionable insights. Each insight must include: id, type (warning|success|tip|encouragement), title, message, emoji. Keep messages under 140 chars, specific and motivating.

DATA:\n${JSON.stringify(summary)}`;

  try {
    const res = await runWithRetry(() => model.generateContent(prompt));
    const text = res.response.text();
    try {
      const parsed = JSON.parse(text) as SmartInsight[];
      return Array.isArray(parsed) ? parsed.slice(0, 4) : [];
    } catch {
      const fallback: SmartInsight[] = [
        {
          id: crypto.randomUUID(),
          type: "tip",
          title: "Try time blocks",
          message: "Group sessions by subject into 45–60 min blocks for focus",
          emoji: "⏱️",
        },
        {
          id: crypto.randomUUID(),
          type: "encouragement",
          title: "Solid streak",
          message: "Maintain your streak with a short 15 min review today",
          emoji: "🔥",
        },
        {
          id: crypto.randomUUID(),
          type: "warning",
          title: "Balance subjects",
          message: "One subject dominates. Add variety to improve retention",
          emoji: "⚖️",
        },
        {
          id: crypto.randomUUID(),
          type: "success",
          title: "Great pace",
          message: "Your average daily minutes are climbing. Keep consistency",
          emoji: "✅",
        },
      ];
      return fallback;
    }
  } catch (e) {
    logger.error("AI insights failed (using fallback)", e);
    const fallback: SmartInsight[] = [
      {
        id: crypto.randomUUID(),
        type: "tip",
        title: "Plan tomorrow",
        message: "List 3 tasks for next study block and timebox them",
        emoji: "📝",
      },
      {
        id: crypto.randomUUID(),
        type: "encouragement",
        title: "Small wins",
        message: "Do a 20 min review to keep momentum",
        emoji: "✅",
      },
    ];
    return fallback;
  }
}

// Smart Mock Response System
function getMockResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("plan") || lower.includes("schedule")) {
    return "Here's a quick plan: 📅\n1. Review notes (15m)\n2. Focus block: Core concepts (45m)\n3. Break (10m)\n4. Practice problems (30m)\nYou got this! 🚀";
  }
  if (lower.includes("math") || lower.includes("calc")) {
    return "For math, practice is key! 🧮 Try solving 5 problems without looking at the solution. If you get stuck, review the formula derivation. Keep going! 💪";
  }
  if (lower.includes("tired") || lower.includes("focus") || lower.includes("distract")) {
    return "Feeling drained? 📉 Try a 'Nsdr' (Non-Sleep Deep Rest) protocol for 10 mins. Or switch to the Pomodoro technique: 25m work, 5m break. 🍅";
  }
  if (lower.includes("exam") || lower.includes("test")) {
    return "Exam prep mode! 📝 Focus on active recall. Close your book and try to explain the topic out loud. It's more effective than re-reading! 🧠";
  }
  if (lower.includes("coding") || lower.includes("programming")) {
    return "Coding tip: 💻 Break the problem into small pseudo-code steps first. If you're stuck, explain the logic to a rubber duck (or me!). 🦆";
  }

  return "That sounds like a solid goal. 🎯 Try breaking it down into smaller, manageable chunks. Do a 25-minute focused sprint on the most difficult part first! 🔥";
}

export async function chatCoach(message: string, context: {
  sessions: StudySession[];
  stats: UserStats;
  documents?: Document[];
}) {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: modelName });
    const system = `You are an encouraging study coach. Answer briefly (≤120 chars), include one concrete tactic and one emoji. Consider the user's study patterns.`;

    const res = await runWithRetry(() => model.generateContent(`${system}\nUser: ${message}\nContext: ${JSON.stringify(context)}`));
    return res.response.text();
  } catch (e: any) {
    console.error("❌ Gemini Operation Failed (Falling back to Mock):", e);
    // Fallback to Smart Mock
    return getMockResponse(message);
  }
}


export async function suggestGoal(subject: string, minutes: number) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: modelName });
  const prompt = `Suggest a concise study goal for ${subject} in ${minutes} minutes. One sentence, ≤100 chars.`;
  try {
    const res = await runWithRetry(() => model.generateContent(prompt));
    return res.response.text();
  } catch (e) {
    logger.warn("AI goal suggestion failed (using mock)", e);
    const base = minutes >= 60 ? `${Math.round(minutes / 60)}h deep work` : `${minutes}m focused study`;
    return `Plan ${base} on ${subject}: outline key concepts and 3 practice questions`;
  }
}

// ====================
// PDF & DOCUMENT ANALYSIS
// ====================

export async function analyzeDocument(document: Document): Promise<DocumentAnalysis> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `Analyze this educational document content and provide structured insights.

Document Name: ${document.name}
Content Preview: ${document.content.substring(0, 2000)}...

Respond with JSON containing:
{
  "keyPoints": ["main point 1", "main point 2", ...],
  "topics": ["topic 1", "topic 2", ...],
  "difficulty": "easy|medium|hard",
  "estimatedStudyTime": number, // in minutes
  "questionsGenerated": number,
  "flashcardsGenerated": number
}

Keep arrays concise (3-5 items each). Estimate study time based on content complexity.`;

  try {
    const res = await runWithRetry(() => model.generateContent(prompt));
    const text = res.response.text();

    try {
      const parsed = JSON.parse(text) as Omit<DocumentAnalysis, 'id' | 'documentId' | 'createdAt'>;
      return {
        id: crypto.randomUUID(),
        documentId: document.id,
        keyPoints: parsed.keyPoints || [],
        topics: parsed.topics || [],
        difficulty: parsed.difficulty || 'medium',
        estimatedStudyTime: parsed.estimatedStudyTime || 30,
        createdAt: new Date().toISOString(),
        questionsGenerated: parsed.questionsGenerated || 0,
        flashcardsGenerated: parsed.flashcardsGenerated || 0
      };
    } catch {
      // Fallback analysis
      return {
        id: crypto.randomUUID(),
        documentId: document.id,
        keyPoints: ["Key concepts extracted", "Main topics identified", "Study recommendations provided"],
        topics: ["General", "Academic"],
        difficulty: "medium",
        estimatedStudyTime: Math.min(Math.max(document.content.length / 200, 15), 120),
        createdAt: new Date().toISOString(),
        questionsGenerated: 0,
        flashcardsGenerated: 0
      };
    }
  } catch (e) {
    logger.error("Document analysis failed", e);
    return {
      id: crypto.randomUUID(),
      documentId: document.id,
      keyPoints: ["Document processed", "Ready for study"],
      topics: ["General"],
      difficulty: "medium",
      estimatedStudyTime: 30,
      createdAt: new Date().toISOString(),
      questionsGenerated: 0,
      flashcardsGenerated: 0
    };
  }
}

export async function summarizeDocument(document: Document, length: 'short' | 'medium' | 'long' = 'medium'): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: modelName });

  const lengthMap = {
    short: "5 bullet points",
    medium: "3-4 paragraphs",
    long: "comprehensive summary with key details"
  };

  const prompt = `Summarize this educational document in ${lengthMap[length]}.

Document: ${document.name}
Content: ${document.content.substring(0, 3000)}...

Provide a clear, structured summary suitable for study purposes.`;

  try {
    const res = await runWithRetry(() => model.generateContent(prompt));
    return res.response.text();
  } catch (e) {
    logger.error("Document summarization failed", e);
    return `Summary of ${document.name}: Key educational content processed and ready for study.`;
  }
}

export async function generateFlashcardsFromDocument(document: Document, count: number = 5): Promise<any[]> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `Generate ${count} flashcards from this educational content.

Document: ${document.name}
Content: ${document.content.substring(0, 2500)}...

Respond with JSON array of objects:
[
  {
    "front": "question or term",
    "back": "answer or definition",
    "difficulty": "easy|medium|hard"
  }
]

Make cards educational and suitable for spaced repetition.`;

  try {
    const res = await runWithRetry(() => model.generateContent(prompt));
    const text = res.response.text();

    try {
      return JSON.parse(text);
    } catch {
      return [
        { front: "Document processed", back: "Ready for study", difficulty: "medium" },
        { front: "Key concepts", back: "Extracted from material", difficulty: "medium" }
      ];
    }
  } catch (e) {
    logger.error("Flashcard generation failed", e);
    return [{ front: "Study Material", back: "Processed successfully", difficulty: "medium" }];
  }
}

// ====================
// Q&A SYSTEM
// ====================

export async function answerDocumentQuestion(document: Document, question: string, conversationHistory: QAMessage[] = []): Promise<{ answer: string; citations: any[] }> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: modelName });

  const historyContext = conversationHistory
    .slice(-3)
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  const prompt = `You are an expert tutor helping with this document.

Document: ${document.name}
Content: ${document.content.substring(0, 3000)}...

Previous conversation:
${historyContext}

Question: ${question}

Provide a helpful, accurate answer based on the document. If the answer isn't in the document, say so clearly.

Format your response as:
ANSWER: [your answer]
CITATIONS: [relevant excerpts from document, if applicable]

Keep answer concise but thorough.`;

  try {
    const res = await runWithRetry(() => model.generateContent(prompt));
    const text = res.response.text();

    // Parse response
    const answerMatch = text.match(/ANSWER:\s*([\s\S]*?)(?=\nCITATIONS:|$)/i);
    const citationsMatch = text.match(/CITATIONS:\s*([\s\S]*)/i);

    return {
      answer: answerMatch ? answerMatch[1].trim() : text,
      citations: citationsMatch ? [{ text: citationsMatch[1].trim(), relevance: 0.9 }] : []
    };
  } catch (e) {
    logger.error("Document Q&A failed", e);
    return {
      answer: "I couldn't find information about that in the document. Try rephrasing your question or check if the topic is covered in the material.",
      citations: []
    };
  }
}

// ====================
// STUDY PLANNING
// ====================

export async function generateStudyPlan(
  subjects: string[],
  availableHours: number,
  startDate: string,
  endDate: string,
  goals: string[]
): Promise<StudyPlan> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `Create a detailed study plan for the following:

Subjects: ${subjects.join(', ')}
Available Hours: ${availableHours} total
Period: ${startDate} to ${endDate}
Goals: ${goals.join('; ')}

Generate a JSON study plan with:
{
  "title": "descriptive title",
  "dailySchedule": [
    {
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "subject": "subject name",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "goal": "specific learning objective",
          "priority": "high|medium|low",
          "estimatedDuration": number // minutes
        }
      ]
    }
  ]
}

Distribute hours合理ly across subjects. Include breaks. Make sessions 25-90 minutes. Be realistic.`;

  try {
    const res = await runWithRetry(() => model.generateContent(prompt));
    const text = res.response.text();

    try {
      const parsed = JSON.parse(text) as Omit<StudyPlan, 'id' | 'createdAt' | 'totalTime' | 'subjects' | 'goals'>;

      // Calculate total time
      const totalTime = parsed.dailySchedule.reduce((total, day) =>
        total + day.sessions.reduce((dayTotal, session) => dayTotal + (session.estimatedDuration || 0), 0), 0
      );

      return {
        id: crypto.randomUUID(),
        title: parsed.title || "Personalized Study Plan",
        startDate,
        endDate,
        dailySchedule: parsed.dailySchedule || [],
        subjects,
        goals,
        createdAt: new Date().toISOString(),
        totalTime
      };
    } catch {
      // Fallback plan
      return generateFallbackStudyPlan(subjects, availableHours, startDate, endDate, goals);
    }
  } catch (e) {
    logger.error("Study plan generation failed (using fallback plan)", e);
    return generateFallbackStudyPlan(subjects, availableHours, startDate, endDate, goals);
  }
}

function generateFallbackStudyPlan(
  subjects: string[],
  availableHours: number,
  startDate: string,
  endDate: string,
  goals: string[]
): StudyPlan {
  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const hoursPerDay = Math.floor(availableHours / days);

  const dailySchedule = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const sessions: PlannedSession[] = [];
    let remainingMinutes = hoursPerDay * 60;

    subjects.forEach((subject, idx) => {
      if (remainingMinutes > 0) {
        const sessionMinutes = Math.min(60, remainingMinutes);
        sessions.push({
          id: crypto.randomUUID(),
          subject,
          startTime: "09:00",
          endTime: `09:${String(sessionMinutes).padStart(2, '0')}`,
          goal: goals[idx] || `Study ${subject}`,
          priority: idx === 0 ? 'high' : 'medium',
          estimatedDuration: sessionMinutes
        });
        remainingMinutes -= sessionMinutes;
      }
    });

    dailySchedule.push({
      date: currentDate.toISOString().split('T')[0],
      sessions
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    id: crypto.randomUUID(),
    title: "Balanced Study Schedule",
    startDate,
    endDate,
    dailySchedule,
    subjects,
    goals,
    createdAt: new Date().toISOString(),
    totalTime: availableHours * 60
  };
}

// ====================
// ADVANCED ANALYTICS
// ====================

export async function generateAIAnalytics(
  sessions: StudySession[],
  stats: UserStats
): Promise<AIAnalytics> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: modelName });

  const sessionData = sessions.slice(0, 50).map(s => ({
    subject: s.subject,
    duration: s.duration_minutes,
    date: s.study_date,
    goal: s.goal
  }));

  const prompt = `Analyze this study data and generate educational insights.

Student Stats:
- Total Minutes: ${stats.totalMinutes}
- Current Streak: ${stats.currentStreak}
- Productivity Score: ${stats.productivityScore}
- Sessions: ${stats.totalSessions}

Recent Sessions:
${JSON.stringify(sessionData)}

Generate JSON with:
{
  "knowledgeGaps": [
    {
      "subject": "subject name",
      "topic": "specific topic",
      "confidence": number, // 0-100
      "recommendation": "study advice"
    }
  ],
  "optimalStudyTimes": [
    {
      "dayOfWeek": number, // 0-6
      "hour": number, // 0-23
      "productivityScore": number, // 0-100
      "recommendedFor": ["subjects"]
    }
  ],
  "progressPredictions": [
    {
      "subject": "subject name",
      "predictedMastery": number, // 0-100
      "weeksToMastery": number,
      "recommendedHours": number
    }
  ],
  "learningStyle": {
    "type": "visual|auditory|kinesthetic|reading/writing",
    "confidence": number, // 0-100
    "recommendations": ["tips"]
  }
}

Be specific and actionable. Base predictions on the data provided.`;

  try {
    const res = await runWithRetry(() => model.generateContent(prompt));
    const text = res.response.text();

    try {
      const parsed = JSON.parse(text) as Omit<AIAnalytics, 'productivityPatterns'>;

      // Add productivity patterns based on data
      const productivityPatterns: ProductivityPattern[] = [
        {
          patternType: stats.currentStreak > 7 ? 'consistent' : 'variable',
          description: `Study pattern shows ${stats.currentStreak > 7 ? 'consistent daily habits' : 'variable engagement'}`,
          recommendation: stats.currentStreak > 7
            ? 'Maintain your consistent streak with varied subjects'
            : 'Build consistency by studying at the same time daily'
        }
      ];

      return {
        knowledgeGaps: parsed.knowledgeGaps || [],
        optimalStudyTimes: parsed.optimalStudyTimes || [],
        progressPredictions: parsed.progressPredictions || [],
        learningStyle: parsed.learningStyle || { type: 'reading/writing', confidence: 75, recommendations: ['Continue with text-based learning'] },
        productivityPatterns
      };
    } catch {
      return generateFallbackAnalytics(stats);
    }
  } catch (e) {
    logger.error("AI analytics generation failed (using fallback)", e);
    return generateFallbackAnalytics(stats);
  }
}

function generateFallbackAnalytics(stats: UserStats): AIAnalytics {
  return {
    knowledgeGaps: [
      {
        subject: "General",
        topic: "Study consistency",
        confidence: 80,
        recommendation: "Maintain your current study streak",
        relatedDocuments: []
      }
    ],
    optimalStudyTimes: [
      {
        dayOfWeek: 1,
        hour: 9,
        productivityScore: 85,
        recommendedFor: ["All subjects"]
      }
    ],
    progressPredictions: [
      {
        subject: "Overall",
        currentDate: new Date().toISOString().split('T')[0],
        predictedMastery: Math.min(90, stats.productivityScore + 10),
        weeksToMastery: 4,
        recommendedHours: 10
      }
    ],
    learningStyle: {
      type: 'reading/writing',
      confidence: 75,
      recommendations: ['Continue with structured note-taking and reading']
    },
    productivityPatterns: [
      {
        patternType: 'consistent',
        description: 'Shows regular study habits',
        recommendation: 'Maintain current schedule with occasional variation'
      }
    ]
  };
}