package com.medi_connect.patients_service.Controller;

import com.medi_connect.patients_service.dto.PatientDto;
import com.medi_connect.patients_service.Service.PatientService;
import com.medi_connect.patients_service.dto.RegisterRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientService patientService;

    // =========================
    // INTERNAL CREATE (NO AUTH)
    // =========================
    @PostMapping("/internal/create")
    public ResponseEntity<?> createPatientInternal(@RequestBody RegisterRequestDto dto) {
        try {
            return ResponseEntity.ok(patientService.registerPatient(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================
    // GET PROFILE
    // =========================
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            return ResponseEntity.ok(patientService.getPatientProfile());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================
    // UPDATE PROFILE
    // =========================
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody PatientDto patientDto) {
        try {
            return ResponseEntity.ok(patientService.updatePatientProfile(patientDto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}