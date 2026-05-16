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
- **In-memory session auth** — password-gated access control with user/admin levels, suitable for local-first POS deployments
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
- Docker (for PostgreSQL)
- npm

### Quick start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install backend dependencies
cd backend
npm install

# 3. Start the API (development mode, watch mode)
npm run start:dev

# 4. In a new terminal, install & start the frontend
cd frontend
npm install
npm run dev
```

The API runs on `http://localhost:3000` and the frontend on `http://localhost:5173`.

### Default credentials
- **User access:** password `user`
- **Admin access:** password `admin`

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
| **Inventory Adjustment** | `POST /inventory-adjustment/adjustStock` | Admin |
| **Auth** | `POST /auth/login`, `GET /auth/session`, `POST /auth/logout`, `POST /auth/change-password` | Mixed |
| **Settings** | `GET /settings/admin-password-setup` | Public |
