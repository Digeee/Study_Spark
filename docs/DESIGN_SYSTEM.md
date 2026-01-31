# Design System

## Color Palette
- Primary Green: `#2ECC71` (HSL 145, 63%, 49%)
- Secondary Green: `#27AE60` (HSL 145, 63%, 42–55% dark variants)
- Accent Orange: `#FF6B35` (HSL 14, 100%, 61%)
- Accent Orange Alt: `#F7931E` (HSL 35, 91%, 54%)

## Tokens
- CSS variables in `src/index.css` under `:root` and `.dark`:
  - `--primary`, `--accent`, `--secondary`, `--ring`, `--radius`.
  - Study colors `--study-*` align with the palette.
  - Gradient stops `--gradient-start`, `--gradient-end`.

## Typography Scale
- Headings: `text-2xl`, `text-3xl` for card titles and page titles.
- Body: `text-sm` default, `text-base` for inputs.
- Emphasis: `font-semibold` and `font-bold` for hierarchy.

## Components
- Buttons: rounded-xl, hover scale and shadow, accessible focus rings.
- Cards: glassmorphism (`glass-card`), subtle shadows, rounded-2xl.
- Navigation: roles and `aria-current`, consistent spacing.
- Forms: rounded inputs, visible focus states, labels.
- Badges: accent-tinted glass badges for highlights.

## Motion & Micro-interactions
- Hover scale, active press, `shimmer`, `float`, and smooth transitions.
- Loading states use `animate-pulse` and `shimmer` where applicable.

## Accessibility
- Contrast verified with green/orange against light/dark backgrounds.
- Focus rings use `--ring` based on primary green.
- `aria-live` on dynamic content (chat), skip link in layout.

## Application
- Use Tailwind utility classes and CSS variables to style consistently.
- Prefer `glass-*` utilities for glossy aesthetics.