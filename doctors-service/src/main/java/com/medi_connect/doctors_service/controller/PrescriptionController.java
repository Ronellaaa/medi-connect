package com.medi_connect.doctors_service.controller;

import com.medi_connect.doctors_service.entity.Prescription;
import com.medi_connect.doctors_service.service.PrescriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public Prescription createPrescription(@RequestBody Prescription prescription) {
        return prescriptionService.createPrescription(prescription);
    }

    @GetMapping
    public List<Prescription> getAllPrescriptions() {
        return prescriptionService.getAllPrescriptions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable Long id) {
        return prescriptionService.getPrescriptionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Prescription> getPrescriptionsByDoctor(@PathVariable Long doctorId) {
        return prescriptionService.getPrescriptionsByDoctorId(doctorId);
    }

    @GetMapping("/patient/{patientId}")
    public List<Prescription> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return prescriptionService.getPrescriptionsByPatientId(patientId);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Prescription> updatePrescription(@PathVariable Long id,
                                                           @RequestBody Prescription prescription) {
        return prescriptionService.updatePrescription(id, prescription)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePrescription(@PathVariable Long id) {
        boolean deleted = prescriptionService.deletePrescription(id);

        if (deleted) {
            return ResponseEntity.ok("Prescription deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}