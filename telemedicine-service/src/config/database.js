// config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'telemedicine',
});

// Create table if not exists
const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
            id UUID PRIMARY KEY,
            room_name VARCHAR(255) NOT NULL,
            appointment_id VARCHAR(100) NOT NULL,
            doctor_id VARCHAR(100) NOT NULL,
            patient_id VARCHAR(100) NOT NULL,
            status VARCHAR(20) DEFAULT 'CREATED',
            created_at TIMESTAMP DEFAULT NOW(),
            started_at TIMESTAMP,
            ended_at TIMESTAMP,
            duration INTEGER DEFAULT 0,
            meeting_url TEXT
        )
    `);
    console.log('✅ Database ready');
};

module.exports = { pool, initDB };