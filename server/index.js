const express = require('express');
const cors = require('cors');
const mailRoutes = require('./routes/mail');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', mailRoutes);

app.get('/', (req, res) => {
  res.send('Temp Mail Backend API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
