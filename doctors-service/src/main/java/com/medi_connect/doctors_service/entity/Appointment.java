package com.medi_connect.doctors_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@Table(name = "appointment")
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Appointment {
    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)
    private Long id;
    private  Long patientId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reason;
    private String status; //Pending, Accepted, Rejected
    private String urgencyLevel;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    Doctor doctor;



}
