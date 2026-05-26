require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await Department.deleteMany({});
  console.log('Deleted all departments:', result.deletedCount);
  await mongoose.disconnect();
  console.log('Done.');
});
