package com.medi_connect.patients_service.Repository;

import com.medi_connect.patients_service.Model.MedicalReport;
import com.medi_connect.patients_service.Model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByPatient(Patient patient);
    List<MedicalReport> findByPatientId(Long patientId);
}