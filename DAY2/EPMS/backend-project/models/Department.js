const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  departmentName: {
    type: String,
    required: true,
    trim: true
  },
  grossSalary: {
    type: Number,
    required: true
  },
  totalDeduction: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
