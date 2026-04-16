package com.medi_connect.patients_service.Repository;

import com.medi_connect.patients_service.Model.Prescription;
import com.medi_connect.patients_service.Model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatient(Patient patient);
    List<Prescription> findByPatientId(Long patientId);
}