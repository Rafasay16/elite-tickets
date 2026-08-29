# Elite Tickets

A full-stack event ticketing platform, interactive seat reservation, and digital access control with real-time QR Code ticket validation, business intelligence admin panels, and a modern interface.

## Online Production Demonstration

- Frontend Platform: https://elite-tickets-vlr.vercel.app/
- Backend API: https://elite-tickets-api-uiqi.onrender.com

---

## 1. Engineering Process: Use of AI Tools and Human Contribution

In compliance with the project guidelines, this section details the distribution between the assisted use of Artificial Intelligence tools and the developer's direct role in architecture, data modeling, structural organization, and technical decision-making.

### AI Tools Used

- **Claude Code (Opus):**
  - Used as a code accelerator for REST route scaffolding, initial prototyping of Zod validation schemas, base mapping of TypeScript types, and generating skeletons for CRUD operations.
- **Gemini 3.7 Flash (High Thinking / Advanced Reasoning):**
  - Used in analyzing performance bottlenecks, refactoring session rules and authentication cookie synchronization, cinema session grouping algorithm by date, instant search logic with text normalization (accent removal), and assisting in diagnosing WebKit rendering engine bugs on iOS Safari.
- **Impeccable (Frontend Audit and Heuristic Critique Suite):**
  - Used as a support tool and design checklist for visual audit of contrast, spatial rhythms, touch ergonomics on smaller screens (320px to 768px), empty states, and consistency in transitioning between light and dark themes.

### What Was Conceived, Architected, and Implemented Manually (Human Work and Engineering)

- **Software Architecture and Modular Directory Organization:**
  - Complete planning and structuring of the monorepo, strictly separating frontend and backend responsibilities:
    - **Layered Backend:** Strict division into Controllers (HTTP request/response), Services (pure business rules), Middlewares (authentication and RBAC), Schemas (payload validation), and Database (Prisma ORM and migrations).
    - **Decoupled Frontend (Next.js 14 App Router):** Separation between Server Components (for server-side data fetching and SEO optimization) and Client Components (`*Client.tsx` for interactivity), isolating API services (`src/services/`), formatting and mask utilities (`src/utils/`), and reusable atomic components (`src/components/`).
- **Relational Database Modeling and Transactional Consistency:**
  - Design of the relational data model in PostgreSQL (Entities: User, Event, Seat, Reservation, Ticket, PaymentMethod).
  - Monetary prices modeled with integer precision in cents (`priceInCents Int`), eliminating Float rounding issues.
  - Dedicated `Ticket` table for cryptographic validation data, decoupled from the `Reservation` entity.
  - Atomic transactions with conditional locks (`prisma.$transaction` and conditional `updateMany` `WHERE status = 'AVAILABLE'` and `WHERE status = 'PAID'`), mathematically guaranteeing at the database level the impossibility of double-booking and double-scan in high-concurrency scenarios.
- **Security, Authentication, and 4-Level RBAC Governance:**
  - Strict segregation of cryptographic secrets with *Fail-Fast* initialization (`JWT_AUTH_SECRET` for sessions and `JWT_TICKET_SECRET` for QR Code signing; the server refuses to boot if variables are missing).
  - Unforgeable HMAC cryptographic signature with mandatory verification (`jwt.verify`), without insecure fallbacks or prefix searching (strict search for exact ID equality).
  - Personal data protection (LGPD/Privacy by Design): QR Code payload is 100% opaque and does not transmit personal data (`customerName`/`guestName`); the ticket holder's data is resolved exclusively on the server after cryptographic verification.
  - Modeling of the role-based access control (RBAC) system (`CLIENT`, `ORGANIZER`, `PORTARIA`, `SUPER_ADMIN`), ensuring that producers cannot access competing events and that gate operators have exclusive and secure access to the reading HUD.
  - Implementation of cryptographic hashing policies with Bcrypt (salt 10) and sanitization of sensitive data (removal of passwords before sending HTTP responses).
- **Tokenized Design System and Proprietary CSS Architecture:**
  - Manual development of a proprietary design system via CSS Modules and pure CSS variables (`globals.css`), without depending on bloated utility frameworks (like Tailwind). The architecture was designed to support Glassmorphism, calculated gradients, and instant switching between Dark Mode and Light Mode through semantic attributes (`[data-theme='light']`).
