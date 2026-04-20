package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.AppointmentDto;
import com.medi_connect.doctors_service.dto.DoctorRelevantReportDto;
import com.medi_connect.doctors_service.dto.MedicalReportDto;
import com.medi_connect.doctors_service.entity.Doctor;
import com.medi_connect.doctors_service.entity.PatientReport;
import com.medi_connect.doctors_service.repository.DoctorRepository;
import com.medi_connect.doctors_service.repository.PatientReportRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientReportService {

    private final PatientReportRepository patientReportRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentClientService appointmentClientService;
    private final MedicalReportClientService medicalReportClientService;

    public PatientReportService(PatientReportRepository patientReportRepository,
                                DoctorRepository doctorRepository,
                                AppointmentClientService appointmentClientService,
                                MedicalReportClientService medicalReportClientService) {
        this.patientReportRepository = patientReportRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentClientService = appointmentClientService;
        this.medicalReportClientService = medicalReportClientService;
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

    public List<DoctorRelevantReportDto> getRelevantReportsForCurrentDoctor() {
        Doctor doctor = getCurrentDoctor();
        List<AppointmentDto> appointments = appointmentClientService.getAppointmentsByDoctorId(doctor.getId());

        Map<Long, AppointmentDto> appointmentByPatientId = appointments.stream()
                .filter(appointment -> appointment.getPatientId() != null)
                .collect(Collectors.toMap(
                        AppointmentDto::getPatientId,
                        appointment -> appointment,
                        (first, second) -> {
                            if (first.getAppointmentDate() == null) {
                                return second;
                            }
                            if (second.getAppointmentDate() == null) {
                                return first;
                            }
                            return first.getAppointmentDate().isAfter(second.getAppointmentDate()) ? first : second;
                        },
                        LinkedHashMap::new
                ));

        List<MedicalReportDto> reports = medicalReportClientService.getReportsByDoctorId(doctor.getId());

        return reports.stream()
                .sorted(Comparator.comparing(
                        MedicalReportDto::getUploadedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .filter(report -> appointmentByPatientId.containsKey(report.getPatientId()))
                .map(report -> mapRelevantReport(report, appointmentByPatientId.get(report.getPatientId())))
                .toList();
    }

    private DoctorRelevantReportDto mapRelevantReport(MedicalReportDto report, AppointmentDto appointment) {
        String patientName = report.getPatientName();
        if ((patientName == null || patientName.isBlank()) && appointment != null) {
            patientName = appointment.getPatientName();
        }

        return DoctorRelevantReportDto.builder()
                .id(report.getId())
                .patientId(report.getPatientId())
                .patientName(patientName != null ? patientName : "Patient #" + report.getPatientId())
                .age(report.getPatientAge())
                .gender(report.getPatientGender())
                .reportName(report.getTitle())
                .reportType(resolveReportType(report))
                .reportUrl(report.getFilePath())
                .notes(report.getDescription())
                .uploadedDate(report.getUploadedAt() != null
                        ? report.getUploadedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        : null)
                .fileType(report.getFileType())
                .fileSize(report.getFileSize())
                .build();
    }

    private String resolveReportType(MedicalReportDto report) {
        if (report.getFileType() != null && !report.getFileType().isBlank()) {
            String[] parts = report.getFileType().split("/");
            String label = parts.length > 1 ? parts[1] : parts[0];
            return label.toUpperCase() + " Report";
        }

        return "Medical Report";
    }

    private Doctor getCurrentDoctor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Doctor authentication not found");
        }

        return doctorRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }
}
