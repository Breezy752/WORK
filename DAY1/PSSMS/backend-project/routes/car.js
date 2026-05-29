const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all cars
router.get('/', (req, res) => {
  db.query('SELECT * FROM Car', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching cars', error: err.message });
    res.json(results);
  });
});

// GET single car by plate number
router.get('/:plateNumber', (req, res) => {
  db.query('SELECT * FROM Car WHERE PlateNumber = ?', [req.params.plateNumber], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching car', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Car not found.' });
    res.json(results[0]);
  });
});

// POST - Add a new car
router.post('/', (req, res) => {
  const { plateNumber, driverName, phoneNumber } = req.body;
  if (!plateNumber || !driverName || !phoneNumber) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check for duplicate plate number
  db.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length > 0) {
      return res.status(409).json({ message: 'Car with this plate number already exists.' });
    }

    db.query(
      'INSERT INTO Car (PlateNumber, DriverName, PhoneNumber) VALUES (?, ?, ?)',
      [plateNumber, driverName, phoneNumber],
      (err2) => {
        if (err2) return res.status(500).json({ message: 'Error adding car', error: err2.message });
        res.status(201).json({ message: 'Car added successfully.' });
      }
    );
  });
});

// PUT - Update car
router.put('/:plateNumber', (req, res) => {
  const { driverName, phoneNumber } = req.body;
  db.query(
    'UPDATE Car SET DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?',
    [driverName, phoneNumber, req.params.plateNumber],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error updating car', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Car not found.' });
      res.json({ message: 'Car updated successfully.' });
    }
  );
});

// DELETE - Remove car
router.delete('/:plateNumber', (req, res) => {
  db.query('DELETE FROM Car WHERE PlateNumber = ?', [req.params.plateNumber], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting car', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Car not found.' });
    res.json({ message: 'Car deleted successfully.' });
  });
});

module.exports = router;
