# Elite Tickets

A full-stack event ticketing and digital access management platform featuring real-time QR Code validation, interactive seat reservations, administrative business intelligence, and a modern glassmorphism interface.

## Live Demonstrations
- Frontend Platform: [https://elite-tickets-vlr.vercel.app/](https://elite-tickets-vlr.vercel.app/)
- Backend API Services: [https://elite-tickets-api-uiqi.onrender.com](https://elite-tickets-api-uiqi.onrender.com)

## Engineering and Development Process

This platform was architected and developed utilizing advanced artificial intelligence engineering workflows and frontend critique tools:

- **AI Engineering Models:** Developed and refined using Claude Code (Opus) and Gemini 3.7 Flash (High Thinking / Reasoning) for full-stack architecture, transactional reservation algorithms, RBAC security rules, and performance optimizations.
- **Frontend Auditing and UX Polish (Impeccable):** Frontend interfaces and user journeys across the catalog, checkout, client wallet, organizer panel, portaria scanner, and super-admin dashboards were systematically reviewed, audited, and polished using the Impeccable design and heuristic critique suite.

## Technology Stack

- **Frontend Subsystem:**
  - Framework: Next.js 14 (App Router)
  - Language: TypeScript
  - Styling: Vanilla CSS Modules with a custom tokenized Glassmorphism design system
  - Icons: Custom Vector SVG Icons
  - Image Optimization: Next.js Image Component with remote pattern integration (TMDB, DiceBear)
  - Audio Feedback: HTML5 Web Audio API Synthesizer (oscillator-based portaria scanning sounds)

- **Backend Subsystem:**
  - Runtime: Node.js
  - Framework: Express
  - Language: TypeScript
  - ORM: Prisma
  - Database: PostgreSQL (Supabase)
  - Authentication: JWT (JSON Web Tokens) with Argon2/Bcrypt password hashing and HTTP-only cookies

- **Infrastructure and Hosting:**
  - Frontend: Vercel
  - Backend: Render
  - Database: Supabase

## Architecture Overview

Elite Tickets provides an end-to-end ticketing ecosystem designed for regional festivals, concerts, theaters, and cinemas in Brazil. The system operates as a monorepo with decoupled frontend and backend services to ensure separation of concerns, high throughput, and seamless maintainability.

### Key Capabilities

1. **Interactive Event Discovery and Faceted Search:**
   - Real-time instant query search across event titles and venues.
   - Category facet filters (Shows, Cinema, Teatro, E-sports, Outros).
   - Date range filters (Hoje, Fim de Semana, Este Mês, Seletor de Calendário).
   - Starting price indicators and high-impact hero carousel with pause-on-hover controls.

2. **Visual Seat Selection and ACID Reservations:**
   - Dynamic SVG-based interactive seat grids with row and column mapping.
   - Real-time seat status tracking (Available, Reserved, Occupied, VIP Courtesy).
   - Atomic checkout reservation prevents double-booking race conditions.

3. **Digital Ticket Wallet (Meus Ingressos):**
   - Authentic boarding pass stub aesthetics with perforation details.
   - Instant high-contrast QR code display directly in ticket cards for fast entrance validation.
   - One-click QR code zoom modal for high-glare lighting environments.
   - Timing badges with automated countdowns (Hoje, Amanhã, Em X dias, Encerrado).
   - Tabbed view separating active upcoming tickets from archived past event passes.
   - Native WhatsApp and clipboard link sharing via Web Share API.

4. **Dedicated Gatekeeper Scanner (Portaria HUD):**
   - High-performance camera-based QR code scanning with auto-dismiss verification overlays.
   - Web Audio API dual-tone audio feedback (positive harmonic chime for valid tickets, dissonant error buzz for duplicates or expired passes).
   - Manual ticket ID input fallback for damaged camera lenses or scratched screens.
   - Real-time recent scans audit feed.

5. **Organizer Administration Dashboard (admin@admin.com):**
   - Executive KPI summary cards (Total Events, Active Events, Total Capacity, Paused Events).
   - ViaCEP integration for automatic street, neighborhood, and city population from postal codes.
   - VIP courtesy ticket issuance with direct seat allocation.
   - Gatekeeper team management with access revocation, credential resets, and scan logs.

6. **Super Administrator Governance Panel (superadmin@elite.com):**
   - Platform-wide governance KPI cards (Total Organizers, Active Partners, Average Platform Fee, Suspended Accounts).
   - Commercial parameterization (custom service fee percentage and event publishing quota per producer).
   - Automated temporary password generation with one-click clipboard copy.

## Access Control and RBAC Roles

The system enforces strict Role-Based Access Control:

- **CLIENT:** Browses catalog, selects seats, executes mock checkout, manages profile and view ticket wallet.
- **ORGANIZER:** Manages event catalog, releases VIP courtesies, pauses/publishes events, and configures gatekeeper staff.
- **PORTARIA:** Dedicated single-purpose scanning interface for rapid entry gate verification.
- **SUPER_ADMIN:** Master platform governance over producer accounts, service fees, and account suspensions.

## Local Setup and Installation

### Prerequisites
- Node.js Runtime (v18.0.0 or higher)
- npm or yarn package manager

### Installation Steps

1. Clone the repository and install root and package dependencies:
```bash
git clone https://github.com/Rafasay16/elite-tickets.git
cd elite-tickets
npm install
npm run install:all
```

2. Configure Environment Variables:

Backend environment (`backend/.env`):
```env
PORT=3333
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your_secure_jwt_secret_key"
```

Frontend environment (`frontend/.env` or `frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3333/api"
```

3. Initialize the Database:
```bash
cd backend
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
cd ..
```

4. Launch Local Development Servers:
```bash
npm run dev
```

The frontend application will be accessible at `http://localhost:3000` and the backend API at `http://localhost:3333`.

## Test Credentials for Development

- **Client Accounts:**
  - Email: `rafinha@gmail.com` | Password: `123456`
  - Email: `reuel@gmail.com` | Password: `123456`
- **Organizer Account:**
  - Email: `admin@admin.com` | Password: `123456`
- **Gatekeeper Account (Portaria):**
  - Email: `portaria@elite.com` | Password: `123456`
- **Super Administrator Account:**
  - Email: `superadmin@elite.com` | Password: `123456`

## Production Build Verification

To build and validate the production bundles across all packages:
```bash
npm run build --prefix frontend
npm run build --prefix backend
```

## License

This project is distributed under the MIT License.
