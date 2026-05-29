const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper: calculate duration in hours
function calculateDuration(entryTime, exitTime) {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const diffMs = exit - entry;
  const diffHours = diffMs / (1000 * 60 * 60);
  return parseFloat(diffHours.toFixed(2));
}

// Helper: calculate parking fee (500 Rwf per hour, minimum 1 hour)
function calculateFee(duration) {
  const hours = duration < 1 ? 1 : Math.ceil(duration);
  return hours * 500;
}

// GET all parking records with car and slot info
router.get('/', (req, res) => {
  const sql = `
    SELECT pr.RecordID, pr.EntryTime, pr.ExitTime, pr.Duration,
           pr.PlateNumber, pr.SlotNumber,
           c.DriverName, c.PhoneNumber
    FROM ParkingRecord pr
    JOIN Car c ON pr.PlateNumber = c.PlateNumber
    ORDER BY pr.EntryTime DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching records', error: err.message });
    res.json(results);
  });
});

// GET single parking record
router.get('/:id', (req, res) => {
  const sql = `
    SELECT pr.*, c.DriverName, c.PhoneNumber
    FROM ParkingRecord pr
    JOIN Car c ON pr.PlateNumber = c.PlateNumber
    WHERE pr.RecordID = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching record', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Record not found.' });
    res.json(results[0]);
  });
});

// POST - Create a new parking record (car entry)
router.post('/', (req, res) => {
  const { entryTime, plateNumber, slotNumber } = req.body;
  if (!entryTime || !plateNumber || !slotNumber) {
    return res.status(400).json({ message: 'Entry time, plate number, and slot number are required.' });
  }

  // Check slot is available
  db.query("SELECT * FROM ParkingSlot WHERE SlotNumber = ? AND SlotStatus = 'Available'", [slotNumber], (err, slots) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (slots.length === 0) {
      return res.status(400).json({ message: 'Slot is not available.' });
    }

    db.query(
      'INSERT INTO ParkingRecord (EntryTime, PlateNumber, SlotNumber) VALUES (?, ?, ?)',
      [entryTime, plateNumber, slotNumber],
      (err2, result) => {
        if (err2) return res.status(500).json({ message: 'Error creating record', error: err2.message });

        // Mark slot as occupied
        db.query("UPDATE ParkingSlot SET SlotStatus = 'Occupied' WHERE SlotNumber = ?", [slotNumber], (err3) => {
          if (err3) console.error('Error updating slot status:', err3.message);
        });

        res.status(201).json({ message: 'Parking record created successfully.', recordId: result.insertId });
      }
    );
  });
});

// PUT - Update parking record (car exit OR edit entry details)
router.put('/:id', (req, res) => {
  const { exitTime, entryTime, slotNumber } = req.body;
  const recordId = req.params.id;

  // ── EDIT mode: update entry time / slot (before exit) ──
  if (!exitTime && (entryTime || slotNumber)) {
    db.query('SELECT * FROM ParkingRecord WHERE RecordID = ?', [recordId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      if (results.length === 0) return res.status(404).json({ message: 'Record not found.' });

      const record = results[0];
      const newEntry = entryTime || record.EntryTime;
      const newSlot  = slotNumber || record.SlotNumber;

      db.query(
        'UPDATE ParkingRecord SET EntryTime = ?, SlotNumber = ? WHERE RecordID = ?',
        [newEntry, newSlot, recordId],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Error updating record', error: err2.message });
          res.json({ message: 'Record updated successfully.' });
        }
      );
    });
    return;
  }

  // ── EXIT mode: record exit time, calculate duration & fee ──
  if (!exitTime) {
    return res.status(400).json({ message: 'Exit time is required.' });
  }

  // Get the entry time first
  db.query('SELECT * FROM ParkingRecord WHERE RecordID = ?', [recordId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Record not found.' });

    const record = results[0];
    const duration = calculateDuration(record.EntryTime, exitTime);
    const fee = calculateFee(duration);

    db.query(
      'UPDATE ParkingRecord SET ExitTime = ?, Duration = ? WHERE RecordID = ?',
      [exitTime, duration, recordId],
      (err2) => {
        if (err2) return res.status(500).json({ message: 'Error updating record', error: err2.message });

        // Free up the slot
        db.query("UPDATE ParkingSlot SET SlotStatus = 'Available' WHERE SlotNumber = ?", [record.SlotNumber], (err3) => {
          if (err3) console.error('Error freeing slot:', err3.message);
        });

        res.json({
          message: 'Parking record updated successfully.',
          duration,
          fee,
          recordId: parseInt(recordId)
        });
      }
    );
  });
});

// DELETE - Remove parking record
router.delete('/:id', (req, res) => {
  // Get slot number before deleting to free it
  db.query('SELECT SlotNumber FROM ParkingRecord WHERE RecordID = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Record not found.' });

    const slotNumber = results[0].SlotNumber;

    db.query('DELETE FROM ParkingRecord WHERE RecordID = ?', [req.params.id], (err2, result) => {
      if (err2) return res.status(500).json({ message: 'Error deleting record', error: err2.message });

      // Free the slot
      db.query("UPDATE ParkingSlot SET SlotStatus = 'Available' WHERE SlotNumber = ?", [slotNumber], () => {});

      res.json({ message: 'Parking record deleted successfully.' });
    });
  });
});

module.exports = router;
