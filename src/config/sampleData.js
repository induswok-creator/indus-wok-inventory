/** Sample kitchen stock for Indus Wok — used to seed demo mode and Firestore. */
module.exports = [
  { name: 'Basmati Rice',        category: 'Grains & Noodles', unit: 'kg',  quantity: 25,  reorderLevel: 10, unitCost: 90,  supplier: 'Sharma Traders' },
  { name: 'Hakka Noodles',       category: 'Grains & Noodles', unit: 'kg',  quantity: 12,  reorderLevel: 6,  unitCost: 80,  supplier: 'Sharma Traders' },
  { name: 'Paneer',              category: 'Dairy',            unit: 'kg',  quantity: 6,   reorderLevel: 4,  unitCost: 320, supplier: 'Amul Distributor' },
  { name: 'Butter',              category: 'Dairy',            unit: 'kg',  quantity: 3,   reorderLevel: 2,  unitCost: 480, supplier: 'Amul Distributor' },
  { name: 'Chicken (boneless)',  category: 'Meat & Poultry',   unit: 'kg',  quantity: 8,   reorderLevel: 5,  unitCost: 240, supplier: 'Fresh Farms Andheri' },
  { name: 'Soy Sauce',           category: 'Sauces & Condiments', unit: 'L', quantity: 4,  reorderLevel: 3,  unitCost: 150, supplier: 'Wok Mart' },
  { name: 'Schezwan Sauce',      category: 'Sauces & Condiments', unit: 'kg', quantity: 2, reorderLevel: 2,  unitCost: 180, supplier: 'Wok Mart' },
  { name: 'Tomato Ketchup',      category: 'Sauces & Condiments', unit: 'kg', quantity: 5, reorderLevel: 3,  unitCost: 110, supplier: 'Wok Mart' },
  { name: 'Refined Oil',         category: 'Oils',             unit: 'L',   quantity: 18,  reorderLevel: 10, unitCost: 130, supplier: 'Sharma Traders' },
  { name: 'Garlic',              category: 'Vegetables',       unit: 'kg',  quantity: 5,   reorderLevel: 2,  unitCost: 160, supplier: 'APMC Vashi' },
  { name: 'Ginger',              category: 'Vegetables',       unit: 'kg',  quantity: 3,   reorderLevel: 2,  unitCost: 140, supplier: 'APMC Vashi' },
  { name: 'Spring Onion',        category: 'Vegetables',       unit: 'kg',  quantity: 2,   reorderLevel: 3,  unitCost: 60,  supplier: 'APMC Vashi' },
  { name: 'Capsicum',            category: 'Vegetables',       unit: 'kg',  quantity: 4,   reorderLevel: 3,  unitCost: 80,  supplier: 'APMC Vashi' },
  { name: 'Cornflour',           category: 'Grains & Noodles', unit: 'kg',  quantity: 7,   reorderLevel: 3,  unitCost: 70,  supplier: 'Sharma Traders' },
  { name: 'Delivery Boxes',      category: 'Packaging',        unit: 'pcs', quantity: 140, reorderLevel: 100, unitCost: 12, supplier: 'PackWell Mumbai' },
];
