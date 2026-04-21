package com.medi_connect.appointment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table (name = "slots")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor

public class Slot {
    @Id
    @GeneratedValue (strategy = GenerationType.UUID)
    private UUID id;
    private Long doctorId;
    private LocalDate availabilityDate;
    private LocalDateTime slotStart;
    private LocalDateTime slotEnd;
    private Integer slotDuration;
    private String hospitalOrClinic;
    private String consultationType;
    @Enumerated(EnumType.STRING)
    private Status status;
    private LocalDateTime holdExpiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum Status {
        AVAILABLE,
        HELD,
        BOOKED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = Status.AVAILABLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
