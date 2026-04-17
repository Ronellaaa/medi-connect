package com.medi_connect.appointment_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table (name = "appoinments")
@Getter @Setter @ToString
@NoArgsConstructor
@AllArgsConstructor

public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID )
    private UUID id ;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientphoneNumber;
    private Integer patientAge;
    private Long doctorId;
    private String doctorName;
    private String specialty;
    private LocalDateTime appointmentDate;
    private String status; // PENDING, CONFIRMED, CANCELLED
    private String paymentStatus;
    private String paymentId;
    private BigDecimal paymentAmount;
    private LocalDateTime paidAt;
    private String meetingUrl;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
        if (paymentStatus == null) {
            paymentStatus = "PENDING";
        }
    }


}
