package com.medi_connect.patients_service.dto;

import lombok.Data;

@Data
public class DoctorAdminSummaryDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String mainSpecialization;
    private Boolean verified;
    private String verificationStatus;
}
