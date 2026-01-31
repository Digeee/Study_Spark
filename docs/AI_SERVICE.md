# AI Service Reliability

## Overview
- Integrates Google Generative AI via `@google/generative-ai`.
- Provides insights generation, chat coaching, and goal suggestions.

## Fix Summary
- Added retry with exponential backoff and 8s request timeout.
- Implemented circuit breaker to pause calls after repeated failures.
- Added structured logging and local fallbacks for all operations.

## Implementation
- Client: `src/integrations/ai/gemini.ts`
- Logger: `src/lib/logger.ts`
- UI: `src/pages/AICoach.tsx`, `src/components/StudyForm.tsx`, `src/pages/Dashboard.tsx`

### Error Handling
- Timeout and network errors trigger retry up to 3 attempts.
- After 3 failures, circuit opens for 60s.
- All failures log with level and metadata.

### Fallbacks
- Insights: local heuristic insights when AI fails.
- Chat: short tactic reply derived from user stats.
- Goal Suggestion: heuristic goal string using subject and duration.

### Logging
- Use `logger` for `debug`, `info`, `warn`, `error`.
- AICoach exposes a Debug panel to view recent logs.

## Testing Procedures
- Unit: run `npm test -s`.
- Lint/type: run `npm run lint`.
- Manual: disconnect network, trigger AI calls; verify fallback messages and logs.
- Load: perform rapid consecutive requests; confirm circuit breaker opens and UI feedback remains responsive.

## Stability Criteria
- No uncaught errors surfaced to users.
- Fallback content is returned within 1.5s under failure.
- Circuit resets after cooldown and resumes successful calls.