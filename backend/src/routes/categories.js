import express from 'express';
import { db } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/', protect, (req, res) => {
  try {
    const categories = db.categories.find();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
});

// Get single category
router.get('/:id', protect, (req, res) => {
  try {
    const category = db.categories.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching category' });
  }
});

// Create category
router.post('/', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const cat = db.categories.create({ name, description: description || '' });
    res.status(201).json({ success: true, data: cat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating category' });
  }
});

// Update category
router.put('/:id', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = db.categories.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const updated = db.categories.findByIdAndUpdate(req.params.id, {
      name: name || existing.name,
      description: description !== undefined ? description : existing.description
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating category' });
  }
});

// Delete category
router.delete('/:id', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.categories.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    db.categories.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting category' });
  }
});

export default router;
