package com.medi_connect.patients_service.Controller;

import com.medi_connect.patients_service.Service.MedicalReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private MedicalReportService medicalReportService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadReport(
            @RequestParam("appointmentId") String appointmentId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(medicalReportService.uploadReport(appointmentId, title, description, file));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-reports")
    public ResponseEntity<?> getMyReports() {
        return ResponseEntity.ok(medicalReportService.getMyReports());
    }

    @GetMapping("/internal/by-patient-ids")
    public ResponseEntity<?> getReportsByPatientIds(@RequestParam List<Long> patientIds) {
        return ResponseEntity.ok(medicalReportService.getReportsByPatientIds(patientIds));
    }

    @GetMapping("/internal/by-doctor/{doctorId}")
    public ResponseEntity<?> getReportsByDoctorId(@PathVariable Long doctorId) {
        return ResponseEntity.ok(medicalReportService.getReportsByDoctorId(doctorId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        try {
            medicalReportService.deleteReport(id);
            return ResponseEntity.ok("Report deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
