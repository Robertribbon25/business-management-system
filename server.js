import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();


const app = express();
const PORT = 3000; 

// Middlewares
app.use(cors());
app.use(express.json());

// Import all API routes
import authRoutes from './backend/src/routes/auth.js';
import categoryRoutes from './backend/src/routes/categories.js';
import productRoutes from './backend/src/routes/products.js';
import customerRoutes from './backend/src/routes/customers.js';
import supplierRoutes from './backend/src/routes/suppliers.js';
import salesRoutes from './backend/src/routes/sales.js';
import employeeRoutes from './backend/src/routes/employees.js';
import dashboardRoutes from './backend/src/routes/dashboard.js';

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DAB Enterprise API is live and healthy' });
});

// Configure Vite integration or Static delivery
if (process.env.NODE_ENV !== 'production') {
  console.log('Starting full-stack application in DEVELOPMENT mode...');
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount Vite dev middlewares
    app.use(vite.middlewares);
  } catch (err) {
    console.error('Failed to initialize Vite development middleware:', err);
  }
} else {
  console.log('Starting full-stack application in PRODUCTION mode...');
  const distPath = path.resolve(process.cwd(), 'frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Self-seed database if empty on startup
import { db } from './backend/src/config/db.js';
const users = db.users.find();
if (users.length === 0) {
  console.log('Database is empty! Triggering automated self-seeding...');
  try {
    await import('./backend/src/seed/seed.js');
    console.log('✓ Dynamic corporate self-seeding complete.');
  } catch (err) {
    console.error('Failed dynamic corporate self-seeding:', err);
  }
}

// Start Server on host 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(` DAB Enterprise Ltd System Running Flawlessly!`);
  console.log(` URL: http://0.0.0.0:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================================`);
});
