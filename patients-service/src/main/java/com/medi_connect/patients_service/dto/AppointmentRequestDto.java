package com.medi_connect.patients_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequestDto {
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private LocalDateTime appointmentDate;
    private String symptoms;
    private String notes;
    private Double consultationFee;
}