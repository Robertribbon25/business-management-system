import express from 'express';
import { db } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all suppliers
router.get('/', protect, (req, res) => {
  try {
    const suppliers = db.suppliers.find();
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching suppliers' });
  }
});

// Get single supplier
router.get('/:id', protect, (req, res) => {
  try {
    const supplier = db.suppliers.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching supplier' });
  }
});

// Create supplier
router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), (req, res) => {
  try {
    const { name, contactName, email, phone, address, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const supplier = db.suppliers.create({
      name,
      contactName: contactName || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating supplier' });
  }
});

// Update supplier
router.put('/:id', protect, authorize('admin', 'manager', 'storekeeper'), (req, res) => {
  try {
    const existing = db.suppliers.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const { name, contactName, email, phone, address, notes } = req.body;

    const updated = db.suppliers.findByIdAndUpdate(req.params.id, {
      name: name || existing.name,
      contactName: contactName !== undefined ? contactName : existing.contactName,
      email: email !== undefined ? email : existing.email,
      phone: phone !== undefined ? phone : existing.phone,
      address: address !== undefined ? address : existing.address,
      notes: notes !== undefined ? notes : existing.notes
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating supplier' });
  }
});

// Delete supplier
router.delete('/:id', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.suppliers.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    db.suppliers.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting supplier' });
  }
});

export default router;
