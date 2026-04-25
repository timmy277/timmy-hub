---
inclusion: auto
---

# Design System — Minimals UI

Follow these rules when writing any frontend UI code for this project.

## Fonts
- Primary: `Public Sans Variable`
- Stack: `Public Sans Variable, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif`
- Base size: 16px, weight: 400, line-height: 24px

## Typography Scale
| Token | Value |
|-------|-------|
| xs | 12px |
| sm | 13.33px |
| md | 14px |
| lg | 15px |
| xl | 16px |
| 2xl | 19px |
| 3xl | 20px |
| 4xl | 24px |

## Color Tokens
| Token | Value |
|-------|-------|
| text.primary | #1c252e |
| text.secondary | #637381 |
| text.tertiary | #ffffff |
| text.inverse | #00a76f |
| surface.base | #000000 |
| surface.raised | #f4f6f8 |
| brand.primary | #00a76f |

## Spacing Scale
`2px / 4px / 6px / 8px / 12px / 16px / 20px / 24px`

## Radius & Motion
- Radius: xs=8px, sm=10px, md=50px (pill)
- Motion: instant=150ms, fast=200ms, normal=250ms, slow=300ms

## Component Rules

### Every interactive component MUST define these states:
`default` | `hover` | `focus-visible` | `active` | `disabled` | `loading` | `error`

### Buttons
- Use semantic tokens, never raw hex
- Pill radius (radius.md = 50px) for primary CTAs
- Min touch target: 44×44px
- Loading state must show spinner, disable pointer events
- Disabled: opacity 0.48, cursor not-allowed

### Forms / Inputs
- Label above input, never placeholder-only
- Error message below input in red, with icon
- Focus ring: 2px solid brand.primary offset 2px
- Required fields marked with asterisk

### Cards / Surfaces
- Background: surface.raised (#f4f6f8) on light
- Border-radius: radius.xs (8px)
- Elevation via box-shadow, not border

### Navigation
- Active state: text.inverse (#00a76f) color
- Hover: background surface.raised
- Focus-visible: visible outline required

## Accessibility (WCAG 2.2 AA)
- All text must meet 4.5:1 contrast ratio (3:1 for large text)
- Focus indicators must be visible — never `outline: none` without replacement
- Keyboard navigation required for all interactive elements
- Touch targets minimum 44×44px
- No information conveyed by color alone

## Anti-patterns — NEVER do these:
- Raw hex colors in component code (use tokens)
- `outline: none` without visible focus replacement
- Placeholder text as the only label
- One-off spacing values outside the scale
- Low-contrast text (text.secondary on white must be checked)
- Ambiguous button labels ("Click here", "Submit")

## Writing Tone
Concise, confident, implementation-focused. Action-oriented labels.
