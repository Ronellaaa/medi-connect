package com.medi_connect.auth_service.service;

import com.medi_connect.auth_service.client.DoctorServiceClient;
import com.medi_connect.auth_service.client.PatientServiceClient;
import com.medi_connect.auth_service.config.JwtService;
import com.medi_connect.auth_service.dto.*;
import com.medi_connect.auth_service.entity.AuthUser;
import com.medi_connect.auth_service.entity.UserRole;
import com.medi_connect.auth_service.repository.AuthUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final DoctorServiceClient doctorServiceClient;
    private final PatientServiceClient patientServiceClient;

    public AuthResponse register(RegisterRequest request) {
        if (authUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        DoctorProfileDto doctorProfile = null;
        Long profileId = null;

        if (request.getRole() == UserRole.DOCTOR) {
            doctorProfile = doctorServiceClient.createDoctorProfile(request);
            profileId = doctorProfile != null ? doctorProfile.getId() : null;
        } else if (request.getRole() == UserRole.PATIENT) {
            PatientProfileDto patientProfile = patientServiceClient.createPatientProfile(request);
            profileId = patientProfile != null ? patientProfile.getId() : null;
        }

        AuthUser savedUser = authUserRepository.save(AuthUser.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .profileId(profileId)
                .build());

        return buildResponse(savedUser, doctorProfile);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        AuthUser user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != request.getRole()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected role does not match this account");
        }

        DoctorProfileDto doctorProfile = null;
        if (user.getRole() == UserRole.DOCTOR) {
            doctorProfile = doctorServiceClient.findDoctorByEmail(user.getEmail());
            if (doctorProfile != null && doctorProfile.getId() != null && user.getProfileId() == null) {
                user.setProfileId(doctorProfile.getId());
                user = authUserRepository.save(user);
            }
        }

        return buildResponse(user, doctorProfile);
    }

    private AuthResponse buildResponse(AuthUser user, DoctorProfileDto doctorProfile) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .userId(user.getId())
                .role(user.getRole())
                .profileId(user.getProfileId())
                .email(user.getEmail())
                .doctor(doctorProfile)
                .build();
    }
}
