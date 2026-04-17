package com.medi_connect.doctors_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="doctor")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String fullName;
    private String email;
    private String phone;
    private String mainSpecialization;
    private String additionalSpecialization;
    private String qualifications;
    private Integer experienceYears;
    private String license;
    private String clinic;
    private Double consultationFee;
    private String availability;
    private String languages;


    @Column(length = 1000)
    private String bio;

}
