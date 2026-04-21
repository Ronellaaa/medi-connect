package com.medi_connect.doctors_service.controller;

import com.medi_connect.doctors_service.dto.DoctorDto;
import com.medi_connect.doctors_service.dto.DoctorVerificationUpdateDto;
import com.medi_connect.doctors_service.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor

public class DoctorController {
    private  final DoctorService doctorService;


    @PostMapping
    public DoctorDto createDoctor(@RequestBody DoctorDto doctor){
        return  doctorService.createDoctor(doctor);
    }

  @GetMapping
  public List<DoctorDto> getAllDoctors() {
        return doctorService.getAllDoctors();
  }

    @GetMapping("/by-email")
    public ResponseEntity<DoctorDto> getDoctorByEmail(@RequestParam String email) {
        return doctorService.getDoctorByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
public ResponseEntity<DoctorDto> getDoctor(@PathVariable Long id) {
    return doctorService.getDoctorById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

    @GetMapping("/admin/verification")
    public ResponseEntity<List<DoctorDto>> getDoctorsForVerification(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(doctorService.getDoctorsForVerification(status));
    }

    @PatchMapping("/admin/{id}/verification")
    public ResponseEntity<?> updateVerification(@PathVariable Long id,
                                                @RequestBody DoctorVerificationUpdateDto verificationUpdate,
                                                Authentication authentication) {
        try {
            return doctorService.updateVerification(id, verificationUpdate, authentication.getName())
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DoctorDto> updateDoctorPartially(@PathVariable Long id, @RequestBody DoctorDto doctor){
 return doctorService.updateDoctorPartially(id,doctor)
         .map(ResponseEntity::ok)
         .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {
        boolean deleted = doctorService.deleteDoctor(id);

        if (deleted) {
            return ResponseEntity.ok("Doctor deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
