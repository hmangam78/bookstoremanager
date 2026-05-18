# Bookstore Management System

**A full-stack Point of Sale (POS) and inventory management application for independent bookstores.** Built with TypeScript (React 19 + NestJS), TypeORM, PostgreSQL, and Tailwind CSS.

---

## Why this project exists

Independent bookstores face unique operational challenges that generic POS systems don't solve:

- **Stock arrives from multiple suppliers** — books come in bulk orders with unknown ISBNs that need to be catalogued on the fly
- **Returns to providers** — unsold books must be returned to their respective publishers, with each publisher having different distribution agreements
- **Customer returns** — buyers bring books back, requiring password-authorised refunds with full traceability
- **Stock integrity** — physical inventory counts rarely match the database; discrepancies must be reconciled reliably
- **Customer pre-orders** — when a book is out of stock, customers want to place an order and get notified when it arrives

This application is designed from the ground up to solve these real-world bookstore workflows.

---

## Skills demonstrated

### Full-stack TypeScript
| Area | Technologies |
|---|---|
| **Backend** | NestJS 11, TypeORM, PostgreSQL, class-validator, bcrypt |
| **Frontend** | React 19, TypeScript, React Router 7, Vite, Tailwind CSS 4 |
| **Language** | 100% TypeScript across both frontend and backend |

### Architecture & Design Patterns
- **Modular monolith** — NestJS modules (`BooksModule`, `SalesModule`, `BasketModule`, etc.) with clear separation of concerns
- **Transactional workflows** — critical operations (checkout, stock receipt, inventory adjustment) run inside database transactions with pessimistic locking to prevent race conditions on stock quantities
- **Service-layer orchestration** — the `BasketService` coordinates `BooksService`, `SalesService`, and `TicketService` to execute a multi-step checkout workflow
- **In-memory session auth** — password-gated access control with user/admin levels, using cryptographically strong session tokens and local session expiry
- **DTO validation** — class-validator with whitelist/transformation on all API endpoints

### Database & Concurrency
- **PostgreSQL advisory locks** — `pg_advisory_xact_lock` keyed by ISBN hash ensures serialised inventory adjustments, preventing double-counting when two employees reconcile stock simultaneously
- **Pessimistic write locking** — `setLock('pessimistic_write')` on every stock-mutating query guarantees data integrity even under concurrent sales
- **Atomic transactions** — stock receipt processing atomically creates the order record, updates book stock (or creates uncatalogued entries for unknown ISBNs), and logs stock movements in a single transaction

### Search & UX
- **Hybrid search engine** — combines exact substring matching on ISBN with fuzzy search (Fuse.js) on title, author, and genre, prioritising exact matches for fast SKU lookup
- **Debounced auto-fill** — uncatalogued items detected on stock receipt are pre-filled into the cataloguing form, reducing data entry errors
- **State-driven modals** — complex multi-step workflows (returns, stock receipt, customer orders) are managed as self-contained React modal components

### Inventory Management
- **Dual-table stock tracking** — catalogued books and uncatalogued stock exist in separate tables, with automatic migration when an uncatalogued ISBN is formally added to the catalogue
- **Full stock traceability** — every stock movement (sale, receipt, return, adjustment) is recorded with type, quantity, ISBN, and reference number, viewable in the admin panel
- **Inventory adjustment workflow** — admin can compare theoretical (database) vs. actual (physical count) stock, batch-adjust discrepancies, and automatically log the corrections

### Reporting & Analytics
- **Period-based sales reports** — filter by date range, with aggregated summaries (total units, revenue, transactions)
- **Per-article sales history** — drill into any book's complete sales record, linked to ticket numbers
- **Daily sales snapshot** — one-click view of today's performance
- **Ticket lookup** — search by ticket number, view line-item detail with returned quantities

---

## Real-world workflows

