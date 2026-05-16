# 📚 Bookstore Management System
Stack: TypeScript, React 19, NestJS, TypeORM, PostgreSQL, Tailwind CSS, Vite

A full-stack bookstore management application handling catalog management, sales processing, and inventory control.

## Key features:

 - Book catalog — Full CRUD with search combining fuzzy matching (Fuse.js) and exact substring matching across title, author, ISBN, and genre.

 - Shopping basket & sales — Basket management with checkout, plus detailed sales tracking.

 - Stock receipt management — Three-step workflow (entry → review → confirm) for supplier orders. Each order is stored with the provider's order number. Unrecognized ISBNs are automatically tracked as "uncatalogued" stock.

 - Uncatalogued workflow — Items from unknown ISBNs appear flagged in the management panel. Users can catalog them with ISBN and stock pre-filled, atomically removing them from the uncatalogued table in the same transaction.

 - Sales reports — Three report types (period-based, daily, per-article) with date filtering.

 - Customer orders — Allows customers to place orders for out of stock books.

### Backend
NestJS modular architecture, TypeORM + PostgreSQL with pessimistic locking for stock operations, transactional workflows, class-validator DTOs.

### Frontend
React 19 + TypeScript, state-driven modals, real-time title resolution on ISBN entry, debounced uncatalogued detection with auto-fill, Tailwind CSS, Lucide icons.
