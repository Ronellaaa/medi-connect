package com.medi_connect.patients_service.Service;

import com.medi_connect.patients_service.dto.MedicalReportDto;
import com.medi_connect.patients_service.dto.AppointmentLookupDto;
import com.medi_connect.patients_service.Model.MedicalReport;
import com.medi_connect.patients_service.Model.Patient;
import com.medi_connect.patients_service.Repository.MedicalReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MedicalReportService {

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    @Autowired
    private PatientService patientService;

    @Autowired
    private AppointmentClientService appointmentClientService;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public MedicalReportDto uploadReport(String appointmentId, String title, String description, MultipartFile file) throws IOException {
        Patient currentPatient = patientService.getCurrentPatient();
        AppointmentLookupDto appointment = appointmentClientService.getAppointmentById(appointmentId);

        if (appointment == null) {
            throw new RuntimeException("Appointment not found");
        }

        if (!currentPatient.getId().equals(appointment.getPatientId())) {
            throw new RuntimeException("This appointment does not belong to the current patient");
        }

        Path uploadPath = Paths.get(uploadDir, "reports", currentPatient.getId().toString());
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(filename);

        Files.copy(file.getInputStream(), filePath);

        MedicalReport report = new MedicalReport();
        report.setPatient(currentPatient);
        report.setAppointmentId(appointmentId);
        report.setDoctorId(appointment.getDoctorId());
        report.setTitle(title);
        report.setDescription(description);
        report.setFilePath(filePath.toString());
        report.setFileType(file.getContentType());
        report.setFileSize(file.getSize());
        report.setUploadedBy(currentPatient.getFirstName() + " " + currentPatient.getLastName());

        MedicalReport savedReport = medicalReportRepository.save(report);
        return convertToDto(savedReport);
    }

    public List<MedicalReportDto> getMyReports() {
        Patient currentPatient = patientService.getCurrentPatient();
        List<MedicalReport> reports = medicalReportRepository.findByPatient(currentPatient);
        return reports.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MedicalReportDto> getReportsByPatientIds(List<Long> patientIds) {
        if (patientIds == null || patientIds.isEmpty()) {
            return List.of();
        }

        return medicalReportRepository.findByPatientIdIn(patientIds).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MedicalReportDto> getReportsByDoctorId(Long doctorId) {
        if (doctorId == null) {
            return List.of();
        }

        return medicalReportRepository.findByDoctorId(doctorId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void deleteReport(Long id) throws IOException {
        Patient currentPatient = patientService.getCurrentPatient();
        MedicalReport report = medicalReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getPatient().getId().equals(currentPatient.getId())) {
            throw new RuntimeException("Unauthorized access to report");
        }

        Path filePath = Paths.get(report.getFilePath());
        Files.deleteIfExists(filePath);

        medicalReportRepository.delete(report);
    }

    private MedicalReportDto convertToDto(MedicalReport report) {
        MedicalReportDto dto = new MedicalReportDto();
        dto.setId(report.getId());
        dto.setPatientId(report.getPatient().getId());
        dto.setDoctorId(report.getDoctorId());
        dto.setAppointmentId(report.getAppointmentId());
        dto.setPatientName(report.getPatient().getFirstName() + " " + report.getPatient().getLastName());
        dto.setPatientAge(calculateAge(report.getPatient().getDateOfBirth()));
        dto.setPatientGender(report.getPatient().getGender());
        dto.setTitle(report.getTitle());
        dto.setFilePath(report.getFilePath());
        dto.setFileType(report.getFileType());
        dto.setFileSize(report.getFileSize());
        dto.setDescription(report.getDescription());
        dto.setReportDate(report.getReportDate());
        dto.setUploadedAt(report.getUploadedAt());
        return dto;
    }

    private Integer calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return null;
        }

        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }
}
