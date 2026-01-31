import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { localStorage as ls } from "@/lib/storage";
import { PomodoroSession } from "@/types/study";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export function usePomodoroSessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["pomodoro-sessions"],
    queryFn: async (): Promise<PomodoroSession[]> => {
      try {
        const { data, error } = await supabase
          .from("pomodoro_sessions")
          .select("*")
          .order("completed_at", { ascending: false });

        if (error) throw error;
        return data as PomodoroSession[];
      } catch (e) {
        console.warn("Falling back to localStorage:", e);
        return ls.getPomodoroSessions();
      }
    },
  });

  const addSession = useMutation({
    mutationFn: async (durationMinutes: number = 25) => {
      const session = {
        duration_minutes: durationMinutes,
        study_date: format(new Date(), "yyyy-MM-dd"),
      };

      const { data, error } = await supabase
        .from("pomodoro_sessions")
        .insert([session])
        .select()
        .single();

      if (error) {
        const localSession: PomodoroSession = {
          ...session,
          id: crypto.randomUUID(),
          completed_at: new Date().toISOString(),
        };
        ls.savePomodoroSession(localSession);
        return localSession;
      }

      return data as PomodoroSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro-sessions"] });
      toast({
        title: "Focus session complete! ⚡",
        description: "Great focus! Take a well-deserved break.",
      });
    },
  });

  return {
    sessions,
    isLoading,
    error,
    addSession,
  };
}
