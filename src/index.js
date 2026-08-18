require('dotenv').config();
const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');
const { demoMode } = require('./config/firebase');

const app = express();
app.use(express.json());

app.get('/health', (req, res) =>
  res.json({ ok: true, firebase: demoMode ? 'demo-mode' : 'connected' })
);

app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍜 Indus Wok Inventory running on port ${PORT}`);
  console.log(`   Dashboard: GET /    API: /api/items`);
});
