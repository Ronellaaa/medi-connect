package com.medi_connect.doctors_service.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Setter
@Getter
@Table(name="prescription")
@RequiredArgsConstructor
@AllArgsConstructor
@Builder

public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    private Long patientId;

    @Column(name = "appointment_id", length = 64)
    private String appointmentId;

    private String diagnosis;

    @Column(length = 2000)
    private String medicines;

    @Column(length = 2000)
    private String instructions;

    private LocalDate issuedDate;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
}
