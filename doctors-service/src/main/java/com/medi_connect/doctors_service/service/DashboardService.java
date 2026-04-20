package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.AppointmentDto;
import com.medi_connect.doctors_service.repository.AvailabilityRepository;
import com.medi_connect.doctors_service.repository.DoctorRepository;
import com.medi_connect.doctors_service.repository.PatientReportRepository;
import com.medi_connect.doctors_service.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final DoctorRepository doctorRepository;
    private final AppointmentClientService appointmentClientService;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientReportRepository patientReportRepository;
    private final AvailabilityRepository availabilityRepository;

    public DashboardService(
            DoctorRepository doctorRepository,
            AppointmentClientService appointmentClientService,
            PrescriptionRepository prescriptionRepository,
            PatientReportRepository patientReportRepository,
            AvailabilityRepository availabilityRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.appointmentClientService = appointmentClientService;
        this.prescriptionRepository = prescriptionRepository;
        this.patientReportRepository = patientReportRepository;
        this.availabilityRepository = availabilityRepository;
    }

    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        List<AppointmentDto> appointments = appointmentClientService.getAllAppointments();

        summary.put("totalDoctors", doctorRepository.count());
        summary.put("totalAppointments", appointments.size());
        summary.put("pendingAppointments", countByStatus(appointments, "PENDING"));
        summary.put("acceptedAppointments", countByStatus(appointments, "CONFIRMED"));
        summary.put("rejectedAppointments", countByStatus(appointments, "CANCELED"));
        summary.put("highUrgencyAppointments", 0);
        summary.put("totalPrescriptions", prescriptionRepository.count());
        summary.put("totalReports", patientReportRepository.count());
        summary.put("totalAvailabilitySlots", availabilityRepository.count());

        return summary;
    }

    private long countByStatus(List<AppointmentDto> appointments, String status) {
        return appointments.stream()
                .filter(appointment -> status.equalsIgnoreCase(appointment.getStatus()))
                .count();
    }
}
