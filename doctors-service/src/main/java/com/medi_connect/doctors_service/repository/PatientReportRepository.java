package com.medi_connect.doctors_service.repository;

import com.medi_connect.doctors_service.entity.PatientReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.parameters.P;

import java.util.List;

public interface PatientReportRepository  extends JpaRepository<PatientReport,Long> {
    List<PatientReport>  findByPatientId(Long patientId);
    List<PatientReport> findByDoctorId(Long doctorId);
}
