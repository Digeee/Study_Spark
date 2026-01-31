import { useState, useEffect } from 'react';
import { Flashcard } from '@/types/study';

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('study-flashcards');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('study-flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcard = (flashcard: Omit<Flashcard, 'id' | 'nextReview' | 'interval' | 'easeFactor'>) => {
    const newCard: Flashcard = {
      ...flashcard,
      id: `fc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nextReview: new Date().toISOString(),
      interval: 1,
      easeFactor: 2.5
    };
    
    setFlashcards(prev => [...prev, newCard]);
  };

  const removeFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(card => card.id !== id));
  };

  const updateFlashcard = (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev => 
      prev.map(card => 
        card.id === id ? { ...card, ...updates } : card
      )
    );
  };

  const getDueCards = () => {
    const now = new Date();
    return flashcards.filter(card => new Date(card.nextReview) <= now);
  };

  const getNewCards = () => {
    return flashcards.filter(card => new Date(card.nextReview) > new Date());
  };

  const flipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const nextCard = () => {
    if (flashcards.length > 0) {
      setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
      setShowAnswer(false);
    }
  };

  const rateCard = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;

    let newInterval: number;
    let newEaseFactor: number;
    let daysToAdd: number;

    switch (rating) {
      case 'again':
        newInterval = 1;
        newEaseFactor = Math.max(1.3, currentCard.easeFactor - 0.2);
        daysToAdd = 0;
        break;
      case 'hard':
        newInterval = currentCard.interval * 1.2;
        newEaseFactor = Math.max(1.3, currentCard.easeFactor - 0.15);
        daysToAdd = Math.round(newInterval);
        break;
      case 'good':
        newInterval = currentCard.interval * currentCard.easeFactor;
        newEaseFactor = currentCard.easeFactor;
        daysToAdd = Math.round(newInterval);
        break;
      case 'easy':
        newInterval = currentCard.interval * currentCard.easeFactor * 1.3;
        newEaseFactor = currentCard.easeFactor + 0.1;
        daysToAdd = Math.round(newInterval);
        break;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysToAdd);

    updateFlashcard(currentCard.id, {
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReview: nextReview.toISOString()
    });

    nextCard();
  };

  const getCurrentCard = () => {
    return flashcards[currentCardIndex] || null;
  };

  const getStats = () => {
    const dueCards = getDueCards();
    const newCards = getNewCards();
    
    return {
      total: flashcards.length,
      due: dueCards.length,
      new: newCards.length,
      mastered: flashcards.filter(c => c.interval > 30).length
    };
  };

  return {
    flashcards,
    currentCardIndex,
    showAnswer,
    addFlashcard,
    removeFlashcard,
    updateFlashcard,
    getDueCards,
    getNewCards,
    flipCard,
    nextCard,
    rateCard,
    getCurrentCard,
    getStats
  };
}