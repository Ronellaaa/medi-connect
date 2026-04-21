package com.medi_connect.doctors_service.repository;

import com.medi_connect.doctors_service.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);
    List<Doctor> findByVerificationStatusOrderByFullNameAsc(String verificationStatus);
}
