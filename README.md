# 🍜 Indus Wok — Inventory Management System

Kitchen inventory management for the **Indus Wok** restaurant, built with
**Node.js + Express** and **Firebase Firestore**.

## Features

- 📦 **Item tracking** — name, category, quantity, unit, unit cost, supplier
- 🔻 **Low-stock alerts** — set a reorder level per item; low items are flagged and sorted to the top
- ➕➖ **Stock in / stock out** — one-tap adjustments with notes (e.g. "weekly delivery", "kitchen use")
- 🧾 **Activity log** — every stock movement is recorded in Firestore with a timestamp
- 💰 **Stock value** — live total inventory value in ₹
- 🔍 Search, category filter, low-stock-only filter
- 🔥 **Firestore-backed** with atomic stock updates (safe for multiple staff at once)

If Firebase isn't configured yet, the app runs in **demo mode** with in-memory sample
kitchen stock so you can use the dashboard immediately.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000` — the dashboard loads with sample Indus Wok stock.

## Connect Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → create/open your project.
2. Enable **Cloud Firestore**.
3. **Project settings → Service accounts → Generate new private key** — save the JSON as
   `serviceAccountKey.json` in the repo root (it's git-ignored, never commit it).
4. `.env` already points at it:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   ```
5. Seed starter stock and restart:
   ```bash
   npm run seed
   npm run dev
   ```
   The header badge switches to **🔥 Firebase connected**.

### Firestore data model

```
inventory/{autoId}
  name: "Basmati Rice"
  category: "Grains & Noodles"
  unit: "kg"
  quantity: 25
  reorderLevel: 10        # low-stock alert threshold
  unitCost: 90            # ₹ per unit
  supplier: "Sharma Traders"
  updatedAt: <timestamp>

inventory_transactions/{autoId}
  itemId, itemName
  delta: +10 | -2.5       # positive = stock in, negative = stock out
  note: "weekly delivery"
  quantityAfter: 35
  at: <timestamp>
```

Stock adjustments run inside a **Firestore transaction**, so simultaneous updates from
multiple devices never lose counts.

## REST API

| Method | Route | Purpose |
|--------|-------|---------|
| GET    | `/api/items` | List items (+ `lowStock` flag) |
| POST   | `/api/items` | Create item |
| PUT    | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |
| POST   | `/api/items/:id/adjust` | `{ delta, note }` — stock in/out |
| GET    | `/api/transactions` | Recent stock movements |

Use these to integrate with a POS or ordering system later.

## Project structure

```
src/
  index.js              # Express server
  routes/api.js         # REST API
  services/store.js     # Data layer (Firestore + demo-mode fallback)
  config/firebase.js    # Firebase Admin init
  config/sampleData.js  # Starter stock list — edit freely
public/index.html       # Dashboard UI
scripts/seed.js         # Seed starter stock into Firestore
```

## Deploying

Any Node host works — Cloud Run, Render, Railway, a VPS. On Google Cloud, application
default credentials are picked up automatically (no key file needed). On other hosts, set
the `FIREBASE_SERVICE_ACCOUNT_JSON` env var to the key file's JSON contents.
