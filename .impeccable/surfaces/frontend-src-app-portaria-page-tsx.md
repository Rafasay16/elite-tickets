---
slug: frontend-src-app-portaria-page-tsx
primary_target: frontend/src/app/portaria/page.tsx
related_targets: ["route:/portaria"]
mode: operate
---

# Surface Brief: Portaria (Access & Turnstile Control)

<!-- surface-brief:schema 1 -->

## 1. Job and Audience
- **Visitor Mode:** `Operate`
- **Primary User:** Venue Gatekeepers and Security Staff (`PORTARIA`, `ORGANIZER`, `SUPER_ADMIN`).
- **Context & Mental State:** Standing at turnstiles and entrance doors in noisy, variable lighting, high-pressure queue situations where speed and zero false admissions are paramount.
- **Core Job:** Verify attendee QR codes / manual codes in <1 second per person, detect duplicate entries instantly, and track total check-in throughput against venue capacity.

## 2. Outcome and Proof
- **Primary Action:** Rapid camera QR scanning and manual code entry.
- **Success Metric:** Continuous validation cycle without blocking the queue; clear distinction between Access Granted (`#10b981`), Duplicate Check-in (`#f59e0b`), and Invalid Ticket (`#ef4444`).
- **Proof / Truth:** Scanned timestamp, attendee full name, reserved seat/sector, short ticket hash (`#TK-1234`), and real-time validated counter.

## 3. Selected Direction
- **Visual Authority:** Grounded in `DESIGN.md` ("The Electric Arena") with high-contrast tactical HUD styling.
- **Structural Thesis:**
  - Sticky Top Bar with quick event switcher and real-time throughput metrics (e.g. `142 / 500 Check-ins • 28%`).
  - High-visibility central viewfinder frame with ambient pulse scanner animation.
  - Quick manual code input drawer/tab below viewfinder.
  - Recent scans mini-feed (last 3-5 validations with status chips).
  - High-impact validation modal featuring:
    - 3-second auto-dismiss countdown progress bar.
    - Prominent status icon and color aura.
    - 2x2 data grid (Attendee Name, Timestamp, Event & Short ID, Reserved Seat).
    - Instant hotkey dismiss (`Space`, `Enter`, `Esc`, or single-tap).

## 4. Scope and Boundaries
- **Named Target:** `frontend/src/app/portaria/page.tsx`
- **Untouched:** Backend check-in logic (`/api/checkout/validate`), authentication token storage, and event fetching routes.
- **Anti-Goals:** No heavy marketing graphics, no complex navigation distractions, no sluggish animations that delay the next scan.

## 5. States and Ranges
- **Empty / No Event Selected:** Guidance prompt instructing the operator to pick an event.
- **Active Scanning:** Fluid camera stream with corner target guides and ready indicator.
- **Validating / Loading:** Instant spinner on manual submission or camera decode.
- **Result States:**
  - *Success (Approved):* Glowing emerald aura, attendee name, seat assignment, scan timestamp.
  - *Warning (Duplicate):* Amber alert, original scan time, customer name, duplicate entry warning.
  - *Error (Invalid / Wrong Event):* Crimson alert, reason detail (e.g., mismatched session or unlisted code).
- **Recent Scans Feed:** Rolling buffer of the last 5 validated items with time and status pill.

## 6. Interaction and Layout
- **Topology:** Centered mobile-first tactical column (`max-width: 640px`).
- **Hierarchy:** Event Selector & Live HUD Header > Camera Viewfinder > Manual Code Input > Recent Scans Log > (Overlay) Result Modal with Auto-Dismiss Timer.
- **Feedback:** Visual color pulses, prominent contrast badges, and keyboard shortcuts for lightning-fast queue processing.

## 7. Constraints and Open Decisions
- **Stack:** Next.js 14 (App Router, Client Component), TypeScript, HTML5-QRCode scanner, CSS Modules / Globals.
- **Accessibility & Lighting:** High-contrast text on dark backgrounds; status conveyed by both color, text labels, and unique geometric icons (Check, Triangle Alert, Cross).
