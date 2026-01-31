import OpenAI from "openai";
import { StudySession, PomodoroSession, UserStats, SmartInsight, Document, DocumentAnalysis, StudyPlan, PlannedSession, AIAnalytics, KnowledgeGap, TimeSlot, ProgressPrediction, LearningStyle, ProductivityPattern, QAMessage } from "@/types/study";
import { logger } from "@/lib/logger";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

// Debug logging
console.log("🔑 OpenAI API Key loaded:", apiKey ? `${apiKey.substring(0, 15)}...` : "MISSING");

function getClient() {
    if (!apiKey) {
        console.error("❌ VITE_OPENAI_API_KEY is not set in .env file");
        throw new Error("Missing VITE_OPENAI_API_KEY");
    }
    console.log("✅ Creating OpenAI client");
    return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
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
            const result = await withTimeout(fn(), 15000);
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
    const client = getClient();

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

DATA:\n${JSON.stringify(summary)}

Respond with ONLY valid JSON array, no markdown or explanation.`;

    try {
        const res = await runWithRetry(() => client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        }));

        const text = res.choices[0]?.message?.content || "[]";
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
            ];
            return fallback;
        }
    } catch (e) {
        logger.error("AI insights failed", e);
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

export async function chatCoach(message: string, context: {
    sessions: StudySession[];
    stats: UserStats;
    documents?: Document[];
}) {
    const client = getClient();
    const system = `You are an encouraging study coach. Answer briefly (≤120 chars), include one concrete tactic and one emoji. Consider the user's study patterns.`;
    try {
        const res = await runWithRetry(() => client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: system },
                { role: "user", content: `${message}\n\nContext: ${JSON.stringify({ streak: context.stats.currentStreak, totalMinutes: context.stats.totalMinutes })}` }
            ],
            temperature: 0.7,
            max_tokens: 150,
        }));
        return res.choices[0]?.message?.content || "Try a 20m focused review with 3 concrete tasks. 📚";
    } catch (e: any) {
        console.error("❌ OpenAI Operation Failed:", e);

        const errorMsg = e?.message || String(e);

        // Return specific error messages to the user for debugging
        if (errorMsg.includes("401")) {
            return "⚠️ **Authentication Error (401)**: The API key is invalid. Please double-check the key in your .env file.";
        }
        if (errorMsg.includes("429")) {
            return "⚠️ **Quota Exceeded (429)**: Your OpenAI account is out of credits or rate limited. Check your billing at platform.openai.com.";
        }
        if (errorMsg.includes("Missing VITE_OPENAI_API_KEY")) {
            return "⚠️ **Configuration Error**: The API Key is not loaded. Try restarting the server.";
        }

        logger.error("AI chat failed", e);
        const tactic = context.stats.currentStreak > 0 ? "Maintain streak with a 15m review" : "Start with a 20m focus block";
        return `${tactic}. Set a clear goal and remove distractions. 🔧 \n\n(Debug Error: ${errorMsg.substring(0, 50)}...)`;
    }
}

export async function suggestGoal(subject: string, minutes: number) {
    const client = getClient();
    const prompt = `Suggest a concise study goal for ${subject} in ${minutes} minutes. One sentence, ≤100 chars.`;
    try {
        const res = await runWithRetry(() => client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 50,
        }));
        return res.choices[0]?.message?.content || `Study ${subject} for ${minutes} minutes`;
    } catch (e) {
        logger.warn("AI goal suggestion failed", e);
        const base = minutes >= 60 ? `${Math.round(minutes / 60)}h deep work` : `${minutes}m focused study`;
        return `Plan ${base} on ${subject}: outline key concepts and 3 practice questions`;
    }
}

export async function generateStudyPlan(
    subjects: string[],
    availableHours: number,
    startDate: string,
    endDate: string,
    goals: string[]
): Promise<StudyPlan> {
    const client = getClient();

    const prompt = `Create a detailed study plan JSON for:
Subjects: ${subjects.join(', ')}
Available Hours: ${availableHours} total
Period: ${startDate} to ${endDate}
Goals: ${goals.join('; ')}

Generate JSON with this exact structure (no markdown):
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
          "estimatedDuration": number
        }
      ]
    }
  ]
}`;

    try {
        const res = await runWithRetry(() => client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        }));

        const text = res.choices[0]?.message?.content || "{}";
        try {
            const parsed = JSON.parse(text) as Omit<StudyPlan, 'id' | 'createdAt' | 'totalTime' | 'subjects' | 'goals'>;

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
            return generateFallbackStudyPlan(subjects, availableHours, startDate, endDate, goals);
        }
    } catch (e) {
        logger.error("Study plan generation failed", e);
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

// Placeholder functions for other features
export async function analyzeDocument(document: Document): Promise<DocumentAnalysis> {
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

export async function summarizeDocument(document: Document, length: 'short' | 'medium' | 'long' = 'medium'): Promise<string> {
    return `Summary of ${document.name}: Key educational content processed and ready for study.`;
}

export async function generateFlashcardsFromDocument(document: Document, count: number = 5): Promise<any[]> {
    return [{ front: "Study Material", back: "Processed successfully", difficulty: "medium" }];
}

export async function answerDocumentQuestion(document: Document, question: string, conversationHistory: QAMessage[] = []): Promise<{ answer: string; citations: any[] }> {
    return {
        answer: "I couldn't find information about that in the document. Try rephrasing your question.",
        citations: []
    };
}

export async function generateAIAnalytics(
    sessions: StudySession[],
    stats: UserStats
): Promise<AIAnalytics> {
    return {
        knowledgeGaps: [],
        optimalStudyTimes: [],
        progressPredictions: [],
        learningStyle: { type: 'reading/writing', confidence: 75, recommendations: ['Continue with text-based learning'] },
        productivityPatterns: []
    };
}
