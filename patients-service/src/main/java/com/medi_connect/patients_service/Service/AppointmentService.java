package com.medi_connect.patients_service.Service;

import com.medi_connect.patients_service.dto.AppointmentDto;
import com.medi_connect.patients_service.dto.AppointmentRequestDto;
import com.medi_connect.patients_service.Model.Appointment;
import com.medi_connect.patients_service.Model.Patient;
import com.medi_connect.patients_service.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientService patientService;

    public AppointmentDto bookAppointment(AppointmentRequestDto request) {
        Patient currentPatient = patientService.getCurrentPatient();

        LocalDateTime startTime = request.getAppointmentDate().minusMinutes(30);
        LocalDateTime endTime = request.getAppointmentDate().plusMinutes(30);
        List<Appointment> existingAppointments = appointmentRepository.findDoctorAppointmentsInRange(
                request.getDoctorId(), startTime, endTime);

        if (!existingAppointments.isEmpty()) {
            throw new RuntimeException("Doctor is not available at the requested time");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(currentPatient);
        appointment.setDoctorId(request.getDoctorId());
        appointment.setDoctorName(request.getDoctorName());
        appointment.setDoctorSpecialty(request.getDoctorSpecialty());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setSymptoms(request.getSymptoms());
        appointment.setNotes(request.getNotes());
        appointment.setConsultationFee(request.getConsultationFee());
        appointment.setStatus("PENDING");

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return convertToDto(savedAppointment);
    }

    public List<AppointmentDto> getMyAppointments() {
        Patient currentPatient = patientService.getCurrentPatient();
        List<Appointment> appointments = appointmentRepository.findByPatient(currentPatient);
        return appointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public AppointmentDto cancelAppointment(Long id) {
        Patient currentPatient = patientService.getCurrentPatient();
        Appointment appointment = appointmentRepository.findByIdAndPatientId(id, currentPatient.getId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot cancel past appointments");
        }

        appointment.setStatus("CANCELLED");
        Appointment cancelledAppointment = appointmentRepository.save(appointment);
        return convertToDto(cancelledAppointment);
    }

    private AppointmentDto convertToDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setPatientName(appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName());
        dto.setPatientEmail(appointment.getPatient().getEmail());
        dto.setDoctorId(appointment.getDoctorId());
        dto.setDoctorName(appointment.getDoctorName());
        dto.setDoctorSpecialty(appointment.getDoctorSpecialty());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStatus(appointment.getStatus());
        dto.setSymptoms(appointment.getSymptoms());
        dto.setNotes(appointment.getNotes());
        dto.setConsultationFee(appointment.getConsultationFee());
        dto.setPaymentStatus(appointment.getPaymentStatus());
        dto.setMeetingLink(appointment.getMeetingLink());
        dto.setCreatedAt(appointment.getCreatedAt());
        return dto;
    }
}