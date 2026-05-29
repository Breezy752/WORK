const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'smartpark_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8 // 8 hours
  }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/car'));
app.use('/api/parking-slots', require('./routes/parkingSlot'));
app.use('/api/parking-records', require('./routes/parkingRecord'));
app.use('/api/payments', require('./routes/payment'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SmartPark PSSMS Backend is running.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
