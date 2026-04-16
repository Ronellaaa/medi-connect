package com.medi_connect.payments_service.repository;

import com.medi_connect.payments_service.model.Payment;
import com.medi_connect.payments_service.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    Optional<Payment> findByAppointmentId(String appointmentId);

    List<Payment> findByPatientId(String patientId);

    List<Payment> findByDoctorId(String doctorId);

    List<Payment> findByPatientIdAndStatus(String patientId, PaymentStatus status);

    long countByDoctorIdAndStatus(String doctorId, PaymentStatus status);

    /* */
    Optional<Payment> findByAppointmentIdAndStatus(String appointmentId, PaymentStatus status);

    @Modifying
    void deleteByAppointmentIdAndStatus(String appointmentId, PaymentStatus status);

    boolean existsByAppointmentIdAndStatus(String appointmentId, PaymentStatus status);
}