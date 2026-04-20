package com.medi_connect.notification_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor

public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID appointmentId;

    private Long recipientId;
    private String recipientName;

    private String recipientPhoneNumber;
    private String recipientEmail;


    private String type; //SMS / Email
    private String message;
    private String subject; // Email subject

    private String notificationStatus; // SENT / PARTIAL / FAILED / PENDING
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        createdAt = LocalDateTime.now();
        if (notificationStatus == null) {
            notificationStatus = "PENDING";
        }

    }
}
