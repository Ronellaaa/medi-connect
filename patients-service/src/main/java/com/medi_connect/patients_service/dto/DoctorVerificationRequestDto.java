package com.medi_connect.patients_service.dto;

import lombok.Data;

@Data
public class DoctorVerificationRequestDto {
    private Long doctorId;
    private String doctorName;
    private String specialty;
    private String email;
    private String phoneNumber;
    private String status;
    private String remarks;
    private String verifiedBy;
    private String verificationDate;
}