package com.medi_connect.patients_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AdminUserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role;
    private String department;
    private String employeeId;
    private boolean enabled;
    private LocalDate dateOfBirth;
    private String gender;
}