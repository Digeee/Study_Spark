import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStudySessions } from "@/hooks/useStudySessions";
import { usePomodoroSessions } from "@/hooks/usePomodoroSessions";
import { getUserStats } from "@/lib/calculations";
import { chatCoach } from "@/integrations/ai/huggingface";
import { logger } from "@/lib/logger";
import { SmartInsights } from "@/components/SmartInsights";
import { generateInsights } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Brain } from "lucide-react";

export default function AICoach() {
  const { sessions } = useStudySessions();
  const { sessions: pomodoros } = usePomodoroSessions();
  const stats = useMemo(() => getUserStats(sessions, pomodoros), [sessions, pomodoros]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "coach"; text: string }[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const localInsights = useMemo(() => {
    return generateInsights(
      stats.totalMinutes ? stats.totalMinutes % 120 : 0,
      stats.currentStreak,
      stats.productivityScore,
      { days: [], totalMinutes: stats.totalMinutes, avgMinutesPerDay: 0, mostStudiedSubject: "", sessionsWithGoals: 0 }
    );
  }, [stats]);

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const reply = await chatCoach(text, { sessions, stats });
      setMessages((m) => [...m, { role: "coach", text: reply }]);
    } catch (e) {
      logger.error("Coach send failed", e);
      const fallback = localInsights[0]?.message || "Try a 20m focused review with 3 concrete tasks.";
      setMessages((m) => [...m, { role: "coach", text: fallback }]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <AppLayout>
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
          <Brain className="h-8 w-8" />
          AI Study Coach
        </h1>
        <p className="text-muted-foreground mt-2">
          Get personalized study advice powered by artificial intelligence
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <Card aria-label="AI coach chat" className="lg:col-span-2 glass-card">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Chat with Your Coach
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Messages Area */}
              <div
                className="h-[400px] overflow-y-auto rounded-xl border border-white/20 p-4 bg-gradient-to-br from-muted/30 to-muted/10 modern-scrollbar"
                role="log"
                aria-live="polite"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="glass-badge p-4 rounded-2xl">
                      <Brain className="h-12 w-12 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Start a Conversation</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Ask for study plans, productivity tips, focus tactics, or advice on any subject!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === "user"
                            ? "gradient-primary text-white shadow-glow"
                            : "glass-card border border-white/30"
                            }`}
                        >
                          <p className="text-sm leading-relaxed">{m.text}</p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="glass-card border border-white/30 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask your study coach anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="glass-input flex-1"
                  disabled={loading}
                />
                <Button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="gradient-primary text-white px-6"
                  size="lg"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="glass-badge">
                  🔥 Streak: {stats.currentStreak} days
                </Badge>
                <Badge variant="secondary" className="glass-badge">
                  📊 Productivity: {stats.productivityScore}%
                </Badge>
                <Badge variant="secondary" className="glass-badge">
                  ⏱️ Total: {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDebug((v) => !v)}
                  aria-expanded={showDebug}
                  className="ml-auto"
                >
                  Debug
                </Button>
              </div>

              {showDebug && (
                <Textarea
                  readOnly
                  value={JSON.stringify(logger.getLogs(), null, 2)}
                  className="h-40 glass-input font-mono text-xs"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Insights Sidebar */}
        <Card aria-label="Local insights" className="glass-card">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <SmartInsights insights={localInsights} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}