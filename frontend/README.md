# Shiv Furniture Works — Frontend

React + Vite frontend for the Mini ERP, connected to the backend API at `http://localhost:5000/api`.

## Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

Ensure the backend is running (`cd ../backend && npm run dev`) and seeded (`npm run seed`).

## Demo Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shiv.com | password123 |
| Sales | sales@shiv.com | password123 |
| Purchase | purchase@shiv.com | password123 |
| Manufacturing | manufacturing@shiv.com | password123 |
| Inventory | inventory@shiv.com | password123 |
| Owner | owner@shiv.com | password123 |

## Architecture

- **`src/api/`** — Axios service layer with JWT interceptor and 401 redirect
- **`src/context/ERPContext.jsx`** — Shared `useERP()` hook (`data`, `updateData`, `addAuditLog`, auth)
- **`src/pages/`** — Feature pages calling API on mutations; Dashboard/Inventory/Products poll every 4s

## Role Access

| Role | Pages |
|------|-------|
| ADMIN | All |
| SALES | Dashboard, Sales |
| PURCHASE | Dashboard, Purchase |
| MANUFACTURING | Dashboard, Manufacturing, BoM |
| INVENTORY_MANAGER | Dashboard, Inventory |
| OWNER | Dashboard, Products (read-only) |