### 1. Supplier Stock Receipt
A box of books arrives from a distributor. The employee enters the order number and scans ISBNs with quantities. Books already in the catalogue have stock updated automatically; unknown ISBNs land in the "uncatalogued" table and are flagged for the manager to catalogue. This mimics how real bookstores receive mixed shipments of known and unknown titles.

### 2. Point of Sale (Checkout)
The cashier searches for books (by title, author, ISBN, or genre), adds them to a basket, and processes the sale. This creates a ticket (with a date-based sequential number), records individual sales for each line item, deducts stock, and logs stock movements — all within a single transaction.

### 3. Customer Returns
A customer brings back a book. The cashier looks up the original ticket, selects which items to return, and enters a password to authorise the refund. The system restores stock, creates negative sale entries for accounting traceability, and updates the ticket status if fully returned.

### 4. Provider Returns (Unsold Books)
Unsold books are grouped by publisher. The system detects which provider sent each book and creates separate return requests per provider. ISBNs already in an active return are blocked from duplicate processing.

### 5. Customer Pre-orders
When a book is out of stock, the staff can register customer orders. These are tracked in the management panel, linking the customer's details to the ISBN they want.

### 6. Stock Reconciliation
At inventory time, an admin loads the full inventory (catalogued + uncatalogued), physically counts shelves, enters actual stock numbers, and submits adjustments. The system uses PostgreSQL advisory locks to ensure that even if two admins reconcile simultaneously, no data is corrupted.

---

## Project structure

```
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/               # Password-based authentication (user/admin)
│   │   ├── basket/             # Shopping basket orchestration
│   │   ├── books/              # Book catalog CRUD + search
│   │   ├── customer/           # Customer management
│   │   ├── customer-order/     # Customer pre-orders
│   │   ├── inventory-adjustment/ # Stock reconciliation
│   │   ├── provider-return/   # Returns to publishers/suppliers
│   │   ├── returns/            # Customer returns (refunds)
│   │   ├── sales/              # Sales recording and queries
│   │   ├── settings/           # System settings (hashed passwords)
│   │   ├── stock-receipt/      # Supplier order receipt + stock movements
│   │   └── ticket/             # Ticket generation and lookup
│   └── scripts/
│       └── reset-db.sql        # Reset operational data (preserves books)
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route pages (Home, Gestion, Reports, Admin)
│   │   ├── services/           # API client modules
│   │   └── lib/                # Axios instance configuration
└── docker-compose.yml          # PostgreSQL 16 container
```

---

## Tech stack summary

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, React Router 7, Tailwind CSS 4, Vite 8, Axios, Lucide React |
| **Backend** | NestJS 11, TypeScript, TypeORM 0.3, class-validator |
| **Database** | PostgreSQL 16 (via Docker), with advisory locks, pessimistic locking |
| **Auth** | bcrypt-hashed passwords, Bearer token sessions |
| **Search** | Fuse.js fuzzy matching + exact substring search |

**Key packages:** `bcrypt`, `fuse.js`, `lucide-react`, `react-datepicker`, `class-transformer`, `class-validator`, `uuid`

---

## Getting started

> **Build instructions are to be decided.** This project uses standard Node.js tooling.

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL and the production stack)
- npm

### Developer quickstart (non-Docker)

1. Start PostgreSQL (local or via Docker):

```bash
# start only postgres via compose
docker compose up -d postgres
```

2. Backend (development):

```bash
cd backend
npm install
npm run start:dev
```

3. Frontend (development):

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:5173` and the API at `http://localhost:3000` (dev defaults).

### Docker Compose deployment (recommended)

The repository includes Dockerfiles for the backend and frontend and a `docker-compose.yml` that builds and runs the full stack (Postgres, backend API, and static frontend via nginx).

Bring the stack up (build images the first time):

```bash
docker compose up --build -d
```

Default published host ports (changeable via a `.env` or by editing `docker-compose.yml`):
- PostgreSQL: host `localhost:5555` -> container `5432`
- Backend API: host `http://localhost:3001` -> container `3000`
- Frontend (nginx): host `http://localhost:8080` -> container `80`

