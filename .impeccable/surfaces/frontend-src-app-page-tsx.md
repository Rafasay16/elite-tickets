---
slug: frontend-src-app-page-tsx
primary_target: frontend/src/app/page.tsx
related_targets: ["route:/"]
mode: persuade
---

# Surface Brief: Event Catalog & Discovery (Home `/`)

<!-- surface-brief:schema 1 -->

## 1. Job and Audience
- **Visitor Mode:** `Persuade`
- **Primary User:** Event attendees and culture enthusiasts across Brazil looking to discover movies, concerts, theater, and regional festivals.
- **Context & Mental State:** Seeking entertainment options for tonight, the weekend, or an upcoming tour; evaluating dates, venue proximity, prices, and popularity.
- **Core Job:** Seamlessly browse filtered events by category, date, and geolocation, preview key event highlights, and transition directly into the seat/ticket selection flow.

## 2. Outcome and Proof
- **Primary Action:** Discovering events and clicking "Reservar" or "Ver Sessões" to initiate ticket purchase.
- **Success Metric:** Engaging first-viewport impression, immediate understanding of events available in the user's selected city, and zero friction in finding relevant dates/showtimes.
- **Proof / Truth:** TMDb rating badges, verified venue locations (e.g. *Spazzio - Campina Grande, PB*), transparent starting prices in BRL (`R$ XX,XX`), and real-time session availability.

## 3. Selected Direction
- **Visual Authority:** Grounded in `DESIGN.md` ("The Electric Arena").
- **Structural Thesis:**
  - **Cinematic Hero Panorama:** Full-width high-impact featured banner showcasing trending headliner events with premiere badges, backdrop lighting, and instant booking CTA.
  - **Facet Filter Bar:** Sticky/prominent glass filter bar with category pills (*Todos*, *Cinema*, *Shows & Festivais*, *Teatro*), quick date chips (*Hoje*, *Fim de Semana*, *Este Mês*), and active city switcher sync.
  - **Rich Event Cards Grid:** Glassmorphism cards with 2:3 aspect poster, TMDb rating tag, venue pin, formatted price (`R$ XX,XX`), and tactile hover lifts with neon sapphire accents.
  - **Curated Sections:** Structured horizontal rails or grouped grids for "Destaques da Região", "Filmes em Cartaz", and "Shows & Festivais".

## 4. Scope and Boundaries
- **Named Target:** `frontend/src/app/page.tsx`, `frontend/src/app/page.module.css`, and related components (`Carousel.tsx`).
- **Untouched:** Backend `/api/events` query endpoints and authentication cookie handling.
- **Anti-Goals:** Avoid cluttered banners with competing promotional noise; maintain clean typography and glassmorphism hierarchy.

## 5. States and Ranges
- **Loading / Server Fetch:** Smooth pulse skeletons for the hero banner and event grid.
- **Populated Catalog (Typical 6–24 events):** Responsive multi-column grid (`repeat(auto-fill, minmax(280px, 1fr))`).
- **Filtered Subset (e.g. only Cinema or Shows):** Instant client/server filter response with clear item count feedback.
- **Empty City / Zero Events:** Friendly empty state with city changer action and suggestions to browse all Brazilian events.

## 6. Interaction and Layout
- **Topology:** Desktop 1200px container with fluid responsive edge-to-edge Hero banner.
- **Hover Micro-Physics:** Cards lift `-6px` with subtle neon sapphire glow, posters slightly zoom `1.04x`, and a sleek "Reservar Ingresso" CTA emerges.
- **Accessibility:** High-contrast text on poster overlays, descriptive `alt` tags, and focus-visible indicators on all category pills and cards.

## 7. Constraints and Open Decisions
- **Stack:** Next.js 14 App Router (Server Component with client filter components), TypeScript, CSS Modules / Globals.
- **Localization:** Brazilian Portuguese (`pt-BR`) copy, dates (`dd/MM/yyyy`), and currency formatting (`R$`).
