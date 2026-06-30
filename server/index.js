const express = require('express');
const cors = require('cors');
const mailRoutes = require('./routes/mail');
const adminRoutes = require('./routes/admin');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// General rate limiter for all API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Stricter rate limiter for account creation
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 account creations per hour
  message: { error: 'Too many accounts created from this IP, please try again after an hour.' }
});

app.use('/api/', apiLimiter);
app.use('/api/create', createAccountLimiter);

// Use Routes
app.use('/api', mailRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Temp Mail Backend API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
