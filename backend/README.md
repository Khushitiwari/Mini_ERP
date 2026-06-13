# Shiv Furniture Works — Backend API

Mini ERP backend for Shiv Furniture Works, built with Node.js, Express, PostgreSQL, and Prisma.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run migrate
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start production server |
| `npm run migrate` | Run Prisma migrations |
| `npm run seed` | Seed database with sample data |
| `npm run generate` | Generate Prisma client |

## Default Users

All users have password `password123`:

| Email | Role |
|-------|------|
| admin@shiv.com | ADMIN |
| sales@shiv.com | SALES |
| purchase@shiv.com | PURCHASE |
| manufacturing@shiv.com | MANUFACTURING |
| inventory@shiv.com | INVENTORY_MANAGER |
| owner@shiv.com | OWNER |

## Architecture

- **stockService** is the central stock module — all inventory changes go through `updateStock()`
- **procurementService** auto-triggers purchase or manufacturing orders on stock shortage
- JWT auth with role-based access control on all endpoints

See `../docs/api-documentation.md` for full API reference.
