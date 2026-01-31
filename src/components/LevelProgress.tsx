import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LevelProgressProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export function LevelProgress({ level, xp, xpToNextLevel }: LevelProgressProps) {
  const totalXpForLevel = xp % 60;
  const progressPercent = (totalXpForLevel / 60) * 100;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-gradient-to-r from-primary/5 to-accent/5 p-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground shadow-lg">
        {level}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-semibold">Level {level}</span>
          <span className="text-sm text-muted-foreground">
            {totalXpForLevel} / 60 XP
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <p className="mt-1 text-xs text-muted-foreground">
          {xpToNextLevel} XP to level {level + 1}
        </p>
      </div>
    </div>
  );
}
