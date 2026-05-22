const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const pricingRoutes = require('./routes/pricingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/pricing', pricingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

module.exports = app;
