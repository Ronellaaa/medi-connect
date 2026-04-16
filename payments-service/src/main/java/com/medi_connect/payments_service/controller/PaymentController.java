package com.medi_connect.payments_service.controller;

import com.medi_connect.payments_service.dto.PaymentRequest;
import com.medi_connect.payments_service.dto.PaymentResponse;
import com.medi_connect.payments_service.model.Payment;
import com.medi_connect.payments_service.service.PayHereService;
import com.medi_connect.payments_service.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity; //Spring's HTTP response wrapper
import org.springframework.web.bind.annotation.*; //Web annotations for REST endpoints

import java.util.Map;

@RestController
@RequestMapping("/api/payments") // Base path for all endpoints in this controller
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final PayHereService payHereService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponse> initiatePayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.initiatePayment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify/{appointmentId}")
    public ResponseEntity<Payment> verifyPayment(@PathVariable String appointmentId) {
        Payment payment = paymentService.getPaymentByAppointment(appointmentId);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/webhook/payhere")
    public ResponseEntity<String> handlePayHereWebhook(@RequestParam Map<String, String> payload) {
        String paymentId = payload.get("order_id");
        String paymentStatus = payload.get("status_code");
        String payherePaymentId = payload.get("payment_id");
        String transactionRef = payload.getOrDefault("payment_id", payload.get("transaction_reference"));
        String statusMessage = payload.getOrDefault("status_message", "Payment failed");

        log.info("Received PayHere webhook for orderId={}, statusCode={}, payherePaymentId={}, statusMessage={}",
            paymentId, paymentStatus, payherePaymentId, statusMessage);
        log.debug("Full PayHere webhook payload: {}", payload);

        if (!payHereService.isValidNotification(payload)) {
            log.warn("Rejected PayHere webhook due to invalid md5 signature for order {}", paymentId);
            return ResponseEntity.badRequest().body("INVALID_SIGNATURE");
        }

        if ("2".equals(paymentStatus)) {
            Payment payment = paymentService.completePayment(paymentId, payherePaymentId, transactionRef);
            log.info("Payment marked COMPLETED for orderId={}, appointmentId={}, dbStatus={}",
                payment.getId(), payment.getAppointmentId(), payment.getStatus());
        } else {
            Payment payment = paymentService.failPayment(paymentId, statusMessage);
            log.warn("Payment marked FAILED for orderId={}, appointmentId={}, dbStatus={}, reason={}",
                payment.getId(), payment.getAppointmentId(), payment.getStatus(), payment.getFailureReason());
        }

        return ResponseEntity.ok("OK");
    }

    @PostMapping("/session-ended")
    public ResponseEntity<String> sessionEnded(@RequestBody Map<String, Object> payload) {
        String appointmentId = (String) payload.get("appointmentId");
        Integer duration = (Integer) payload.get("duration");

        log.info("Session ended for appointment: {}, duration: {}s", appointmentId, duration);
        paymentService.recordSessionEnd(appointmentId, duration);

        return ResponseEntity.ok("Session recorded");
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "payments-service",
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
}
