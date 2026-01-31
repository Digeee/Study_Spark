import { cn } from "@/lib/utils";

interface ProductivityScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ProductivityScore({ score, size = "md", showLabel = true }: ProductivityScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-study-green";
    if (s >= 50) return "text-study-orange";
    return "text-destructive";
  };

  const getScoreEmoji = (s: number) => {
    if (s >= 80) return "🌟";
    if (s >= 50) return "💪";
    return "🎯";
  };

  const sizeClasses = {
    sm: { container: "h-16 w-16", text: "text-xl", emoji: "text-xl" },
    md: { container: "h-24 w-24", text: "text-3xl", emoji: "text-2xl" },
    lg: { container: "h-32 w-32", text: "text-4xl", emoji: "text-3xl" },
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", sizeClasses[size].container)}>
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", sizeClasses[size].text, getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <span className={sizeClasses[size].emoji}>{getScoreEmoji(score)}</span>
          <span>Productivity</span>
        </div>
      )}
    </div>
  );
}
