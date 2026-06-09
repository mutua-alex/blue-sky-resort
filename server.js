require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

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

// Helper function to find the folder regardless of capitalization (public vs Public)
function getPublicPath() {
  const rootDir = __dirname;
  const items = fs.readdirSync(rootDir);
  const publicFolder = items.find(item => item.toLowerCase() === 'public');
  return publicFolder ? path.join(rootDir, publicFolder) : path.join(rootDir, 'public');
}

const publicPath = getPublicPath();
console.log(`[Server Setup] Serving static files from: ${publicPath}`);

// Serve static assets (CSS, Images)
app.use(express.static(publicPath));

// Dynamic File Sender to automatically match file casing (index.html vs Index.html)
function serveHtmlFile(fileName, res) {
  try {
    const items = fs.readdirSync(publicPath);
    const actualFile = items.find(item => item.toLowerCase() === fileName.toLowerCase());
    
    if (actualFile) {
      res.sendFile(path.join(publicPath, actualFile));
    } else {
      res.status(404).send(`File ${fileName} not found in template directory.`);
    }
  } catch (err) {
    console.error(`Error serving ${fileName}:`, err);
    res.status(500).send("Internal Server Error layout pathing.");
  }
}

// Map endpoints directly using the case-insensitive finder
app.get('/', (req, res) => serveHtmlFile('index.html', res));
app.get('/index.html', (req, res) => serveHtmlFile('index.html', res));
app.get('/about.html', (req, res) => serveHtmlFile('about.html', res));
app.get('/rooms.html', (req, res) => serveHtmlFile('rooms.html', res));
app.get('/gallery.html', (req, res) => serveHtmlFile('gallery.html', res));
app.get('/booking.html', (req, res) => serveHtmlFile('booking.html', res));
app.get('/contact.html', (req, res) => serveHtmlFile('contact.html', res));

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
