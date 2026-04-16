package com.medi_connect.auth_service.dto;

import com.medi_connect.auth_service.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    private String phone;

    @NotBlank
    private String password;

    @NotNull
    private UserRole role;

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
