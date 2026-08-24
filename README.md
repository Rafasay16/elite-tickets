# Elite Tickets

A full-stack event ticketing application featuring real-time QR Code validation, seat reservation, and a dynamic, interactive user interface.

## Live Demonstrations
- **Frontend Platform:** [https://elite-tickets-vlr.vercel.app/](https://elite-tickets-vlr.vercel.app/)
- **Backend API Services:** [https://elite-tickets-api-uiqi.onrender.com](https://elite-tickets-api-uiqi.onrender.com)

## Technology Stack
- **Frontend:** Next.js 14, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL (Hosted on Supabase)
- **Infrastructure:** Vercel (Frontend Hosting) & Render (Backend Hosting)

## Architecture Overview

Elite Tickets is a comprehensive ticketing platform designed for cinemas, concerts, and regional festivals. It provides an end-to-end solution for event management, ticket purchasing, and access control.

The system is structured as a monorepo containing decoupled frontend and backend services, ensuring high scalability, maintainability, and clear separation of concerns.

### Frontend Subsystem
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Design System:** Custom CSS Modules featuring modern dark-mode and glassmorphism aesthetics.
- **Core Capabilities:**
  - Interactive and dynamic seat mapping and sector selection algorithms.
  - Geolocation-based event filtering and multi-session scheduling logic.
  - Role-based routing supporting specialized administrative dashboards.
  - Client-side dynamic QR Code rendering for ticket validation workflows.

### Backend Subsystem
- **Framework:** Node.js powered by Express
- **Language:** TypeScript
- **Object-Relational Mapping:** Prisma
- **Database Engine:** PostgreSQL (Supabase integration)
- **Core Capabilities:**
  - Secure RESTful API architecture.
  - JSON Web Token (JWT) based authentication and authorization protocols.
  - ACID-compliant transactional seat reservation logic.
  - Comprehensive relational data modeling encompassing users, events, locations, seats, and reservations.

## Access Control and Roles

The platform implements a strict Role-Based Access Control (RBAC) architecture:

1. **Client (CLIENT):** Permitted to browse location-filtered events, select specific time sessions, interact with seat maps, simulate payment processing, and view acquired ticket portfolios.
2. **Organizer (ORGANIZER):** Granted access to the Administrative Dashboard for creating events, defining seat capacities, and monitoring real-time financial metrics.
3. **Super Administrator (SUPER_ADMIN):** Provided with global visibility over all platform analytics, total revenue streams, and comprehensive system administration rights.
4. **Gatekeeper (PORTARIA):** Authorized to access the entry control interface to scan QR codes or manually validate ticket identifiers in real-time, effectively mitigating duplicate entries and fraud.

## System Setup and Initialization

### Requirements
- Node.js Runtime (v18 or higher required)
- Package Manager (npm or yarn)

### Installation Procedures

Clone the repository and install all required dependencies across the root, frontend, and backend packages:

```bash
# Initialize dependencies globally
npm install
npm run install:all
```

### Environment Configuration

#### Backend Environment
Create a `.env` file in the `backend` directory containing the database and security configurations:
```env
PORT=3333
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your_secure_jwt_key"
```

Deploy the database schema to the PostgreSQL instance:
```bash
cd backend
npx prisma generate
npx prisma db push
```

#### Frontend Environment
Create a `.env` file in the `frontend` directory containing integration endpoints:
```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

### Local Development Server

To initialize the application locally, start the concurrent development servers from the root directory:

```bash
npm run dev
```

The frontend application will compile and serve on `http://localhost:3000`, while the backend API will initialize on `http://localhost:3333`.

## Development Test Data

The project includes an automated seeding script that populates the database with real-world API data (TMDb and Ticketmaster) and exclusive regional events (e.g., Campina Grande, João Pessoa, Recife).

To execute the seed sequence:
```bash
cd backend
npx tsx prisma/seed.ts
```

Standardized authentication credentials for development testing:

- **Client Role:**
  - Email: `rafinha@gmail.com`
  - Password: `123456`
  - Email: `reuel@gmail.com` (New test account)
  - Password: `123456`
- **Organizer Role:**
  - Email: `admin@admin.com`
  - Password: `123456`
- **Gatekeeper Role (Portaria):**
  - Email: `portaria@elite.com`
  - Password: `123456`
- **Super Administrator Role:**
  - Email: `superadmin@elite.com`
  - Password: `123456`

## Troubleshooting

If something is not working as expected when setting up or running the application, check the following points:

1. **Database connection error:** Ensure that the connection string in the backend's `.env` file is correct and that your machine's IP is authorized in the database provider (e.g., Supabase).
2. **Frontend fails to run:** Verify if the `NEXT_PUBLIC_API_URL` variable is pointing correctly to `http://localhost:3333` and if the backend server is running simultaneously.
3. **Events do not appear on the screen:** The database might be empty. Make sure to run the seed command (`npx tsx prisma/seed.ts` inside the `backend` folder).
4. **Login fails:** Check if the database was seeded. Test passwords are always `123456`. If the problem persists, create a new account through the application's registration flow.

## License

This software architecture and its implementations are proprietary and confidential. Unauthorized distribution or modification is prohibited.
