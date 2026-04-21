package com.medi_connect.appointment_service.repository;

import com.medi_connect.appointment_service.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SlotRepository extends JpaRepository<Slot, UUID> {

    List<Slot> findByDoctorIdAndAvailabilityDate(Long doctorId, LocalDate availabilityDate);
    List<Slot> findByDoctorIdAndAvailabilityDateAndStatus(
            Long doctorId,
            LocalDate availabilityDate,
            Slot.Status status
    );
    List<Slot> findByDoctorIdAndSlotStartBetween(Long doctorId, LocalDateTime start, LocalDateTime end);
    Optional<Slot> findByIdAndStatus(UUID id, Slot.Status status);
    List<Slot> findByStatusAndHoldExpiresAtBefore(Slot.Status status, LocalDateTime cutoff);

}
