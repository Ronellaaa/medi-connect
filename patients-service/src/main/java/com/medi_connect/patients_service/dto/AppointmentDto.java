package com.medi_connect.patients_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private LocalDateTime appointmentDate;
    private String status;
    private String symptoms;
    private String notes;
    private Double consultationFee;
    private String paymentStatus;
    private String meetingLink;
    private LocalDateTime createdAt;
}