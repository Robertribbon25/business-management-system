import express from 'express';
import { db } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', protect, (req, res) => {
  try {
    const products = db.products.find();
    // Hydrate categories and suppliers
    const hydrated = products.map(prod => {
      const category = prod.categoryId ? db.categories.findById(prod.categoryId) : null;
      const supplier = prod.supplierId ? db.suppliers.findById(prod.supplierId) : null;
      return {
        ...prod,
        category,
        supplier
      };
    });
    res.json({ success: true, count: hydrated.length, data: hydrated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
});

// Get single product
router.get('/:id', protect, (req, res) => {
  try {
    const product = db.products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const category = product.categoryId ? db.categories.findById(product.categoryId) : null;
    const supplier = product.supplierId ? db.suppliers.findById(product.supplierId) : null;
    res.json({
      success: true,
      data: {
        ...product,
        category,
        supplier
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
});

// Create product
router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), (req, res) => {
  try {
    const { name, sku, categoryId, supplierId, price, cost, stock, minStockAlert, description } = req.body;

    if (!name || !sku || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide name, SKU, price, and stock' });
    }

    // Check SKU uniqueness
    const existing = db.products.findOne({ sku });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A product with this SKU already exists' });
    }

    const prod = db.products.create({
      name,
      sku,
      categoryId: categoryId || '',
      supplierId: supplierId || '',
      price: Number(price),
      cost: Number(cost || 0),
      stock: Number(stock),
      minStockAlert: Number(minStockAlert || 5),
      description: description || ''
    });

    res.status(201).json({ success: true, data: prod });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating product' });
  }
});

// Update product
router.put('/:id', protect, authorize('admin', 'manager', 'storekeeper'), (req, res) => {
  try {
    const existing = db.products.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, sku, categoryId, supplierId, price, cost, stock, minStockAlert, description } = req.body;

    // Check SKU uniqueness if changed
    if (sku && sku !== existing.sku) {
      const duplicateSku = db.products.findOne({ sku });
      if (duplicateSku) {
        return res.status(400).json({ success: false, message: 'A product with this SKU already exists' });
      }
    }

    const updated = db.products.findByIdAndUpdate(req.params.id, {
      name: name || existing.name,
      sku: sku || existing.sku,
      categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
      supplierId: supplierId !== undefined ? supplierId : existing.supplierId,
      price: price !== undefined ? Number(price) : existing.price,
      cost: cost !== undefined ? Number(cost) : existing.cost,
      stock: stock !== undefined ? Number(stock) : existing.stock,
      minStockAlert: minStockAlert !== undefined ? Number(minStockAlert) : existing.minStockAlert,
      description: description !== undefined ? description : existing.description
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
});

// Delete product
router.delete('/:id', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.products.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    db.products.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
});

export default router;
