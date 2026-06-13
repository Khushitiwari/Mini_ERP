# Shiv Furniture Works — API Documentation

Base URL: `http://localhost:5000/api`

All responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

## Authentication

Include JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Auth

### POST /auth/login

Login and receive a JWT token.

**Request:**
```json
{
  "email": "admin@shiv.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@shiv.com",
      "role": "ADMIN",
      "createdAt": "2026-06-13T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### POST /auth/register

Register a new user. **Admin only.**

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@shiv.com",
  "password": "password123",
  "role": "SALES"
}
```

**Roles:** `ADMIN`, `SALES`, `PURCHASE`, `MANUFACTURING`, `INVENTORY_MANAGER`, `OWNER`

### GET /auth/me

Get current authenticated user profile. Requires auth.

---

## Products

**Access:** ADMIN, OWNER — full CRUD. All other roles — read-only.

### GET /products

List all products. Optional query filters:

- `type` — `RAW_MATERIAL` | `FINISHED_GOOD`
- `procurementStrategy` — `MTS` | `MTO`

**Example:** `GET /products?type=FINISHED_GOOD`

### GET /products/:id

Get a single product by ID.

### POST /products

Create a product.

**Request:**
```json
{
  "name": "Wooden Shelf",
  "sku": "WSH-001",
  "type": "FINISHED_GOOD",
  "salesPrice": 3000,
  "costPrice": 1500,
  "procurementStrategy": "MTS",
  "procureOnDemand": false,
  "procurementType": "MANUFACTURING",
  "defaultVendorId": null
}
```

### PUT /products/:id

Update a product (partial update supported).

### DELETE /products/:id

Delete a product.

---

## Customers

### GET /customers

List all customers.

### GET /customers/:id

Get customer by ID (includes sales orders).

### POST /customers

**Request:**
```json
{
  "name": "ABC Corp",
  "email": "contact@abc.com",
  "phone": "+91-9000000000",
  "address": "123 Main St"
}
```

### PUT /customers/:id

Update customer.

### DELETE /customers/:id

Delete customer.

---

## Vendors

### GET /vendors

List all vendors.

### GET /vendors/:id

Get vendor by ID.

### POST /vendors

**Request:**
```json
{
  "name": "Wood Suppliers Ltd",
  "email": "sales@woodsuppliers.com",
  "phone": "+91-9000000001",
  "address": "Industrial Zone, Chennai"
}
```

### PUT /vendors/:id

Update vendor.

### DELETE /vendors/:id

Delete vendor.

---

## Bill of Materials (BoM)

**Access:** ADMIN, MANUFACTURING — full access. Others — read-only.

### GET /bom/:productId

Get BoM for a finished product by product ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "finishedProductId": 4,
    "components": [
      {
        "id": 1,
        "componentProductId": 1,
        "quantityRequired": 4,
        "componentProduct": { "id": 1, "name": "Wooden Leg", "sku": "WL-001" }
      }
    ],
    "operations": [
      {
        "id": 1,
        "operationName": "Assembly",
        "durationMinutes": 60,
        "workCenter": "Assembly Line"
      }
    ]
  },
  "message": "BoM retrieved"
}
```

### POST /bom

Create a BoM.

**Request:**
```json
{
  "finishedProductId": 4,
  "components": [
    { "componentProductId": 1, "quantityRequired": 4 },
    { "componentProductId": 2, "quantityRequired": 1 },
    { "componentProductId": 3, "quantityRequired": 12 }
  ],
  "operations": [
    { "operationName": "Assembly", "durationMinutes": 60, "workCenter": "Assembly Line" },
    { "operationName": "Painting", "durationMinutes": 30, "workCenter": "Paint Floor" }
  ]
}
```

### PUT /bom/:id

Update BoM components and/or operations.

**Request:**
```json
{
  "components": [
    { "componentProductId": 1, "quantityRequired": 4 }
  ],
  "operations": [
    { "operationName": "Assembly", "durationMinutes": 45, "workCenter": "Assembly Line" }
  ]
}
```

---

## Sales Orders

**Access:** ADMIN, SALES — full access. Others — read-only.

### GET /sales-orders

List sales orders. Optional filters:

- `status` — `DRAFT`, `CONFIRMED`, `PARTIALLY_DELIVERED`, `FULLY_DELIVERED`, `CANCELLED`
- `customerId` — filter by customer

### GET /sales-orders/:id

Get sales order by ID.

### POST /sales-orders

Create a draft sales order.

**Request:**
```json
{
  "customerId": 1,
  "items": [
    { "productId": 4, "quantity": 5 },
    { "productId": 5, "quantity": 10 }
  ]
}
```

### PUT /sales-orders/:id/confirm

Confirm order. Reserves available stock; triggers procurement for shortages on MTO/procure-on-demand products.

### PUT /sales-orders/:id/deliver

Record delivery of items.

**Request:**
```json
{
  "items": [
    { "itemId": 1, "quantity": 3 },
    { "itemId": 2, "quantity": 10 }
  ]
}
```

### PUT /sales-orders/:id/cancel

Cancel order and release reserved stock.

---

## Purchase Orders

**Access:** ADMIN, PURCHASE — full access. Others — read-only.

### GET /purchase-orders

List purchase orders. Optional filters:

- `status` — `DRAFT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `FULLY_RECEIVED`, `CANCELLED`
- `vendorId` — filter by vendor

