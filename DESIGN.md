# Design System Inspired by Minimals

## 1. Visual Theme & Atmosphere

Minimals embodies a clean, modern, and minimalist aesthetic designed for productivity and clarity. The design prioritizes simplicity and function, using a refined palette of deep neutrals paired with vibrant accent colors that pop against spacious, light backgrounds. The visual language feels contemporary and approachable, balancing professional sophistication with friendly accessibility. Geometric elements and playful colored dots accent the layout, creating visual interest without clutter. The overall mood is confident, efficient, and forward-thinking—ideal for developer tools and UI kits that empower creation.

**Key Characteristics**
- Minimalist, clutter-free layouts with generous whitespace
- Deep charcoal and navy foundations paired with bright emerald and cyan accents
- Rounded and circular elements for softness and approachability
- Clean typography hierarchy with distinct font personalities
- Semantic color system for status and interactive feedback
- Subtle shadows and elevations to create depth without heaviness
- Emphasis on usability and developer-first design principles

## 2. Color Palette & Roles

### Primary
- **Primary Dark** (`#1C252E`): Primary text, headings, and core brand elements; dominant neutral anchor throughout the interface
- **Primary Navy** (`#003768`): Darker brand accent for emphasis and depth in key CTAs or backgrounds

### Accent Colors
- **Success Green** (`#00A76F`): Primary interactive accent; links, active states, and call-to-action buttons
- **Success Green Light** (`#5BE49B`): Lighter success state for hover, focus, and secondary interactive feedback
- **Cyan** (`#00B8D9`): Secondary accent for alternative CTAs and data visualization highlights

### Interactive
- **Primary Green Hover** (`#5BE49B`): Hover and focus state for green interactive elements
- **Secondary Gray** (`#637381`): Secondary interactive text and muted UI elements
- **Tertiary Gray** (`#919EAB`): Disabled states, secondary hints, and de-emphasized content

### Neutral Scale
- **White** (`#FFFFFF`): Primary background and card surfaces
- **Off-White** (`#F9FAFB`): Subtle background tint for sections and containers
- **Light Gray** (`#F4F6F8`): Alternative light background for layered content
- **Pale Gray** (`#F5F5F5`): Border and divider backgrounds
- **Border Gray** (`#DFE3E8`): Light borders and dividers between content
- **Medium Gray** (`#C4CDD5`): Stronger borders and subtle dividers

### Surface & Borders
- **Border Gray** (`#DFE3E8`): Thin borders and stroke lines
- **Divider Medium** (`#C4CDD5`): Stronger dividers between sections

### Semantic / Status
- **Warning** (`#FFAB00`): Warning alerts and cautionary UI states
- **Error** (`#B71D18`): Error messages and destructive actions
- **Success** (`#22C55E`): Positive confirmations and success messages

## 3. Typography Rules

