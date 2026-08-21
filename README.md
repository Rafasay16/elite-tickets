# Elite Tickets

Elite Tickets is a comprehensive, full-stack ticketing platform designed for cinemas, concerts, and festivals. It provides an end-to-end solution for event management, ticket purchasing, and access control.

The system is built as a monorepo, divided into a decoupled frontend and backend architecture, ensuring scalability and ease of maintenance.

## Architecture Overview

The repository is structured into two main applications:

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules with a custom dark-mode, glassmorphism design system.
- **Key Features:**
  - Dynamic interactive seat mapping and sector selection.
  - Location-based event filtering and multi-session aggregation.
  - Role-based routing and specialized dashboards.
  - Dynamic QR Code rendering for ticket validation.

### Backend
- **Framework:** Node.js with Express
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** SQLite (Configured for development; easily swappable to PostgreSQL/MySQL)
- **Key Features:**
  - RESTful API architecture.
  - JWT-based authentication and authorization.
  - Transactional seat reservation and ticket generation logic.
  - Comprehensive data modeling for users, events, sessions, seats, and tickets.

## User Roles and Capabilities

The platform supports a robust Role-Based Access Control (RBAC) system:

1. **Client (CLIENT):** Can browse events by city, select specific sessions, choose seats via an interactive map, simulate payments, and view their purchased tickets.
2. **Organizer (ORGANIZER):** Can access the Admin Dashboard to create and manage events, set up seat capacities, and monitor sales metrics.
3. **Super Admin (SUPER_ADMIN):** Has global visibility over platform metrics, total revenue, and system-wide administration.
4. **Portaria (PORTARIA):** Can access the entry dashboard to scan or manually input ticket IDs to validate entry in real-time, preventing duplicate entries or expired tickets.

## Core Features

- **Location-Aware Browsing:** Users select their city, and the platform automatically filters available events.
- **Multi-Session Support:** Events (like movies) can have multiple sessions on different dates and times under the same title, aggregating intelligently on the home page.
- **Interactive Booking:** 
  - For cinemas: Individual seat selection on a visual grid.
  - For shows/festivals: Lot-based sector selection with maximum ticket constraints.
- **Ticket Lifecycle Management:** Tickets possess states (Valid, Used, Expired) and include dynamically generated QR Codes.
- **TMDb Integration:** Automated fetching of high-quality movie posters and backdrops for cinematic events.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

Clone the repository and install dependencies for both the frontend and backend.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

#### Backend
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=3333
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secure_jwt_secret"
```

Initialize the database:
```bash
cd backend
npx prisma db push
```

#### Frontend
Create a `.env` file in the `frontend` directory with the following variables:
```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
TMDB_API_KEY="your_tmdb_api_key_here"
```

### Running the Application

To run the application locally, you need to start both servers.

**Start the Backend API:**
```bash
cd backend
npm run dev
```

**Start the Frontend Client:**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3333`.

## Database Management

You can inspect and manage the database using Prisma Studio:
```bash
cd backend
npx prisma studio
```

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.
