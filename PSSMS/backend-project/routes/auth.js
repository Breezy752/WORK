const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }



  try {
    // Check for duplicate username
    db.query('SELECT * FROM User WHERE Username = ?', [username], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      if (results.length > 0) {
        return res.status(409).json({ message: 'Username already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      db.query('INSERT INTO User (Username, Password) VALUES (?, ?)', [username, hashedPassword], (err2) => {
        if (err2) return res.status(500).json({ message: 'Error creating user', error: err2.message });
        res.status(201).json({ message: 'User registered successfully.' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  db.query('SELECT * FROM User WHERE Username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Session-based login
    req.session.user = { id: user.UserID, username: user.Username };
    res.json({ message: 'Login successful.', user: { id: user.UserID, username: user.Username } });
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed.' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully.' });
  });
});

// Check session
router.get('/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Password recovery (reset password)
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ message: 'Username and new password are required.' });
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPassword.test(newPassword)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    });
  }

  db.query('SELECT * FROM User WHERE Username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    db.query('UPDATE User SET Password = ? WHERE Username = ?', [hashedPassword, username], (err2) => {
      if (err2) return res.status(500).json({ message: 'Error updating password', error: err2.message });
      res.json({ message: 'Password reset successfully.' });
    });
  });
});

module.exports = router;
