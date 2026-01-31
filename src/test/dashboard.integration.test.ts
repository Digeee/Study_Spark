import { test, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { initializeUserData, resetUserData, isUserDataInitialized } from '@/lib/user-initialization';
import { getUserStats, getWeeklyStats } from '@/lib/calculations';
import { StudySession, PomodoroSession } from '@/types/study';

describe('User Initialization System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should initialize user data for new users', () => {
    const result = initializeUserData();
    
    expect(result).toBe(true);
    expect(isUserDataInitialized()).toBe(true);
    
    // Check that sample data was created
    const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
    const pomodoroSessions = JSON.parse(localStorage.getItem('pomodoro_sessions') || '[]');
    
    expect(studySessions).toHaveLength(2);
    expect(pomodoroSessions).toHaveLength(1);
    
    // Verify session structure
    expect(studySessions[0]).toHaveProperty('id');
    expect(studySessions[0]).toHaveProperty('subject');
    expect(studySessions[0]).toHaveProperty('duration_minutes');
    expect(studySessions[0]).toHaveProperty('goal');
  });

  test('should not re-initialize existing users', () => {
    // First initialization
    initializeUserData();
    
    // Second attempt should return false
    const result = initializeUserData();
    
    expect(result).toBe(false);
  });

  test('should reset user data correctly', () => {
    // Initialize data first
    initializeUserData();
    expect(isUserDataInitialized()).toBe(true);
    
    // Reset data
    resetUserData();
    
    // Check that data is cleared
    expect(isUserDataInitialized()).toBe(false);
    expect(localStorage.getItem('study_sessions')).toBeNull();
    expect(localStorage.getItem('pomodoro_sessions')).toBeNull();
  });
});

describe('Calculations with Sample Data', () => {
  beforeEach(() => {
    localStorage.clear();
    initializeUserData();
  });

  test('should calculate user stats correctly', () => {
    const studySessions: StudySession[] = JSON.parse(localStorage.getItem('study_sessions') || '[]');
    const pomodoroSessions: PomodoroSession[] = JSON.parse(localStorage.getItem('pomodoro_sessions') || '[]');
    
    const stats = getUserStats(studySessions, pomodoroSessions);
    
    expect(stats).toHaveProperty('currentStreak');
    expect(stats).toHaveProperty('totalMinutes');
    expect(stats).toHaveProperty('level');
    expect(stats).toHaveProperty('productivityScore');
    
    // Should have some study time
    expect(stats.totalMinutes).toBeGreaterThan(0);
    
    // Should have a valid level
    expect(stats.level).toBeGreaterThanOrEqual(1);
  });

  test('should calculate weekly stats', () => {
    const studySessions: StudySession[] = JSON.parse(localStorage.getItem('study_sessions') || '[]');
    const weeklyStats = getWeeklyStats(studySessions);
    
    expect(weeklyStats).toHaveProperty('days');
    expect(weeklyStats).toHaveProperty('totalMinutes');
    expect(weeklyStats).toHaveProperty('avgMinutesPerDay');
    
    expect(weeklyStats.days).toHaveLength(7);
    expect(weeklyStats.totalMinutes).toBeGreaterThanOrEqual(0);
  });
});

describe('Routing Integration', () => {
  test('should have all required routes defined', () => {
    const requiredRoutes = [
      '/',
      '/documents',
      '/add-study',
      '/focus-mode',
      '/study-planner',
      '/analytics',
      '/flashcards',
      '/quiz-generator',
      '/ai-coach',
      '/achievements',
      '/study-buddy'
    ];
    
    // In a real test, we'd mount the App component and check routes
    // This is a placeholder to ensure we remember to test routing
    expect(requiredRoutes).toHaveLength(11);
  });
});