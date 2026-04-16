package com.medi_connect.patients_service.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AdminAggregatedDto {
    // From Patient Service
    private List<AdminUserDto> patients;
    private Long totalPatients;
    private Long activePatients;

    // From Appointment Service
    private List<AppointmentDto> appointments;
    private Long totalAppointments;
    private Map<String, Object> appointmentStats;

    // From Doctor Service
    private List<DoctorVerificationRequestDto> doctors;
    private Long totalDoctors;
    private List<DoctorVerificationRequestDto> pendingVerifications;

    // From Payment Service
    private List<FinancialTransactionDto> transactions;
    private Double totalRevenue;
    private Double platformFees;

    // Aggregated Platform Stats
    private PlatformStatsDto platformStats;
}