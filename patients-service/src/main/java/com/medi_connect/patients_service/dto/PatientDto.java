package com.medi_connect.patients_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String bloodGroup;
    private String emergencyContact;
    private String role;
    private boolean enabled;
}