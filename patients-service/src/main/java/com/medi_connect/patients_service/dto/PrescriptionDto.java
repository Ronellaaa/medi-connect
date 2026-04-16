package com.medi_connect.patients_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PrescriptionDto {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private String diagnosis;
    private String medications;
    private String instructions;
    private LocalDateTime validUntil;
    private LocalDateTime issuedAt;
}