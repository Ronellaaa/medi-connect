package com.medi_connect.appointment_service.service;

import com.medi_connect.appointment_service.entity.Slot;
import com.medi_connect.appointment_service.repository.SlotRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SlotService {

    private final SlotRepository slotRepository;

    public SlotService(SlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    public List<Slot> generateSlots(
            Long doctorId,
            LocalDate availabilityDate,
            LocalTime startTime,
            LocalTime endTime,
            Integer slotDuration,
            String hospitalOrClinic,
            String consultationType
    ) {
        validateGenerateRequest(doctorId, availabilityDate, startTime, endTime, slotDuration);
        releaseExpiredHolds();

        LocalDateTime windowStart = LocalDateTime.of(availabilityDate, startTime);
        LocalDateTime windowEnd = LocalDateTime.of(availabilityDate, endTime);

        long totalMinutes = Duration.between(windowStart, windowEnd).toMinutes();
        if (totalMinutes < slotDuration) {
            throw new RuntimeException("Availability window must fit at least one slot");
        }

        List<Slot> existingSlots = slotRepository.findByDoctorIdAndSlotStartBetween(
                doctorId,
                windowStart,
                windowEnd.minusSeconds(1)
        );

        boolean hasActiveSlots = existingSlots.stream().anyMatch(slot ->
                slot.getStatus() == Slot.Status.BOOKED || slot.getStatus() == Slot.Status.HELD
        );
        if (hasActiveSlots) {
            throw new RuntimeException("Cannot regenerate slots while held or booked slots exist in this window");
        }

        if (!existingSlots.isEmpty()) {
            slotRepository.deleteAll(existingSlots);
        }

        List<Slot> slots = new ArrayList<>();
        LocalDateTime cursor = windowStart;

        while (!cursor.plusMinutes(slotDuration).isAfter(windowEnd)) {
            Slot slot = new Slot();
            slot.setDoctorId(doctorId);
            slot.setAvailabilityDate(availabilityDate);
            slot.setSlotStart(cursor);
            slot.setSlotEnd(cursor.plusMinutes(slotDuration));
            slot.setSlotDuration(slotDuration);
            slot.setHospitalOrClinic(hospitalOrClinic);
            slot.setConsultationType(consultationType);
            slot.setStatus(Slot.Status.AVAILABLE);

            slots.add(slot);
            cursor = cursor.plusMinutes(slotDuration);
        }

        return slotRepository.saveAll(slots);
    }

    public List<Slot> getAvailableSlots(Long doctorId, LocalDate availabilityDate){
        releaseExpiredHolds();

        if (doctorId == null || availabilityDate == null) {
            throw new RuntimeException("Doctor and date are required");
        }

        return slotRepository.findByDoctorIdAndAvailabilityDateAndStatus(
                doctorId,
                availabilityDate,
                Slot.Status.AVAILABLE
        );

    }

    public Slot holdSlot(UUID slotId){
        releaseExpiredHolds();

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getStatus() != Slot.Status.AVAILABLE) {
            throw new RuntimeException("Slot is not available");
        }

        slot.setStatus(Slot.Status.HELD);
        slot.setHoldExpiresAt(LocalDateTime.now().plusMinutes(5));

        return slotRepository.save(slot);

    }

    public Slot markSlotBooked(UUID slotId){
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getStatus() != Slot.Status.HELD) {
            throw new RuntimeException("Only held slots can be booked");
        }
        if (slot.getHoldExpiresAt() != null && slot.getHoldExpiresAt().isBefore(LocalDateTime.now())) {
            slot.setStatus(Slot.Status.AVAILABLE);
            slot.setHoldExpiresAt(null);
            slotRepository.save(slot);
            throw new RuntimeException("Slot hold has expired");
        }

        slot.setStatus(Slot.Status.BOOKED);
        slot.setHoldExpiresAt(null);

        return slotRepository.save(slot);
    }

    public Slot releaseSlot(UUID slotId){
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        slot.setStatus(Slot.Status.AVAILABLE);
        slot.setHoldExpiresAt(null);

        return slotRepository.save(slot);
    }

    public void clearSlotsForWindow(
            Long doctorId,
            LocalDate availabilityDate,
            LocalTime startTime,
            LocalTime endTime
    ) {
        if (doctorId == null || availabilityDate == null || startTime == null || endTime == null) {
            throw new RuntimeException("Doctor, date, start time, and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("End time must be later than start time");
        }

        releaseExpiredHolds();

        LocalDateTime windowStart = LocalDateTime.of(availabilityDate, startTime);
        LocalDateTime windowEnd = LocalDateTime.of(availabilityDate, endTime);

        List<Slot> existingSlots = slotRepository.findByDoctorIdAndSlotStartBetween(
                doctorId,
                windowStart,
                windowEnd.minusSeconds(1)
        );

        boolean hasActiveSlots = existingSlots.stream().anyMatch(slot ->
                slot.getStatus() == Slot.Status.BOOKED || slot.getStatus() == Slot.Status.HELD
        );
        if (hasActiveSlots) {
            throw new RuntimeException("Cannot clear slots while held or booked slots exist in this window");
        }

        if (!existingSlots.isEmpty()) {
            slotRepository.deleteAll(existingSlots);
        }
    }

    public void releaseExpiredHolds() {
        List<Slot> expiredSlots = slotRepository.findByStatusAndHoldExpiresAtBefore(
                Slot.Status.HELD,
                LocalDateTime.now()
        );

        for (Slot slot : expiredSlots) {
            slot.setStatus(Slot.Status.AVAILABLE);
            slot.setHoldExpiresAt(null);
        }

        if (!expiredSlots.isEmpty()) {
            slotRepository.saveAll(expiredSlots);
        }
    }

    private void validateGenerateRequest(
            Long doctorId,
            LocalDate availabilityDate,
            LocalTime startTime,
            LocalTime endTime,
            Integer slotDuration

    ){
        if (doctorId == null) {
            throw new RuntimeException("Doctor id is required");
        }
        if (availabilityDate == null) {
            throw new RuntimeException("Availability date is required");
        }
        if (startTime == null || endTime == null) {
            throw new RuntimeException("Start time and end time are required");
        }
        if (slotDuration == null || slotDuration <= 0) {
            throw new RuntimeException("Slot duration must be positive");
        }
        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("End time must be later than start time");
        }

    }



}
