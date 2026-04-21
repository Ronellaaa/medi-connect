package com.medi_connect.patients_service.Service;

import com.medi_connect.patients_service.dto.*;
import com.medi_connect.patients_service.Model.Patient;
import com.medi_connect.patients_service.Model.Appointment;
import com.medi_connect.patients_service.Repository.AppointmentRepository;
import com.medi_connect.patients_service.Repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorClientService doctorClientService;

    // ==================== PATIENT MANAGEMENT (ADMIN OPERATIONS) ====================

    public List<AdminUserDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .filter(p -> "ROLE_PATIENT".equals(p.getRole()))
                .map(this::convertToAdminDto)
                .collect(Collectors.toList());
    }

    public AdminUserDto getPatientDetails(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (!"ROLE_PATIENT".equals(patient.getRole())) {
            throw new RuntimeException("User is not a patient");
        }

        return convertToAdminDto(patient);
    }

    @Transactional
    public AdminUserDto updatePatientByAdmin(Long patientId, AdminUserDto adminUserDto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        patient.setFirstName(adminUserDto.getFirstName());
        patient.setLastName(adminUserDto.getLastName());
        patient.setPhoneNumber(adminUserDto.getPhoneNumber());
        patient.setDateOfBirth(adminUserDto.getDateOfBirth());
        patient.setGender(adminUserDto.getGender());
        patient.setEnabled(adminUserDto.isEnabled());

        Patient updatedPatient = patientRepository.save(patient);
        return convertToAdminDto(updatedPatient);
    }

    @Transactional
    public void enableDisablePatient(Long patientId, boolean enable) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        patient.setEnabled(enable);
        patientRepository.save(patient);
    }

    @Transactional
    public void deletePatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        patientRepository.delete(patient);
    }

    // ==================== PLATFORM STATISTICS ====================

    public PlatformStatsDto getPlatformStats() {
        PlatformStatsDto stats = new PlatformStatsDto();

        List<Patient> allPatients = patientRepository.findAll();
        List<Appointment> allAppointments = appointmentRepository.findAll();
        List<DoctorAdminSummaryDto> allDoctors = doctorClientService.getAllDoctors();

        stats.setTotalPatients(allPatients.stream()
                .filter(p -> "ROLE_PATIENT".equals(p.getRole()))
                .count());
        stats.setActivePatients(allPatients.stream()
                .filter(p -> "ROLE_PATIENT".equals(p.getRole()) && p.isEnabled())
                .count());

        stats.setTotalDoctors((long) allDoctors.size());
        stats.setVerifiedDoctors(allDoctors.stream()
                .filter(doctor -> Boolean.TRUE.equals(doctor.getVerified()) || "VERIFIED".equalsIgnoreCase(doctor.getVerificationStatus()))
                .count());
        stats.setPendingDoctorVerifications(allDoctors.stream()
                .filter(doctor -> "PENDING".equalsIgnoreCase(doctor.getVerificationStatus()))
                .count());
        stats.setRejectedDoctorVerifications(allDoctors.stream()
                .filter(doctor -> "REJECTED".equalsIgnoreCase(doctor.getVerificationStatus()))
                .count());
        stats.setActiveDoctors(stats.getVerifiedDoctors());

        // Appointment statistics
        stats.setTotalAppointments((long) allAppointments.size());
        stats.setCompletedAppointments(allAppointments.stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .count());
        stats.setCancelledAppointments(allAppointments.stream()
                .filter(a -> "CANCELLED".equalsIgnoreCase(a.getStatus()))
                .count());

        Map<String, Long> appointmentsByStatus = allAppointments.stream()
                .filter(a -> a.getStatus() != null && !a.getStatus().isBlank())
                .collect(Collectors.groupingBy(
                        a -> a.getStatus().toUpperCase(Locale.ROOT),
                        Collectors.counting()
                ));
        stats.setAppointmentsByStatus(appointmentsByStatus);

        // Revenue statistics from local appointments
        double totalRevenue = allAppointments.stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()) && "PAID".equalsIgnoreCase(a.getPaymentStatus()))
                .mapToDouble(a -> a.getConsultationFee() != null ? a.getConsultationFee() : 0)
                .sum();
        stats.setTotalRevenue(totalRevenue);
        stats.setPlatformFees(totalRevenue * 0.10);

        // Patients by month
        Map<String, Long> patientsByMonth = new HashMap<>();
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        allPatients.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(sixMonthsAgo))
                .forEach(p -> {
                    String month = p.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"));
                    patientsByMonth.put(month, patientsByMonth.getOrDefault(month, 0L) + 1);
                });
        stats.setPatientsByMonth(patientsByMonth);

        Map<String, Long> doctorsBySpecialization = allDoctors.stream()
                .filter(doctor -> doctor.getMainSpecialization() != null && !doctor.getMainSpecialization().isBlank())
                .collect(Collectors.groupingBy(
                        DoctorAdminSummaryDto::getMainSpecialization,
                        Collectors.counting()
                ));
        stats.setDoctorsBySpecialization(doctorsBySpecialization);

        return stats;
    }

    // ==================== HELPER METHODS ====================

    private AdminUserDto convertToAdminDto(Patient patient) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(patient.getId());
        dto.setEmail(patient.getEmail());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setRole(patient.getRole());
        dto.setDepartment(patient.getDepartment());
        dto.setEmployeeId(patient.getEmployeeId());
        dto.setEnabled(patient.isEnabled());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        return dto;
    }
}
