package com.medi_connect.doctors_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorRelevantReportDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Integer age;
    private String gender;
    private String reportName;
    private String reportType;
    private String reportUrl;
    private String notes;
    private String uploadedDate;
    private String fileType;
    private Long fileSize;
}
