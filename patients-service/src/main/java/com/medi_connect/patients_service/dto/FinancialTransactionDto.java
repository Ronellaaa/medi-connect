package com.medi_connect.patients_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FinancialTransactionDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private Double amount;
    private String paymentMethod;
    private String paymentId;
    private String status;
    private LocalDateTime transactionDate;
    private String description;
}