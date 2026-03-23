// src/services/paymentService.js
class PaymentService {
    async verifyPayment(appointmentId) {
        // MOCK - Will be replaced with actual Spring Boot call later
        return {
            verified: true,
            appointmentId,
            paymentId: `pay_${Date.now()}`,
            status: 'COMPLETED',
            amount: 2500.00,
            message: 'Payment verified (MOCK)'
        };
    }

    async notifySessionEnded(appointmentId, sessionId, duration) {
        // MOCK - Will be replaced with actual Spring Boot call later
        console.log(`[MOCK] Notifying payment service: Session ${sessionId} ended, duration: ${duration}s`);
        return { success: true };
    }
}

module.exports = new PaymentService();