package com.medi_connect.appointment_service.controller;

import com.medi_connect.appointment_service.entity.Slot;
import com.medi_connect.appointment_service.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @PostMapping("/generate")
    public ResponseEntity<List<Slot>> generateSlots(@RequestBody Map<String, Object> payload) {
        Long doctorId = Long.valueOf(payload.get("doctorId").toString());
        LocalDate availabilityDate = LocalDate.parse(payload.get("availabilityDate").toString());
        LocalTime startTime = LocalTime.parse(payload.get("startTime").toString());
        LocalTime endTime = LocalTime.parse(payload.get("endTime").toString());
        Integer slotDuration = Integer.valueOf(payload.get("slotDuration").toString());
        String hospitalOrClinic = payload.get("hospitalOrClinic") != null
                ? payload.get("hospitalOrClinic").toString()
                : null;
        String consultationType = payload.get("consultationType") != null
                ? payload.get("consultationType").toString()
                : null;

        return ResponseEntity.ok(slotService.generateSlots(
                doctorId,
                availabilityDate,
                startTime,
                endTime,
                slotDuration,
                hospitalOrClinic,
                consultationType
        ));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Slot>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availabilityDate
    ) {
        return ResponseEntity.ok(slotService.getAvailableSlots(doctorId, availabilityDate));
    }

    @PatchMapping("/{slotId}/hold")
    public ResponseEntity<Slot> holdSlot(@PathVariable UUID slotId) {
        return ResponseEntity.ok(slotService.holdSlot(slotId));
    }

    @PatchMapping("/{slotId}/book")
    public ResponseEntity<Slot> markSlotBooked(@PathVariable UUID slotId) {
        return ResponseEntity.ok(slotService.markSlotBooked(slotId));
    }

    @PatchMapping("/{slotId}/release")
    public ResponseEntity<Slot> releaseSlot(@PathVariable UUID slotId) {
        return ResponseEntity.ok(slotService.releaseSlot(slotId));
    }

    @DeleteMapping("/window")
    public ResponseEntity<Void> clearSlotsForWindow(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availabilityDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime
    ) {
        slotService.clearSlotsForWindow(doctorId, availabilityDate, startTime, endTime);
        return ResponseEntity.noContent().build();
    }
}
