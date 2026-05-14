# 📧 Temp-Email & SMS Platform - Comprehensive Master Documentation

<div align="center">
  <h3>Enterprise-Grade Disposable Email & SMS Verification SaaS</h3>
  <p>A highly scalable, secure, and performant platform built with Next.js, Node.js, Express, PostgreSQL, Redis, and WebSockets.</p>
</div>

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Screenshots Section](#3-screenshots-section)
4. [Tech Stack](#4-tech-stack)
5. [Folder Structure](#5-folder-structure)
6. [System Architecture](#6-system-architecture)
7. [Architecture Diagrams](#7-architecture-diagrams)
8. [Database ER Diagram](#8-database-er-diagram)
9. [Authentication Flow](#9-authentication-flow)
10. [Temp Mail Workflow](#10-temp-mail-workflow)
11. [Temp SMS Workflow](#11-temp-sms-workflow)
12. [API Architecture](#12-api-architecture)
13. [Realtime Socket Architecture](#13-realtime-socket-architecture)
14. [Security Architecture](#14-security-architecture)
15. [Payment Architecture](#15-payment-architecture)
16. [Queue System](#16-queue-system)
17. [Redis Caching Strategy](#17-redis-caching-strategy)
18. [Complete Installation Guide](#18-complete-installation-guide)
19. [Docker Setup](#19-docker-setup)
20. [Environment Variables](#20-environment-variables)
21. [Prisma Setup](#21-prisma-setup)
22. [Database Migrations](#22-database-migrations)
23. [Running Frontend](#23-running-frontend)
24. [Running Backend](#24-running-backend)
25. [Production Deployment](#25-production-deployment)
26. [Vercel Deployment](#26-vercel-deployment)
27. [Railway Deployment](#27-railway-deployment)
28. [Nginx Configuration](#28-nginx-configuration)
29. [Cloudflare Setup](#29-cloudflare-setup)
30. [SSL Setup](#30-ssl-setup)
31. [API Documentation](#31-api-documentation)
32. [Authentication API](#32-authentication-api)
33. [Mail API](#33-mail-api)
34. [SMS API](#34-sms-api)
35. [Admin API](#35-admin-api)
36. [WebSocket Events](#36-websocket-events)
37. [Stripe Integration](#37-stripe-integration)
38. [Testing Guide](#38-testing-guide)
39. [Load Testing](#39-load-testing)
40. [Scaling Strategy](#40-scaling-strategy)
41. [Monitoring & Logging](#41-monitoring--logging)
42. [Admin Dashboard Explanation](#42-admin-dashboard-explanation)
43. [Provider Management](#43-provider-management)
44. [Abuse Prevention System](#44-abuse-prevention-system)
45. [Rate Limiting Strategy](#45-rate-limiting-strategy)
46. [SMTP Email Flow](#46-smtp-email-flow)
47. [SMS Provider Flow](#47-sms-provider-flow)
48. [Queue Processing](#48-queue-processing)
49. [CI/CD Pipeline](#49-cicd-pipeline)
50. [Performance Optimization](#50-performance-optimization)
51. [SEO Optimization](#51-seo-optimization)
52. [Lighthouse Optimization](#52-lighthouse-optimization)
53. [PWA Support](#53-pwa-support)
54. [Browser Notifications](#54-browser-notifications)
55. [Docker Compose Explanation](#55-docker-compose-explanation)
56. [Production Best Practices](#56-production-best-practices)
57. [Troubleshooting Guide](#57-troubleshooting-guide)
58. [FAQ](#58-faq)
59. [Contribution Guide](#59-contribution-guide)
60. [License](#60-license)

---

## 1. Project Overview

The **Temp-Email & SMS Platform** is an enterprise-level SaaS application that provides users and developers with disposable email addresses and temporary virtual phone numbers for verification purposes. Designed to bypass aggressive spam filters and SMS verifications securely, this platform offers real-time synchronization, a robust REST API for developers, premium tiers monetized via Stripe, and a highly polished UI.

## 2. Features

- **Disposable Email:** Generate temporary inboxes instantly.
- **Disposable SMS:** Virtual numbers to receive OTPs and verifications.
- **Realtime Updates:** Instant push notifications via WebSockets.
- **Custom Domains:** Support for multiple custom email domains.
- **Monetization:** Stripe integration for premium subscriptions.
- **Developer API:** Extensive REST APIs authenticated via API keys.
- **Admin Dashboard:** Total system control, analytics, and abuse prevention.
- **Auto-Cleanup:** Scheduled cron jobs to delete old emails and free up database storage.

## 3. Screenshots Section

*(Insert screenshots of your application here)*
- **Landing Page:** Beautiful glassmorphism hero section.
- **Dashboard:** User control panel with active mailboxes and SMS numbers.
- **Admin Panel:** Charts, user management, and active provider configurations.
- **Mailbox View:** Real-time email viewer with attachments support.

## 4. Tech Stack

- **Frontend:** Next.js (App Router), React, TailwindCSS, Zustand, Axios, Socket.io-client.
- **Backend:** Node.js, Express, TypeScript, Zod, Socket.io.
- **Database & ORM:** PostgreSQL, Prisma ORM.
- **Caching & Queues:** Redis, BullMQ.
- **Infrastructure:** Docker, Nginx, Cloudflare.
- **Payments:** Stripe API.

## 5. Folder Structure

```text
Temp-email/
├── backend/
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── controllers/    # Route request handlers
│   │   ├── middlewares/    # Auth, validation, rate limiting
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Core business logic
│   │   ├── utils/          # Helpers (SMTP, Socket, Redis)
│   │   └── validators/     # Zod schemas
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Utility functions & Axios config
│   │   └── store/          # Zustand global state
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 6. System Architecture

The system follows a scalable microservices-inspired architecture but is bundled as a robust monolith for ease of deployment. 
- **Nginx** handles reverse proxying and load balancing.
- **Express Backend** serves REST API requests and manages WebSocket connections.
- **PostgreSQL** stores persistent relational data.
- **Redis** acts as an ultra-fast cache and manages WebSockets Pub/Sub and BullMQ queues.

## 7. Architecture Diagrams

```mermaid
graph TD
    Client[Client App / Next.js] -->|HTTP/REST| API[API Gateway / Express]
    Client -->|WebSocket| WSS[WebSocket Server]
    API --> DB[(PostgreSQL)]
    API --> Redis[(Redis Cache)]
    API --> Stripe[Stripe API]
    WSS --> Redis
    SMTP[SMTP Server] -->|Incoming Emails| Queue[Redis Bull Queue]
    Queue -->|Process Email| API
```

## 8. Database ER Diagram

```mermaid
erDiagram
    User ||--o{ Subscription : has
    User ||--o{ Mailbox : owns
    User ||--o{ SmsInbox : owns
    User ||--o{ ApiKey : creates
    Mailbox ||--o{ Email : receives
    SmsInbox ||--o{ SmsMessage : receives
    User {
        string id PK
        string email
        string password
        string role
        boolean isPremium
    }
    Mailbox {
        string id PK
        string address
        string userId FK
    }
```

## 9. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB
    User->>Frontend: Login with Credentials
    Frontend->>Backend: POST /auth/login
    Backend->>DB: Verify Credentials
    DB-->>Backend: User Data
    Backend-->>Frontend: JWT Access & Refresh Tokens
    Frontend->>User: Redirect to Dashboard
```

## 10. Temp Mail Workflow

1. User requests a new mailbox via UI or API.
2. Backend assigns a random prefix with an active domain and saves it to PostgreSQL.
3. Custom SMTP server listens on port 25.
4. Email arrives, parser extracts headers, body, and attachments.
5. Email is verified against active mailboxes in PostgreSQL.
6. Email is stored, and an event is published via Redis to WebSockets.
7. Frontend updates in real-time.

## 11. Temp SMS Workflow

1. User requests an SMS number.
2. Number is fetched from provider pool (Twilio/Custom).
3. Sender texts the number.
4. Provider sends a webhook to `POST /api/sms/webhook`.
5. Backend verifies webhook signature, stores the message.
6. Real-time update emitted to the user's dashboard.

## 12. API Architecture

```mermaid
sequenceDiagram
    participant App
    participant Nginx
    participant API
    participant Cache
    participant DB
    App->>Nginx: Request /api/v1/emails
    Nginx->>API: Route Request
    API->>Cache: Check Cache
    alt Cache Hit
        Cache-->>API: Return Cached Data
    else Cache Miss
        API->>DB: Query Database
        DB-->>API: Return Data
        API->>Cache: Store in Cache
    end
    API-->>Nginx: Response
    Nginx-->>App: JSON Response
```

## 13. Realtime Socket Architecture

```mermaid
graph TD
    Client1[Frontend Client 1] -->|Socket.io| WSS1[WebSocket Node 1]
    Client2[Frontend Client 2] -->|Socket.io| WSS2[WebSocket Node 2]
    WSS1 <--> RedisAdapter[Redis Pub/Sub Adapter]
    WSS2 <--> RedisAdapter
    BackendAPI[Express Controllers] -->|Publish| RedisAdapter
```

## 14. Security Architecture

- **JWT Authentication:** Short-lived access tokens with HTTP-only refresh tokens.
- **CORS:** Strictly limited to configured frontend domains.
- **Rate Limiting:** `express-rate-limit` backed by Redis to prevent brute force and API abuse.
- **Sanitization:** All inputs validated securely using Zod.
- **Helmet:** HTTP header security configurations.

## 15. Payment Architecture

Stripe is used for managing premium tiers.
- **Checkout Sessions:** Created dynamically via backend.
- **Webhooks:** Stripe sends payment events to `POST /api/subscriptions/webhook`.
- **Fulfillment:** User's `isPremium` status is toggled in PostgreSQL automatically upon payment intent success.

## 16. Queue System

```mermaid
graph LR
    Producer[API / Webhook / SMTP] -->|Add Job| RedisQueue[Redis BullMQ]
    RedisQueue --> Worker1[Worker Node 1]
    RedisQueue --> Worker2[Worker Node 2]
    Worker1 -->|Process| DB[(PostgreSQL)]
    Worker2 -->|Process| DB
    Worker1 -->|Failed| RetryQueue[Retry/Dead Letter]
```

## 17. Redis Caching Strategy

```mermaid
graph TD
    Request[Client Request] --> API[Express API]
    API -->|GET /key| Redis[(Redis)]
    alt Found
        Redis -->|Return Data| API
    else Not Found
        API -->|Query| DB[(PostgreSQL)]
        DB -->|Return Data| API
        API -->|SETEX /key| Redis
    end
    API --> Response[Send JSON]
```

## 18. Complete Installation Guide

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- Docker & Docker Compose

### Local Setup
1. Clone the repository.
2. Setup environment variables (see #20).
3. Run `npm install` inside both `frontend` and `backend`.
4. Start Redis and PostgreSQL instances.

## 19. Docker Setup

To run the entire stack locally using Docker Compose:
```bash
docker-compose up --build -d
```
This will spin up PostgreSQL, Redis, Backend (API & Socket), and Frontend in interconnected containers.

## 20. Environment Variables

Create `.env` in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/tempmail?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="super-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
SMTP_PORT=25
FRONTEND_URL="http://localhost:3000"
```

## 21. Prisma Setup

Inside the `backend/` folder:
```bash
npx prisma generate
```
This generates the strongly-typed Prisma Client for TypeScript.

## 22. Database Migrations

Apply the database schema to your PostgreSQL instance:
```bash
npx prisma migrate dev --name init
```

## 23. Running Frontend

Inside the `frontend/` folder:
```bash
npm run dev
```
The Next.js application will start on `http://localhost:3000`.

## 24. Running Backend

Inside the `backend/` folder:
```bash
npm run build
npm start
```
For development with hot-reloading: `npm run dev`.

## 25. Production Deployment

Production architecture requires:
1. Load balancer (Nginx)
2. Process manager (PM2) or Container Orchestration (Docker Swarm / K8s).
3. Managed Database and Redis services.

## 26. Vercel Deployment

Deploying the Next.js frontend to Vercel is seamless:
1. Push your code to GitHub.
2. Import the `frontend` folder into Vercel.
3. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` in Vercel settings.
4. Deploy.

## 27. Railway Deployment

Backend, PostgreSQL, and Redis can be easily deployed to Railway:
1. Create a new Railway project.
2. Provision PostgreSQL and Redis plugins.
3. Link the `backend` GitHub repository.
4. Map the environment variables to the provisioned database/redis URLs.

## 28. Nginx Configuration

If deploying to a VPS, use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 29. Cloudflare Setup

1. Route your domain DNS through Cloudflare.
2. Ensure proxy status is set to "Proxied (Orange Cloud)".
3. Configure Page Rules to bypass cache for API routes (`/api/*`).
4. Set WebSockets to be enabled in Cloudflare Network settings.

## 30. SSL Setup

Cloudflare handles edge SSL. For strict SSL between Cloudflare and your server, install Certbot on your VPS:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

## 31. API Documentation

All API routes respond with JSON. Ensure you pass the `Authorization: Bearer <token>` or `x-api-key: <key>` header for protected routes.

## 32. Authentication API

- `POST /api/auth/register` - Create an account.
- `POST /api/auth/login` - Login and receive JWT.
- `GET /api/auth/me` - Get current user profile.

## 33. Mail API

- `POST /api/mailbox` - Generate a new mailbox.
- `GET /api/mailbox` - List user's mailboxes.
- `GET /api/mailbox/:id/messages` - Get emails for a mailbox.
- `DELETE /api/mailbox/:id` - Delete a mailbox.

## 34. SMS API

- `POST /api/sms/numbers` - Allocate a new temp number.
- `GET /api/sms/numbers` - List active numbers.
- `GET /api/sms/messages/:numberId` - Get SMS records.

## 35. Admin API

*(Requires Admin Role)*
- `GET /api/admin/users` - List all users.
- `GET /api/admin/stats` - Platform usage statistics.
- `POST /api/admin/ban` - Ban a user.

## 36. WebSocket Events

Connect to `ws://api.domain.com`.
**Events Emitted to Client:**
- `new_email` - Payload contains email metadata.
- `new_sms` - Payload contains SMS details.
**Client Emits:**
- `join_room` - Joins a specific mailbox/number room for targeted updates.

## 37. Stripe Integration

1. Create products in Stripe Dashboard.
2. Use Price IDs in your frontend pricing page.
3. Backend creates checkout session.
4. Webhook updates DB. 
*Note:* Ensure Stripe Webhook CLI is running for local testing.

## 38. Testing Guide

Run Jest tests in the backend:
```bash
npm run test
```

## 39. Load Testing

Use Artillery to test API limits:
```bash
npx artillery run load-test.yml
```

## 40. Scaling Strategy

- **Stateless Backend:** Keep Node.js purely stateless. State lives in Redis and Postgres.
- **Horizontal Pod Autoscaling:** Run multiple instances of Express.
- **Database Pooling:** Use PgBouncer or Prisma Accelerate to handle heavy concurrent DB connections.

## 41. Monitoring & Logging

- **Logging:** Winston logger integrated in backend.
- **APM:** New Relic or Datadog for tracking endpoint latency.
- **Error Tracking:** Sentry initialized in both frontend and backend.

## 42. Admin Dashboard Explanation

The Admin panel provides a graphical interface to monitor the system's pulse. It lists active subsciptions, controls global rate limits, and allows managing SMTP ban lists to prevent abusive sender domains.

## 43. Provider Management

For SMS, multiple providers (Twilio, Vonage) can be configured via environment variables. The backend abstracts the provider logic to allow switching without code changes.

## 44. Abuse Prevention System

- IPs generating >50 mailboxes an hour are auto-blocked.
- Invalid SMTP commands trigger immediate TCP disconnects.
- Temporary domains are rotated to prevent blacklisting.

## 45. Rate Limiting Strategy

Using Redis:
- Public APIs: 100 req / 15 mins.
- Paid API Keys: 1000 req / min.
- SMTP Receiver: Max 5 connections per IP.

## 46. SMTP Email Flow

```mermaid
graph TD
    Sender -->|SMTP| SMTPServer[Node.js SMTP Receiver]
    SMTPServer -->|Parse| Parser[Mailparser]
    Parser -->|Add to Queue| BullQueue[BullMQ Redis]
    BullQueue -->|Process Job| Worker[Email Processor]
    Worker -->|Save to DB| DB[(PostgreSQL)]
    Worker -->|Publish Event| RedisPubSub[Redis Pub/Sub]
    RedisPubSub --> WSS[WebSocket Server]
    WSS -->|Emit Event| Client[Connected Client]
```

## 47. SMS Provider Flow

```mermaid
graph TD
    Provider[Twilio / Plivo / Custom] -->|Webhook| WebhookEndpoint[POST /api/sms/webhook]
    WebhookEndpoint -->|Validate Signature| Validator[Middleware]
    Validator -->|Parse Payload| Parser[SMS Parser]
    Parser -->|Save to DB| DB[(PostgreSQL)]
    Parser -->|Publish Event| RedisPubSub[Redis Pub/Sub]
    RedisPubSub --> WSS[WebSocket Server]
    WSS -->|Emit Event| Client[Connected Client]
```

## 48. Queue Processing

CPU-intensive tasks (email parsing, push notifications) are offloaded to BullMQ. Workers process these continuously in the background, ensuring the main Express event loop remains unblocked.

## 49. CI/CD Pipeline

Using GitHub Actions:
- On Push to `main`: Run lint, run tests.
- On Success: Build Docker images.
- Push to Docker Hub.
- Trigger server webhook to pull and deploy.

## 50. Performance Optimization

- DB Indexes on `userId`, `mailboxId`, and timestamps.
- Next.js SSR and Static caching used appropriately.
- Gzip compression enabled on Nginx.
- Images highly optimized and served via Next Image component.

## 51. SEO Optimization

Frontend uses rich metadata, dynamic open-graph tags, and semantic HTML5 to ensure top Google rankings for "Temp Email" and "Temp SMS".

## 52. Lighthouse Optimization

Achieves a 95+ score.
- Minimize main-thread work.
- Use `next/font` for optimal font loading.
- Defer non-critical JS.

## 53. PWA Support

Included `next-pwa` config. Users can install the app on their mobile home screen for instant access to temporary numbers.

## 54. Browser Notifications

Uses standard Web Push APIs to alert users when a new email or SMS arrives if they are tabbed out.

## 55. Docker Compose Explanation

The `docker-compose.yml` ties the microservices:
- `db`: PostgreSQL 14 alpine.
- `redis`: Redis 6 alpine.
- `api`: Node.js server built from backend Dockerfile.
- `web`: Next.js production build.

## 56. Production Best Practices

- Always use managed DBs in production (AWS RDS / Supabase).
- Keep secrets entirely out of source control.
- Utilize WAF (Web Application Firewall) to filter malicious packets.

## 57. Troubleshooting Guide

**Emails not arriving?** 
- Ensure port 25 is unblocked by your hosting provider (many block it by default).
- Verify DNS MX records point correctly to your server IP.

**WebSockets disconnecting?**
- Check Nginx reverse proxy configuration to ensure `Connection 'upgrade'` is set.

## 58. FAQ

**Q: Can I use this for personal use?**
A: Yes, the codebase is fully open for self-hosting.

**Q: How does the email deletion work?**
A: A cron job runs every hour to delete emails older than 24 hours (or based on subscription tier limits).

## 59. Contribution Guide

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 60. License

This project is licensed under the MIT License - see the LICENSE file for details.
