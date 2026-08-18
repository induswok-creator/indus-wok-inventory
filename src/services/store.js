/**
 * Data layer — one interface, two backends:
 *   • Firestore  (collections: `inventory`, `inventory_transactions`)
 *   • In-memory demo store (when Firebase isn't configured)
 *
 * Firestore document shape — inventory/{id}:
 *   { name, category, unit, quantity, reorderLevel, unitCost, supplier, updatedAt }
 *
 * inventory_transactions/{id}:
 *   { itemId, itemName, delta, note, quantityAfter, at }
 */
const { admin, db, demoMode } = require('../config/firebase');
const sampleData = require('../config/sampleData');

// ── Demo store ───────────────────────────────────────────────────────────────
const demo = {
  items: new Map(),
  transactions: [],
  nextId: 1,
};
if (demoMode) {
  for (const item of sampleData) {
    const id = String(demo.nextId++);
    demo.items.set(id, { id, ...item, updatedAt: new Date().toISOString() });
  }
}

const now = () => new Date().toISOString();

// ── Items ────────────────────────────────────────────────────────────────────
async function listItems() {
  if (demoMode) return [...demo.items.values()];
  const snap = await db.collection('inventory').orderBy('name').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function createItem(data) {
  const item = sanitize(data);
  item.updatedAt = demoMode ? now() : admin.firestore.FieldValue.serverTimestamp();
  if (demoMode) {
    const id = String(demo.nextId++);
    demo.items.set(id, { id, ...item });
    return { id, ...item };
  }
  const ref = await db.collection('inventory').add(item);
  return { id: ref.id, ...item };
}

async function updateItem(id, data) {
  const patch = sanitize(data);
  patch.updatedAt = demoMode ? now() : admin.firestore.FieldValue.serverTimestamp();
  if (demoMode) {
    const existing = demo.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    demo.items.set(id, updated);
    return updated;
  }
  const ref = db.collection('inventory').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.update(patch);
  return { id, ...snap.data(), ...patch };
}

async function deleteItem(id) {
  if (demoMode) return demo.items.delete(id);
  await db.collection('inventory').doc(id).delete();
  return true;
}

/** Adjust stock by delta (+ stock in, − stock out) and log a transaction. */
async function adjustStock(id, delta, note = '') {
  delta = Number(delta);
  if (!Number.isFinite(delta) || delta === 0) throw new Error('delta must be a non-zero number');

  if (demoMode) {
    const item = demo.items.get(id);
    if (!item) return null;
    item.quantity = Math.max(0, round3(item.quantity + delta));
    item.updatedAt = now();
    const tx = {
      id: String(demo.nextId++),
      itemId: id, itemName: item.name, delta, note,
      quantityAfter: item.quantity, at: now(),
    };
    demo.transactions.unshift(tx);
    return { item, tx };
  }

  // Atomic in Firestore — safe even with multiple staff updating at once
  const itemRef = db.collection('inventory').doc(id);
  const txRef = db.collection('inventory_transactions').doc();
  const result = await db.runTransaction(async (t) => {
    const snap = await t.get(itemRef);
    if (!snap.exists) return null;
    const item = snap.data();
    const quantityAfter = Math.max(0, round3(Number(item.quantity) + delta));
    t.update(itemRef, {
      quantity: quantityAfter,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    t.set(txRef, {
      itemId: id, itemName: item.name, delta, note,
      quantityAfter, at: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { item: { id, ...item, quantity: quantityAfter }, tx: { id: txRef.id } };
  });
  return result;
}

// ── Transactions ─────────────────────────────────────────────────────────────
async function listTransactions(limit = 30) {
  if (demoMode) return demo.transactions.slice(0, limit);
  const snap = await db
    .collection('inventory_transactions')
    .orderBy('at', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, at: data.at?.toDate?.()?.toISOString() || data.at };
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function sanitize(data) {
  const out = {};
  if (data.name !== undefined) out.name = String(data.name).trim();
  if (data.category !== undefined) out.category = String(data.category).trim();
  if (data.unit !== undefined) out.unit = String(data.unit).trim();
  if (data.supplier !== undefined) out.supplier = String(data.supplier).trim();
  for (const k of ['quantity', 'reorderLevel', 'unitCost']) {
    if (data[k] !== undefined) {
      const n = Number(data[k]);
      out[k] = Number.isFinite(n) && n >= 0 ? round3(n) : 0;
    }
  }
  return out;
}
const round3 = (n) => Math.round(n * 1000) / 1000;

module.exports = { listItems, createItem, updateItem, deleteItem, adjustStock, listTransactions };
