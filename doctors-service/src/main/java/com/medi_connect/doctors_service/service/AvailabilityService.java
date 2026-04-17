package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.AvailabilityDto;
import com.medi_connect.doctors_service.entity.Appointment;
import com.medi_connect.doctors_service.entity.Availability;
import com.medi_connect.doctors_service.entity.Doctor;
import com.medi_connect.doctors_service.repository.AppointmentRepository;
import com.medi_connect.doctors_service.repository.AvailabilityRepository;
import com.medi_connect.doctors_service.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;

@Service
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public AvailabilityService(AvailabilityRepository availabilityRepository,
                               DoctorRepository doctorRepository,
                               AppointmentRepository appointmentRepository) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public Availability createAvailability(Availability availability) {
        Long doctorId = availability.getDoctor().getId();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        availability.setDoctor(doctor);

        return availabilityRepository.save(availability);
    }

    public List<AvailabilityDto> getAllAvailability() {
        return availabilityRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<AvailabilityDto> getAvailabilityByDoctorId(Long doctorId) {
        return availabilityRepository.findByDoctorId(doctorId).stream().map(this::toDto).toList();
    }

    public Optional<Availability> updateAvailability(Long id, Availability updatedAvailability) {
        return availabilityRepository.findById(id).map(existing -> {

            if (updatedAvailability.getAvailabilityDate() != null) {
                existing.setAvailabilityDate(updatedAvailability.getAvailabilityDate());
            }
            if (updatedAvailability.getStartTime() != null) {
                existing.setStartTime(updatedAvailability.getStartTime());
            }
            if (updatedAvailability.getEndTime() != null) {
                existing.setEndTime(updatedAvailability.getEndTime());
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

            return availabilityRepository.save(existing);
        });
    }

    public boolean deleteAvailability(Long id) {
        if (!availabilityRepository.existsById(id)) {
            return false;
        }
        availabilityRepository.deleteById(id);
        return true;
    }

    public Map<String, String> getAvailabilitySuggestion(Long doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);

        Map<String, Integer> dayCount = new HashMap<>();
        Map<String, Integer> timeSlotCount = new HashMap<>();

        for (Appointment appointment : appointments) {
            if (appointment.getAppointmentDate() != null) {
                String day = appointment.getAppointmentDate().getDayOfWeek().toString();
                dayCount.put(day, dayCount.getOrDefault(day, 0) + 1);
            }

            if (appointment.getAppointmentTime() != null) {
                int hour = appointment.getAppointmentTime().getHour();

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
                .hospitalOrClinic(availability.getHospitalOrClinic())
                .consultationType(availability.getConsultationType())
                .available(Boolean.TRUE.equals(availability.getAvailable()))
                .doctor(AvailabilityDto.DoctorSummary.builder()
                        .id(availability.getDoctor() != null ? availability.getDoctor().getId() : null)
                        .fullName(availability.getDoctor() != null ? availability.getDoctor().getFullName() : null)
                        .build())
                .build();
    }

    private String formatTime(LocalTime value) {
        return value != null ? value.toString() : "";
    }
}
