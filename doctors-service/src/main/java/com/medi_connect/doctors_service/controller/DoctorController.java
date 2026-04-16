package com.medi_connect.doctors_service.controller;

import com.medi_connect.doctors_service.dto.DoctorDto;
import com.medi_connect.doctors_service.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
