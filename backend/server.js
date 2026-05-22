const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const pricingRoutes = require('./routes/pricingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve backend API routes
app.use('/api/pricing', pricingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to view the pricing application!`);
  });
});

module.exports = app;
