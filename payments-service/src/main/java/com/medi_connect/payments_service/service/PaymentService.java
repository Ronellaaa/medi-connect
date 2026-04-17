package com.medi_connect.payments_service.service;

import com.medi_connect.payments_service.dto.PayHereCheckoutPayload;
import com.medi_connect.payments_service.dto.PayHereCheckoutRequest;
import com.medi_connect.payments_service.dto.PaymentRequest;
import com.medi_connect.payments_service.dto.PaymentResponse;
import com.medi_connect.payments_service.model.Payment;
import com.medi_connect.payments_service.model.PaymentStatus;
import com.medi_connect.payments_service.repository.PaymentRepository;

import java.util.HashMap;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import org.springframework.web.client.RestTemplate; 
import org.springframework.beans.factory.annotation.Value; 
import java.util.Map;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PayHereService payHereService;

    private final RestTemplate restTemplate;

    @Value("${appointment.service.url}")
    private String appointmentServiceUrl;

    @Value("${telemedicine.service.url}")
    private String telemedicineServiceUrl;

    @Transactional
    public PaymentResponse initiatePayment(PaymentRequest request) {
        log.info("Initiating payment for appointment: {}", request.getAppointmentId());

        /*if (paymentRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new RuntimeException("Payment already initiated for this appointment");
        }*/

        /*String patientId = request.getPatientId();
        String doctorId = request.getDoctorId();
        
        if (patientId == null || patientId.isBlank() || doctorId == null || doctorId.isBlank()) {
            log.info("Fetching patient/doctor IDs from appointment service");
            String url = appointmentServiceUrl + "/api/appointments/" + request.getAppointmentId() + "/payment-info";

            try {
                Map<String, String> ids = restTemplate.getForObject(url, Map.class);
                patientId = ids.get("patientId");
                doctorId = ids.get("doctorId");
                log.info("Retrieved IDs - patientId: {}, doctorId: {}", patientId, doctorId);
            } catch (Exception e) {
                log.error("Failed to fetch IDs: {}", e.getMessage());
                throw new RuntimeException("Could not retrieve appointment details");
            }
        }*/

            
        // ✅ SIMPLE VALIDATION - No service call needed!
        if (request.getPatientId() == null || request.getPatientId().isBlank()) {
            throw new RuntimeException("Patient ID is required");
        }
        if (request.getDoctorId() == null || request.getDoctorId().isBlank()) {
            throw new RuntimeException("Doctor ID is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Valid payment amount is required");
        }


        Optional<Payment> completedPayment = paymentRepository.findByAppointmentIdAndStatus(request.getAppointmentId(), PaymentStatus.COMPLETED);
        if (completedPayment.isPresent()) {
            throw new RuntimeException("Payment already completed for this appointment");
        }

        paymentRepository.deleteByAppointmentIdAndStatus(request.getAppointmentId(), PaymentStatus.PENDING);


        /**/

        Payment payment = Payment.builder()
                .appointmentId(request.getAppointmentId())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .amount(request.getAmount())
                .status(PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment record created with ID: {}", payment.getId());

        PayHereCheckoutPayload checkout = payHereService.createCheckoutPayload(
            PayHereCheckoutRequest.builder()
                .orderId(payment.getId())
                .amount(payment.getAmount())
                .currency("LKR")
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .items(resolveItemsDescription(request))
                .custom1(request.getAppointmentId())
                .custom2(request.getPatientId())
                .build()
        );

        return new PaymentResponse(
                payment.getId(),
                checkout.getActionUrl(),
                checkout.getMethod(),
                checkout.getFields(),
                PaymentStatus.PENDING,
                payment.getAmount(),
                payment.getCreatedAt(),
                "Payment initiated successfully"
        );
    }

    public Payment getPaymentByAppointment(String appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Payment not found for appointment: " + appointmentId));
    }

    @Transactional
    public Payment completePayment(String paymentId, String payherePaymentId, String transactionRef) {
        log.info("Completing payment: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("Payment cannot be completed. Current status: " + payment.getStatus());
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPayherePaymentId(payherePaymentId);
        payment.setTransactionReference(transactionRef);
        payment.setPaidAt(LocalDateTime.now());
        payment.setFailureReason(null);

        Payment completed = paymentRepository.save(payment);
        log.info("Payment completed: {}", paymentId);

            String meetingUrl = null;
        try {
            String telemedicineUrl = telemedicineServiceUrl + "/api/sessions/create";
            
            Map<String, String> sessionRequest = Map.of(
            "paymentId", payment.getId(),
            "appointmentId", payment.getAppointmentId()
            );
            
            Map<String, String> sessionResponse = restTemplate.postForObject(
                telemedicineUrl, sessionRequest, Map.class);
            
//            meetingUrl = sessionResponse.get("meetingUrl");
//            payment.setMeetingUrl(meetingUrl);
            paymentRepository.save(payment);
            
            log.info("Telemedicine session created: {}", meetingUrl);
        } catch (Exception e) {
            log.error("Failed to create telemedicine session: {}", e.getMessage());
            // Continue - don't fail the payment
        }

        // ✅ ADD THIS - Notify Appointment Service (DIFFERENT URL!)
        try {
            String notifyUrl = appointmentServiceUrl + "/api/appointments/" + payment.getAppointmentId() + "/payment-status";
            
            Map<String, Object> notification = new HashMap<>();
            notification.put("status", "PAID");
            notification.put("paymentId", payment.getId());
            notification.put("amount", payment.getAmount());
            notification.put("paidAt", payment.getPaidAt().toString());
            if (meetingUrl != null) {
                notification.put("meetingUrl", meetingUrl);
            }
            
            restTemplate.postForObject(notifyUrl, notification, Map.class);
            log.info("Appointment service notified of payment");
        } catch (Exception e) {
            log.error("Failed to notify appointment service: {}", e.getMessage());
        }


        return completed;
    }

    @Transactional
    public Payment failPayment(String paymentId, String reason) {
        log.info("Marking payment as failed: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        return paymentRepository.save(payment);
    }

    @Transactional
    public void recordSessionEnd(String appointmentId, int duration) {
        Payment payment = getPaymentByAppointment(appointmentId);
        payment.setSessionDuration(duration);
        payment.setStatus(PaymentStatus.SESSION_USED);
        paymentRepository.save(payment);
        log.info("Session recorded for payment: {}, duration: {}s", payment.getId(), duration);
    }

    private String resolveItemsDescription(PaymentRequest request) {
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            return request.getDescription();
        }

        return "Telemedicine payment for appointment " + request.getAppointmentId();
    }
}
