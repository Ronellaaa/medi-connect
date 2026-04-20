package com.medi_connect.doctors_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicalReportDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String title;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private String description;
    private LocalDateTime reportDate;
    private LocalDateTime uploadedAt;
}
