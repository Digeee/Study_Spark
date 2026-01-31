import { useState } from "react";
import { useTimer } from "@/hooks/useTimer";
import { usePomodoroSessions } from "@/hooks/usePomodoroSessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, SkipForward, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PomodoroTimer() {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const { addSession } = usePomodoroSessions();

  const handleComplete = () => {
    addSession.mutate(focusDuration);
    // Play sound notification
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAxAqN7ilFwsYnvJ34mIhoSFhYiJiYeGg4KBf35/gIGCg4SFhoaGhYWEg4KBgH9+fn5/gIGCg4SFhYWFhYSEg4KBgIB/fn5+f4CBgoOEhIWFhYWEhIOCgYGAgH9+fn9/gIGCg4OEhISEhISDgoGBgIB/fn5/f4CBgoKDg4SEhISDg4KCgYGAf39/f4CAgYKCg4ODg4ODg4KCgYGAgH9/f3+AgIGCgoODg4ODg4KCgoGBgIB/f39/gICBgoKDg4ODg4KCgoKBgYCAf39/f4CAgYKCgoODg4OCgoKCgYGAgH9/f3+AgIGBgoKDg4OCgoKCgoGBgIB/f39/gICBgYKCg4ODgoKCgoKBgYCAf39/f4CAgIGCgoKDg4KCgoKCgYGAgH9/f39/gICBgYKCgoKCgoKCgoGBgIB/f39/f4CAgYGCgoKCgoKCgoGBgYB/f39/f4CAgIGBgoKCgoKCgoKBgYCAf39/f3+AgICBgYKCgoKCgoKCgYGAgH9/f39/gICAgYGCgoKCgoKCgYGBgH9/f39/f4CAgIGBgoKCgoKCgoGBgIB/f39/f3+AgICBgYKCgoKCgoKBgYCAf39/f39/gICAgYGBgoKCgoKCgYGAgH9/f39/f4CAgIGBgYKCgoKCgoGBgIB/f39/f3+AgICAgYGBgoKCgoKBgYGAf39/f39/f4CAgIGBgYKCgoKCgYGBgH9/f39/f3+AgICAgYGBgoKCgoGBgYB/f39/f39/gICAgIGBgYKCgoKBgYGAf39/f39/f4CAgICBgYGBgoKCgYGBgH9/f39/f39/gICAgIGBgYKCgoGBgYB/f39/f39/f4CAgICAgYGBgoKBgYGAf39/f39/f3+AgICAgIGBgYKCgYGBgH9/f39/f39/gICAgICBgYGCgoGBgYB/f39/f39/f4CAgICAgYGBgoGBgYGAf39/f39/f3+AgICAgICBgYGCgYGBgH9/f39/f39/gICAgICAgYGBgoGBgYB/f39/f39/f4CAgICAgIGBgYGBgYGAf39/f39/f3+AgICAgICBgYGBgYGBgH9/f39/f39/gICAgICAgYGBgYGBgYB/f39/f39/f4CAgICAgIGBgYGBgYGAf39/f39/f39/gICAgICAgYGBgYGBgH9/f39/f39/f4CAgICAgICBgYGBgYGAf39/f39/f39/gICAgICAgIGBgYGBgYB/f39/f39/f3+AgICAgICAgYGBgYGBgH9/f39/f39/f4CAgICAgICBgYGBgYGAf39/f39/f39/gICAgICAgIGBgYGBgYB/f39/f39/f39/gICAgICAgIGBgYGBgH9/f39/f39/f3+AgICAgICAgYGBgYGAf39/f39/f39/f4CAgICAgICBgYGBgYB/f39/f39/f39/gICAgICAgICBgYGBgYB/f39/f39/f39/gICAgICAgICBgYGBgIB/f39/f39/f39/gICAgICAgIGBgYGBgH9/f39/f39/f39/gICAgICAgICBgYGBgH9/f39/f39/f39/gICAgICAgICBgYGBgH9/f39/f39/f39/f4CAgICAgICAgYGBgYB/f39/f39/f39/f4CAgICAgICAgYGBgYB/f39/f39/f39/f4CAgICAgICAgYGBgIB/f39/f39/f39/f3+AgICAgICAgIGBgYCAf39/f39/f39/f3+AgICAgICAgICBgYGAf39/f39/f39/f39/gICAgICAgICAgYGBgH9/f39/f39/f39/f4CAgICAgICAgIGBgYB/f39/f39/f39/f3+AgICAgICAgICBgYGAf39/f39/f39/f39/gICAgICAgICAgYGBf39/f39/f39/f39/f4CAgICAgICAgIGBgX9/f39/f39/f39/f3+AgICAgICAgICBgYF/f39/f39/f39/f39/gICAgICAgICAgYGBf39/f39/f39/f39/f4CAgICAgICAgICBgX9/f39/f39/f39/f3+AgICAgICAgICAgYF/f39/f39/f39/f39/f4CAgICAgICAgICBgX9/f39/f39/f39/f3+AgICAgICAgICAgIF/f39/f39/f39/f39/f4CAgICAgICAgICAgX9/f39/f39/f39/f39/gICAgICAgICAgICBf39/f39/f39/f39/f3+AgICAgICAgICAgIF/f39/f39/f39/f39/f4CAgICAgICAgICAgH9/f39/f39/f39/f39/gICAgICAgICAgICAf39/f39/f39/f39/f3+AgICAgICAgICAgIB/f39/f39/f39/f39/f4CAgICAgICAgICAgH9/f39/f39/f39/f39/gICAgICAgICAgICAf39/f39/f39/f39/f3+AgICAgICAgICAgIB/f39/f39/f39/f39/f4CAgICAgICAgICAgH9/f39/f39/f39/f39/gICAgICAgICAgIB/f39/f39/f39/f39/f3+AgICAgICAgICAgH9/f39/f39/f39/f39/f4CAgICAgICAgICAf39/f39/f39/f39/f39/gICAgICAgICAgIB/f39/f39/f39/f39/f3+AgICAgICAgICAgH9/f39/f39/f39/f39/f4CAgICAgICAgIB/");
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      // Audio not supported
    }
  };

  const {
    state,
    isBreak,
    formattedTime,
    progress,
    sessionsCompleted,
    start,
    pause,
    reset,
    skip,
  } = useTimer({
    focusDuration,
    breakDuration,
    onComplete: handleComplete,
  });

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <span>{isBreak ? "☕" : "⚡"}</span>
            {isBreak ? "Break Time" : "Focus Mode"}
          </CardTitle>
          <p className="text-muted-foreground">
            {isBreak ? "Take a short break and recharge" : "Stay focused and avoid distractions"}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {/* Timer Circle */}
          <div className="relative">
            <svg className="h-64 w-64 -rotate-90 transform" viewBox="0 0 256 256">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="12"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke={isBreak ? "hsl(var(--study-green))" : "url(#timerGradient)"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold tabular-nums">
                {formattedTime}
              </span>
              <span className="mt-2 text-muted-foreground">
                {state === "idle" && "Ready to start"}
                {state === "running" && "Focusing..."}
                {state === "paused" && "Paused"}
                {state === "break" && "Resting..."}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="h-12 w-12"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              onClick={state === "running" || state === "break" ? pause : start}
              className={cn(
                "h-16 w-16 rounded-full",
                state === "running" || state === "break"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-gradient-to-r from-primary to-accent"
              )}
            >
              {state === "running" || state === "break" ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={skip}
              className="h-12 w-12"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Sessions completed */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-2xl">🍅</span>
            <span className="font-medium">
              {sessionsCompleted} {sessionsCompleted === 1 ? "session" : "sessions"} completed
            </span>
          </div>

          {/* Duration settings */}
          <div className="flex w-full items-center gap-4 rounded-lg border bg-secondary/30 p-4">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-1 items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Focus</label>
                <Select
                  value={focusDuration.toString()}
                  onValueChange={(v) => setFocusDuration(parseInt(v))}
                  disabled={state !== "idle"}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="25">25 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Break</label>
                <Select
                  value={breakDuration.toString()}
                  onValueChange={(v) => setBreakDuration(parseInt(v))}
                  disabled={state !== "idle"}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 min</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
