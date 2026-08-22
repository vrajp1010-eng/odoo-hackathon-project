# 🌍 Globe Trotter..

**Plan your dream multi-city adventures with ease.**

Globe Trotter is an end-to-end travel planning application designed for the Odoo × L.D.C.E Hackathon 2026. It empowers users to dream, design, and organize multi-city trips seamlessly.

## ✨ Features

- **Multi-City Itinerary Builder**: Visually organize cities, arrival/departure dates, and activities.
- **Smart Budgeting**: Keep track of transport, stay, activity, and meal expenses. Get instant feedback on whether you are over or under budget.
- **Catalog Integration**: Search for popular cities and activities natively.
- **Public Sharing**: Toggle trips to 'public' to generate a beautiful, read-only URL for friends and family.
- **Secure Authentication**: Protected routes and actions via Auth.js v5 (NextAuth) and bcrypt.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components, Server Actions)
- **Styling**: Tailwind CSS v4, Lucide Icons, Custom shadcn/ui inspired components
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma 7 (with `@prisma/adapter-pg`)
- **Authentication**: Auth.js v5
- **Validation**: Zod (v4)

## 🚀 Getting Started

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy the `.env.example` to `.env` and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```

3. **Database Setup**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Run the App**:
   ```bash
   npm run dev
   ```

## 🏆 Hackathon Demo Flow

1. Arrive at the beautiful Landing Page.
2. Sign up for a new account.
3. Explore the Dashboard with your upcoming trips and popular global destinations.
4. Plan a new trip and add a city like Paris.
5. Add activities like visiting the Eiffel Tower and Seine River Cruise.
6. Allocate a budget for the trip.
7. Switch the trip to Public and share the URL.

---
*Built autonomously by the Antigravity Agent for the Odoo Hackathon.*
