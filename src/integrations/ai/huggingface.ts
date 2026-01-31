import { StudySession, PomodoroSession, UserStats, SmartInsight, Document, DocumentAnalysis, StudyPlan, QAMessage, AIAnalytics, PlannedSession } from "@/types/study";
import { logger } from "@/lib/logger";

const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY as string | undefined;
const MODEL = "mistralai/Mistral-7B-Instruct-v0.3";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

// Debug logging
console.log("🤗 Hugging Face API Key loaded:", API_KEY ? `${API_KEY.substring(0, 5)}...` : "MISSING");

async function queryHuggingFace(prompt: string, max_new_tokens = 500) {
    if (!API_KEY) throw new Error("Missing VITE_HUGGINGFACE_API_KEY");

    const response = await fetch(API_URL, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: max_new_tokens,
                temperature: 0.7,
                return_full_text: false,
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Hugging Face API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result[0]?.generated_text || "";
}

// Smart Mock Response (Fallback)
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
    return "That sounds like a solid goal. 🎯 Try breaking it down into smaller, manageable chunks. Do a 25-minute focused sprint on the most difficult part first! 🔥";
}

// ----------------------------------------------------
// AI Coach Chat
// ----------------------------------------------------
export async function chatCoach(message: string, context: {
    sessions: StudySession[];
    stats: UserStats;
    documents?: Document[];
}) {
    try {
        const systemPrompt = `<s>[INST] You are an encouraging study coach. Answer nicely and briefly (under 2 sentences). Include one emoji.
    
    User: ${message}
    Context: Streak: ${context.stats.currentStreak} days.
    [/INST]`;

        const response = await queryHuggingFace(systemPrompt, 150);
        return response.trim();
    } catch (e) {
        logger.error("HF Chat Failed", e);
        return getMockResponse(message);
    }
}

