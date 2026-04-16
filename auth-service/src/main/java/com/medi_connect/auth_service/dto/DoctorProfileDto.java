package com.medi_connect.auth_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfileDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String mainSpecialization;
    private String additionalSpecialization;
    private String qualifications;
    private Integer experienceYears;
    private String license;
    private String clinic;
    private String consultationFee;
    private String availability;
    private String languages;
    private String bio;
}
