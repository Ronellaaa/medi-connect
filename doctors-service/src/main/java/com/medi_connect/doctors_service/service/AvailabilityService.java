package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.AppointmentDto;
import com.medi_connect.doctors_service.dto.AvailabilityDto;
import com.medi_connect.doctors_service.entity.Availability;
import com.medi_connect.doctors_service.entity.Doctor;
import com.medi_connect.doctors_service.repository.AvailabilityRepository;
import com.medi_connect.doctors_service.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;

@Service
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentClientService appointmentClientService;

    public AvailabilityService(AvailabilityRepository availabilityRepository,
                               DoctorRepository doctorRepository,
                               AppointmentClientService appointmentClientService) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentClientService = appointmentClientService;
    }

    public Availability createAvailability(Availability availability) {
        Long doctorId = availability.getDoctor().getId();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        availability.setDoctor(doctor);
        validateAvailability(availability);

        Availability savedAvailability = availabilityRepository.save(availability);
        syncSlotsForAvailability(savedAvailability);
        return savedAvailability;
    }

    public List<AvailabilityDto> getAllAvailability() {
        return availabilityRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<AvailabilityDto> getAvailabilityByDoctorId(Long doctorId) {
        return availabilityRepository.findByDoctorId(doctorId).stream().map(this::toDto).toList();
    }

    public Optional<Availability> updateAvailability(Long id, Availability updatedAvailability) {
        return availabilityRepository.findById(id).map(existing -> {
            Availability previous = Availability.builder()
                    .id(existing.getId())
                    .availabilityDate(existing.getAvailabilityDate())
                    .startTime(existing.getStartTime())
                    .endTime(existing.getEndTime())
                    .slotDuration(existing.getSlotDuration())
                    .hospitalOrClinic(existing.getHospitalOrClinic())
                    .consultationType(existing.getConsultationType())
                    .available(existing.getAvailable())
                    .doctor(existing.getDoctor())
                    .build();

            if (updatedAvailability.getAvailabilityDate() != null) {
                existing.setAvailabilityDate(updatedAvailability.getAvailabilityDate());
            }
            if (updatedAvailability.getStartTime() != null) {
                existing.setStartTime(updatedAvailability.getStartTime());
            }
            if (updatedAvailability.getEndTime() != null) {
                existing.setEndTime(updatedAvailability.getEndTime());
            }
            if(updatedAvailability.getSlotDuration()!= null){
                existing.setSlotDuration(updatedAvailability.getSlotDuration());
            }
            if (updatedAvailability.getHospitalOrClinic() != null) {
                existing.setHospitalOrClinic(updatedAvailability.getHospitalOrClinic());
            }
            if (updatedAvailability.getConsultationType() != null) {
                existing.setConsultationType(updatedAvailability.getConsultationType());
            }
            if (updatedAvailability.getAvailable() != null) {
                existing.setAvailable(updatedAvailability.getAvailable());
            }

            if (updatedAvailability.getDoctor() != null && updatedAvailability.getDoctor().getId() != null) {
                Doctor doctor = doctorRepository.findById(updatedAvailability.getDoctor().getId())
                        .orElseThrow(() -> new RuntimeException("Doctor not found"));
                existing.setDoctor(doctor);
            }

            validateAvailability(existing);
            AppointmentClientService client = appointmentClientService;
            if (Boolean.TRUE.equals(previous.getAvailable())) {
                client.clearSlotsForAvailability(
                        previous.getDoctor().getId(),
                        previous.getAvailabilityDate(),
                        previous.getStartTime(),
                        previous.getEndTime()
                );
            }

            Availability savedAvailability = availabilityRepository.save(existing);
            syncSlotsForAvailability(savedAvailability);
            return savedAvailability;
        });
    }

    public boolean deleteAvailability(Long id) {
        Optional<Availability> existing = availabilityRepository.findById(id);
        if (existing.isEmpty()) {
            return false;
        }

        Availability availability = existing.get();
        if (Boolean.TRUE.equals(availability.getAvailable())) {
            appointmentClientService.clearSlotsForAvailability(
                    availability.getDoctor().getId(),
                    availability.getAvailabilityDate(),
                    availability.getStartTime(),
                    availability.getEndTime()
            );
        }

        availabilityRepository.deleteById(id);
        return true;
    }

    public Map<String, String> getAvailabilitySuggestion(Long doctorId) {
        List<AppointmentDto> appointments = appointmentClientService.getAppointmentsByDoctorId(doctorId);

        Map<String, Integer> dayCount = new HashMap<>();
        Map<String, Integer> timeSlotCount = new HashMap<>();

        for (AppointmentDto appointment : appointments) {
            if (appointment.getAppointmentDate() != null) {
                String day = appointment.getAppointmentDate().getDayOfWeek().toString();
                dayCount.put(day, dayCount.getOrDefault(day, 0) + 1);
            }

            if (appointment.getAppointmentDate() != null) {
                int hour = appointment.getAppointmentDate().getHour();

                String slot;
                if (hour < 12) {
                    slot = "Morning";
                } else if (hour < 17) {
                    slot = "Afternoon";
                } else {
                    slot = "Evening";
                }

                timeSlotCount.put(slot, timeSlotCount.getOrDefault(slot, 0) + 1);
            }
        }

        String bestDay = dayCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("No data");

        String bestTimeSlot = timeSlotCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("No data");

        Map<String, String> suggestion = new HashMap<>();
        suggestion.put("bestDay", bestDay);
        suggestion.put("bestTimeSlot", bestTimeSlot);
        suggestion.put("message", "Suggested to add more slots on " + bestDay + " during " + bestTimeSlot);

        return suggestion;
    }

    private AvailabilityDto toDto(Availability availability) {
        return AvailabilityDto.builder()
                .id(availability.getId())
                .availabilityDate(availability.getAvailabilityDate() != null ? availability.getAvailabilityDate().toString() : null)
                .startTime(formatTime(availability.getStartTime()))
                .endTime(formatTime(availability.getEndTime()))
                .slotDuration(availability.getSlotDuration())
                .hospitalOrClinic(availability.getHospitalOrClinic())
                .consultationType(availability.getConsultationType())
                .available(Boolean.TRUE.equals(availability.getAvailable()))
                .doctor(AvailabilityDto.DoctorSummary.builder()
                        .id(availability.getDoctor() != null ? availability.getDoctor().getId() : null)
                        .fullName(availability.getDoctor() != null ? availability.getDoctor().getFullName() : null)
                        .build())
                .build();
    }

    private void validateAvailability(Availability availability) {
        if (availability.getStartTime() == null || availability.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required");
        }

        if (availability.getSlotDuration() == null || availability.getSlotDuration() <= 0) {
            throw new RuntimeException("Slot duration must be a positive number of minutes");
        }

        if (!availability.getStartTime().isBefore(availability.getEndTime())) {
            throw new RuntimeException("End time must be later than start time");
        }

        long minutes = java.time.Duration.between(
                availability.getStartTime(),
                availability.getEndTime()
        ).toMinutes();

        if (minutes < availability.getSlotDuration()) {
            throw new RuntimeException("Availability window must fit at least one slot");
        }
    }

    private void syncSlotsForAvailability(Availability availability) {
        if (!Boolean.TRUE.equals(availability.getAvailable())) {
            return;
        }

        appointmentClientService.generateSlotsForAvailability(
                availability.getDoctor().getId(),
                availability.getAvailabilityDate(),
                availability.getStartTime(),
                availability.getEndTime(),
                availability.getSlotDuration(),
                availability.getHospitalOrClinic(),
                availability.getConsultationType()
        );
    }

    private String formatTime(LocalTime value) {
        return value != null ? value.toString() : "";
    }
}
