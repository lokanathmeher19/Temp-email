const express = require('express');
const jwt = require('jsonwebtoken');
const { getStat } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_env';

// POST /login
router.post('/login', (req, res) => {
  const { password } = req.body;
  
  // Use ADMIN_PASSWORD from .env, or default to 'biswa12345' for easy local setup if missing
  const adminPassword = process.env.ADMIN_PASSWORD || 'biswa12345';

  if (password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Middleware to verify JWT
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// GET /stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalEmails = await getStat('total_emails_generated');
    // We could add more stats here later
    res.json({
      totalEmailsGenerated: totalEmails,
      uptime: process.uptime()
    });
  } catch (err) {
    console.error('Failed to get stats', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
