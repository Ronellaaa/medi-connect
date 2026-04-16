package com.medi_connect.patients_service.dto;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MedicalReportDto {
    private Long id;
    private String title;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private String description;
    private LocalDateTime reportDate;
    private LocalDateTime uploadedAt;
}
