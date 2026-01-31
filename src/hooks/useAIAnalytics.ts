import { useState, useEffect } from 'react';
import { StudySession, AIAnalytics } from '@/types/study';
import { generateAIAnalytics } from '@/integrations/ai/gemini';
import { getUserStats } from '@/lib/calculations';
import { useStudySessions } from './useStudySessions';
import { usePomodoroSessions } from './usePomodoroSessions';

export function useAIAnalytics() {
  const { sessions } = useStudySessions();
  const { sessions: pomodoros } = usePomodoroSessions();
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const stats = getUserStats(sessions, pomodoros);

  const generateAnalytics = async () => {
    try {
      setIsLoading(true);
      
      const aiAnalytics = await generateAIAnalytics(sessions, stats);
      setAnalytics(aiAnalytics);
      setLastGenerated(new Date());
      
      // Save to localStorage
      localStorage.setItem('ai-analytics', JSON.stringify({
        data: aiAnalytics,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Analytics generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai-analytics');
    if (saved) {
      try {
        const { data, timestamp } = JSON.parse(saved);
        setAnalytics(data);
        setLastGenerated(new Date(timestamp));
        
        // Regenerate if older than 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (new Date(timestamp) < oneDayAgo) {
          generateAnalytics();
        }
      } catch (error) {
        console.error('Failed to load saved analytics:', error);
      }
    } else {
      // Generate on first load
      generateAnalytics();
    }
  }, []);

  // Regenerate when sessions change significantly
  useEffect(() => {
    if (sessions.length > 0 && !analytics) {
      generateAnalytics();
    }
  }, [sessions.length]);

  const getKnowledgeGapRecommendations = () => {
    if (!analytics) return [];
    return analytics.knowledgeGaps.map(gap => ({
      ...gap,
      urgency: gap.confidence < 30 ? 'high' : gap.confidence < 60 ? 'medium' : 'low'
    }));
  };

  const getOptimalStudySchedule = () => {
    if (!analytics) return [];
    
    // Group by day of week and find best hours
    const schedule: Record<number, any[]> = {};
    
    analytics.optimalStudyTimes.forEach(slot => {
      if (!schedule[slot.dayOfWeek]) {
        schedule[slot.dayOfWeek] = [];
      }
      schedule[slot.dayOfWeek].push(slot);
    });
    
    return Object.entries(schedule).map(([day, slots]) => ({
      day: parseInt(day),
      bestSlots: slots.sort((a, b) => b.productivityScore - a.productivityScore).slice(0, 2),
      averageScore: slots.reduce((sum, slot) => sum + slot.productivityScore, 0) / slots.length
    })).sort((a, b) => b.averageScore - a.averageScore);
  };

  const getSubjectPredictions = () => {
    if (!analytics) return [];
    return analytics.progressPredictions;
  };

  const getLearningStyleRecommendations = () => {
    if (!analytics?.learningStyle) return null;
    
    return {
      ...analytics.learningStyle,
      studyTechniques: getStudyTechniquesForStyle(analytics.learningStyle.type)
    };
  };

  const getProductivityPatterns = () => {
    return analytics?.productivityPatterns || [];
  };

  const getDaysSinceLastGeneration = () => {
    if (!lastGenerated) return null;
    return Math.floor((Date.now() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24));
  };

  return {
    analytics,
    isLoading,
    lastGenerated,
    generateAnalytics,
    getKnowledgeGapRecommendations,
    getOptimalStudySchedule,
    getSubjectPredictions,
    getLearningStyleRecommendations,
    getProductivityPatterns,
    getDaysSinceLastGeneration,
    stats
  };
}

function getStudyTechniquesForStyle(style: string): string[] {
  switch (style) {
    case 'visual':
      return [
        'Use diagrams and mind maps',
        'Create color-coded notes',
        'Watch educational videos',
        'Use flashcards with images'
      ];
    case 'auditory':
      return [
        'Record and listen to lectures',
        'Explain concepts out loud',
        'Join study groups for discussion',
        'Use audio learning materials'
      ];
    case 'kinesthetic':
      return [
        'Take hands-on practice tests',
        'Use physical manipulatives',
        'Walk while studying/reviewing',
        'Write notes by hand'
      ];
    case 'reading/writing':
      return [
        'Create detailed written summaries',
        'Rewrite notes in your own words',
        'Practice essay writing',
        'Use text-based flashcards'
      ];
    default:
      return [
        'Mix different learning approaches',
        'Try various study techniques',
        'Experiment with active recall',
        'Use spaced repetition'
      ];
  }
}