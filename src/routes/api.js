/** REST API for the inventory dashboard. */
const express = require('express');
const store = require('../services/store');

const router = express.Router();
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal error' });
  });

// GET /api/items — all items, with lowStock flag
router.get('/items', wrap(async (req, res) => {
  const items = await store.listItems();
  res.json(
    items.map((i) => ({ ...i, lowStock: Number(i.quantity) <= Number(i.reorderLevel) }))
  );
}));

// POST /api/items — create
router.post('/items', wrap(async (req, res) => {
  const { name, category, unit } = req.body || {};
  if (!name || !category || !unit)
    return res.status(400).json({ error: 'name, category and unit are required' });
  const item = await store.createItem(req.body);
  res.status(201).json(item);
}));

// PUT /api/items/:id — update
router.put('/items/:id', wrap(async (req, res) => {
  const item = await store.updateItem(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
}));

// DELETE /api/items/:id
router.delete('/items/:id', wrap(async (req, res) => {
  await store.deleteItem(req.params.id);
  res.json({ ok: true });
}));

// POST /api/items/:id/adjust — { delta: +5 | -2, note: "weekly delivery" }
router.post('/items/:id/adjust', wrap(async (req, res) => {
  const { delta, note } = req.body || {};
  const result = await store.adjustStock(req.params.id, delta, note || '');
  if (!result) return res.status(404).json({ error: 'Item not found' });
  res.json(result.item);
}));

// GET /api/transactions — recent stock movements
router.get('/transactions', wrap(async (req, res) => {
  res.json(await store.listTransactions(Number(req.query.limit) || 30));
}));

module.exports = router;
