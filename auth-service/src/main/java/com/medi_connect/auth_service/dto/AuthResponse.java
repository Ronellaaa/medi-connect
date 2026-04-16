package com.medi_connect.auth_service.dto;

import com.medi_connect.auth_service.entity.UserRole;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private UserRole role;
    private Long profileId;
    private String email;
    private DoctorProfileDto doctor;
}
