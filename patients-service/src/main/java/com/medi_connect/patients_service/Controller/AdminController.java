package com.medi_connect.patients_service.Controller;

import com.medi_connect.patients_service.dto.AdminUserDto;
import com.medi_connect.patients_service.dto.PlatformStatsDto;
import com.medi_connect.patients_service.Service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ==================== PATIENT MANAGEMENT ENDPOINTS ====================

    @GetMapping("/patients")
    public ResponseEntity<List<AdminUserDto>> getAllPatients() {
        return ResponseEntity.ok(adminService.getAllPatients());
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<?> getPatientDetails(@PathVariable Long patientId) {
        try {
            return ResponseEntity.ok(adminService.getPatientDetails(patientId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/patients/{patientId}")
    public ResponseEntity<?> updatePatient(@PathVariable Long patientId,
                                           @RequestBody AdminUserDto adminUserDto) {
        try {
            return ResponseEntity.ok(adminService.updatePatientByAdmin(patientId, adminUserDto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/patients/{patientId}/enable")
    public ResponseEntity<?> enablePatient(@PathVariable Long patientId) {
        try {
            adminService.enableDisablePatient(patientId, true);
            return ResponseEntity.ok("Patient enabled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/patients/{patientId}/disable")
    public ResponseEntity<?> disablePatient(@PathVariable Long patientId) {
        try {
            adminService.enableDisablePatient(patientId, false);
            return ResponseEntity.ok("Patient disabled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/patients/{patientId}")
    public ResponseEntity<?> deletePatient(@PathVariable Long patientId) {
        try {
            adminService.deletePatient(patientId);
            return ResponseEntity.ok("Patient deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== DASHBOARD ENDPOINTS ====================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<PlatformStatsDto> getPlatformStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }
}