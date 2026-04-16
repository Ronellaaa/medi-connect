package com.medi_connect.doctors_service.repository;

import com.medi_connect.doctors_service.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByStatus(String status);
    long countByStatus(String status);
    long countByUrgencyLevel(String urgencyLevel);
}
