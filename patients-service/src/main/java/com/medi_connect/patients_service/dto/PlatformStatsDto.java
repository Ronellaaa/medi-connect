package com.medi_connect.patients_service.dto;

import lombok.Data;
import java.util.Map;

@Data
public class PlatformStatsDto {
    private Long totalPatients;
    private Long activePatients;
    private Long totalDoctors;
    private Long activeDoctors;
    private Long verifiedDoctors;
    private Long pendingDoctorVerifications;
    private Long rejectedDoctorVerifications;
    private Long totalAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Double totalRevenue;
    private Double platformFees;
    private Map<String, Long> appointmentsByStatus;
    private Map<String, Long> patientsByMonth;
    private Map<String, Long> doctorsBySpecialization;
}
