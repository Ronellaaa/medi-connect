package com.medi_connect.patients_service.Controller;

import com.medi_connect.patients_service.Service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @GetMapping("/my-prescriptions")
    public ResponseEntity<?> getMyPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getMyPrescriptions());
    }
}