To stop and remove the containers and network:

```bash
docker compose down
```

### Environment variables

You can place a `.env` file next to `docker-compose.yml` to override Compose defaults. Important variables used by the services:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` — Postgres credentials.
- `POSTGRES_PORT` — host port mapping for postgres (default used in compose: `5555`).
- Backend runtime variables (set in compose): `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- `DB_SYNCHRONIZE` — controls TypeORM `synchronize` (defaults to `false` in compose; DO NOT enable in production).
- `CORS_ORIGIN` — comma-separated allowed origins for the backend (compose uses `http://localhost:8080` by default).
- Frontend build arg: `VITE_API_URL` — used when building the frontend image so the static site knows where to call the API.

Example `.env`:

```env
POSTGRES_USER=bookstore
POSTGRES_PASSWORD=bookstore
POSTGRES_DB=bookstore
POSTGRES_PORT=5555
```

### What changed in this repo (recent updates)

- Added `backend/Dockerfile` and `frontend/Dockerfile` and a simple `frontend/nginx.conf` to serve the production bundle.
- Expanded `docker-compose.yml` to include backend and frontend services and reasonable defaults.
- Backend configuration moved from hardcoded values to environment-driven values in `backend/src/app.module.ts` (DB connection) and `backend/src/main.ts` (CORS origins).
- `DB_SYNCHRONIZE` is disabled by default in the Compose production settings.
- Frontend relies on `VITE_API_URL` (build arg / `import.meta.env.VITE_API_URL`) for the API base URL.
- Removed an unused standalone provider-return page to keep the top-level navigation to four pages; provider returns remain accessible inside the Admin screens.


### First-run setup
- On a fresh database, the app opens a one-time setup screen that requires you to create both the admin and user passwords.
- Those passwords are stored hashed in PostgreSQL and you choose them during setup, so they are never printed to logs.
- If you reset the database, you will see the setup screen again.

---

## API overview

| Module | Endpoints | Auth |
|---|---|---|
| **Books** | `GET /books`, `GET /books/:id`, `POST /books`, `PATCH /books/:id`, `DELETE /books/:id`, `GET /books/by-title-author-tag-isbn?query=...` | Public |
| **Basket** | `GET /basket`, `POST /basket/add`, `DELETE /basket/clear`, `DELETE /basket/remove/:bookId`, `PATCH /basket/quantity`, `POST /basket/checkout` | Public |
| **Sales** | `GET /sales`, `GET /sales/today`, `GET /sales/book/:id`, `GET /sales/book/:id/sales` | Public |
| **Tickets** | `GET /tickets`, `GET /tickets/:ticketNo`, `GET /tickets/by-sale/:saleId`, `POST /tickets` | Public |
| **Stock Receipt** | `POST /stock-receipt/upload`, `GET /stock-receipt/uncatalogued`, `GET /stock-receipt/uncatalogued/:isbn`, `GET /stock-receipt/movements/:isbn` | Public |
| **Returns** | `POST /returns/return` | User/Admin |
| **Customer Orders** | `GET /customer-orders`, `GET /customer-orders/customer/:id`, `POST /customer-orders`, `DELETE /customer-orders/:id` | Public |
| **Provider Returns** | `GET /provider-return`, `GET /provider-return/active`, `GET /provider-return/finished`, `GET /provider-return/:id`, `POST /provider-return`, `PATCH /provider-return/:id`, `DELETE /provider-return/:id`, `PATCH /provider-return/:id/send` | Admin |
| **Inventory Adjustment** | `POST /inventory-adjustment/adjustStock` | Admin |
| **Auth** | `GET /auth/setup-state`, `POST /auth/setup`, `POST /auth/login`, `GET /auth/session`, `POST /auth/logout`, `POST /auth/change-password` | Mixed |
| **Settings** | `GET /settings/admin-password-setup` | Public |
