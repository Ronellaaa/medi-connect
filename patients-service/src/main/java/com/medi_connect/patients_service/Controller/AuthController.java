package com.medi_connect.patients_service.Controller;

import com.medi_connect.patients_service.dto.AuthResponseDto;
import com.medi_connect.patients_service.dto.LoginRequestDto;
import com.medi_connect.patients_service.dto.RegisterRequestDto;
import com.medi_connect.patients_service.Model.Patient;
import com.medi_connect.patients_service.Secutity.JwtUtil;
import com.medi_connect.patients_service.Service.CustomUserDetailsService;
import com.medi_connect.patients_service.Service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PatientService patientService;

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequest) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(loginRequest.getEmail());

        String jwt = jwtUtil.generateToken(userDetails);

        Patient patient = patientService.getPatientByEmail(loginRequest.getEmail());

        return ResponseEntity.ok(new AuthResponseDto(
                jwt,
                "Bearer",
                patient.getId(),
                patient.getEmail(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getRole()
        ));
    }

    // =========================
    // REGISTER PATIENT
    // =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDto request) {

        try {
            Patient patient = patientService.registerPatient(request);
            return ResponseEntity.ok(patientService.convertToDto(patient));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================
    // REGISTER ADMIN
    // =========================
    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody RegisterRequestDto request) {

        try {
            Patient admin = patientService.registerAdmin(request);
            return ResponseEntity.ok(patientService.convertToDto(admin));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}