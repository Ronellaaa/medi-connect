const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class SessionService {
    async createSession(appointmentId, paymentId) {
        const sessionId = uuidv4();
        const roomName = `call_${appointmentId}_${Date.now()}`;
        const meetingUrl = `https://meet.jit.si/${roomName}`;
        
        await pool.query(
            `INSERT INTO sessions (id, room_name, appointment_id, payment_id, meeting_url)
             VALUES ($1, $2, $3, $4, $5)`,
            [sessionId, roomName, appointmentId, paymentId, meetingUrl]
        );
        
        return { sessionId, roomName, meetingUrl };
    }

    async getSession(sessionId) {
        const result = await pool.query(
            'SELECT * FROM sessions WHERE id = $1',
            [sessionId]
        );
        return result.rows[0] || null;
    }

    async endSession(sessionId) {
        await pool.query(
            `UPDATE sessions 
             SET status = 'ENDED', ended_at = NOW() 
             WHERE id = $1`,
            [sessionId]
        );
    }

}

module.exports = new SessionService();