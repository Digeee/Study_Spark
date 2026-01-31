import { SmartInsight } from "@/types/study";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface SmartInsightsProps {
  insights: SmartInsight[];
}

const typeStyles = {
  warning: "border-study-orange/30 bg-study-orange/10",
  success: "border-study-green/30 bg-study-green/10",
  tip: "border-study-blue/30 bg-study-blue/10",
  encouragement: "border-study-pink/30 bg-study-pink/10",
};

export function SmartInsights({ insights }: SmartInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI-Powered Insights</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
          ✨ Smart
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={cn(
              "rounded-xl border p-4 transition-all hover:shadow-md",
              typeStyles[insight.type]
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{insight.emoji}</span>
              <h4 className="font-semibold">{insight.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
