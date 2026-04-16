package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.entity.Doctor;
import com.medi_connect.doctors_service.entity.PatientReport;
import com.medi_connect.doctors_service.repository.DoctorRepository;
import com.medi_connect.doctors_service.repository.PatientReportRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PatientReportService {

    private final PatientReportRepository patientReportRepository;
    private final DoctorRepository doctorRepository;

    public PatientReportService(PatientReportRepository patientReportRepository,
                                DoctorRepository doctorRepository) {
        this.patientReportRepository = patientReportRepository;
        this.doctorRepository = doctorRepository;
    }

    public PatientReport createReport(PatientReport patientReport) {
        Long doctorId = patientReport.getDoctor().getId();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        patientReport.setDoctor(doctor);

        if (patientReport.getUploadedDate() == null) {
            patientReport.setUploadedDate(LocalDate.now());
        }

        return patientReportRepository.save(patientReport);
    }

    public List<PatientReport> getAllReports() {
        return patientReportRepository.findAll();
    }

    public Optional<PatientReport> getReportById(Long id) {
        return patientReportRepository.findById(id);
    }

    public List<PatientReport> getReportsByPatientId(Long patientId) {
        return patientReportRepository.findByPatientId(patientId);
    }

    public List<PatientReport> getReportsByDoctorId(Long doctorId) {
        return patientReportRepository.findByDoctorId(doctorId);
    }

    public Optional<PatientReport> updateReport(Long id, PatientReport updatedReport) {
        return patientReportRepository.findById(id).map(existing -> {

            if (updatedReport.getPatientId() != null) {
                existing.setPatientId(updatedReport.getPatientId());
            }
            if (updatedReport.getReportName() != null) {
                existing.setReportName(updatedReport.getReportName());
            }
            if (updatedReport.getReportType() != null) {
                existing.setReportType(updatedReport.getReportType());
            }
            if (updatedReport.getReportUrl() != null) {
                existing.setReportUrl(updatedReport.getReportUrl());
            }
            if (updatedReport.getNotes() != null) {
                existing.setNotes(updatedReport.getNotes());
            }
            if (updatedReport.getUploadedDate() != null) {
                existing.setUploadedDate(updatedReport.getUploadedDate());
            }

            if (updatedReport.getDoctor() != null && updatedReport.getDoctor().getId() != null) {
                Doctor doctor = doctorRepository.findById(updatedReport.getDoctor().getId())
                        .orElseThrow(() -> new RuntimeException("Doctor not found"));
                existing.setDoctor(doctor);
            }

            return patientReportRepository.save(existing);
        });
    }

    public boolean deleteReport(Long id) {
        if (!patientReportRepository.existsById(id)) {
            return false;
        }
        patientReportRepository.deleteById(id);
        return true;
    }
}