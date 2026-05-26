const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { requireAuth } = require('../middleware/auth');

// GET all departments
router.get('/', requireAuth, async (req, res) => {
  try {
    const departments = await Department.find().sort({ departmentCode: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single department
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create department
router.post('/', requireAuth, async (req, res) => {
  try {
    const { departmentCode, departmentName, grossSalary, totalDeduction } = req.body;
    const existing = await Department.findOne({ departmentCode: departmentCode.toUpperCase() });
    if (existing)
      return res.status(400).json({ message: 'Department code already exists' });

    const dept = new Department({ departmentCode, departmentName, grossSalary, totalDeduction });
    await dept.save();
    res.status(201).json({ message: 'Department created', department: dept });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
