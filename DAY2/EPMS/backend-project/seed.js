/**
 * Seed script: creates default admin user and department data
 * Run once: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');

const departments = [
  { departmentCode: 'CW',   departmentName: 'Carwash',            grossSalary: 300000, totalDeduction: 20000 },
  { departmentCode: 'ST',   departmentName: 'Stock',              grossSalary: 200000, totalDeduction: 5000  },
  { departmentCode: 'MC',   departmentName: 'Mechanic',           grossSalary: 450000, totalDeduction: 40000 },
  { departmentCode: 'ADMS', departmentName: 'Administration Staff', grossSalary: 600000, totalDeduction: 70000 }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Seed departments
  for (const dept of departments) {
    const exists = await Department.findOne({ departmentCode: dept.departmentCode });
    if (!exists) {
      await Department.create(dept);
      console.log(`Created department: ${dept.departmentName}`);
    } else {
      console.log(`Department already exists: ${dept.departmentName}`);
    }
  }

  // Seed admin user
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    await User.create({ username: 'admin', password: 'admin123' });
    console.log('Created admin user (username: admin, password: admin123)');
  } else {
    console.log('Admin user already exists');
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
