package com.medi_connect.doctors_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String templateName;

    private String diagnosis;

    @Column(length = 2000)
    private String medicines;

    @Column(length = 2000)
    private String instructions;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
}