package com.medi_connect.patients_service.dto;

import lombok.Data;

@Data
public class AppointmentLookupDto {
    private String id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String appointmentDate;
    private String status;
}
