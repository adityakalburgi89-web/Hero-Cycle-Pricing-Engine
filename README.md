# 🚲 Hero Cycle Pricing Engine - Full-Stack Monorepo

Welcome to the **Hero Cycle Pricing Engine Boilerplate**, a production-ready, recruiter-level full-stack application built using a clean monorepo architecture. 

This repository leverages **TypeScript** end-to-end to maximize type-safety, maintainability, and clean separation of concerns.

---

## 🏗️ Architecture & Core Features

### 💻 Frontend (React + Vite)
*   **Vite Toolchain**: Ultra-fast bundler and hot-module replacement (HMR).
*   **State Management (Zustand)**: Lightweight, reactive state management using a hook-based API, integrated with **Zustand Devtools** for clear debugging state inspection.
*   **Axios HTTP Pipeline**: Custom configured client located in `frontend/src/config/api.ts` with unified request/response interceptors. Formats API response payloads, injects auth headers automatically, and captures network anomalies globally.
*   **Tailwind CSS Custom Design System**: Stunning dark mode layout with custom Outfit typography, glassmorphic panels, radial glows, and elegant micro-animations.
*   **Pricing Simulator Widget**: A highly interactable playground letting developers adjust cycle properties (quantity, material, region) to compile active business pricing rules in real-time.
*   **No DB Fallback/Simulation**: If your database is not yet migrated, the dashboard detects it and activates a local state-based database simulation so the application works **out of the box** without configuration!

### ⚙️ Backend (Node.js + Express + Prisma)
*   **3-Tier MVC Architecture**: Explicit separating layer between HTTP router declarations, controller logic handlers, database persistence, and system utilities.
*   **Prisma ORM**: Integration with **PostgreSQL** with predefined models for `User` and `PricingRule`, and safe indexing properties.
*   **Zod Environment validation**: The server parses and strictly validates `.env` variables at boot time inside `backend/src/config/env.ts`, aborting execution immediately with descriptive error logging if parameters are invalid.
*   **Custom Global Error handler**: Structured middleware in `backend/src/middlewares/error.middleware.ts` capturing uncaught exceptions and `ZodError` validation anomalies, outputting descriptive stack frames in development and clean sanitizations in production.
*   **Winston Colorized logging**: Dedicated logger generating formatted logs across levels (info, debug, warning, error) with direct output file writers for server-side exceptions.
*   **Express Security stack**: Bundles `helmet` for HTTP headers, customized `cors` controls, and `express-rate-limit` to guard against brute-force threats.

---

## 📂 Folder Structure

```
hero-cycle-pricing-engine/
├── package.json               # Root monorepo workspace orchestration
├── README.md                  # Comprehensive blueprint handbook
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Active PostgreSQL schema rules
│   ├── src/
│   │   ├── config/            # DB singletons & env verifications
│   │   ├── controllers/       # Request handlers & schema validations
│   │   ├── middlewares/       # Express rate limits & error catches
│   │   ├── routes/            # REST API Endpoint declarations
│   │   ├── utils/             # Winston logger & ApiError wrappers
│   │   ├── app.ts             # Express Application bootstrapping
│   │   └── server.ts          # Graceful signal listeners
│   ├── tsconfig.json          # TS ES2022 Configs
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/        # UI Buttons & Card design systems
    │   ├── config/            # Axios API config
    │   ├── store/             # Zustand state management
    │   ├── types/             # TypeScript declarations
    │   ├── App.tsx            # Full Dashboard container
    │   ├── main.tsx           # Entry script
    │   └── index.css          # Tailwind base & Glassmorphism styles
    ├── index.html             # SEO Meta parameters & Google Fonts
    ├── tailwind.config.js     # Custom color tokens & HSL overrides
    ├── postcss.config.js      # PostCSS integrations
    ├── vite.config.ts         # Vite server settings
    ├── tsconfig.json          # Frontend TS bundler resolution
    └── package.json
```

---

## ⚡ Quickstart Guide

### 1. Install Dependencies
Run from the root directory to install all packages in the backend and frontend workspaces using npm:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the template configuration files and customize them:
```bash
# In backend/
cp .env.example .env

# In frontend/
cp .env.example .env
```

### 3. Database Migration (PostgreSQL)
Configure your `DATABASE_URL` in `backend/.env` with your PostgreSQL server connection details, then execute:
```bash
npm run db:migrate
```
*Note: If you do not run migrations or DB connection fails, the frontend will automatically boot in simulated mode to let you demo the system!*

### 4. Start Development Servers
Run the following orchestrator command from the root directory to launch the backend API and frontend Vite server concurrently:
```bash
npm run dev
```

*   **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
*   **Backend REST Gateway**: [http://localhost:5000](http://localhost:5000)
*   **API Health Status**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🧩 Scripts Directory

Operate directly from the root workspace:

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Spins up both API and Vite UI concurrently |
| `npm run build` | Compiles and builds production outputs for backend and frontend |
| `npm run db:generate` | Refreshes Prisma client schema bindings |
| `npm run db:migrate` | Runs Prisma schema push/migrations on database |
| `npm run db:studio` | Launches Prisma graphical GUI dashboard |
