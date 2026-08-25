# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Event Attendees / Clients:** Discovering and purchasing tickets for regional Brazilian entertainment (shows, cinema, festivals, cultural events) with fast seat/sector selection and instant mobile QR ticket presentation.
- **Event Organizers:** Creating events, configuring venue seating and session times, and tracking live sales performance and financial metrics.
- **Gatekeepers (Portaria):** Venue entrance staff using high-contrast QR code scanning and manual validation to verify entry and eliminate fraud.
- **Super Administrators:** Platform oversight, cross-event sales monitoring, and overall system management.

## Product Purpose
Provide an end-to-end digital ticketing and access platform for regional entertainment events in Brazil, seamlessly connecting discovery, interactive seat reservation, and real-time gate validation.

## Positioning
An integrated, frictionless access flow uniting interactive real-time seat reservation with instant on-the-ground gatekeeper QR validation.

## Operating Context
- Busy, variable-light venue entrances where gatekeepers require rapid, high-contrast QR validation with zero lag.
- Mobile-first ticket presentation by attendees at venue turnstiles and gates.
- Responsive organizer and admin dashboards for setup, monitoring, and live analytics.

## Capabilities and Constraints
- **Capabilities:**
  - Interactive seat mapping and sector selection.
  - Geolocation filtering and multi-session event scheduling.
  - Client-side dynamic QR code generation for digital tickets.
  - Dedicated gatekeeper interface (`/portaria`) with camera scanner and manual validation.
  - Role-Based Access Control (`CLIENT`, `ORGANIZER`, `SUPER_ADMIN`, `PORTARIA`).
- **Constraints:**
  - Payment processing is currently simulated.
  - In-app digital tickets and QR display (no external transactional email dispatch in current scope).

## Brand Commitments
- Name: **Elite Tickets**
- Aesthetic Identity: Modern dark-mode interface with glassmorphism panels, royal blue and indigo neon accents, and crisp typography.

## Evidence on Hand
- Working Next.js 14 (App Router) frontend and Express/Prisma/PostgreSQL backend.
- Seeded regional event database (Campina Grande, João Pessoa, Recife, etc.).
- Complete suite of core routes: catalog, event details, seat picker, simulated checkout, attendee tickets wallet, portaria validation, and administrative dashboards.

## Product Principles
1. **Entrance Velocity & Clarity:** Gatekeeper tools and ticket presentation must provide instantaneous, unambiguous status feedback in high-pressure event environments.
2. **Spatial Intuition:** Venue maps and seat pickers must offer intuitive visual hierarchy and immediate selection feedback.
3. **Operational Focus:** Operator interfaces (organizers, admins, portaria) prioritize data clarity, ergonomics, and speed over decorative fluff.
4. **Reliable State Integrity:** Every seat reservation, ticket state, and validation record maintains strict consistency.
