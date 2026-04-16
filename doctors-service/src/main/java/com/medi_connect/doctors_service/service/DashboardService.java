package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.repository.AppointmentRepository;
import com.medi_connect.doctors_service.repository.AvailabilityRepository;
import com.medi_connect.doctors_service.repository.DoctorRepository;
import com.medi_connect.doctors_service.repository.PatientReportRepository;
import com.medi_connect.doctors_service.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientReportRepository patientReportRepository;
    private final AvailabilityRepository availabilityRepository;

    public DashboardService(
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            PrescriptionRepository prescriptionRepository,
            PatientReportRepository patientReportRepository,
            AvailabilityRepository availabilityRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.patientReportRepository = patientReportRepository;
        this.availabilityRepository = availabilityRepository;
    }

    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        summary.put("totalDoctors", doctorRepository.count());
        summary.put("totalAppointments", appointmentRepository.count());
        summary.put("pendingAppointments", appointmentRepository.countByStatus("PENDING"));
        summary.put("acceptedAppointments", appointmentRepository.countByStatus("ACCEPTED"));
        summary.put("rejectedAppointments", appointmentRepository.countByStatus("REJECTED"));
        summary.put("highUrgencyAppointments", appointmentRepository.countByUrgencyLevel("HIGH"));
        summary.put("totalPrescriptions", prescriptionRepository.count());
        summary.put("totalReports", patientReportRepository.count());
        summary.put("totalAvailabilitySlots", availabilityRepository.count());

        return summary;
    }
}