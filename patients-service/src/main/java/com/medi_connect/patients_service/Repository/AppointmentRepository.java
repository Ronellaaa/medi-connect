package com.medi_connect.patients_service.Repository;

import com.medi_connect.patients_service.Model.Appointment;
import com.medi_connect.patients_service.Model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    Optional<Appointment> findByIdAndPatientId(Long id, Long patientId);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentDate BETWEEN :start AND :end")
    List<Appointment> findDoctorAppointmentsInRange(@Param("doctorId") Long doctorId,
                                                    @Param("start") LocalDateTime start,
                                                    @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentDate = :date AND a.status != 'CANCELLED'")
    Long countAppointmentsForDoctorOnDate(@Param("doctorId") Long doctorId, @Param("date") LocalDateTime date);
}
