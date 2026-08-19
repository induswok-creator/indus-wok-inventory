# 🍜 Indus Wok — Inventory Management System

Kitchen inventory management for the **Indus Wok** restaurant. Two ways to run it:

1. **🌐 Static web app (GitHub Pages)** — `index.html` at the repo root. Runs entirely in
   the browser and talks to **Firebase Firestore** directly via the Firebase Web SDK.
   Live at: **https://induswok-creator.github.io/indus-wok-inventory/**
2. **🖥 Node.js server** — `src/` + `public/`. Express REST API + Firebase Admin SDK,
   for when you want a backend (POS integrations, private deployments).

Both share the same Firestore collections, so you can use them together.

## 🌐 GitHub Pages version — setup

The page works immediately in **demo mode** (data stored on your device). To connect
your real Firebase project:

1. **Create a web app config** — Firebase Console → Project settings → General →
   Your apps → **Add app → Web** → copy the `firebaseConfig` object.
2. **Enable Authentication** — Firebase Console → Authentication → Sign-in method →
   enable **Email/Password**, then **Users → Add user** for each staff member.
3. **Secure Firestore** — Firestore → Rules → paste the contents of
   [`firestore.rules`](./firestore.rules) → Publish. (Only signed-in staff can read/write;
   the transaction log is append-only.)
4. **Connect** — open the live page and paste the config into the setup screen
   (remembered per device), or hard-wire it for everyone by editing
   [`firebase-config.js`](./firebase-config.js) and pushing.

> The Firebase web config (apiKey etc.) is **not a secret** — it's an identifier, safe in
> a public repo. Your data is protected by the Firestore rules + Auth, not by hiding the
> config.

## Features

- 📦 **Item tracking** — name, category, quantity, unit, unit cost, supplier
- 🔻 **Low-stock alerts** — set a reorder level per item; low items are flagged and sorted to the top
- ➕➖ **Stock in / stock out** — one-tap adjustments with notes (e.g. "weekly delivery", "kitchen use")
- 🧾 **Activity log** — every stock movement is recorded in Firestore with a timestamp
- 💰 **Stock value** — live total inventory value in ₹
- 🔍 Search, category filter, low-stock-only filter
- 🔐 **Staff login** (Pages version) via Firebase Auth; **live sync** across devices via Firestore snapshots
- 🔥 **Firestore-backed** with atomic stock updates (safe for multiple staff at once)

## 🖥 Node.js server version — quick start

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
