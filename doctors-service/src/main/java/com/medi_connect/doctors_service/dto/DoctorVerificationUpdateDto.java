package com.medi_connect.doctors_service.dto;

import lombok.Data;

@Data
public class DoctorVerificationUpdateDto {
    private String status;
    private String remarks;
}
