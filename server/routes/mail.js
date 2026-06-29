const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_BASE_URL = 'https://api.mail.tm';

// Helper function to generate a random string
const generateRandomString = (length) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Route to create a new temp email account
router.post('/create', async (req, res) => {
  try {
    // 1. Get available domains
    const domainsResponse = await axios.get(`${API_BASE_URL}/domains`);
    const domain = domainsResponse.data['hydra:member'][0].domain;

    // 2. Generate random address and password
    const username = generateRandomString(10);
    const address = `${username}@${domain}`;
    const password = generateRandomString(16);

    // 3. Create account
    await axios.post(`${API_BASE_URL}/accounts`, {
      address: address,
      password: password
    });

    // 4. Get auth token
    const tokenResponse = await axios.post(`${API_BASE_URL}/token`, {
      address: address,
      password: password
    });

    res.json({
      address: address,
      token: tokenResponse.data.token
    });

  } catch (error) {
    console.error('Error creating account:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create temp email account' });
  }
});

// Route to fetch messages (inbox)
router.get('/messages', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No authorization token provided' });

  try {
    const response = await axios.get(`${API_BASE_URL}/messages`, {
      headers: { Authorization: token }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching messages:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Route to fetch a single message
router.get('/messages/:id', async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  
  if (!token) return res.status(401).json({ error: 'No authorization token provided' });

  try {
    const response = await axios.get(`${API_BASE_URL}/messages/${id}`, {
      headers: { Authorization: token }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching message:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

module.exports = router;
