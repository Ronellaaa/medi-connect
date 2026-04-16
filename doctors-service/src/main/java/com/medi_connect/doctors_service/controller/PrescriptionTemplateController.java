package com.medi_connect.doctors_service.controller;

import com.medi_connect.doctors_service.entity.PrescriptionTemplate;
import com.medi_connect.doctors_service.service.PrescriptionTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescription-templates")
public class PrescriptionTemplateController {

    private final PrescriptionTemplateService prescriptionTemplateService;

    public PrescriptionTemplateController(PrescriptionTemplateService prescriptionTemplateService) {
        this.prescriptionTemplateService = prescriptionTemplateService;
    }

    @PostMapping
    public PrescriptionTemplate createTemplate(@RequestBody PrescriptionTemplate template) {
        return prescriptionTemplateService.createTemplate(template);
    }

    @GetMapping
    public List<PrescriptionTemplate> getAllTemplates() {
        return prescriptionTemplateService.getAllTemplates();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionTemplate> getTemplateById(@PathVariable Long id) {
        return prescriptionTemplateService.getTemplateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctor/{doctorId}")
    public List<PrescriptionTemplate> getTemplatesByDoctor(@PathVariable Long doctorId) {
        return prescriptionTemplateService.getTemplatesByDoctorId(doctorId);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PrescriptionTemplate> updateTemplate(@PathVariable Long id,
                                                               @RequestBody PrescriptionTemplate template) {
        return prescriptionTemplateService.updateTemplate(id, template)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTemplate(@PathVariable Long id) {
        boolean deleted = prescriptionTemplateService.deleteTemplate(id);

        if (deleted) {
            return ResponseEntity.ok("Prescription template deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}