// ----------------------------------------------------
// Smart Insights (Dashboard)
// ----------------------------------------------------
export async function generateAiInsights(
    sessions: StudySession[],
    pomodoros: PomodoroSession[],
    stats: UserStats,
): Promise<SmartInsight[]> {
    try {
        const prompt = `<s>[INST] Analyze this study data and output exactly 3 insights in raw JSON format array. No markdown.
    Data: Total mins: ${stats.totalMinutes}, Streak: ${stats.currentStreak}.
    
    Format: [{"id":"1","type":"tip","title":"Title","message":"Msg","emoji":"💡"}]
    [/INST]`;

        const text = await queryHuggingFace(prompt, 300);
        // clean partial markdown if present
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (e) {
        logger.error("HF Insights Failed", e);
        return [
            {
                id: "1", type: "tip", title: "Focus Time", message: "Try the Pomodoro technique today!", emoji: "🍅"
            },
            {
                id: "2", type: "encouragement", title: "Keep it up", message: "Consistency is key to success.", emoji: "⭐"
            }
        ];
    }
}

// ----------------------------------------------------
// Goal Suggestion
// ----------------------------------------------------
export async function suggestGoal(subject: string, minutes: number) {
    try {
        const prompt = `<s>[INST] Suggest one short study goal (max 10 words) for ${subject} in ${minutes} mins. [/INST]`;
        const res = await queryHuggingFace(prompt, 50);
        return res.trim().replace(/"/g, "");
    } catch (e) {
        return `Review ${subject} key concepts`;
    }
}

// ----------------------------------------------------
// Study Planner
// ----------------------------------------------------
export async function generateStudyPlan(
    subjects: string[],
    availableHours: number,
    startDate: string,
    endDate: string,
    goals: string[]
): Promise<StudyPlan> {
    // Return mock plan immediately for safety/reliability in demo
    // as LLM JSON generation can be flaky without strict schema enforcement
    return generateFallbackStudyPlan(subjects, availableHours, startDate, endDate, goals);
}

function generateFallbackStudyPlan(
    subjects: string[],
    availableHours: number,
    startDate: string,
    endDate: string,
    goals: string[]
): StudyPlan {
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

    // Simple mock logic
    return {
        id: crypto.randomUUID(),
        title: "Hugging Face Study Plan",
        startDate,
        endDate,
        subjects,
        goals,
        createdAt: new Date().toISOString(),
        totalTime: availableHours * 60,
        dailySchedule: [
            {
                date: startDate,
                sessions: subjects.map((sub, i) => ({
                    id: crypto.randomUUID(),
                    subject: sub,
                    startTime: "09:00",
                    endTime: "10:00",
                    goal: goals[i] || "Study hard",
                    priority: "high",
                    estimatedDuration: 60
                }))
            }
        ]
    };
}

// ----------------------------------------------------
// PDF Analysis (Stubbed for now)
// ----------------------------------------------------
import {
    generateSummary,
    generateFlashcards,
    generateQuiz,
    generateMindMap,
    generateFAQs
} from "@/lib/ai-utilities";

// ----------------------------------------------------
// Smart Local Fallback (Rule-Based)
// ----------------------------------------------------
export async function analyzeDocument(document: Document): Promise<DocumentAnalysis> {
    // Check if we can use API, otherwise fallback immediately
    if (!API_KEY) {
        return generateLocalAnalysis(document);
    }

    try {
        // Attempt relatively simple classification via LLM
        const prompt = `<s>[INST] Analyze this text. Return JSON with keyPoints (array), topics (array), difficulty (easy/medium/hard). Text: ${document.content.substring(0, 500)} [/INST]`;
        const text = await queryHuggingFace(prompt, 200);
        const json = JSON.parse(text.replace(/```json/g, "").replace(/```/g, ""));

        return {
            id: crypto.randomUUID(),
            documentId: document.id,
            keyPoints: json.keyPoints || ["AI Analysis Complete"],
            topics: json.topics || ["General"],
            difficulty: json.difficulty || "medium",
            estimatedStudyTime: Math.ceil(document.content.length / 1000),
            createdAt: new Date().toISOString(),
            questionsGenerated: generateQuiz(document.content, document.name).length,
            flashcardsGenerated: generateFlashcards(document.content).length
        };
    } catch (e) {
        logger.warn("HF Analysis failed, using local rule-based engine");
        return generateLocalAnalysis(document);
    }
}

function generateLocalAnalysis(document: Document): DocumentAnalysis {
    const summary = generateSummary(document.content);
    const quiz = generateQuiz(document.content, document.name);
    const flashcards = generateFlashcards(document.content);
    const mindmap = generateMindMap(document.content);

    return {
        id: crypto.randomUUID(),
        documentId: document.id,
        keyPoints: [summary, ...mindmap.slice(0, 2).map(m => `Key concept: ${m.concept}`)],
        topics: mindmap.map(m => m.concept),
        difficulty: document.content.length > 5000 ? "hard" : "medium",
        estimatedStudyTime: Math.ceil(document.content.split(' ').length / 200),
        createdAt: new Date().toISOString(),
        questionsGenerated: quiz.length,
        flashcardsGenerated: flashcards.length
    };
}

export async function summarizeDocument(document: Document, length: 'short' | 'medium' | 'long' = 'medium'): Promise<string> {
    try {
        if (!API_KEY) throw new Error("No API Key");

        const prompt = `<s>[INST] Summarize this text in 3 sentences: ${document.content.substring(0, 1000)} [/INST]`;
        return await queryHuggingFace(prompt, 200);
    } catch (e) {
        return generateSummary(document.content);
    }
}

export async function generateFlashcardsFromDocument(document: Document, count: number = 5): Promise<any[]> {
    // Local logic is often better for flashcards than small LLMs which hallucinate JSON
    return generateFlashcards(document.content).slice(0, count);
}

export async function answerDocumentQuestion(document: Document, question: string, conversationHistory: QAMessage[] = []): Promise<{ answer: string; citations: any[] }> {
    try {
        if (!API_KEY) throw new Error("No API");

        const prompt = `<s>[INST] Answer this question based on the text: "${question}" \n\n Text: ${document.content.substring(0, 1000)} [/INST]`;
        const answer = await queryHuggingFace(prompt, 300);
        return { answer, citations: [] };
    } catch (e) {
        // Fallback: try to find a matching FAQ or return generic advice
        const faqs = generateFAQs(document.content, document.name);
        // minimal fuzzy match
        const match = faqs.find(f => f.q.toLowerCase().includes(question.toLowerCase().split(' ')[0]));

        if (match) {
            return { answer: match.a, citations: [] };
        }

        return {
            answer: "Automatic Q&A is limited in offline mode. Please check the 'Key Concepts' section or try asking about the main topic or summary.",
            citations: []
        };
    }
}

export async function generateAIAnalytics(sessions: StudySession[], stats: UserStats): Promise<AIAnalytics> {
    return {
        knowledgeGaps: [],
        optimalStudyTimes: [],
        progressPredictions: [],
        learningStyle: { type: 'visual', confidence: 0, recommendations: [] },
        productivityPatterns: []
    };
}
