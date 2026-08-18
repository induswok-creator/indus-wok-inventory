/**
 * Seed Firestore with Indus Wok's starter inventory.
 * Usage: npm run seed   (requires Firebase credentials in .env)
 * Safe to re-run: skips items that already exist by name.
 */
require('dotenv').config();
const { db, demoMode } = require('../src/config/firebase');
const sampleData = require('../src/config/sampleData');

async function seed() {
  if (demoMode) {
    console.error('❌ Firebase is not configured. Add credentials to .env first (see README).');
    process.exit(1);
  }

  const existing = await db.collection('inventory').get();
  const existingNames = new Set(existing.docs.map((d) => d.data().name));

  let added = 0;
  const batch = db.batch();
  for (const item of sampleData) {
    if (existingNames.has(item.name)) continue;
    batch.set(db.collection('inventory').doc(), { ...item, updatedAt: new Date() });
    added++;
  }
  await batch.commit();
  console.log(`✅ Seeded ${added} items (${sampleData.length - added} already existed).`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
