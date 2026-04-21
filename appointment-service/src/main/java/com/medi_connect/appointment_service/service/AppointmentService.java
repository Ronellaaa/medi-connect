package com.medi_connect.appointment_service.service;

import com.medi_connect.appointment_service.dto.PaymentStatusUpdateRequest;
import com.medi_connect.appointment_service.entity.Appointment;
import com.medi_connect.appointment_service.entity.Slot;
import com.medi_connect.appointment_service.repository.AppointmentRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private SlotService slotService;

    @Value("${notification.service.url:http://localhost:8086}")
    private String notificationServiceUrl;

    public List<Appointment> getAllAppointmentsByPatient(Long patientId) {
        return attachQueueMetadata(appointmentRepository.findByPatientId(patientId));
    }

    public List<Appointment> getAllAppointmentsByDoctor(Long doctorId) {
        return attachQueueMetadata(appointmentRepository.findByDoctorId(doctorId));
    }

    public List<Appointment> findAppoinmentByPatientId(UUID appoinmentId, Long patientId) {
        return appointmentRepository.findAppoinmentByPatientId(appoinmentId, patientId);
    }

    public List<Appointment> getAllByStatus(String status) {
        return attachQueueMetadata(appointmentRepository.findByStatus(status));
    }

    public List<Appointment> getAllAppointments() {
        return attachQueueMetadata(appointmentRepository.findAll());
    }

    public Appointment getAppointmentById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Appointment not found")
                );
        return attachQueueMetadata(appointment);
    }

    public Appointment createAppointment(Appointment appointment) {
        if (appointment.getSlotId() == null) {
            throw new RuntimeException("Slot id is required");
        }

        Slot heldSlot = slotService.holdSlot(appointment.getSlotId());
        try {
            appointment.setDoctorId(heldSlot.getDoctorId());
            appointment.setAppointmentDate(heldSlot.getSlotStart());
            appointment.setAppointmentEndDate(heldSlot.getSlotEnd());

            return attachQueueMetadata(appointmentRepository.save(appointment));
        } catch (RuntimeException ex) {
            slotService.releaseSlot(heldSlot.getId());
            throw ex;
        }
    }

    public Appointment updateAppointment(UUID appointmentId, Appointment updatedappointment) {
        Appointment existing = getAppointmentById(appointmentId);

        if (updatedappointment.getPatientName() != null) {
            existing.setPatientName(updatedappointment.getPatientName());

        }
        if (updatedappointment.getPatientphoneNumber() != null) {
            existing.setPatientphoneNumber(updatedappointment.getPatientphoneNumber());
        }
        if (updatedappointment.getAppointmentDate() != null) {
            existing.setAppointmentDate(updatedappointment.getAppointmentDate());
        }


        return attachQueueMetadata(appointmentRepository.save(existing));

    }

    public Appointment updateStatus(UUID appointmentId, String status) {
        Appointment appointment = getAppointmentById(appointmentId);
        appointment.setStatus(status);
        if ("CONFIRMED".equalsIgnoreCase(status)) {
            appointment.setLiveStatus("WAITING");
        }
        if ("CANCELLED".equalsIgnoreCase(status) || "CANCELED".equalsIgnoreCase(status)) {
            appointment.setLiveStatus("CANCELLED");
            releaseAppointmentSlot(appointment);
        }
        return attachQueueMetadata(appointmentRepository.save(appointment));
    }

    public Appointment updateLiveStatus(UUID appointmentId, String liveStatus) {
        Appointment appointment = getAppointmentById(appointmentId);
        String normalizedStatus = normalizeLiveStatus(liveStatus);

        if (!"CONFIRMED".equalsIgnoreCase(appointment.getStatus()) && !"COMPLETED".equalsIgnoreCase(normalizedStatus)) {
            throw new RuntimeException("Only confirmed appointments can join the live queue");
        }

        if ("ONGOING".equals(normalizedStatus)) {
            List<Appointment> sameQueueAppointments = getQueueAppointments(appointment.getDoctorId(), appointment.getAppointmentDate());
            for (Appointment queueAppointment : sameQueueAppointments) {
                if (!queueAppointment.getId().equals(appointment.getId())
                        && "ONGOING".equalsIgnoreCase(queueAppointment.getLiveStatus())) {
                    queueAppointment.setLiveStatus("WAITING");
                    appointmentRepository.save(queueAppointment);
                }
            }
        }

        appointment.setLiveStatus(normalizedStatus);
        return attachQueueMetadata(appointmentRepository.save(appointment));
    }

    public Appointment updatePaymentStatus(UUID appointmentId, PaymentStatusUpdateRequest request) {
        Appointment appointment = getAppointmentById(appointmentId);

        System.out.println(request.getMeetingUrl());
        System.out.println(request.getStatus());

        appointment.setPaymentStatus(request.getStatus());
        appointment.setPaymentId(request.getPaymentId());
        appointment.setPaymentAmount(request.getAmount());
        appointment.setPaidAt(request.getPaidAt());

        if (request.getMeetingUrl() != null && !request.getMeetingUrl().isBlank()) {
            appointment.setMeetingUrl(request.getMeetingUrl());
        }


        if ("PAID".equalsIgnoreCase(request.getStatus())) {
            appointment.setStatus("CONFIRMED");
            if (appointment.getLiveStatus() == null || appointment.getLiveStatus().isBlank() || "CANCELLED".equalsIgnoreCase(appointment.getLiveStatus())) {
                appointment.setLiveStatus("WAITING");
            }
            confirmAppointmentSlot(appointment);
            sendAppointmentConfirmation(appointment);
        }

        if ("FAILED".equalsIgnoreCase(request.getStatus())) {
            appointment.setStatus("CANCELED");
            appointment.setLiveStatus("CANCELLED");
            releaseAppointmentSlot(appointment);
            sendAppointmentCancellation(appointment);
        }
        if ("PENDING".equalsIgnoreCase(request.getStatus())) {
            appointment.setStatus("PENDING");
        }

        System.out.println(request.getStatus());

        return attachQueueMetadata(appointmentRepository.save(appointment));



    }

    public void deleteAppointment(UUID appointmentId) {
        Appointment appointment = getAppointmentById(appointmentId);
        releaseAppointmentSlot(appointment);
        appointmentRepository.deleteById(appointmentId);
    }

    private void confirmAppointmentSlot(Appointment appointment) {
        if (appointment.getSlotId() == null) {
            return;
        }

        slotService.markSlotBooked(appointment.getSlotId());
    }

    private void releaseAppointmentSlot(Appointment appointment) {
        if (appointment.getSlotId() == null) {
            return;
        }

        slotService.releaseSlot(appointment.getSlotId());
    }

    private String normalizeLiveStatus(String liveStatus) {
        if (liveStatus == null || liveStatus.isBlank()) {
            throw new RuntimeException("Live status is required");
        }

        String normalized = liveStatus.trim().toUpperCase();
        if (!normalized.equals("WAITING") && !normalized.equals("ONGOING") && !normalized.equals("COMPLETED") && !normalized.equals("CANCELLED")) {
            throw new RuntimeException("Unsupported live status");
        }
        return normalized;
    }

    private List<Appointment> attachQueueMetadata(List<Appointment> appointments) {
        return appointments.stream()
                .map(this::attachQueueMetadata)
                .collect(Collectors.toList());
    }

    private Appointment attachQueueMetadata(Appointment appointment) {
        appointment.setQueueToken(calculateQueueToken(appointment));
        return appointment;
    }

    private Integer calculateQueueToken(Appointment appointment) {
        if (appointment == null || appointment.getId() == null || appointment.getDoctorId() == null || appointment.getAppointmentDate() == null) {
            return null;
        }

        String status = appointment.getStatus() != null ? appointment.getStatus().toUpperCase() : "";
        if (!"CONFIRMED".equals(status)) {
            return null;
        }

        LocalDate queueDate = appointment.getAppointmentDate().toLocalDate();
        List<Appointment> queueAppointments = appointmentRepository.findByDoctorId(appointment.getDoctorId()).stream()
                .filter(item -> item.getAppointmentDate() != null)
                .filter(item -> queueDate.equals(item.getAppointmentDate().toLocalDate()))
                .filter(item -> "CONFIRMED".equalsIgnoreCase(item.getStatus()))
                .filter(item -> !"CANCELLED".equalsIgnoreCase(item.getLiveStatus()) && !"CANCELED".equalsIgnoreCase(item.getLiveStatus()))
                .sorted(Comparator.comparing(Appointment::getAppointmentDate))
                .collect(Collectors.toList());

        for (int index = 0; index < queueAppointments.size(); index += 1) {
            if (appointment.getId().equals(queueAppointments.get(index).getId())) {
                return index + 1;
            }
        }

        return null;
    }

    private List<Appointment> getQueueAppointments(Long doctorId, LocalDateTime appointmentDate) {
        if (doctorId == null || appointmentDate == null) {
            return List.of();
        }

        LocalDate queueDate = appointmentDate.toLocalDate();
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .filter(item -> item.getAppointmentDate() != null)
                .filter(item -> queueDate.equals(item.getAppointmentDate().toLocalDate()))
                .filter(item -> "CONFIRMED".equalsIgnoreCase(item.getStatus()))
                .sorted(Comparator.comparing(Appointment::getAppointmentDate))
                .collect(Collectors.toList());
    }

    private void sendAppointmentConfirmation(Appointment appointment) {
        if (appointment.getPatientEmail() == null || appointment.getPatientEmail().isBlank()) {
            return;
        }

        String notifyUrl = notificationServiceUrl + "/api/notification/appointment-confirmation";
        Map<String, String> payload = new HashMap<>();
        payload.put("appointmentId", appointment.getId().toString());
        payload.put("patientName", appointment.getPatientName());
        payload.put("doctorName", appointment.getDoctorName());
        payload.put("doctorEmail", appointment.getDoctorEmail());
        payload.put("patientPhone", appointment.getPatientphoneNumber());
        payload.put("patientEmail", appointment.getPatientEmail());
        payload.put("appointmentDate", appointment.getAppointmentDate().toString());

        restTemplate.postForObject(notifyUrl, payload, String.class);
    }

    public void sendAppointmentCancellation(Appointment appointment) {
        if (appointment.getPatientEmail() == null || appointment.getPatientEmail().isBlank() || appointment.getDoctorEmail() == null || appointment.getDoctorEmail().isBlank()) {
            System.out.println("Email not found!");
            return;
        }
        String notifyUrl = notificationServiceUrl + "/api/notification/appointment-cancellation";

        Map<String, String> payload = new HashMap<>();
        payload.put("appointmentId", appointment.getId().toString());
        payload.put("patientName", appointment.getPatientName());
        payload.put("doctorName", appointment.getDoctorName());
        payload.put("doctorEmail",appointment.getDoctorEmail());
        payload.put("patientPhone", appointment.getPatientphoneNumber());
        payload.put("patientEmail", appointment.getPatientEmail());
        payload.put("appointmentDate", appointment.getAppointmentDate().toString());

        restTemplate.postForObject(notifyUrl, payload, String.class);


    }


}
