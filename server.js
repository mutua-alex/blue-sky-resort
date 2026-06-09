require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Neon PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

// Explicit Route Mappings
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'index.html')));
app.get('/about.html', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'about.html')));
app.get('/rooms.html', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'rooms.html')));
app.get('/gallery.html', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'gallery.html')));
app.get('/booking.html', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'booking.html')));
app.get('/contact.html', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'contact.html')));

// Handle Form Submission for Reservations
app.post('/api/booking', async (req, res) => {
  const { name, email, phone, room, checkin, checkout } = req.body;
  try {
    await pool.query(
      'INSERT INTO bookings (guest_name, guest_email, guest_phone, room_type, check_in, check_out) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, email, phone, room, checkin, checkout]
    );
    res.redirect('/booking.html?status=success');
  } catch (err) {
    console.error("Database Save Error:", err);
    res.redirect('/booking.html?status=error');
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Blue Sky Resort server running smoothly on port ${port}`);
});
