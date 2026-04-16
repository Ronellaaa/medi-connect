package com.medi_connect.doctors_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "availability")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Availability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;

    private String hospitalOrClinic;

    private String consultationType; // IN_PERSON / ONLINE / BOTH

    private Boolean available;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
}

