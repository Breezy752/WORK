const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  grossSalary: {
    type: Number,
    required: true
  },
  totalDeduction: {
    type: Number,
    required: true
  },
  netSalary: {
    type: Number,
    required: true
  },
  month: {
    type: String,
    required: true // e.g. "2025-05"
  }
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);
