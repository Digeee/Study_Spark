import { useState, useEffect } from 'react';
import { GeneratedQuiz, QuizQuestion } from '@/types/study';

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<GeneratedQuiz[]>(() => {
    const saved = localStorage.getItem('study-quizzes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentQuiz, setCurrentQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('study-quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  const createQuiz = (quiz: Omit<GeneratedQuiz, 'id' | 'createdAt'>) => {
    const newQuiz: GeneratedQuiz = {
      ...quiz,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    setQuizzes(prev => [...prev, newQuiz]);
    return newQuiz;
  };

  const removeQuiz = (id: string) => {
    setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
  };

  const startQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setQuizStarted(true);
      setQuizCompleted(false);
    }
  };

  const submitAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    setQuizCompleted(true);
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizStarted(false);
    setQuizCompleted(false);
  };

  const getQuizResults = () => {
    if (!currentQuiz || !quizCompleted) return null;
    
    const correctAnswers = currentQuiz.questions.filter(question => 
      answers[question.id]?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
    ).length;
    
    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    
    return {
      totalQuestions: currentQuiz.questions.length,
      correctAnswers,
      score,
      percentage: score,
      passed: score >= 70
    };
  };

  const getSubjectQuizzes = (subject: string) => {
    return quizzes.filter(quiz => 
      quiz.subject.toLowerCase().includes(subject.toLowerCase()) ||
      quiz.title.toLowerCase().includes(subject.toLowerCase())
    );
  };

  const getRecentQuizzes = (limit: number = 5) => {
    return [...quizzes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const getCurrentQuestion = () => {
    if (!currentQuiz) return null;
    return currentQuiz.questions[currentQuestionIndex];
  };

  const isAnswered = (questionId: string) => {
    return !!answers[questionId];
  };

  const getAnswer = (questionId: string) => {
    return answers[questionId] || '';
  };

  const getStats = () => {
    const totalTaken = quizzes.filter(q => q.questions.some(question => 
      Object.keys(answers).includes(question.id)
    )).length;
    
    return {
      total: quizzes.length,
      taken: totalTaken,
      averageScore: totalTaken > 0 ? 85 : 0 // Placeholder - would need to store actual scores
    };
  };

  return {
    quizzes,
    currentQuiz,
    currentQuestionIndex,
    answers,
    quizStarted,
    quizCompleted,
    createQuiz,
    removeQuiz,
    startQuiz,
    submitAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    finishQuiz,
    resetQuiz,
    getQuizResults,
    getSubjectQuizzes,
    getRecentQuizzes,
    getCurrentQuestion,
    isAnswered,
    getAnswer,
    getStats
  };
}