import express from 'express';
import { db } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all customers
router.get('/', protect, (req, res) => {
  try {
    const customers = db.customers.find();
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching customers' });
  }
});

// Get single customer
router.get('/:id', protect, (req, res) => {
  try {
    const customer = db.customers.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching customer' });
  }
});

// Create customer
router.post('/', protect, (req, res) => {
  try {
    const { name, email, phone, address, company, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    const customer = db.customers.create({
      name,
      email: email || '',
      phone: phone || '',
      address: address || '',
      company: company || '',
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating customer' });
  }
});

// Update customer
router.put('/:id', protect, (req, res) => {
  try {
    const existing = db.customers.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { name, email, phone, address, company, notes } = req.body;

    const updated = db.customers.findByIdAndUpdate(req.params.id, {
      name: name || existing.name,
      email: email !== undefined ? email : existing.email,
      phone: phone !== undefined ? phone : existing.phone,
      address: address !== undefined ? address : existing.address,
      company: company !== undefined ? company : existing.company,
      notes: notes !== undefined ? notes : existing.notes
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating customer' });
  }
});

// Delete customer
router.delete('/:id', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.customers.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    db.customers.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting customer' });
  }
});

export default router;
