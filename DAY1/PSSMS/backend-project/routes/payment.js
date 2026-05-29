const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all payments with full details
router.get('/', (req, res) => {
  const sql = `
    SELECT p.PaymentID, p.AmountPaid, p.PaymentDate,
           pr.RecordID, pr.EntryTime, pr.ExitTime, pr.Duration,
           pr.PlateNumber, pr.SlotNumber,
           c.DriverName, c.PhoneNumber
    FROM Payment p
    JOIN ParkingRecord pr ON p.RecordID = pr.RecordID
    JOIN Car c ON pr.PlateNumber = c.PlateNumber
    ORDER BY p.PaymentDate DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching payments', error: err.message });
    res.json(results);
  });
});

// ⚠️ IMPORTANT: /report/daily MUST come before /:id to avoid Express matching "report" as an id
// GET daily report - payments for a specific date
router.get('/report/daily', (req, res) => {
  const { date } = req.query;
  let sql = `
    SELECT p.PaymentID, p.AmountPaid, p.PaymentDate,
           pr.RecordID, pr.EntryTime, pr.ExitTime, pr.Duration,
           pr.PlateNumber, pr.SlotNumber,
           c.DriverName
    FROM Payment p
    JOIN ParkingRecord pr ON p.RecordID = pr.RecordID
    JOIN Car c ON pr.PlateNumber = c.PlateNumber
  `;
  const params = [];
  if (date) {
    sql += ' WHERE DATE(p.PaymentDate) = ?';
    params.push(date);
  }
  sql += ' ORDER BY p.PaymentDate DESC';
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error generating report', error: err.message });
    res.json(results);
  });
});

// GET single payment by ID
router.get('/:id', (req, res) => {
  const sql = `
    SELECT p.PaymentID, p.AmountPaid, p.PaymentDate,
           pr.RecordID, pr.EntryTime, pr.ExitTime, pr.Duration,
           pr.PlateNumber, pr.SlotNumber,
           c.DriverName, c.PhoneNumber
    FROM Payment p
    JOIN ParkingRecord pr ON p.RecordID = pr.RecordID
    JOIN Car c ON pr.PlateNumber = c.PlateNumber
    WHERE p.PaymentID = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching payment', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Payment not found.' });
    res.json(results[0]);
  });
});

// POST - Record a payment
router.post('/', (req, res) => {
  const { amountPaid, paymentDate, recordId } = req.body;
  if (!amountPaid || !recordId) {
    return res.status(400).json({ message: 'Amount paid and record ID are required.' });
  }
  const pDate = paymentDate || new Date().toISOString().slice(0, 19).replace('T', ' ');

  db.query('SELECT * FROM Payment WHERE RecordID = ?', [recordId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length > 0) {
      return res.status(409).json({ message: 'Payment for this parking record already exists.' });
    }
    db.query(
      'INSERT INTO Payment (AmountPaid, PaymentDate, RecordID) VALUES (?, ?, ?)',
      [amountPaid, pDate, recordId],
      (err2, result) => {
        if (err2) return res.status(500).json({ message: 'Error recording payment', error: err2.message });
        res.status(201).json({ message: 'Payment recorded successfully.', paymentId: result.insertId });
      }
    );
  });
});

// PUT - Update payment
router.put('/:id', (req, res) => {
  const { amountPaid, paymentDate } = req.body;
  if (!amountPaid) return res.status(400).json({ message: 'Amount is required.' });
  db.query(
    'UPDATE Payment SET AmountPaid = ?, PaymentDate = ? WHERE PaymentID = ?',
    [amountPaid, paymentDate, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error updating payment', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Payment not found.' });
      res.json({ message: 'Payment updated successfully.' });
    }
  );
});

// DELETE - Remove payment
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM Payment WHERE PaymentID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting payment', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Payment not found.' });
    res.json({ message: 'Payment deleted successfully.' });
  });
});

module.exports = router;
