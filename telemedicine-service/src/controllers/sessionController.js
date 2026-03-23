const sessionService = require('../services/sessionService');

class SessionController {
    async createSession(req, res) {
        try {
            const { appointmentId, doctorId, patientId } = req.body;
            
            if (!appointmentId || !doctorId || !patientId) {
                return res.status(400).json({ error: 'Missing fields' });
            }
            
            const session = await sessionService.createSession(appointmentId, doctorId, patientId);
            
            res.json({
                success: true,
                sessionId: session.sessionId,
                meetingUrl: session.meetingUrl,
                roomName: session.roomName
            });
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSession(req, res) {
        try {
            const session = await sessionService.getSession(req.params.sessionId);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json(session);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async endSession(req, res) {
        try {
            await sessionService.endSession(req.params.sessionId);
            res.json({ success: true, message: 'Session ended' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

       
}

module.exports = new SessionController();