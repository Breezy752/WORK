const mysql = require('mysql2');
require('dotenv').config();

// Connect without specifying database first to create it
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
});

const sql = `
CREATE DATABASE IF NOT EXISTS PSSMS;
USE PSSMS;

CREATE TABLE IF NOT EXISTS User (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(100) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ParkingSlot (
  SlotNumber VARCHAR(20) PRIMARY KEY,
  SlotStatus ENUM('Available', 'Occupied') NOT NULL DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS Car (
  PlateNumber VARCHAR(20) PRIMARY KEY,
  DriverName VARCHAR(100) NOT NULL,
  PhoneNumber VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS ParkingRecord (
  RecordID INT AUTO_INCREMENT PRIMARY KEY,
  EntryTime DATETIME NOT NULL,
  ExitTime DATETIME,
  Duration DECIMAL(10,2),
  PlateNumber VARCHAR(20) NOT NULL,
  SlotNumber VARCHAR(20) NOT NULL,
  FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber) ON UPDATE CASCADE,
  FOREIGN KEY (SlotNumber) REFERENCES ParkingSlot(SlotNumber) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Payment (
  PaymentID INT AUTO_INCREMENT PRIMARY KEY,
  AmountPaid DECIMAL(10,2) NOT NULL,
  PaymentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  RecordID INT NOT NULL,
  FOREIGN KEY (RecordID) REFERENCES ParkingRecord(RecordID) ON DELETE CASCADE
);
`;

connection.query(sql, (err) => {
  if (err) {
    console.error('Error initializing database:', err.message);
    process.exit(1);
  }
  console.log('Database PSSMS and all tables created successfully.');
  connection.end();
});
