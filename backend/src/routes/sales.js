import express from 'express';
import { db } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

let invoiceCounter = 1000;

// Get all sales
router.get('/', protect, (req, res) => {
  try {
    const sales = db.sales.find();
    // Hydrate customer context and items products names
    const hydrated = sales.map(sale => {
      const customer = sale.customerId ? db.customers.findById(sale.customerId) : null;
      const items = (sale.items || []).map(item => {
        const prod = db.products.findById(item.productId);
        return {
          ...item,
          product: prod ? { name: prod.name, sku: prod.sku } : null
        };
      });
      return {
        ...sale,
        customer,
        items
      };
    });
    res.json({ success: true, count: hydrated.length, data: hydrated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching sales records' });
  }
});

// Get single sale
router.get('/:id', protect, (req, res) => {
  try {
    const sale = db.sales.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }
    const customer = sale.customerId ? db.customers.findById(sale.customerId) : null;
    const items = (sale.items || []).map(item => {
      const prod = db.products.findById(item.productId);
      return {
        ...item,
        product: prod ? { name: prod.name, sku: prod.sku } : null
      };
    });
    res.json({
      success: true,
      data: {
        ...sale,
        customer,
        items
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching sale' });
  }
});

// Create sale (checkout)
router.post('/', protect, (req, res) => {
  try {
    const { customerId, items, paymentMethod, paymentStatus } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items in cart' });
    }

    // Validate quantities and stock
    let totalAmount = 0;
    const itemsWithPricing = [];

    for (let cartItem of items) {
      const product = db.products.findById(cartItem.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${cartItem.productId}` });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${cartItem.quantity}` 
        });
      }

      const itemCost = product.cost || 0;
      const itemPrice = product.price || 0;
      const subtotal = itemPrice * cartItem.quantity;

      totalAmount += subtotal;
      itemsWithPricing.push({
        productId: cartItem.productId,
        quantity: Number(cartItem.quantity),
        price: Number(itemPrice),
        cost: Number(itemCost),
        subtotal
      });
    }

    // Deduct stock
    for (let cartItem of itemsWithPricing) {
      const product = db.products.findById(cartItem.productId);
      db.products.findByIdAndUpdate(cartItem.productId, {
        stock: product.stock - cartItem.quantity
      });
    }

    // Generate unique Invoice Number
    const count = db.sales.find().length;
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${1001 + count}`;

    const newSale = db.sales.create({
      customerId: customerId || '',
      items: itemsWithPricing,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'paid',
      invoiceNumber,
      salesRep: req.user.name || 'External Sales'
    });

    res.status(201).json({ success: true, data: newSale });
  } catch (error) {
    console.error('Sale checkout failed:', error);
    res.status(500).json({ success: false, message: 'Server error during sales checkout' });
  }
});

// Update payment status
router.put('/:id', protect, authorize('admin', 'manager', 'sales'), (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const existing = db.sales.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    const updated = db.sales.findByIdAndUpdate(req.params.id, {
      paymentStatus: paymentStatus || existing.paymentStatus
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating sale status' });
  }
});

// Delete sale (restores stock!)
router.delete('/:id', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.sales.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    // Restore stock
    if (existing.items && existing.items.length) {
      for (let item of existing.items) {
        const product = db.products.findById(item.productId);
        if (product) {
          db.products.findByIdAndUpdate(item.productId, {
            stock: product.stock + item.quantity
          });
        }
      }
    }

    db.sales.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Sale cancelled and stock restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting sale' });
  }
});

export default router;
