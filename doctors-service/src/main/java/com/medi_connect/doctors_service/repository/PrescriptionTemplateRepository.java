package com.medi_connect.doctors_service.repository;

import com.medi_connect.doctors_service.entity.PrescriptionTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionTemplateRepository extends JpaRepository<PrescriptionTemplate, Long> {
    List<PrescriptionTemplate> findByDoctorId(Long doctorId);
}