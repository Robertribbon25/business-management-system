import express from 'express';
import { db } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all employees
router.get('/', protect, (req, res) => {
  try {
    const employees = db.employees.find();
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching employees' });
  }
});

// Get single employee
router.get('/:id', protect, (req, res) => {
  try {
    const emp = db.employees.findById(req.params.id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: emp });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching employee' });
  }
});

// Create employee
router.post('/', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const { name, email, phone, role, department, salary, status, hireDate } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and role' });
    }

    const emp = db.employees.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      role,
      department: department || 'General Operations',
      salary: Number(salary || 0),
      status: status || 'active',
      hireDate: hireDate || new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ success: true, data: emp });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating employee' });
  }
});

// Update employee
router.put('/:id', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.employees.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { name, email, phone, role, department, salary, status, hireDate } = req.body;

    const updated = db.employees.findByIdAndUpdate(req.params.id, {
      name: name || existing.name,
      email: email ? email.toLowerCase() : existing.email,
      phone: phone !== undefined ? phone : existing.phone,
      role: role || existing.role,
      department: department !== undefined ? department : existing.department,
      salary: salary !== undefined ? Number(salary) : existing.salary,
      status: status || existing.status,
      hireDate: hireDate || existing.hireDate
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating employee' });
  }
});

// Delete employee
router.delete('/:id', protect, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.employees.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    db.employees.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting employee' });
  }
});

export default router;
