import { useState, useEffect, useCallback, useRef } from "react";

export type TimerState = "idle" | "running" | "paused" | "break";

interface UseTimerOptions {
  focusDuration?: number; // in minutes
  breakDuration?: number; // in minutes
  onComplete?: () => void;
  onBreakComplete?: () => void;
}

export function useTimer({
  focusDuration = 25,
  breakDuration = 5,
  onComplete,
  onBreakComplete,
}: UseTimerOptions = {}) {
  const [state, setState] = useState<TimerState>("idle");
  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = isBreak ? breakDuration * 60 : focusDuration * 60;
  const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (state === "idle" || state === "paused") {
      setState(isBreak ? "break" : "running");
    }
  }, [state, isBreak]);

  const pause = useCallback(() => {
    if (state === "running" || state === "break") {
      setState("paused");
    }
  }, [state]);

  const reset = useCallback(() => {
    clearTimer();
    setState("idle");
    setIsBreak(false);
    setTimeRemaining(focusDuration * 60);
  }, [clearTimer, focusDuration]);

  const skip = useCallback(() => {
    clearTimer();
    if (isBreak) {
      setIsBreak(false);
      setTimeRemaining(focusDuration * 60);
      setState("idle");
    } else {
      setIsBreak(true);
      setTimeRemaining(breakDuration * 60);
      setState("break");
    }
  }, [clearTimer, focusDuration, breakDuration, isBreak]);

  useEffect(() => {
    if (state === "running" || state === "break") {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            if (isBreak) {
              setIsBreak(false);
              setState("idle");
              setTimeRemaining(focusDuration * 60);
              onBreakComplete?.();
            } else {
              setSessionsCompleted((s) => s + 1);
              setIsBreak(true);
              setState("break");
              setTimeRemaining(breakDuration * 60);
              onComplete?.();
            }
            return isBreak ? focusDuration * 60 : breakDuration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [state, isBreak, focusDuration, breakDuration, onComplete, onBreakComplete, clearTimer]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return {
    state,
    isBreak,
    timeRemaining,
    formattedTime,
    progress,
    sessionsCompleted,
    start,
    pause,
    reset,
    skip,
  };
}
