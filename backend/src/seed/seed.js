import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

function runSeed() {
  console.log('--- DAB Enterprise Ltd Database Seed Started ---');

  // 1. Reset collections
  db.users.write([]);
  db.categories.write([]);
  db.products.write([]);
  db.customers.write([]);
  db.suppliers.write([]);
  db.sales.write([]);
  db.employees.write([]);

  // 2. Add Users (Bcrypt hashed)
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('admin123', salt);
  const managerPassword = bcrypt.hashSync('manager123', salt);
  const salesPassword = bcrypt.hashSync('sales123', salt);
  const storePassword = bcrypt.hashSync('store123', salt);

  const adminUser = db.users.create({
    name: 'Robert Ndayiragije',
    email: 'admin@dab.com',
    password: adminPassword,
    role: 'admin'
  });

  const managerUser = db.users.create({
    name: 'Lucy West',
    email: 'manager@dab.com',
    password: managerPassword,
    role: 'manager'
  });

  db.users.create({
    name: 'Mark Sales',
    email: 'sales@dab.com',
    password: salesPassword,
    role: 'sales'
  });

  db.users.create({
    name: 'Bill Store',
    email: 'store@dab.com',
    password: storePassword,
    role: 'storekeeper'
  });

  console.log('✓ Users Created Successfully!');

  // 3. Categories
  const catElectronics = db.categories.create({ name: 'Industrial Electronics', description: 'Advanced power supply panels, circuit breakers, and metering kits.' });
  const catTools = db.categories.create({ name: 'Heavy Duty Tools', description: 'Professional grade power drills, saws, and pneumatic machinery.' });
  const catSafety = db.categories.create({ name: 'Personal Protective Equipment', description: 'High-visibility garments, protective spectacles, safety shoes, helmets.' });
  const catOffice = db.categories.create({ name: 'Office Furniture & Supplies', description: 'Ergonomic business layouts, storage cabinets, and stationary.' });

  console.log('✓ Categories Created Successfully!');

  // 4. Suppliers
  const supLogistics = db.suppliers.create({ name: 'Apex Logistics Ltd', contactName: 'Thomas Vance', email: 'vance@apexlogistics.com', phone: '+250781234567', address: 'Plot 42 Freezone, Kigali', notes: 'Primary distributor for heavy tools' });
  const supPower = db.suppliers.create({ name: 'Summit Power Grids', contactName: 'Angela Merkel', email: 'sales@summitpower.com', phone: '+14159828383', address: 'San Francisco, CA', notes: 'Distributor of heavy voltage electrical equipment' });
  const supSafe = db.suppliers.create({ name: 'SecureGuard Safety Ltd', contactName: 'David Kansiime', email: 'support@secureguard.co.rw', phone: '+250788889900', address: 'Town Center, Kigali', notes: 'Supplier of approved PPE equipment' });

  console.log('✓ Suppliers Created Successfully!');

  // 5. Products
  const pDrill = db.products.create({
    name: 'Industrial Rotating Core Drill',
    sku: 'DAB-TST-09',
    categoryId: catTools._id,
    supplierId: supLogistics._id,
    price: 349,
    cost: 180,
    stock: 25,
    minStockAlert: 8,
    description: 'Rotary pulse hammer drill with dual-torque core mechanism.'
  });

  const pPanel = db.products.create({
    name: 'Grid Circuit Breaker Panel (400V)',
    sku: 'DAB-ELC-101',
    categoryId: catElectronics._id,
    supplierId: supPower._id,
    price: 1250,
    cost: 750,
    stock: 5,
    minStockAlert: 6, // Low stock on startup to trigger warning alert!
    description: '400V main grid control circuit panel with short protection.'
  });

  const pHelmet = db.products.create({
    name: 'Carbon-Core Safety Helmet XL',
    sku: 'DAB-PPE-02',
    categoryId: catSafety._id,
    supplierId: supSafe._id,
    price: 45,
    cost: 20,
    stock: 120,
    minStockAlert: 15,
    description: 'Impact absorption industrial helmet with high rating index.'
  });

  const pCabinet = db.products.create({
    name: 'Biometric Security Cabinet',
    sku: 'DAB-FUR-50',
    categoryId: catOffice._id,
    supplierId: supLogistics._id,
    price: 599,
    cost: 320,
    stock: 3,
    minStockAlert: 4, // Low stock warning trigger!
    description: 'Heavy gauge steel security office archive cabinet with fingerprint access.'
  });

  const pGloves = db.products.create({
    name: 'Heat-Resistant Thermal Gloves (Pack of 5)',
    sku: 'DAB-PPE-88',
    categoryId: catSafety._id,
    supplierId: supSafe._id,
    price: 18,
    cost: 8,
    stock: 150,
    minStockAlert: 20,
    description: 'Industrial thermal welding high temperature gloves.'
  });

  console.log('✓ Products Created Successfully!');

  // 6. Customers
  const custZenith = db.customers.create({ name: 'Zenith Construction Group', email: 'procurement@zenithconst.com', phone: '+250785551122', address: 'Avenue du Commerce, Kigali', company: 'Zenith Construction Ltd', notes: 'VIP Customer with net-30 terms' });
  const custApex = db.customers.create({ name: 'Apex Metalworks Co', email: 'joshua@apexmetal.com', phone: '+250789001122', address: 'Gikondo Industrial Area, Kigali', company: 'Apex Metalworks Ltd', notes: 'Purchases drill bits and tools monthly' });
  const custWalkin = db.customers.create({ name: 'Walk-In Customer / General Retail', email: 'retail@dab.com', phone: '', address: 'Counter Checkout', company: 'Individual Retail', notes: 'Standard instant counter cashier transactions' });

  console.log('✓ Customers Created Successfully!');

  // 7. Employees
  db.employees.create({ name: 'Robert Ndayiragije', email: 'admin@dab.com', phone: '+250788100100', role: 'admin', department: 'Executive Management', salary: 5000, status: 'active', hireDate: '2023-01-15' });
  db.employees.create({ name: 'Lucy West', email: 'manager@dab.com', phone: '+250788200200', role: 'manager', department: 'Branch Operations', salary: 3500, status: 'active', hireDate: '2023-06-01' });
  db.employees.create({ name: 'Mark Sales', email: 'sales@dab.com', phone: '+250788300300', role: 'sales', department: 'Direct Sales Department', salary: 1800, status: 'active', hireDate: '2024-02-10' });
  db.employees.create({ name: 'Bill Store', email: 'store@dab.com', phone: '+250788400400', role: 'storekeeper', department: 'Logistics and Warehouse', salary: 1500, status: 'active', hireDate: '2024-03-01' });

  console.log('✓ Employees Created Successfully!');

  // 8. Sales Transactions (Aggregated across the last week to make a beautiful Recharts graph)
  const today = new Date();
  
  const createPastDateStr = (daysAgo) => {
    const d = new Date();
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString();
  };

  // Sale 1: 5 days ago (Circuit panel, Drill)
  db.sales.create({
    customerId: custZenith._id,
    items: [
      { productId: pPanel._id, quantity: 1, price: 1250, cost: 750, subtotal: 1250 },
      { productId: pDrill._id, quantity: 2, price: 349, cost: 180, subtotal: 698 }
    ],
    totalAmount: 1948,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    invoiceNumber: 'INV-2026-1001',
    salesRep: 'Lucy West',
    createdAt: createPastDateStr(5)
  });

  // Sale 2: 4 days ago (Cabinets, Gloves)
  db.sales.create({
    customerId: custApex._id,
    items: [
      { productId: pCabinet._id, quantity: 2, price: 599, cost: 320, subtotal: 1198 },
      { productId: pGloves._id, quantity: 5, price: 18, cost: 8, subtotal: 90 }
    ],
    totalAmount: 1288,
    paymentMethod: 'mobile_money',
    paymentStatus: 'paid',
    invoiceNumber: 'INV-2026-1002',
    salesRep: 'Mark Sales',
    createdAt: createPastDateStr(4)
  });

  // Sale 3: 3 days ago (Helmets, Gloves)
  db.sales.create({
    customerId: custZenith._id,
    items: [
      { productId: pHelmet._id, quantity: 15, price: 45, cost: 20, subtotal: 675 },
      { productId: pGloves._id, quantity: 10, price: 18, cost: 8, subtotal: 180 }
    ],
    totalAmount: 855,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    invoiceNumber: 'INV-2026-1003',
    salesRep: 'Mark Sales',
    createdAt: createPastDateStr(3)
  });

  // Sale 4: 2 days ago (Drill)
  db.sales.create({
    customerId: custWalkin._id,
    items: [
      { productId: pDrill._id, quantity: 1, price: 349, cost: 180, subtotal: 349 }
    ],
    totalAmount: 349,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    invoiceNumber: 'INV-2026-1004',
    salesRep: 'Lucy West',
    createdAt: createPastDateStr(2)
  });

  // Sale 5: Yesterday (Circuit panel, Cabinet)
  db.sales.create({
    customerId: custZenith._id,
    items: [
      { productId: pPanel._id, quantity: 1, price: 1250, cost: 750, subtotal: 1250 },
      { productId: pCabinet._id, quantity: 1, price: 599, cost: 320, subtotal: 599 }
    ],
    totalAmount: 1849,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    invoiceNumber: 'INV-2026-1005',
    salesRep: 'Mark Sales',
    createdAt: createPastDateStr(1)
  });

  // Sale 6: Today (Helmets, Gloves, Drill)
  db.sales.create({
    customerId: custWalkin._id,
    items: [
      { productId: pHelmet._id, quantity: 4, price: 45, cost: 20, subtotal: 180 },
      { productId: pGloves._id, quantity: 2, price: 18, cost: 8, subtotal: 36 },
      { productId: pDrill._id, quantity: 1, price: 349, cost: 180, subtotal: 349 }
    ],
    totalAmount: 565,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    invoiceNumber: 'INV-2026-1006',
    salesRep: 'Robert Ndayiragije',
    createdAt: today.toISOString()
  });

  console.log('✓ Sales Records Seeded Successfully!');
  console.log('--- DAB Enterprise Ltd Database Seed Completed Successfully ---');
}

// Execute the seed function immediately
runSeed();
