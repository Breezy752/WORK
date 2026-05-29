const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all parking slots
router.get('/', (req, res) => {
  db.query('SELECT * FROM ParkingSlot', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching slots', error: err.message });
    res.json(results);
  });
});

// GET available slots only
router.get('/available', (req, res) => {
  db.query("SELECT * FROM ParkingSlot WHERE SlotStatus = 'Available'", (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching available slots', error: err.message });
    res.json(results);
  });
});

// GET single slot
router.get('/:slotNumber', (req, res) => {
  db.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [req.params.slotNumber], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching slot', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Slot not found.' });
    res.json(results[0]);
  });
});

// POST - Add a new parking slot
router.post('/', (req, res) => {
  const { slotNumber, slotStatus } = req.body;
  if (!slotNumber) {
    return res.status(400).json({ message: 'Slot number is required.' });
  }

  const status = slotStatus || 'Available';

  // Check for duplicate
  db.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [slotNumber], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length > 0) {
      return res.status(409).json({ message: 'Parking slot already exists.' });
    }

    db.query(
      'INSERT INTO ParkingSlot (SlotNumber, SlotStatus) VALUES (?, ?)',
      [slotNumber, status],
      (err2) => {
        if (err2) return res.status(500).json({ message: 'Error adding slot', error: err2.message });
        res.status(201).json({ message: 'Parking slot added successfully.' });
      }
    );
  });
});

// PUT - Update slot status
router.put('/:slotNumber', (req, res) => {
  const { slotStatus } = req.body;
  db.query(
    'UPDATE ParkingSlot SET SlotStatus = ? WHERE SlotNumber = ?',
    [slotStatus, req.params.slotNumber],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error updating slot', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Slot not found.' });
      res.json({ message: 'Slot updated successfully.' });
    }
  );
});

// DELETE - Remove slot
router.delete('/:slotNumber', (req, res) => {
  db.query('DELETE FROM ParkingSlot WHERE SlotNumber = ?', [req.params.slotNumber], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting slot', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Slot not found.' });
    res.json({ message: 'Slot deleted successfully.' });
  });
});

module.exports = router;
