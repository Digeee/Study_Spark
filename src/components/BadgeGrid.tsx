import { cn } from "@/lib/utils";
import { Badge } from "@/types/study";

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={cn(
            "relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
            badge.earned
              ? "border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg"
              : "border-border bg-muted/30 opacity-50 grayscale"
          )}
        >
          <span className={cn("text-3xl", badge.earned && "animate-float")}>
            {badge.emoji}
          </span>
          <div>
            <p className="text-sm font-semibold">{badge.name}</p>
            <p className="text-xs text-muted-foreground">{badge.requirement}</p>
          </div>
          {badge.earned && (
            <div className="absolute -right-1 -top-1 rounded-full bg-study-green px-1.5 py-0.5 text-xs text-primary-foreground">
              ✓
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
