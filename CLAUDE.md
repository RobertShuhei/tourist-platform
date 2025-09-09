# Project Constitution: AI Inbound Tourism Platform (CLAUDE.md)

## 0. How to Use This Document (Instructions for the AI Assistant)
**This is the master plan and single source of truth for our project.** You, the AI assistant, must adhere strictly to the definitions, architecture, phases, and roles outlined in this document for all development tasks. Do not propose solutions that contradict this constitution. Your primary goal is to act as a specialized agent based on the role assigned in the prompt and generate code or provide advice that aligns with this master plan. **You will only take action when explicitly prompted by the user.**

---

## 1. Project Overview
This project is an AI-powered platform for inbound tourism in Japan. It serves as a hub for information and booking of domestic tours, connecting foreign tourists with individual guides (foreign residents in Japan or Japanese nationals who speak foreign languages).

### Objectives
-   **Provide Localized Information**: Offer information on unique tourist spots and hidden gems that major travel sites often miss.
-   **Deliver Unique Experiences**: Enable local guides to offer personalized tours, from famous sites to niche restaurants.
-   **Revitalize Local Regions**: Stimulate local economies by directing tourist traffic to less-known areas.

### Target Audience
-   Foreign tourists visiting Japan.
-   Individual guides (foreign residents, multilingual Japanese nationals).
-   Japanese students interested in international exchange.
-   Local governments and businesses aiming for regional revitalization.

### Revenue Streams
-   Commission fees/subscriptions for guides.
-   Subscription fees, commissions, and advertising revenue from local businesses (hotels, restaurants, shops).
-   Usage fees for AI-powered features (translation, tour generation, user analytics).

---

## 2. Technical Architecture & Stack

### Architecture
-   **Monorepo Structure**:
    -   `apps/web`: Frontend (Next.js)
    -   `apps/api`: Main Backend (FastAPI)
    -   `apps/ml-service`: AI/ML Inference API (FastAPI)
-   **Infrastructure**: Docker for containerization, managed via `docker-compose`. CI/CD pipeline managed by GitHub Actions.

### Technology Stack
-   **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Playwright (E2E Testing), `next-i18next` (i18n).
-   **Backend (API & ML)**: FastAPI (Python), SQLAlchemy (ORM), Alembic (Migrations), Pydantic (Validation), Celery + Redis (Async Tasks).
-   **Database**: PostgreSQL with PostGIS (for geospatial queries) and pgvector (for semantic search).
-   **Cache/Queue**: Redis.
-   **Storage**: S3-compatible object storage (for images, documents).
-   **Authentication**: JWT-based with Role-Based Access Control (RBAC).
-   **External APIs**: Stripe (Payments), an external KYC provider (e.g., Stripe Identity), and a map provider (e.g., Mapbox, Google Maps).

---

## 3. Development Phases & Core Features

### Phase 1: Foundation & Core Matching
-   **Goal**: Establish the basic platform for users to register, be verified, and find each other.
-   **Features**:
    -   User registration and manual KYC verification.
    -   Guide profile creation and basic search/filtering.
    -   Text-only chat functionality for matched users.

### Phase 2: Enhance Matching & Monetization
-   **Goal**: Improve match quality and build the revenue infrastructure.
-   **Features**:
    -   Rule-based recommendation engine.
    -   Full integration of Stripe for payments and payouts.
    -   Review and rating system.
    -   Automated KYC integration.

### Phase 3: AI Integration & Ecosystem Expansion
-   **Goal**: Differentiate with high-value AI features and expand the business ecosystem.
-   **Features**:
    -   AI-powered automatic tour itinerary generation.
    -   Advanced, personalized recommendations using machine learning.
    -   Real-time chat translation.
    -   Dashboard for local governments and businesses.

---

## 4. AI Agent Roles

This project will be developed by a virtual team of specialized AI agents, managed by a human Project Manager.

1.  **`Architect`**: Designs system architecture, data models, and API endpoints.
2.  **`UI_UX_Designer`**: Creates user-friendly wireframes, mockups, and defines the design system.
3.  **`Frontend_Engineer`**: Implements the Next.js UI based on the designer's specifications.
4.  **`Backend_Engineer`**: Implements the FastAPI business logic and APIs.
5.  **`AI_Engineer`**: Develops the core AI features (recommendations, tour generation) for the `ml-service`.
6.  **`DB_Specialist`**: Designs database schemas, writes migration scripts, and optimizes queries.
7.  **`QA_Engineer`**: Generates unit tests (`pytest`) and E2E tests (`Playwright`).
8.  **`DevOps_Engineer`**: Manages Docker, `docker-compose`, and GitHub Actions CI/CD pipelines.
9.  **`Security_Auditor`**: Reviews code for security vulnerabilities.
10. **`Doc_Writer`**: Generates and refines documentation and code comments.