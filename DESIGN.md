---
name: Elite Tickets
description: End-to-end ticketing and real-time gate validation for regional Brazilian entertainment
colors:
  electric-sapphire: "#2563eb"
  neon-indigo: "#4f46e5"
  access-emerald: "#059669"
  alert-crimson: "#dc2626"
  warning-amber: "#f59e0b"
  midnight-obsidian: "#0f172a"
  frosted-slate: "rgba(30, 41, 59, 0.7)"
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  border-glass: "rgba(255, 255, 255, 0.1)"
typography:
  display:
    fontFamily: "var(--font-heading), 'Space Grotesk', system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "var(--font-heading), 'Space Grotesk', system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "var(--font-heading), 'Space Grotesk', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-body), 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.electric-sapphire}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.neon-indigo}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "0.75rem 1.5rem"
  card-glass:
    backgroundColor: "{colors.frosted-slate}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "0.75rem 1.5rem"
---

# Design System: Elite Tickets

## Overview

**Creative North Star: "The Electric Arena"**

Elite Tickets channels the electric atmosphere of live stadium concerts, premier cinema showcases, and vibrant regional Brazilian festivals into a sleek, immersive dark glass interface. Built for high velocity across the entire ticketing lifecycle, the visual system strikes a balance between consumer excitement during event discovery and tactical clarity during high-pressure gatekeeper validations.

The visual language layers deep obsidian slate foundations (`#0f172a`) with translucent frosted glass panels (12px backdrop blur) and electric sapphire accents (`#2563eb`). Micro-interactions are tactile and responsive—buttons elevate with soft luminescence on hover, seat maps provide instant tactile feedback, and validation states radiate unambiguous status feedback in low-light entryways.

**Key Characteristics:**
- **Layered Dark Depth:** Rich obsidian and slate tones layered with translucent glass panels rather than flat opaque backgrounds.
- **Electric Accent Luminescence:** Focused royal blue and neon indigo accents paired with soft 15-20px ambient glow filters.
- **Role-Calibrated Ergonomics:** High-energy discovery for attendees; high-contrast, zero-ambiguity HUD layouts for on-site gatekeepers.
- **Tactile Micro-Physics:** Smooth translateY transforms, pill-shaped action geometry, and instant spatial selection feedback.

## Colors

The palette pairs a midnight obsidian foundation with electric sapphire and neon indigo luminescence, supported by high-contrast semantic status accents.

### Primary
- **Electric Sapphire** (`#2563eb`): The primary interactive voice. Drives primary action buttons, active navigation markers, selected seat states, and brand highlights.

### Secondary
- **Neon Indigo** (`#4f46e5`): Interactive elevation and focus state. Applied to button hover states, complimentary seat badges, and gradient blends.

### Status Accents
- **Access Emerald** (`#059669` / `#10b981`): Gate check-in authorized status, positive transaction confirmations, and available states.
- **Alert Crimson** (`#dc2626` / `#ef4444`): Unauthorized entry, duplicate scan warnings, destructive actions, and invalid ticket indicators.
- **Warning Amber** (`#f59e0b`): Prior check-in alerts, session expiration notices, and cautionary operator states.

### Neutral
- **Midnight Obsidian** (`#0f172a`): Root canvas and deep background fill.
- **Frosted Slate Glass** (`rgba(30, 41, 59, 0.7)`): Card, modal, and header surface containers with 12px backdrop filter blur.
- **Border Glass** (`rgba(255, 255, 255, 0.1)`): Delicate translucent bounding strokes for panels, inputs, and dividers.
- **Text Primary** (`#f8fafc`): Crisp slate 50 text for high-legibility titles, labels, and prices.
- **Text Secondary** (`#94a3b8`): Slate 400 for contextual metadata, timestamps, and supporting labels.

### Named Rules
**The Luminescence Rule.** Ambient glow shadows (`0 4px 15px rgba(37, 99, 235, 0.4)`) are reserved strictly for interactive triggers, active selections, and live status badges. Inactive surfaces remain subtly bordered.

**The Status Sovereignty Rule.** On access control and validation surfaces (such as `/portaria`), semantic status colors (Emerald, Amber, Crimson) take 100% precedence over brand blue.

## Typography

**Display Font:** Space Grotesk (`var(--font-heading)`)
**Body Font:** Plus Jakarta Sans (`var(--font-body)`)
**Label/Mono Font:** JetBrains Mono (`var(--font-mono)`)

**Character:** Architectural, bold grotesque headings paired with highly legible, geometric sans for interface copy, anchored by monospace data precision for codes, ticket IDs, and timestamps.

### Hierarchy
- **Display** (Bold 700, `2.5rem`, line-height `1.1`, letter-spacing `-0.04em`): Main hero banners, festival showcases, and primary portal titles.
- **Headline** (Bold 700, `2rem`, line-height `1.2`, letter-spacing `-0.02em`): Modal titles, section headers, and high-impact validation result titles.
- **Title** (SemiBold 600, `1.25rem`, line-height `1.3`, letter-spacing `-0.01em`): Event card titles, sector names, and operator module headings.
- **Body** (Regular 400, `1rem`, line-height `1.6`): Descriptions, event information, instruction paragraphs, and form labels.
- **Label** (Medium 500, `0.75rem`, letter-spacing `0.05em`, uppercase): Monospace navigation tabs, ticket IDs (`#TK-8821`), seat badges, and timestamp readouts.

### Named Rules
**The Monospace Identifier Rule.** Any ticket ID, transaction hash, QR reference, or exact time measurement must be rendered in `JetBrains Mono` with uppercase tracking.

