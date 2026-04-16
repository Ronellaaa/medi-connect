package com.medi_connect.auth_service.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PatientProfileDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String gender;
    private String address;
    private String bloodGroup;
    private String emergencyContact;
    private String role;
    private boolean enabled;

}
