const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { requireAuth } = require('../middleware/auth');

// GET all employees
router.get('/', requireAuth, async (req, res) => {
  try {
    const employees = await Employee.find().populate('department').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single employee
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).populate('department');
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create employee
router.post('/', requireAuth, async (req, res) => {
  try {
    const { employeeNumber, firstName, lastName, position, address, telephone, gender, hiredDate, department } = req.body;

    const existing = await Employee.findOne({ employeeNumber });
    if (existing)
      return res.status(400).json({ message: 'Employee number already exists' });

    const emp = new Employee({ employeeNumber, firstName, lastName, position, address, telephone, gender, hiredDate, department });
    await emp.save();
    const populated = await emp.populate('department');
    res.status(201).json({ message: 'Employee created', employee: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
