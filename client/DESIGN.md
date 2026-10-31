# PDF Past Paper Manager - Design System

## Color Tokens (Semantic)

### Light Theme
```css
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-active: #1d4ed8;
  --color-primary-subtle: rgba(59, 130, 246, 0.1);
  --color-primary-focus: rgba(59, 130, 246, 0.25);

  --color-success: #10b981;
  --color-success-hover: #059669;
  --color-success-subtle: rgba(16, 185, 129, 0.1);

  --color-warning: #f59e0b;
  --color-warning-hover: #d97706;
  --color-warning-subtle: rgba(245, 158, 11, 0.1);

  --color-error: #ef4444;
  --color-error-hover: #dc2626;
  --color-error-subtle: rgba(239, 68, 68, 0.1);

  --color-bg: #f9fafb;
  --color-surface: #ffffff;
  --color-surface-hover: #f3f4f6;
  --color-surface-active: #e5e7eb;

  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;
  --color-border-focus: #3b82f6;

  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-text-inverse: #ffffff;

  --color-overlay: rgba(0, 0, 0, 0.5);
  --color-overlay-strong: rgba(0, 0, 0, 0.7);
}
```

### Dark Theme
```css
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-primary-hover: #93c5fd;
  --color-primary-active: #3b82f6;
  --color-primary-subtle: rgba(96, 165, 250, 0.15);
  --color-primary-focus: rgba(96, 165, 250, 0.35);

  --color-success: #34d399;
  --color-success-hover: #6ee7b7;
  --color-success-subtle: rgba(52, 211, 153, 0.15);

  --color-warning: #fbbf24;
  --color-warning-hover: #fcd34d;
  --color-warning-subtle: rgba(251, 191, 36, 0.15);

  --color-error: #f87171;
  --color-error-hover: #fca5a5;
  --color-error-subtle: rgba(248, 113, 113, 0.15);

  --color-bg: #111827;
  --color-surface: #1f2937;
  --color-surface-hover: #374151;
  --color-surface-active: #4b5563;

  --color-border: #374151;
  --color-border-strong: #4b5563;
  --color-border-focus: #60a5fa;

  --color-text: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-muted: #9ca3af;
  --color-text-inverse: #111827;

  --color-overlay: rgba(0, 0, 0, 0.7);
  --color-overlay-strong: rgba(0, 0, 0, 0.85);
}
```

## Spacing Scale
```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

## Border Radius
```css
:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
}
```

## Shadows
```css
:root {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
  --shadow-focus: 0 0 0 3px var(--color-primary-focus);
}
```

## Typography
```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;

  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  --line-height-tight: 1.3;
  --line-height-base: 1.5;
  --line-height-relaxed: 1.6;

  --tracking-tight: -0.02em;
  --tracking-normal: 0;
}
```

## Motion
```css
:root {
  --motion-fast: 100ms;
  --motion-base: 150ms;
  --motion-slow: 250ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Z-Index Scale
```css
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 1000;
  --z-modal: 1010;
  --z-popover: 1100;
  --z-tooltip: 1200;
  --z-toast: 1300;
}
```

## Component Tokens

### Button
```css
--btn-height-sm: 28px;
--btn-height-base: 36px;
--btn-height-lg: 44px;
--btn-padding-x-sm: 10px;
--btn-padding-x-base: 16px;
--btn-padding-x-lg: 20px;
--btn-gap: 8px;
```

### Input
```css
--input-height: 36px;
--input-padding-x: 12px;
--input-border-width: 1px;
```

### Icon Button
```css
--icon-btn-size-sm: 24px;
--icon-btn-size-base: 32px;
--icon-btn-size-lg: 36px;
```

## Icon System
- Use Lucide React (or similar) for consistent stroke-weight icons
- 20x20 default, 16x16 small, 24x24 large
- Stroke width: 2px default, 1.5px small
- Icons inherit currentColor

## States (Every Interactive Component)
| State | Visual Treatment |
|-------|------------------|
| Default | Base tokens |
| Hover | `--color-surface-hover`, `--color-border-strong` |
| Active/Pressed | `--color-surface-active`, scale(0.98) |
| Focus | `--shadow-focus`, `--color-border-focus` |
| Disabled | `--color-text-muted`, `--color-border`, cursor: not-allowed, opacity: 0.5 |
| Loading | Skeleton or spinner, disabled interaction |
| Error | `--color-error` border, `--color-error-subtle` bg |

## Loading States
- **Skeleton:** `--color-surface` → `--color-surface-hover` pulse animation
- **Inline spinner:** 16x16, `--color-primary`, 1s linear rotation

## Empty States
- Icon (48px), heading (16px, semibold), description (14px, secondary), primary action
- Centered, max-width 320px

## Responsive Breakpoints
```css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
```

## Breakpoint Behavior
- **Sidebar:** Fixed 280px desktop → drawer on mobile (< 768px)
- **Paper view:** Two-pane desktop → stacked drawers on mobile
- **Grids:** `minmax(220px, 1fr)` → single column < 640px
- **Typography:** Fixed rem scale (no fluid)
- **Density:** Comfortable desktop, compact mobile