import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { localStorage as ls } from "@/lib/storage";
import { StudySession } from "@/types/study";
import { toast } from "@/hooks/use-toast";

export function useStudySessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["study-sessions"],
    queryFn: async (): Promise<StudySession[]> => {
      try {
        const { data, error } = await supabase
          .from("study_sessions")
          .select("*")
          .order("study_date", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as StudySession[];
      } catch (e) {
        console.warn("Falling back to localStorage:", e);
        return ls.getStudySessions();
      }
    },
  });

  const addSession = useMutation({
    mutationFn: async (session: Omit<StudySession, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("study_sessions")
        .insert([session])
        .select()
        .single();

      if (error) {
        // Fallback to localStorage
        const localSession: StudySession = {
          ...session,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };
        ls.saveStudySession(localSession);
        return localSession;
      }

      return data as StudySession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
      toast({
        title: "Session logged! 📚",
        description: "Great job! Keep up the momentum.",
      });
    },
    onError: () => {
      toast({
        title: "Saved locally",
        description: "Session saved offline. Will sync when connected.",
        variant: "destructive",
      });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("study_sessions")
        .delete()
        .eq("id", id);

      if (error) {
        ls.deleteStudySession(id);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
      toast({
        title: "Session deleted",
        description: "The study session has been removed.",
      });
    },
  });

  return {
    sessions,
    isLoading,
    error,
    addSession,
    deleteSession,
  };
}