### Font Family
- **Primary Display Font:** Barlow (sans-serif stack: Barlow, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif)
- **Primary Body Font:** Public Sans Variable (sans-serif stack: 'Public Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif)

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display 1 | Barlow | 72px | 800 | 90px | -1.5px | Hero headings and page titles |
| Display 2 | Barlow | 48px | 800 | 64px | -1px | Section headings and prominent titles |
| Heading 1 | Barlow | 32px | 700 | 48px | -0.5px | Major section headings |
| Heading 2 | Public Sans Variable | 24px | 700 | 36px | 0px | Subsection headings and card titles |
| Heading 3 | Public Sans Variable | 19px | 700 | 28.5px | 0px | Component labels and secondary headings |
| Body Large | Public Sans Variable | 20px | 400 | 36px | 0px | Primary body text and descriptive copy |
| Body Regular | Public Sans Variable | 16px | 400 | 24px | 0px | Default paragraph and link text |
| Label Strong | Public Sans Variable | 14px | 600 | 22px | 0.5px | Form labels, captions, and emphasis |
| Button | Public Sans Variable | 16px | 400 | 24px | 0.5px | Button text and inline actions |
| Caption Small | Public Sans Variable | 10px | 500 | 18px | 0px | Small helper text, timestamps, and metadata |

### Principles
- **Personality Through Font Pairing:** Barlow conveys boldness and confidence for display; Public Sans Variable ensures readability and technical precision for body content
- **Weight Variation:** Bold weights (700–800) establish hierarchy and draw attention; regular weights (400) maintain legibility for extended reading
- **Generous Line Height:** All text benefits from open line spacing to support scannability and reduce cognitive load
- **Semantic Sizing:** Typography scales intentionally with use cases—larger for hero content, tighter for dense information
- **Letter Spacing:** Increased tracking on display text (−1.5px to −0.5px) adds elegance; labels and buttons use subtle positive tracking (+0.5px) for clarity

## 4. Component Stylings

### Buttons

**Primary Button (CTA)**
- Background: `#00A76F`
- Text Color: `#FFFFFF`
- Font: Public Sans Variable, 16px, weight 400
- Padding: `12px 24px`
- Border Radius: `8px`
- Border: `0px none`
- Box Shadow: `rgba(0, 167, 111, 0.24) 0px 8px 16px 0px`
- Hover State: Background `#00936A`, text `#FFFFFF`, shadow intensifies to `rgba(0, 167, 111, 0.32) 0px 12px 20px 0px`
- Active State: Background `#007C56`, text `#FFFFFF`
- Disabled State: Background `#C4CDD5`, text `#919EAB`, box-shadow `none`

**Secondary Button (Outlined)**
- Background: `rgba(0, 167, 111, 0.12)`
- Text Color: `#00A76F`
- Font: Public Sans Variable, 16px, weight 400
- Padding: `12px 24px`
- Border Radius: `8px`
- Border: `2px solid #00A76F`
- Box Shadow: `none`
- Hover State: Background `rgba(0, 167, 111, 0.2)`, text `#00A76F`
- Active State: Background `rgba(0, 167, 111, 0.3)`, text `#007C56`
- Disabled State: Background `rgba(0, 0, 0, 0.04)`, text `#919EAB`, border `1px solid #DFE3E8`

**Ghost Button (Minimal)**
- Background: `rgba(0, 0, 0, 0)`
- Text Color: `#637381`
- Font: Public Sans Variable, 16px, weight 400
- Padding: `8px 12px`
- Border Radius: `6px`
- Border: `0px none`
- Box Shadow: `none`
- Hover State: Background `rgba(0, 0, 0, 0.04)`, text `#1C252E`
- Active State: Background `rgba(0, 0, 0, 0.08)`, text `#1C252E`
- Disabled State: Background `rgba(0, 0, 0, 0)`, text `#919EAB`

**Icon Button (Circular)**
- Background: `rgba(0, 0, 0, 0)`
- Text Color: `#637381`
- Font: Public Sans Variable, 24px, weight 400
- Padding: `8px`
- Border Radius: `50%`
- Border: `0px none`
- Box Shadow: `none`
- Hover State: Background `rgba(0, 0, 0, 0.08)`, text `#1C252E`
- Active State: Background `rgba(0, 0, 0, 0.12)`, text `#1C252E`

### Cards & Containers

**Card Standard**
- Background: `#FFFFFF`
- Border: `1px solid #DFE3E8`
- Border Radius: `12px`
- Padding: `24px`
- Box Shadow: `0px 1px 3px rgba(0, 0, 0, 0.08)`
- Hover State: Box Shadow `0px 4px 8px rgba(0, 0, 0, 0.12)`, border `1px solid #C4CDD5`

**Card Elevated**
- Background: `#FFFFFF`
- Border: `0px none`
- Border Radius: `16px`
- Padding: `32px`
- Box Shadow: `0px 8px 24px rgba(0, 0, 0, 0.12)`
- Hover State: Box Shadow `0px 12px 32px rgba(0, 0, 0, 0.16)`

**Container Subtle**
- Background: `#F9FAFB`
- Border: `1px solid #F4F6F8`
- Border Radius: `12px`
- Padding: `20px`
- Box Shadow: `none`

### Inputs & Forms

**Text Input Default**
- Background: `#FFFFFF`
- Text Color: `#1C252E`
- Font: Public Sans Variable, 16px, weight 400
- Padding: `12px 16px`
- Border: `1px solid #DFE3E8`
- Border Radius: `8px`
- Focus State: Border `2px solid #00A76F`, outline `none`, box-shadow `0px 0px 0px 3px rgba(0, 167, 111, 0.08)`
- Error State: Border `2px solid #B71D18`, box-shadow `0px 0px 0px 3px rgba(183, 29, 24, 0.08)`
- Disabled State: Background `#F4F6F8`, text `#919EAB`, border `1px solid #DFE3E8`
- Placeholder: `#919EAB`, font-style italic

**Label (Form)**
- Color: `#1C252E`
- Font: Public Sans Variable, 14px, weight 600
- Line Height: `22px`
- Margin Bottom: `8px`
- Display: block

**Helper Text**
- Color: `#919EAB`
- Font: Public Sans Variable, 12px, weight 400
- Line Height: `18px`
- Margin Top: `4px`

**Error Message**
- Color: `#B71D18`
- Font: Public Sans Variable, 12px, weight 500
- Line Height: `18px`
- Margin Top: `4px`

### Navigation

**Navigation Item (Default)**
- Background: `rgba(0, 0, 0, 0)`
- Text Color: `#637381`
- Font: Public Sans Variable, 16px, weight 400
- Padding: `8px 12px`
- Border Radius: `6px`
- Border: `0px none`
- Line Height: `24px`
- Hover State: Background `rgba(0, 0, 0, 0.04)`, text `#1C252E`

**Navigation Item (Active)**
- Background: `rgba(0, 167, 111, 0.12)`
- Text Color: `#00A76F`
- Font: Public Sans Variable, 16px, weight 600
- Padding: `8px 12px`
- Border Radius: `6px`
- Border Radius Left: `4px` (accent bar left side variant)
- Border Left: `4px solid #00A76F`

**Navbar (Top)**
- Background: `#FFFFFF`
- Border Bottom: `1px solid #DFE3E8`
- Padding: `16px 24px`
- Box Shadow: `0px 1px 3px rgba(0, 0, 0, 0.08)`
- Display: flex
- Align Items: center
- Justify Content: space-between

### Badges

**Badge Success**
- Background: `rgba(0, 167, 111, 0.12)`
- Text Color: `#00A76F`
- Font: Public Sans Variable, 12px, weight 600
- Padding: `4px 8px`
- Border Radius: `4px`
- Border: `0px none`
- Line Height: `18px`

**Badge Warning**
- Background: `rgba(255, 171, 0, 0.12)`
- Text Color: `#FFAB00`
- Font: Public Sans Variable, 12px, weight 600
- Padding: `4px 8px`
- Border Radius: `4px`
- Border: `0px none`

**Badge Error**
- Background: `rgba(183, 29, 24, 0.12)`
- Text Color: `#B71D18`
- Font: Public Sans Variable, 12px, weight 600
- Padding: `4px 8px`
- Border Radius: `4px`
- Border: `0px none`

### Links

**Link Primary**
- Color: `#00A76F`
- Font: Public Sans Variable, 16px, weight 400
- Text Decoration: `none`
- Line Height: `24px`
- Cursor: pointer
- Hover State: Color `#007C56`, text-decoration `underline`
- Active State: Color `#005A45`
- Visited State: Color `#5BE49B`

**Link Secondary**
- Color: `#637381`
- Font: Public Sans Variable, 16px, weight 400
- Text Decoration: `none`
- Line Height: `24px`
- Hover State: Color `#1C252E`, text-decoration `underline`

## 5. Layout Principles

### Spacing System
The Minimals spacing system is built on a `8px` base unit, allowing flexible and harmonious composition across all screen sizes.

- **xs:** `4px` – Tight spacing between adjacent inline elements, small gaps
- **sm:** `8px` – Padding within components, gaps between compact elements
- **md:** `12px` – Default spacing within components, margin between related elements
- **lg:** `16px` – Standard padding in containers, spacing between component groups
- **xl:** `24px` – Section padding and spacing between distinct content blocks
- **2xl:** `32px` – Larger component padding, spacing between major sections
- **3xl:** `40px` – Gap between feature sections, large breathing room
- **4xl:** `48px` – Major section separators
- **5xl:** `64px` – Hero section spacing, gap between main content areas
- **6xl:** `72px` – Page-level padding for top-level sections
- **7xl:** `80px` – Maximum breathing room between distinct page sections

### Grid & Container
- **Max Width:** `1200px` (main content container)
- **Columns:** 12-column flexible grid system at desktop; 6-column at tablet; 4-column at mobile
- **Gutter:** `24px` on desktop, `16px` on tablet, `12px` on mobile
- **Section Pattern:** Full-width sections with centered `1200px` content containers, `80px` top and bottom padding
- **Edge Margins:** `24px` on desktop, `16px` on tablet, `12px` on mobile

### Whitespace Philosophy
Minimals prioritizes generous whitespace to create a sense of calm and focus. Content never feels cramped; instead, strategic negative space guides the eye and improves cognitive processing. Major sections receive `64px–80px` vertical spacing, allowing each block to breathe. Cards and containers maintain internal padding of at least `24px`, with typography sized to accommodate comfortable reading. This philosophy extends to interactive elements: buttons and inputs have ample padding for both visual balance and touch accessibility.

### Border Radius Scale
- **xs:** `4px` – Tight radius for subtle form elements
- **sm:** `6px` – Small interactive components (ghost buttons, tags)
- **md:** `8px` – Standard radius for inputs, small buttons, and containers
- **lg:** `12px` – Larger containers, cards, and component groups
- **xl:** `16px` – Elevated cards and major modal components
- **full:** `50%` – Circular buttons and avatars

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow, `box-shadow: none` | Subtle components, body text, ghost buttons |
| Subtle | `0px 1px 3px rgba(0, 0, 0, 0.08)` | Default cards, input fields, minor UI elements |
| Hover | `0px 4px 8px rgba(0, 0, 0, 0.12)` | Card hover states, slightly elevated interactive elements |
| Raised | `0px 8px 16px rgba(0, 0, 0, 0.12)` | Modal overlays, dropdowns, floating action buttons |
| Elevated | `0px 8px 24px rgba(0, 0, 0, 0.12)` | Elevated cards, prominent modals |
| Focus | `0px 0px 0px 3px rgba(0, 167, 111, 0.08)` + `0px 0px 0px 1px #00A76F` | Keyboard focus indicators on interactive elements |
| Primary CTA Shadow | `rgba(0, 167, 111, 0.24) 0px 8px 16px 0px` | Primary action buttons and key CTAs |

**Shadow Philosophy:** Shadows in Minimals are restrained and purposeful, never overwhelming the interface. They serve two functions: (1) elevation—to distinguish floating or layered content from the background—and (2) affordance—to signal interactivity and clickability. Neutral shadows use muted black with low opacity; accent shadows incorporate the primary green to subtly reinforce brand presence. All shadows maintain consistent blur and spread values to create a cohesive visual depth system.

## 7. Do's and Don'ts

### Do
- **Use the green accent (#00A76F) for all primary calls-to-action**, ensuring consistent brand recognition and user guidance
- **Maintain at least 24px of internal padding in cards and containers** to avoid visual claustrophobia
- **Apply the typography hierarchy strictly**—use Display 1 for page titles, Heading 1 for major sections, and Body Regular for default text
- **Leverage the semantic color system**: green for positive actions, orange (#FFAB00) for warnings, red (#B71D18) for errors
- **Include generous whitespace between sections**—minimum `64px` vertical spacing between major content blocks
- **Use rounded corners consistently**: `8px` for inputs and buttons, `12px` for standard cards, `16px` for elevated modals
- **Employ Public Sans Variable for all body content** to maintain technical clarity and developer-friendly aesthetics
- **Stack focus states with both a colored outline and subtle shadow** to meet WCAG accessibility guidelines
- **Keep button padding at minimum `12px 24px`** for thumb-friendly touch targets on mobile

### Don't
- **Don't use harsh black (#000000) for text**—substitute Primary Dark (#1C252E) for softer, more refined typography
- **Don't apply multiple shadows to a single element**—stick to one elevation level per component
- **Don't mix accent colors arbitrarily**—green, cyan, and orange have specific semantic purposes; use them intentionally
- **Don't set line-height below 1.5x the font size**—narrow line-height reduces readability and visual clarity
- **Don't nest more than 3 levels of visual hierarchy** in a single UI section
- **Don't use the primary green for warning or error states**—this undermines semantic meaning
- **Don't reduce padding below `12px` in interactive components**—small targets harm usability and accessibility
- **Don't apply transform effects (scale, rotate) to text elements** without ensuring readability and legibility remain intact
- **Don't override the border radius scale** without documented rationale; consistency is critical
- **Don't forget to test all interactive states** (hover, focus, active, disabled) during implementation

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | 320px–599px | Single column, `12px` gutter, 4-column grid, full-width cards, stacked navigation, `16px` edge margins |
| Tablet | 600px–999px | 6-column grid, `16px` gutter, `16px` edge margins, 2-column card layouts, collapsible nav |
| Desktop | 1000px–1919px | 12-column grid, `24px` gutter, `24px` edge margins, multi-column layouts, full navigation visible |
| Large Desktop | 1920px+ | Centered `1200px` container, `40px` edge margins, maximum spacing applied |

### Touch Targets
- **Minimum Size:** `44px × 44px` for all interactive elements on touch devices
- **Recommended Minimum:** `48px × 48px` for buttons and clickable controls
- **Spacing Between Targets:** `8px` minimum vertical and horizontal gap between adjacent interactive elements to prevent mis-taps
- **Icon Buttons:** Minimum `40px` diameter; larger `48px` preferred on mobile
- **Form Inputs:** Minimum height `44px` with `12px 16px` padding to ensure comfortable thumb interaction
- **Links & Text Buttons:** Padding of at least `8px` on all sides to increase tap area

### Collapsing Strategy
- **Navigation:** Desktop top bar becomes hamburger menu below `600px` width; navigation items stack vertically in drawer overlay
- **Cards:** Desktop 3-column grid collapses to 2-column at tablet (`600px–999px`), single-column at mobile (`<600px`)
- **Typography:** Display 1 reduces from `72px` to `48px` at tablet, `32px` at mobile; Display 2 reduces from `48px` to `32px` at tablet, `24px` at mobile
- **Spacing:** `80px` section padding reduces to `48px` at tablet, `24px` at mobile
- **Buttons:** Full-width buttons at mobile (`<600px`); inline side-by-side at tablet and desktop
- **Forms:** Single-column layout at mobile; 2-column layouts only introduced at desktop (`>1000px`)
- **Images & Graphics:** Decorative accent dots and geometric elements scale proportionally; hide smallest elements below `600px` to preserve mobile screen real estate

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA:** Success Green (`#00A76F`) with hover state `#00936A`
- **Secondary CTA:** Success Green Light (`#5BE49B`)
- **Background (Primary):** White (`#FFFFFF`)
- **Background (Subtle):** Off-White (`#F9FAFB`)
- **Heading Text:** Primary Dark (`#1C252E`)
- **Body Text:** Secondary Gray (`#637381`)
- **Disabled Text:** Tertiary Gray (`#919EAB`)
- **Border / Divider:** Border Gray (`#DFE3E8`)
- **Warning State:** Warning (`#FFAB00`)
- **Error State:** Error (`#B71D18`)
- **Success State:** Success (`#22C55E`)
- **Accent Secondary:** Cyan (`#00B8D9`)

### Iteration Guide

1. **All text headings use Barlow font at weights 700–800**; body and labels use Public Sans Variable at weight 400–600. Display 1 is `72px` at desktop, collapsing to `48px` tablet / `32px` mobile.

2. **Primary buttons must feature Success Green background (`#00A76F`), `12px 24px` padding, `8px` border-radius, and the green elevation shadow `rgba(0, 167, 111, 0.24) 0px 8px 16px 0px`**. Hover state darkens to `#00936A`.

3. **Form inputs and cards use `1px solid #DFE3E8` borders with `8px` border-radius**. Focus states add a 3px outline ring in rgba(0, 167, 111, 0.08) around the element.

4. **All interactive components must maintain minimum `44px × 44px` touch targets on mobile; desktop can use `36px` minimum for icon buttons**.

5. **Whitespace between major sections is never less than `64px` desktop / `48px` tablet / `24px` mobile**; internal card padding is minimum `24px`.

6. **Navigation items in the primary nav bar are styled as ghost buttons (`rgba(0, 0, 0, 0)` background, gray text) with hover background `rgba(0, 0, 0, 0.04)`. Active items use green background and text (`#00A76F`, weight 600)**.

7. **Semantic colors are immutable: green for positive/success, orange for warning, red for error**. Never swap or override these roles.

8. **All shadows follow the elevation system**; do not create custom shadow values. Use the predefined levels: Subtle (`0px 1px 3px rgba(0,0,0,0.08)`), Hover (`0px 4px 8px rgba(0,0,0,0.12)`), Raised (`0px 8px 16px rgba(0,0,0,0.12)`), Elevated (`0px 8px 24px rgba(0,0,0,0.12)`).

9. **Links are always Success Green (`#00A76F`) with hover state text-decoration underline; visited links use the lighter green (`#5BE49B`)**. Body text links never exceed `16px` font size.

10. **Grid layouts are 12-column desktop, 6-column tablet, 4-column mobile, with gutters of `24px` desktop / `16px` tablet / `12px` mobile**. All sections center on a max-width `1200px` container.