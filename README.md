# CareGuide Frontend

> Modern, secure enterprise dashboard and workspace application built with **Next.js 16 (App Router)**, **React 19**, **Redux Toolkit**, and **TypeScript**. Features tenant-isolated note management, community discussions with MongoDB aggregation showcases, role-based access control (RBAC), and containerized deployments.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Design System](#-architecture--design-system)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation & Local Development](#installation--local-development)
- [Docker & Containerization](#-docker--containerization)
  - [Production Container (Multi-Stage Standalone)](#production-container-multi-stage-standalone)
  - [Docker Compose Quickstart](#docker-compose-quickstart)
  - [Containerized Development with Hot-Reload](#containerized-development-with-hot-reload)
- [Available Scripts](#-available-scripts)
- [Security & Performance](#-security--performance)
- [License](#-license)

---

## 🚀 Overview

**CareGuide Frontend** connects to the CareGuide backend API service. It provides enterprise-grade identity, note management, and interactive showcases of complex MongoDB aggregation pipelines (`$lookup` and `$unwind`), complete with glassmorphic dark-mode UI, responsive side-by-side grids, and bottom-fixed pagination controls.

---

## ✨ Key Features

### 🔐 Authentication & Session Management
- **JWT & Silent Refresh**: Automatic access token rotation using refresh tokens with a concurrent request queue interceptor.
- **Full Auth Flow**: Register, OTP email verification, Login, Forgot Password, and Password Reset.
- **Route Protection**: Protected layouts ensuring authenticated-only workspace access.

### 📝 Notes Repository
- **Tenant Isolation**: Secure private note CRUD with compound MongoDB indexes (`userId: 1, createdAt: -1`).
- **Admin Privilege & Filtering**: Super Admins and Admins can toggle between all system notes and their own personal notes.
- **Search & Pagination**: Real-time client search and persistent bottom-fixed pagination bar with per-page selectors (6, 12, 24, 48).
- **Responsive Side-by-Side Cards**: Dynamic multi-column layout with smooth hover elevation.

### 💬 Community Discussions & MongoDB Aggregation Showcase
- **Public Community Feed**: Publish and explore architectural discussions and community posts.
- **Scenario 2: `$lookup` Pipeline Explorer**: Interactive inspector demonstrating single-query relational joins between `users` and `posts` collections.
- **Side-by-Side Grid Layout**: Responsive grid view with sticky bottom pagination controls.

### 👥 User Administration & Interest Analytics
- **Role-Based Access Control (RBAC)**: Manage user roles (`USER`, `ADMIN`, `SUPER_ADMIN`) and account statuses.
- **Interest Clustering (`$unwind`)**: Showcase of array unwind pipelines clustering users by shared tags and interests.
- **Profile Customization**: Live profile editing with interactive interest chip management.

---

## 🛠 Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.3.4](https://nextjs.org/) | App Router, Turbopack, Standalone Output |
| **Core Library** | [React 19.2](https://react.dev/) | Modern concurrent React primitives |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) | Slices, AsyncThunks, centralized dispatch |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent SVG icon set |
| **Language** | [TypeScript 5.6](https://www.typescriptlang.org/) | Strict type safety and API interfaces |
| **Linting** | [Oxlint](https://oxc.rs/) | High-performance Rust-based JavaScript/TypeScript linter |
| **Styling** | Vanilla CSS Design System | Glassmorphism, tailored HSL color tokens, dark mode |
| **Containerization** | [Docker](https://www.docker.com/) | Multi-stage Alpine builds, non-root user, standalone runtime |

---

## 📐 Architecture & Design System

- **Standalone Output Optimization**: Built with `output: "standalone"` in `next.config.mjs`, reducing Docker image footprint from ~500MB+ to under **100MB**.
- **Unified Reverse Proxy**: Local and containerized API calls route through `/api/v1/*` rewrite rules to prevent CORS conflicts and decouple backend hostnames.
- **Design Tokens**: Standardized CSS variables defined in `src/styles/globals.css`, `components.css`, and `pages.css` for consistent spacing, radii, colors, and transitions.

---

## 📂 Project Directory Structure

```text
careguide_frontend/
├── .github/                  # CI/CD workflow configurations
├── public/                   # Static assets (images, icons, svgs)
├── src/
│   ├── api/                  # API client, HTTP interceptors, token refresh logic
│   │   ├── client.ts         # Unified fetch wrapper with JWT auto-refresh
│   │   ├── auth.api.ts       # Authentication endpoints
│   │   ├── notes.api.ts      # Notes CRUD endpoints
│   │   ├── posts.api.ts      # Community posts endpoints
│   │   └── users.api.ts      # User and admin endpoints
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Authentication route group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-otp/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/      # Protected workspace route group
│   │   │   ├── notes/        # Notes management page
│   │   │   ├── posts/        # Community & $lookup showcase page
│   │   │   ├── profile/      # User profile page
│   │   │   └── admin/        # Admin users & interests management
│   │   ├── api/
│   │   │   └── health/       # Health check probe (/api/health)
│   │   ├── layout.tsx        # Root HTML layout and providers
│   │   └── page.tsx          # Home redirect page
│   ├── components/           # Reusable UI component modules
│   │   ├── auth/             # Login and register forms
│   │   ├── common/           # Toast, Navbar, Sidebar, Modals
│   │   ├── notes/            # Note cards and create/edit modal
│   │   ├── posts/            # Create post modal
│   │   └── users/            # User edit and status modals
│   ├── redux/                # Global state management
│   │   ├── slices/           # Redux slices (auth, notes, posts, users, toast)
│   │   ├── hooks.ts          # Typed useAppDispatch & useAppSelector
│   │   └── store.ts          # Store configuration
│   ├── styles/               # Design system stylesheets
│   │   ├── globals.css       # Tokens, CSS reset, base theme
│   │   ├── components.css    # Cards, buttons, inputs, fixed pagination
│   │   └── pages.css         # Page layouts, grids, aggregation banners
│   └── types/                # TypeScript data contracts & response types
├── .dockerignore             # Docker build context exclusions
├── .env.example              # Sample environment variables
├── docker-compose.yml        # Production Docker Compose orchestration
├── docker-compose.dev.yml    # Development Compose setup with hot reloading
├── Dockerfile                # Production multi-stage Docker build
├── Dockerfile.dev            # Development container configuration
├── next.config.mjs           # Next.js configuration (standalone, rewrites)
├── package.json              # Dependencies and npm scripts
└── tsconfig.json             # TypeScript compiler settings
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later (LTS recommended)
- **npm**: `v10.x` or later
- **Backend Service**: Ensure the CareGuide backend is running (default: `http://localhost:5000`)
- **Docker Desktop** *(optional, for containerized run)*: Version 24+

### Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port for the Next.js HTTP server |
| `FRONTEND_PORT` | `3000` | Host port exposed in Docker Compose |
| `BACKEND_URL` | `http://localhost:5000` | Target URL for `/api/v1/*` proxy rewrites |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disables anonymous Next.js telemetry |

### Installation & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker & Containerization

### Production Container (Multi-Stage Standalone)

The project includes an optimized multi-stage `Dockerfile`:
- Uses Alpine Linux with `libc6-compat`.
- Employs Docker layer caching with `npm ci`.
- Runs as an unprivileged system user (`nextjs:nodejs`, UID 1001).
- Includes active `HEALTHCHECK` probing `/api/health`.

**Build and run the production image**:
```bash
# Build the image
npm run docker:build

# Run the container
npm run docker:run
```

### Docker Compose Quickstart

To run the frontend service using Docker Compose:

```bash
# Start container in detached mode
npm run docker:up

# View logs
docker compose logs -f

# Stop container
npm run docker:down
```

### Containerized Development with Hot-Reload

For a completely containerized development environment with live host code syncing:

```bash
npm run docker:dev
```

---

## 📜 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Starts local Next.js dev server with Turbopack |
| `npm run build` | `next build` | Compiles optimized standalone production build |
| `npm run start` | `next start` | Starts Next.js production server |
| `npm run lint` | `oxlint src` | Runs fast Oxlint code quality verification |
| `npm run docker:build` | `docker build ...` | Builds the production Docker image |
| `npm run docker:run` | `docker run ...` | Runs production Docker container on port 3000 |
| `npm run docker:up` | `docker compose up -d` | Deploys stack via Docker Compose |
| `npm run docker:down` | `docker compose down` | Stops and tears down Compose containers |
| `npm run docker:dev` | `docker compose -f ...` | Starts development container with live reload |

---

## 🛡 Security & Performance

- **Non-Root Container**: Container runs with unprivileged user `nextjs` (UID 1001) preventing privilege escalation vulnerabilities.
- **Minimal Image Surface**: Excludes package manager caches, tests, source files, and development dependencies in the runner stage.
- **Log Rotation**: Built-in JSON log limits (`max-size: 10m`, `max-file: 3`) preventing container disk exhaustion.
- **Protected Endpoints**: Dynamic token refresh prevents expired session disruption while clearing state securely on logout.
- **Health Check Endpoint**: `/api/health` returns status `200 OK` for AWS ALB, Kubernetes liveness/readiness probes, and Docker daemon checks.

---

## 📄 License

This project is proprietary and maintained for the **CareGuide** enterprise platform. All rights reserved.