## Layout

The spatial model uses a centralized 1200px max-width container (`max-width: 1200px; padding: 0 1.5rem; margin: 0 auto`) with responsive fluid padding.

- **Grid Systems:**
  - Event Catalog: Responsive auto-fill grid (`repeat(auto-fill, minmax(280px, 1fr))`) with `1.5rem` to `2rem` gap.
  - Interactive Seat Map: Centered stage projection screen at the top, followed by labeled alphabetical rows and clustered seat units.
  - Portaria Scanner HUD: Centered single-column tactical layout with maximum width of `640px` for optimal mobile scanning ergonomics.
- **Responsive Breakpoints:**
  - Mobile: `< 640px` (stacked navigation, single-column full-width buttons).
  - Tablet: `640px - 1024px` (2-column event grid, compact header).
  - Desktop: `> 1024px` (multi-column layouts, expanded seat grids, fixed header).

## Elevation & Depth

Elite Tickets relies on layered frosted glass panels with ambient glow luminescence rather than heavy black drop shadows. Depth is communicated through translucency, backdrop blur, and luminous highlights.

### Shadow Vocabulary
- **Neon Glow Primary** (`box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4)`): Applied to primary buttons and active selections.
- **Neon Glow Hover** (`box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4)`): Applied to elevated hover states.
- **Glass Panel Ambient** (`box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1)`): Base ambient drop shadow for frosted glass cards.
- **Validation Modal Aura** (`box-shadow: 0 0 50px rgba(16, 185, 129, 0.35), 0 25px 50px rgba(0, 0, 0, 0.8)`): High-intensity status aura for full-screen entry approval or denial dialogs.

### Named Rules
**The Frosted Surface Rule.** All elevated containers must declare `backdrop-filter: blur(12px)` and a `1px solid rgba(255, 255, 255, 0.1)` boundary to preserve separation from background graphics.

## Shapes

- **Pill Form Factor (Radius `9999px`):** Primary buttons, secondary buttons, search bars, inputs, filter chips, and user action buttons.
- **Soft Curvature (Radius `16px`):** Content cards, ticket summary panels, event posters, and container modules.
- **Tactical Radius (Radius `24px`):** Large validation modals, checkout bottom sheets, and hero cards.
- **Seat Cell Form (Radius `8px 8px 4px 4px`):** Cinema and arena seat units with curved ergonomic headrests.

## Components

### Buttons
- **Shape:** Pill curvature (`border-radius: 9999px`), bold heading font (`Space Grotesk`).
- **Primary:** Background `var(--accent-neon)` (`#2563eb`), white text, `padding: 0.75rem 1.5rem`, `box-shadow: 0 4px 15px var(--accent-neon-glow)`.
- **Hover / Focus:** `transform: translateY(-2px)`, background `var(--accent-purple)` (`#4f46e5`), `box-shadow: 0 6px 20px var(--accent-purple-glow)`.
- **Secondary:** Background transparent, border `1px solid var(--border-glass)`, text `var(--text-primary)`, hover background `rgba(255, 255, 255, 0.05)`.

### Cards / Glass Panels
- **Corner Style:** Rounded `16px`.
- **Background:** `rgba(30, 41, 59, 0.7)` with `backdrop-filter: blur(12px)`.
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`.
- **Internal Padding:** `1.5rem` to `2rem`.

### Inputs / Selects
- **Style:** Pill form factor (`border-radius: 9999px`), `border: 1px solid var(--border-glass)`, background `transparent`, text `var(--text-primary)`.
- **Focus:** `border-color: var(--accent-neon)`, `box-shadow: 0 0 10px var(--accent-neon-glow)`, background `rgba(0, 0, 0, 0.2)`.

### Seat Map Units
- **Available:** `rgba(255, 255, 255, 0.1)` fill, `1px solid var(--border-glass)`, cursor pointer, translateY on hover.
- **Selected:** `var(--accent-neon)` fill, black text, `box-shadow: 0 0 15px var(--accent-neon-glow)`.
- **Sold / Occupied:** `rgba(255, 255, 255, 0.05)` fill, subdued `×` symbol, cursor not-allowed.
- **Cortesia / VIP:** `rgba(79, 70, 229, 0.4)` fill with neon indigo border and gift indicator.

### Portaria Validation Result Card
- **Frame:** `24px` radius, `border: 2px solid [statusColor]`, ambient gradient wash matching status.
- **Status Icon:** `84px` circular badge with pulsating colored glow box-shadow.
- **Information Grid:** Multi-column 2x2 layout for Attendee Name, Scanned Time, Event Title, and Reserved Seat.

## Do's and Don'ts

### Do:
- **Do** use `Space Grotesk` for titles and action triggers, `Plus Jakarta Sans` for body copy, and `JetBrains Mono` for IDs and timestamps.
- **Do** wrap interactive surfaces in `.glass-panel` with `backdrop-filter: blur(12px)` and `1px solid var(--border-glass)`.
- **Do** use pill buttons (`border-radius: 9999px`) with `translateY(-2px)` and neon glow for primary actions.
- **Do** provide immediate color and icon contrast on all portaria check-in states (Green = Approved, Yellow = Duplicate, Red = Invalid).

### Don't:
- **Don't** use solid opaque gray backgrounds for content containers; preserve the translucent glassmorphism aesthetic.
- **Don't** use un-styled default browser `<select>` or calendar inputs; preserve custom SVG arrows and indicator icons.
- **Don't** apply blue brand luminescence to error or duplicate warning messages.
- **Don't** clutter operator scanning views with marketing banners or non-essential decorative elements.
