// test-db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'babibuba',
    host: 'localhost',
    port: 5432,
    database: 'telemedicine',
});

async function test() {
    try {
        console.log('🔌 Connecting to PostgreSQL...');
        
        // Test connection
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Connected!');
        console.log('Server time:', result.rows[0].now);
        
        // Create sessions table
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
        console.log('✅ Sessions table created!');
        
        // Insert a test session
        const { v4: uuidv4 } = require('uuid');
        const testId = uuidv4();
        
        await pool.query(
            `INSERT INTO sessions (id, room_name, appointment_id, doctor_id, patient_id, meeting_url)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [testId, 'test-room', 'apt-001', 'doc-001', 'pat-001', 'https://meet.jit.si/test']
        );
        console.log('✅ Test session inserted!');
        
        // Read back
        const sessions = await pool.query('SELECT * FROM sessions');
        console.log(`✅ Found ${sessions.rows.length} session(s) in database`);
        
        await pool.end();
        console.log('\n🎉 PostgreSQL is ready for your telemedicine service!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

test();