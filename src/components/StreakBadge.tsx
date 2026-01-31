import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StreakBadge({ streak, size = "md", showLabel = true }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  const numberSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <span className={cn("animate-flame inline-block", sizeClasses[size])}>
          🔥
        </span>
        {streak > 0 && (
          <span
            className={cn(
              "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2 font-bold text-accent-foreground shadow-lg",
              numberSizeClasses[size]
            )}
          >
            {streak}
          </span>
        )}
      </div>
      {showLabel && (
        <span className={cn("mt-2 font-medium text-muted-foreground", labelSizeClasses[size])}>
          {streak === 0 ? "Start your streak!" : streak === 1 ? "1 day streak" : `${streak} day streak`}
        </span>
      )}
    </div>
  );
}
