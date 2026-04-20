package com.medi_connect.doctors_service.controller;

import com.medi_connect.doctors_service.dto.DoctorRelevantReportDto;
import com.medi_connect.doctors_service.entity.PatientReport;
import com.medi_connect.doctors_service.service.PatientReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class PatientReportController {

    private final PatientReportService patientReportService;

    public PatientReportController(PatientReportService patientReportService) {
        this.patientReportService = patientReportService;
    }

    @PostMapping
    public PatientReport createReport(@RequestBody PatientReport patientReport) {
        return patientReportService.createReport(patientReport);
    }

    @GetMapping
    public List<PatientReport> getAllReports() {
        return patientReportService.getAllReports();
    }

    @GetMapping("/relevant")
    public List<DoctorRelevantReportDto> getRelevantReports() {
        return patientReportService.getRelevantReportsForCurrentDoctor();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientReport> getReportById(@PathVariable Long id) {
        return patientReportService.getReportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public List<PatientReport> getReportsByPatient(@PathVariable Long patientId) {
        return patientReportService.getReportsByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<PatientReport> getReportsByDoctor(@PathVariable Long doctorId) {
        return patientReportService.getReportsByDoctorId(doctorId);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PatientReport> updateReport(@PathVariable Long id,
                                                      @RequestBody PatientReport patientReport) {
        return patientReportService.updateReport(id, patientReport)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReport(@PathVariable Long id) {
        boolean deleted = patientReportService.deleteReport(id);

        if (deleted) {
            return ResponseEntity.ok("Report deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
