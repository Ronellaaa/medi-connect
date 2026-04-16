const express = require('express');
const cors = require('cors');
const sessionRoutes = require('./routes/sessionRoutes');
const { initDB } = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'telemedicine-service' });
});

// Routes
app.use('/api/telemedicine', sessionRoutes);

// Initialize database
initDB();

module.exports = app;