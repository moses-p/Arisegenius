# Arisegenius – AI Contributor Guide

This guide is written for autonomous or semi-autonomous AI agents that will extend, debug, or operate the Arisegenius platform. It highlights the current system shape, safety rails, and high‑impact areas that are ready for enhancement.

## System Snapshot

- **Frontend (`frontend/`)**: Static TypeScript-free site (HTML/CSS/JS) served through Nginx. Key entry points: `index.html`, `ventures.html`, `products.html`, and dedicated payment/product scripts.
- **Backend (`backend/`)**: Node 18 / Express + TypeScript with Prisma ORM, PostgreSQL, Redis, and multi-provider payment hooks. Routes now include authentication, products, orders, payments, dealers, CMS, analytics, and users.
- **Infrastructure**: Dockerfiles per service plus a `docker-compose.yml` orchestrating frontend, backend, Postgres, Redis, and Nginx.
- **Dev tooling**: Prisma for data access, Winston logging, Joi validation, Stripe + Mobile Money SDKs, Nodemailer, and Socket.IO for real-time updates.

## Operating Constraints

1. **Respect existing environment configuration** – never commit secrets; `.env` values live in `backend/env.example`.
2. **Preserve TypeScript strictness** – new code must be typed (no implicit `any`). If the compiled output reveals pre-existing issues, document them rather than downgrading compiler settings.
3. **Shared Prisma client** – always import from `src/lib/prisma` to avoid multiple connections.
4. **Request typing** – `express.Request` is globally augmented with `user`. Import `Request`, `Response`, `NextFunction` for new route handlers.
5. **Logging & errors** – use `asyncHandler` + centralized `errorHandler`. Never swallow exceptions silently.
6. **Payments** – mock provider calls are acceptable, but the public contract in `PaymentService` must remain stable. Emit Socket.IO events via `io`.
7. **Files & uploads** – rely on `FileUploadService` helper; do not write ad-hoc disk operations.

## How to Spin Up Locally

```bash
# 1. Backend
cd backend
npm install
cp env.example .env
npx prisma migrate dev
npm run dev

# 2. Frontend (simple static host)
cd ../frontend
npm install
npm run dev # or npx serve .

# 3. Docker option (root dir)
docker-compose up --build
```

Use `npx prisma studio` for quick DB inspection and `npm run seed` for demo data.

## High-Impact Enhancement Areas

| Area | Why it matters | Suggested next steps |
| --- | --- | --- |
| **Order lifecycle** | Recently added order APIs cover CRUD but lack shipment automation | Add carrier webhooks, shipment status transitions, and email notifications |
| **Dealer portal UX** | Dealers need dashboards for inventory + analytics | Build React/Next micro front-end or enhance existing static pages |
| **Analytics depth** | Current analytics endpoints provide summaries only | Layer in cube-style aggregations, caching, and data export endpoints |
| **Checkout UX** | Frontend payment form is basic | Integrate Stripe Elements / mobile money SDK UIs with backend `/payments` |
| **Testing** | There are no automated tests | Add Jest + supertest coverage for auth, products, orders, payments |

## Coding Standards

- **Linting**: `npm run lint` (ESLint) for backend. Keep CI green by resolving warnings before merging.
- **Formatting**: Prettier defaults (2 spaces). No trailing spaces, keep files ASCII unless already Unicode.
- **Commits**: Conventional style (`feat:`, `fix:`, `docs:`) when interacting with Git.
- **Documentation**: Update `README.md` or this guide when you add/alter workflows, infrastructure, or system boundaries.

## Safety Checklist Before Opening a PR

1. ✅ Unit/integration tests added or updated.
2. ✅ `npm run build` or `tsc --noEmit` verified locally (document any existing upstream failures).
3. ✅ Lint passes for touched files.
4. ✅ Swagger docs updated when changing public API contracts.
5. ✅ Seed script extended when introducing new required data.

## Quick Reference

- **Shared Prisma client**: `import { prisma } from '../lib/prisma';`
- **Async route wrapper**: `import { asyncHandler } from '../middleware/errorHandler';`
- **Auth helpers**: `authenticateToken`, `requireAdmin`, `requireDealer`, `optionalAuth`
- **Payment facade**: `PaymentService.processPayment(orderId, method, amount, currency, details)`
- **Email facade**: `emailService.sendVerificationEmail(email, token)` etc.
- **File uploads**: `FileUploadService.uploadSingle('field')`

## Communicating with Humans

If you detect missing context, destructive changes, or secrets, pause and alert a human operator. Document every assumption and external dependency you rely on in PR descriptions or task updates.

---

**Arisegenius** – Empower AI teammates to ship confidently. Stay safe, stay typed, and keep Africa’s leading tire innovation platform humming. 🚗💡

