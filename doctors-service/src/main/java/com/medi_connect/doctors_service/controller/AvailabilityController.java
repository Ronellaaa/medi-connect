package com.medi_connect.doctors_service.controller;

import com.medi_connect.doctors_service.dto.AvailabilityDto;
import com.medi_connect.doctors_service.entity.Availability;
import com.medi_connect.doctors_service.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor

public class AvailabilityController {
 private final AvailabilityService availabilityService;

 @PostMapping
 public Availability createAvailability(@RequestBody Availability availability){
     return availabilityService.createAvailability(availability);
 }

 @GetMapping
    public List<AvailabilityDto> getAllAvailability(){
     return availabilityService.getAllAvailability();
 }

 @GetMapping("/doctor/{doctorId}")
 public List<AvailabilityDto> getAvailabilityByDoctor(@PathVariable Long doctorId) {
     return availabilityService.getAvailabilityByDoctorId(doctorId);
 }

    @GetMapping("/suggestion/{doctorId}")
    public Map<String, String> getAvailabilitySuggestion(@PathVariable Long doctorId) {
        return availabilityService.getAvailabilitySuggestion(doctorId);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Availability> updateAvailability(@PathVariable Long id, @RequestBody Availability availability) {
        return availabilityService.updateAvailability(id, availability)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAvailability(@PathVariable Long id) {
        boolean deleted = availabilityService.deleteAvailability(id);

        if (deleted) {
            return ResponseEntity.ok("Availability deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }


    }

}
