package com.medi_connect.doctors_service.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorDto {
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
    private Double consultationFee;
    private String availability;
    private String languages;
    private String bio;
    private Boolean verified;
    private String verificationStatus;
    private String verificationRemarks;
    private String verifiedBy;
    private LocalDateTime verificationDate;
}
