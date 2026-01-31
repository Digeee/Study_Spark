# UI Redesign

## Goals
- Improve accessibility, navigation, and responsiveness.
- Modern aesthetics while keeping clarity and focus.

## Changes
- Navigation: `aria` roles, `aria-current`, consistent focus styles.
- Layout: `AppLayout` adds `role=banner` and `role=main`, skip link.
- AICoach: responsive 2+1 grid, `aria-live` chat log, debug toggle, local insights panel.

## Accessibility
- Keyboard navigation supported with clear focus indicators.
- Announcements via `aria-live` for new chat messages.
- Color contrast adheres to Tailwind theme tokens.

## Responsive Layout
- Mobile bottom nav retained; desktop header navigation consistent.
- AICoach chat and insights stack on mobile, split on larger screens.

## User Acceptance Criteria
- Navigation is clear and reachable via keyboard.
- Chat interactions provide immediate feedback and do not freeze under AI outages.
- Local insights render within 1s when AI is unavailable.
- Main content focus is reachable via “Skip to content”.

## Verification
- Manually test at `http://localhost:8082` on mobile and desktop widths.
- Use browser devtools for Lighthouse accessibility checks.
- Confirm layout adapts at common breakpoints (sm, md, lg).