- **Infrastructure, Deploy, and CI/CD Strategy:**
  - Choice and configuration of hosting environments: Vercel for the frontend in Edge/Serverless architecture, Render for the Express API service in a Node.js container, and Supabase for the managed PostgreSQL cluster with connection pooling.
- **Debugging on Real Physical Devices:**
  - Manual testing and debugging on physical smartphones (iPhone/Safari and Android/Chrome), identifying specific mobile rendering engine behaviors, such as the issue of fixed elements being cut off inside containers with `backdrop-filter` in iOS Safari's WebKit, solved by implementing `createPortal`.
- **Creative Conception of Value-Added Features:**
  - Human ideation of all commercial product features: synthesized auditory feedback at the gate via Web Audio API, smart sharing via WhatsApp Web Share API, automatic address search by ZIP code (ViaCEP), geolocation integration with official IBGE data, and a secure password generator with quick copy.

---

## 2. Initiatives and Creativity Differentials (Beyond Basic Scope)

Below are the features implemented on own initiative to make the platform a commercial-grade product:

1. **Native Sound Synthesizer at the Gate (Web Audio API):**
   - Instead of relying solely on visual alerts, the gate screen features a sound frequency synthesizer that emits a harmonic chord for a valid ticket and a dissonant beep for duplicate or invalid tickets, speeding up the queue flow.
2. **Integrated QR Code on the Ticket Stub with Enlargement Modal:**
   - The QR Code is directly visible on the body of the digital ticket, eliminating extra clicks at the event entrance. Includes a full-screen enlargement button for easy reading in sunlight or scratched screens.
3. **Automatic Geolocation and IBGE API Integration:**
   - Users can identify their location via GPS (Reverse Geocoding) or select their state and municipality using the official IBGE database, filtering events in their region.
4. **Automatic Address Autofill by ZIP Code (ViaCEP):**
   - In the organizer's admin panel, typing the venue's ZIP code automatically fills in the street, neighborhood, city, and state fields.
5. **Super Administrator Governance with Secure Password Generation:**
   - The Super Admin can parameterize individualized convenience fees per producer, limit event publication quotas, and generate temporary passwords with an immediate copy-to-clipboard button.
6. **Light and Dark Mode Theme Toggler:**
   - Full support for theme switching with browser persistence and semantic tokens that ensure readability and contrast on all screens.
7. **Adaptive Mobile Menu via React Portal:**
   - Developed specifically to avoid the classic Safari/WebKit issue where fixed elements get cut off inside headers with a blur effect (backdrop-filter).

---

## 3. Technologies Used

### Frontend
- Framework: Next.js 14 (App Router)
- Language: TypeScript (Strict Typechecking)
- Styling: CSS Modules with semantic variables and tokens
- Icons: Customized SVG vector icons
- Image Optimization: Next.js Image Component integrated with TMDB and DiceBear
- Web Features: Web Audio API, Web Share API, Geolocation API, HTML5 Canvas QR

### Backend
- Runtime Environment: Node.js
- Framework: Express
- Language: TypeScript (Strict typing, dedicated domain interfaces, no `any`)
- ORM: Prisma
- Database: PostgreSQL (Supabase)
- Cryptography and Authentication: JWT with fail-fast and key segregation, Bcrypt (salt 10)
- Automated Testing: Vitest (with concurrency, ticket security, and authentication suites)

### Infrastructure and Hosting
- Frontend: Vercel
- Backend: Render
- Database: Supabase

---

## 4. Role Structure and Permissions (RBAC)

- **CLIENT:** Accesses the event catalog, performs searches and filters, selects seats, makes reservations, views and shares tickets in the digital wallet, and edits their profile.
- **ORGANIZER:** Creates and manages events, monitors indicators (total events, capacity, and tickets sold), issues VIP complimentary tickets, and registers gate staff.
- **PORTARIA (GATE):** Simplified and secure interface for reading tickets via camera or manual typing, with auditory feedback and real-time entry auditing.
- **SUPER_ADMIN:** Global platform governance panel, allowing the registration of producers, setting custom service fees, pausing accounts, and resetting credentials.