### GET /purchase-orders/:id

Get purchase order by ID.

### POST /purchase-orders

Create a draft purchase order.

**Request:**
```json
{
  "vendorId": 1,
  "items": [
    { "productId": 3, "quantity": 500 }
  ]
}
```

### PUT /purchase-orders/:id/confirm

Confirm purchase order.

### PUT /purchase-orders/:id/receive

Record receipt of items (updates stock via stockService).

**Request:**
```json
{
  "items": [
    { "itemId": 1, "quantity": 500 }
  ]
}
```

### PUT /purchase-orders/:id/cancel

Cancel purchase order.

---

## Manufacturing Orders

**Access:** ADMIN, MANUFACTURING — full access. Others — read-only.

### GET /manufacturing-orders

List manufacturing orders. Optional filter:

- `status` — `DRAFT`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

### GET /manufacturing-orders/:id

Get manufacturing order with work orders and BoM details.

### POST /manufacturing-orders

Create a draft manufacturing order (reserves component stock).

**Request:**
```json
{
  "productId": 4,
  "quantity": 3,
  "assignedTo": 4
}
```

### PUT /manufacturing-orders/:id/start

Start manufacturing (status → IN_PROGRESS, first work order → IN_PROGRESS).

### PUT /manufacturing-orders/:id/work-orders/:woId/complete

Complete a work order and advance to the next one.

### PUT /manufacturing-orders/:id/complete

Complete manufacturing order — consumes components, produces finished goods.

---

## Stock

**Access:** ADMIN, INVENTORY_MANAGER — full access (including manual adjustments). Others — read-only.

### GET /stock

Get all products with stock summary.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Wooden Leg",
      "sku": "WL-001",
      "type": "RAW_MATERIAL",
      "onHandQty": 200,
      "reservedQty": 0,
      "freeToUseQty": 200
    }
  ],
  "message": "Stock summary retrieved"
}
```

### GET /stock/:productId

Get stock summary for a single product.

### GET /stock/:productId/ledger

Get stock movement history for a product.

### POST /stock/:productId/adjust

Manual stock adjustment (ADMIN, INVENTORY_MANAGER only).

**Request:**
```json
{
  "changeQty": 10,
  "reason": "MANUAL_ADJUSTMENT"
}
```

---

## Dashboard

### GET /dashboard/summary

Get dashboard summary counts.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSalesOrders": 5,
    "pendingDeliveries": 2,
    "manufacturingOrdersInProgress": 1,
    "delayedOrders": 0,
    "totalPurchaseOrders": 3,
    "partialReceipts": 1
  },
  "message": "Dashboard summary retrieved"
}
```

---

## Audit Logs

**Access:** ADMIN only.

### GET /audit-logs

List audit logs. Optional filters:

- `entityType` — e.g. `Product`, `SalesOrder`, `PurchaseOrder`
- `userId` — filter by user ID
- `startDate` — ISO date string
- `endDate` — ISO date string

**Example:** `GET /audit-logs?entityType=SalesOrder&startDate=2026-06-01`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "action": "CREATE",
      "entityType": "Product",
      "entityId": 7,
      "oldValue": null,
      "newValue": { "id": 7, "name": "Wooden Shelf" },
      "timestamp": "2026-06-13T10:00:00.000Z",
      "user": { "id": 1, "name": "Admin User", "email": "admin@shiv.com", "role": "ADMIN" }
    }
  ],
  "message": "Audit logs retrieved"
}
```

---

## Health Check

### GET /health

No authentication required.

```json
{
  "success": true,
  "data": { "status": "ok" },
  "message": "Shiv Furniture ERP API is running"
}
```

---

## Role Access Summary

| Resource | Full Access | Read-Only |
|----------|-------------|-----------|
| Products | ADMIN, OWNER | SALES, PURCHASE, MANUFACTURING, INVENTORY_MANAGER |
| Sales Orders | ADMIN, SALES | PURCHASE, MANUFACTURING, INVENTORY_MANAGER, OWNER |
| Purchase Orders | ADMIN, PURCHASE | SALES, MANUFACTURING, INVENTORY_MANAGER, OWNER |
| Manufacturing | ADMIN, MANUFACTURING | SALES, PURCHASE, INVENTORY_MANAGER, OWNER |
| BoM | ADMIN, MANUFACTURING | SALES, PURCHASE, INVENTORY_MANAGER, OWNER |
| Stock | ADMIN, INVENTORY_MANAGER, OWNER | SALES, PURCHASE, MANUFACTURING |
| Audit Logs | ADMIN | — |
| Dashboard | All authenticated users | — |
| Customers/Vendors | All authenticated users | — |
