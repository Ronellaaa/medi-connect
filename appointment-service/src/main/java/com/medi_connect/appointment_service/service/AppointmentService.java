package com.medi_connect.appointment_service.service;

import com.medi_connect.appointment_service.dto.PaymentStatusUpdateRequest;
import com.medi_connect.appointment_service.entity.Appointment;
import com.medi_connect.appointment_service.repository.AppointmentRepository;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8086}")
    private String notificationServiceUrl;

    public List<Appointment> getAllAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAllAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }
    public List<Appointment>findAppoinmentByPatientId(UUID appoinmentId,Long patientId ){
        return appointmentRepository.findAppoinmentByPatientId(appoinmentId,patientId);
    }

    public List<Appointment> getAllByStatus(String status) {
        return appointmentRepository.findByStatus(status);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Appointment not found")
                );
    }

    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
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


        return appointmentRepository.save(existing);

    }

    public Appointment updateStatus(UUID appointmentId, String status) {
        Appointment appointment = getAppointmentById(appointmentId);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public Appointment updatePaymentStatus(UUID appointmentId, PaymentStatusUpdateRequest request) {
        Appointment appointment = getAppointmentById(appointmentId);

        appointment.setPaymentStatus(request.getStatus());
        appointment.setPaymentId(request.getPaymentId());
        appointment.setPaymentAmount(request.getAmount());
        appointment.setPaidAt(request.getPaidAt());

        if (request.getMeetingUrl() != null && !request.getMeetingUrl().isBlank()) {
            appointment.setMeetingUrl(request.getMeetingUrl());
        }

        if ("PAID".equalsIgnoreCase(request.getStatus())) {
            appointment.setStatus("CONFIRMED");
            sendAppointmentConfirmation(appointment);
        }

        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(UUID appointmentId) {
        appointmentRepository.deleteById(appointmentId);
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
        payload.put("patientPhone", appointment.getPatientphoneNumber());
        payload.put("patientEmail", appointment.getPatientEmail());
        payload.put("appointmentDate", appointment.getAppointmentDate().toString());

        restTemplate.postForObject(notifyUrl, payload, String.class);
    }


}
