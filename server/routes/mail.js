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

// Route to get available domains
router.get('/domains', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/domains`);
    res.json(response.data['hydra:member']);
  } catch (error) {
    console.error('Error fetching domains:', error.message);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

// Route to create a new temp email account
router.post('/create', async (req, res) => {
  try {
    let domain = req.body.domain;
    if (!domain) {
      const domainsResponse = await axios.get(`${API_BASE_URL}/domains`);
      domain = domainsResponse.data['hydra:member'][0].domain;
    }

    let username = req.body.username;
    if (!username) {
      username = generateRandomString(10);
    }
    // ensure username is valid (alphanumeric and some chars)
    username = username.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    
    const address = `${username}@${domain}`;
    const password = generateRandomString(16);

    const accountResponse = await axios.post(`${API_BASE_URL}/accounts`, {
      address: address,
      password: password
    });

    const tokenResponse = await axios.post(`${API_BASE_URL}/token`, {
      address: address,
      password: password
    });

    res.json({
      id: accountResponse.data.id,
      address: address,
      token: tokenResponse.data.token
    });

  } catch (error) {
    console.error('Error creating account:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.['hydra:description'] || 'Failed to create temp email account';
    res.status(error.response?.status || 500).json({ error: errorMsg });
  }
});

// Route to delete an account
router.delete('/account/:id', async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  
  if (!token) return res.status(401).json({ error: 'No authorization token provided' });

  try {
    await axios.delete(`${API_BASE_URL}/accounts/${id}`, {
      headers: { Authorization: token }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to delete account' });
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

// Route to download message source (EML)
router.get('/messages/:id/download', async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  
  if (!token) return res.status(401).json({ error: 'No authorization token provided' });

  try {
    const response = await axios.get(`${API_BASE_URL}/messages/${id}/download`, {
      headers: { Authorization: token, Accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8' },
      responseType: 'arraybuffer'
    });
    
    res.setHeader('Content-Type', 'message/rfc822');
    res.setHeader('Content-Disposition', `attachment; filename="message-${id}.eml"`);
    res.send(response.data);
  } catch (error) {
    console.error('Error downloading message:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to download message' });
  }
});

// Route to delete a message
router.delete('/messages/:id', async (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  
  if (!token) return res.status(401).json({ error: 'No authorization token provided' });

  try {
    await axios.delete(`${API_BASE_URL}/messages/${id}`, {
      headers: { Authorization: token }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
