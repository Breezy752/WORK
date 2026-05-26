const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const { requireAuth } = require('../middleware/auth');

// GET all salaries
router.get('/', requireAuth, async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate({ path: 'employee', populate: { path: 'department' } })
      .sort({ createdAt: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single salary
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate({ path: 'employee', populate: { path: 'department' } });
    if (!salary) return res.status(404).json({ message: 'Salary record not found' });
    res.json(salary);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create salary
router.post('/', requireAuth, async (req, res) => {
  try {
    const { employee, grossSalary, totalDeduction, month } = req.body;

    // Check employee exists
    const emp = await Employee.findById(employee);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    // Check duplicate salary for same employee and month
    const existing = await Salary.findOne({ employee, month });
    if (existing)
      return res.status(400).json({ message: 'Salary for this employee and month already exists' });

    const netSalary = Number(grossSalary) - Number(totalDeduction);
    const salary = new Salary({ employee, grossSalary, totalDeduction, netSalary, month });
    await salary.save();
    const populated = await salary.populate({ path: 'employee', populate: { path: 'department' } });
    res.status(201).json({ message: 'Salary created', salary: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update salary
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { employee, grossSalary, totalDeduction, month } = req.body;
    const netSalary = Number(grossSalary) - Number(totalDeduction);

    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { employee, grossSalary, totalDeduction, netSalary, month },
      { new: true, runValidators: true }
    ).populate({ path: 'employee', populate: { path: 'department' } });

    if (!salary) return res.status(404).json({ message: 'Salary record not found' });
    res.json({ message: 'Salary updated', salary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE salary
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ message: 'Salary record not found' });
    res.json({ message: 'Salary deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET monthly payroll report
router.get('/report/monthly', requireAuth, async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? { month } : {};
    const salaries = await Salary.find(filter)
      .populate({ path: 'employee', populate: { path: 'department' } })
      .sort({ month: -1 });

    const report = salaries.map(s => ({
      _id: s._id,
      month: s.month,
      firstName: s.employee?.firstName,
      lastName: s.employee?.lastName,
      position: s.employee?.position,
      department: s.employee?.department?.departmentName,
      grossSalary: s.grossSalary,
      totalDeduction: s.totalDeduction,
      netSalary: s.netSalary
    }));

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
