# Shiv Furniture Works — Mini ERP

A hackathon Mini ERP system for Shiv Furniture Works covering sales, purchase, manufacturing, inventory, and procurement automation.

## Project Structure

```
mini-erp/
├── backend/     # Node.js + Express + Prisma API (implemented)
├── frontend/    # React frontend (placeholder structure)
└── docs/        # API documentation
```

## Quick Start

### Backend

```bash
cd mini-erp/backend
npm install
cp .env.example .env
# Configure DATABASE_URL in .env
npm run migrate
npm run seed
npm run dev
```

API: `http://localhost:5000`  
Health check: `GET /health`

### Frontend

Coming soon — folder structure is in place under `frontend/`.

## Features

- **Products & Inventory** — raw materials and finished goods with stock tracking
- **Sales Orders** — create, confirm (with auto-reservation), deliver
- **Purchase Orders** — create, confirm, receive goods
- **Manufacturing** — BoM-driven production with work orders
- **Procurement Automation** — auto-generates POs or MOs on stock shortage
- **Audit Logs** — tracks all key entity changes (Admin only)
- **Dashboard** — summary counts for orders and operations

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express, Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | Zod |

## Documentation

See [docs/api-documentation.md](docs/api-documentation.md) for the full REST API reference.
