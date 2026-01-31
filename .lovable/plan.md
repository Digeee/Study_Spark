
# 📚 Smart Study Activity Tracking Platform

## Overview
A vibrant, modern web application that helps students log study sessions, track consistency, visualize progress, and receive smart productivity insights. The app will use Supabase for data persistence (with LocalStorage fallback) and feature a colorful, engaging design optimized for student users.

---

## 🎨 Design Direction
- **Modern & Colorful**: Vibrant gradients (purple/blue/pink accents), engaging card designs with subtle shadows
- **Student-Friendly**: Fun, motivating visuals with emoji-enhanced feedback
- **Mobile-First**: Fully responsive for studying on-the-go
- **Visual Hierarchy**: Clear focus on streaks, scores, and badges to drive engagement

---

## 📱 App Pages

### 1. Dashboard (`/`)
The main hub showing all key metrics at a glance:
- **Quick Stats Cards**: Today's study time, current streak, productivity score, level/XP
- **Study Time Chart**: Bar/line chart showing daily study time over the past week
- **Weekly Progress Summary**: Visual breakdown by subject with color-coded bars
- **Smart Insights Section**: "AI-powered" recommendation cards with actionable tips
- **Recent Activity Feed**: Last 5 study sessions with subject tags
- **Badge Showcase**: Display earned badges with progress to next badge

### 2. Add Study Session (`/add-study`)
Clean, focused form for logging study activities:
- Subject name (with recent subjects as quick-select chips)
- Duration input (minutes/hours toggle)
- Optional study goal text field
- Date picker (defaults to today)
- Visual confirmation with streak update preview
- "Start Focus Mode" quick action button

### 3. Focus Mode (`/focus-mode`)
Pomodoro timer with immersive UI:
- Large circular countdown timer (25 min focus / 5 min break)
- Start, Pause, Reset controls
- Session counter (completed pomodoros)
- Visual/audio completion alerts
- Quick log option when timer completes
- Customizable focus duration option

### 4. Progress & Achievements (`/achievements`)
Gamification center:
- All badges grid (earned vs. locked)
- Level progress bar with XP tracking
- Streak calendar heatmap
- Study statistics (total hours, favorite subjects, best study day)

---

## ⚡ Core Features

### Study Activity Logging
- Form with subject, duration, goal, and date fields
- Auto-save to Supabase (or LocalStorage if offline)
- Duplicate prevention (same subject + date warning)
- Quick-add recent subjects

### Study Time & Consistency Tracking
- Daily study totals calculated in real-time
- Weekly aggregated summaries
- **Streak System**:
  - Counts consecutive days with at least 1 logged session
  - Streak resets at midnight if no session logged
  - Visual streak counter with fire emoji 🔥

### Dashboard & Visual Analytics (using Recharts)
- **Daily Study Bar Chart**: Last 7 days with color-coded bars
- **Weekly Progress Line Chart**: Trending study time
- **Subject Breakdown**: Pie/donut chart by subject
- All charts with smooth animations and hover tooltips

### Productivity Score (Rule-Based, 0-100)
```
+40 points: Daily study ≥ 2 hours (scaled: 20pts for 1hr)
+30 points: Streak ≥ 3 days (10pts per day up to 3)
+30 points: Goal filled for session
```
- Visual score meter with color gradient (red → yellow → green)
- Daily score tracking for trends

### "AI-Powered" Smart Insights
Rule-based recommendations displayed as colorful tip cards:
- Low study time warnings with actionable suggestions
- Streak encouragement messages
- Productivity improvement tips
- Subject balance recommendations
- Time-of-day pattern insights
- Labeled as "AI-powered insights" in the UI ✨

---

## 🏆 Gamification Features

### Badge System
- 🥉 **Bronze**: 3-day streak
- 🥈 **Silver**: 5-day streak  
- 🥇 **Gold**: 7-day streak
- 📚 **Bookworm**: 10 total hours studied
- 🎯 **Goal Getter**: 5 sessions with goals completed
- ⚡ **Focus Master**: 5 pomodoro sessions completed

### Level System
- XP earned per minute studied
- Level milestones with visual celebrations
- Progress bar showing XP to next level

---

## ⏱️ Focus Mode (Pomodoro Timer)
- 25-minute focus countdown with circular progress
- 5-minute break timer
- Start / Pause / Reset controls
- Session completion sound effect
- Auto-log completed focus sessions
- Break reminders

---

## 💡 Smart Planning & Reminders
UI-based motivational messages:
- "You usually study best in the evening" (pattern detection)
- "You missed yesterday — let's restart today 💪"
- "You're on fire! 5 days and counting 🔥"
- Displayed contextually in dashboard cards

---

## 🗂️ Components Structure
- `StudyForm` - Add/edit study sessions
- `DashboardCards` - Stat display cards
- `StudyCharts` - Chart components wrapper
- `StreakBadge` - Streak display with fire animation
- `ProductivityScore` - Score meter visualization
- `SmartInsights` - AI tip cards carousel
- `PomodoroTimer` - Focus mode timer
- `BadgeGrid` - Achievement display
- `LevelProgress` - XP bar component

---

## 🔧 Technical Approach
- **Data Storage**: Supabase tables for study sessions, with LocalStorage fallback
- **Charts**: Recharts (already installed)
- **State**: React hooks + React Query for data fetching
- **Styling**: Tailwind CSS with custom gradient classes
- **Responsive**: Mobile-first with tablet/desktop breakpoints

---

## 📊 Data Model
**Study Sessions Table:**
- id, subject, duration_minutes, goal, study_date, created_at

**User Stats (calculated):**
- Daily totals, streaks, badges earned, level/XP (derived from sessions)

---

This plan delivers a polished, feature-complete study tracking platform that looks intelligent and encourages consistent study habits - perfect for demonstrating to hackathon judges in under 2 minutes! 🎓
