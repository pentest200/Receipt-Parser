# Receipt Parser

A full-stack web application that uses AI to extract structured data from receipt images. Users upload a receipt photo, the app sends it to OpenAI's GPT-4.1 vision model to extract merchant, amounts, and line items, then presents an editable review interface where low-confidence fields are highlighted for correction. Corrected receipts are saved to a local SQLite database and can be browsed in a receipt history view.

## Quick Start

```bash
# 1. Clone and install
npm run setup

# 2. Configure environment
cp .env.example .env
# Edit .env and add your OpenAI API key

# 3. Run (starts both client and server)
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TypeScript, TailwindCSS v4 |
| Forms | React Hook Form |
| Data Fetching | TanStack Query, Axios |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite via Prisma ORM |
| AI | OpenAI GPT-4.1 (Responses API) |
| Validation | Zod |
| Upload | Multer (memory storage) |

## Architecture

```
Client (React)  →  Vite Proxy  →  Express API  →  OpenAI / Prisma+SQLite
                                    ↓
                              Controller
                                    ↓
                              Service Layer
                                    ↓
                          LLM Service / DB Service
```

Layered backend architecture separates routing, business logic, LLM integration, and data persistence into distinct modules.

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/parse` | Upload receipt image, returns extracted JSON |
| POST | `/api/receipts` | Save a corrected receipt |
| GET | `/api/receipts` | List all saved receipts |
| GET | `/api/receipts/:id` | Get a single receipt with line items |

---

## 1. What did you build?

A Receipt Parser web app that lets users upload receipt images, extracts structured data (merchant, date, amounts, line items) using OpenAI's vision model, presents results in an editable form with confidence-based highlighting so users know which fields to correct, and persists corrected receipts to SQLite. The core differentiator is the correction workflow: low-confidence fields are visually flagged with yellow/red highlighting and percentage badges, making it immediately clear what needs human review.

## 2. Biggest Tradeoffs

**SQLite** — Chose SQLite for zero-config local persistence. It's perfect for an MVP and single-user scenarios but doesn't support concurrent writes or horizontal scaling. For production, I'd migrate to PostgreSQL with the same Prisma schema (one-line change).

**Single Retry** — The LLM extraction retries once on failure (API error, invalid JSON, or Zod validation failure). Diminishing returns beyond one retry: if the model can't parse the receipt twice, a third attempt rarely helps. This keeps P95 latency predictable (~10s vs potentially 30s+ with exponential backoff).

**Confidence Thresholds (40%/70%)** — These are hardcoded heuristics, not empirically calibrated. The 70% threshold for yellow and 40% for red were chosen to balance signal-to-noise: too aggressive flags everything, too conservative misses real errors. In production, I'd A/B test these thresholds against user correction rates.

**Memory Storage for Uploads** — Using Multer's memory storage instead of disk. Receipt images are small (<10MB), so buffering in memory avoids temp file cleanup logic. This wouldn't scale for high-throughput batch processing.

**No Authentication** — Deliberately omitted for MVP scope. All receipts are visible to all users. Adding auth (e.g., NextAuth or Clerk) would be the first production addition.

## 3. Where did you use AI?

- **OpenAI GPT-4.1** — Core feature: extracts structured receipt data from images via the Responses API with a carefully crafted system prompt that enforces JSON-only output and confidence scoring.
- **Claude** — Assisted with boilerplate scaffolding and code generation for the project structure.
- **Manual Implementation** — Backend architecture (layered service pattern), Zod validation schemas, confidence highlighting UX, retry logic, React Hook Form integration, and all error handling were manually designed and implemented.

## 4. What would you build with another week?

- **Authentication** — User accounts with receipt ownership (Clerk or NextAuth)
- **Receipt Search** — Full-text search across merchant names and dates
- **Pagination** — Virtual scrolling for large receipt histories
- **Receipt Categories** — Auto-categorization (groceries, dining, fuel, etc.)
- **OCR Preprocessing** — Tesseract.js for pre-processing before LLM to reduce token cost
- **Multiple LLM Support** — Fallback to Claude or Gemini if OpenAI fails
- **Confidence Visualization** — Per-field confidence bars and aggregate receipt quality score
- **Unit + E2E Tests** — Playwright for the full upload→review→save flow
- **Docker** — Multi-stage Dockerfile for one-command deployment
- **Export** — CSV/PDF export of saved receipts

## 5. One Thing I Would Push Back On

**The assignment doesn't define "line item."** A receipt from a restaurant might have "1x Burger $12.99" where the line item has a quantity, name, and price. A grocery receipt might have "ORGANIC BANANAS 2.49 F" with tax codes. A gas station receipt has gallons × price/gallon. I chose the simplest reasonable model — `{ name, amount }` — which covers 80% of cases. A more robust model would include `quantity`, `unitPrice`, `category`, and `taxCode`, but that complexity should be driven by actual user needs, not speculative generalization. Ship simple, iterate on real feedback.

## Engineering Decisions

| Decision | Rationale |
|----------|-----------|
| GPT-4.1 | Best vision model for structured extraction; strong JSON adherence at lower cost than GPT-4o |
| Prisma | Type-safe database access; schema changes are trivial; SQLite↔PostgreSQL is a one-line config change |
| SQLite | Zero-config local persistence; perfect for MVPs and take-home assignments |
| Single retry | Keeps latency predictable; diminishing returns beyond one retry for LLM extraction |
| Confidence highlighting | Core UX differentiator; tells users *what* to correct, not just *that* they can edit |
| React Hook Form | Performant form management; uncontrolled inputs minimize re-renders on large receipt forms |
| Memory storage | Avoids temp file management; receipt images are small enough for in-memory buffering |
| TailwindCSS v4 | Utility-first CSS with zero config; v4's Vite plugin eliminates PostCSS setup |

## Running Tests

```bash
cd server
npx vitest run
```

Tests cover:
- Zod schema validation (valid, invalid, edge cases)
- Parse service logic (retry, JSON cleaning, error handling)

## Project Structure

```
receipt-parser/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── hooks/          # TanStack Query custom hooks
│   │   ├── services/       # Axios API client
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # Helper functions
│   ├── index.html
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── llm/            # OpenAI integration
│   │   ├── routes/         # Express route definitions
│   │   ├── middleware/      # Multer upload config
│   │   ├── db/             # Prisma client
│   │   ├── utils/          # Zod schemas
│   │   └── __tests__/      # Vitest tests
│   └── prisma/
│       └── schema.prisma
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