---

## 5. Installation, Local Execution, and Testing Instructions

### Prerequisites
- Node.js (version 18.0.0 or higher)
- npm package manager

### Step by Step

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/Rafasay16/elite-tickets.git
cd elite-tickets
npm install
npm run install:all
```

2. Configure environment variables:

`backend/.env` file:
```env
PORT=3333
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database"
JWT_AUTH_SECRET="secret_key_for_session_tokens"
JWT_TICKET_SECRET="secret_key_for_qr_ticket_signing"
TMDB_API_KEY="optional_tmdb_key"
TICKETMASTER_API_KEY="optional_ticketmaster_key"
```

`frontend/.env.local` file:
```env
NEXT_PUBLIC_API_URL="http://localhost:3333/api"
```

3. Initialize and seed the database:
```bash
cd backend
npx prisma generate
npx prisma db push
npx tsx scripts/seed.ts
cd ..
```

4. Run automated tests (Backend):
```bash
cd backend
npm test
cd ..
```

5. Run development servers simultaneously:
```bash
npm run dev
```

- The web application will be accessible at: `http://localhost:3000`
- The backend API will be accessible at: `http://localhost:3333`

---

## 6. Automated Testing Coverage (Vitest)

The backend features automated test suites covering critical business flows:

1. **`tests/concurrency.test.ts`**:
   - **Anti-Double-Booking Guarantee**: Fires 3 simultaneous requests for the same seat via `Promise.allSettled`; validates that exactly 1 succeeds and the others fail with a conflict.
   - **Anti-Double-Scan Guarantee**: Fires simultaneous scans of the same QR Code; validates that only the first is cleared and the second is rejected with `ALREADY USED`.
2. **`tests/ticket_security.test.ts`**:
   - **Opaque Payload without PII**: Inspects the QR Code JWT to ensure the absence of personal data (`customerName`/`guestName`).
   - **Rejection of Tampered/Forged QR**: Mandatory signature validation via `jwt.verify()`.
   - **Prevention of Prefix Attack**: Rejects raw or incomplete UUID identifiers.
   - **Secure Server Resolution**: Validation of legitimate ticket and data resolution in the database.
3. **`tests/auth.test.ts`**:
   - **Secret Segregation**: Proves that authentication tokens cannot validate tickets and vice versa.
   - **Registration and Login Flow**: Password verification with Bcrypt hash and JWT generation.

---

## 7. Test Credentials for Validation

| Role | E-mail | Password | Access Area |
|---|---|---|---|
| Client | rafinha@gmail.com | 123456 | Catalog, Reservation, My Tickets, Profile |
| Client | reuel@gmail.com | 123456 | Catalog, Reservation, My Tickets, Profile |
| Organizer | admin@admin.com | 123456 | Organizer Panel (/admin), Gate |
| Gate | portaria@elite.com | 123456 | Gate Scanner HUD (/portaria) |
| Super Admin | superadmin@elite.com | 123456 | Global Governance (/super-admin) |

---

## 8. Support and Troubleshooting Information

If you encounter any unexpected behavior during execution or testing:

1. **Response Time on the First API Request (Cold Start on Render):**
   - The production backend is hosted on Render's free tier. If inactive for a few minutes, the first data load may take about 30 to 50 seconds to initialize the instance. After the first access, responses occur normally in milliseconds.
2. **Camera Permission in the Gate Scanner:**
   - Modern browsers require a secure connection (HTTPS or localhost) to grant camera access. When testing the gate reader on mobile devices, make sure to authorize camera permission when requested by the browser. If the camera is unavailable, the **Manual Typing** tab allows you to validate tickets by typing the ticket identifier.
3. **Theme Switching and Local Storage:**
   - The light/dark theme preference is persisted in `localStorage`. If the switch doesn't seem to respond when changing browsers, clear the site's data cache or open it in incognito mode.
4. **Production Build Validation:**
   - Both packages have been validated with a production build without TypeScript typing errors:
   ```bash
   npm run build --prefix frontend
   npm run build --prefix backend
   ```
