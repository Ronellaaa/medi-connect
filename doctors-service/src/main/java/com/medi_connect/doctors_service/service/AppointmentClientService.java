package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.AppointmentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppointmentClientService {

    private final RestTemplate restTemplate;
    @Value("${appointment.service.url:http://localhost:8088}")
    private String appointmentServiceUrl;

    public AppointmentDto getAppointmentById(String appointmentId) {
        String url = appointmentServiceUrl + "/api/appointments/" + appointmentId;
        return restTemplate.getForObject(url, AppointmentDto.class);
    }

    public List<AppointmentDto> getAllAppointments() {
        String url = appointmentServiceUrl + "/api/appointments";
        return exchangeForAppointments(url);
    }

    public List<AppointmentDto> getAppointmentsByDoctorId(Long doctorId) {
        String url = appointmentServiceUrl + "/api/appointments/doctors/" + doctorId;
        return exchangeForAppointments(url);
    }

    public void generateSlotsForAvailability(
            Long doctorId,
            LocalDate availabilityDate,
            LocalTime startTime,
            LocalTime endTime,
            Integer slotDuration,
            String hospitalOrClinic,
            String consultationType
    ) {
        String url = appointmentServiceUrl + "/api/slots/generate";

        Map<String, Object> payload = new HashMap<>();
        payload.put("doctorId", doctorId);
        payload.put("availabilityDate", availabilityDate != null ? availabilityDate.toString() : null);
        payload.put("startTime", startTime != null ? startTime.toString() : null);
        payload.put("endTime", endTime != null ? endTime.toString() : null);
        payload.put("slotDuration", slotDuration);
        payload.put("hospitalOrClinic", hospitalOrClinic);
        payload.put("consultationType", consultationType);

        restTemplate.postForEntity(url, new HttpEntity<>(payload), Void.class);
    }

    public void clearSlotsForAvailability(
            Long doctorId,
            LocalDate availabilityDate,
            LocalTime startTime,
            LocalTime endTime
    ) {
        String url = UriComponentsBuilder
                .fromUriString(appointmentServiceUrl + "/api/slots/window")
                .queryParam("doctorId", doctorId)
                .queryParam("availabilityDate", availabilityDate)
                .queryParam("startTime", startTime)
                .queryParam("endTime", endTime)
                .toUriString();

        restTemplate.exchange(url, HttpMethod.DELETE, null, Void.class);
    }

    private List<AppointmentDto> exchangeForAppointments(String url) {
        ResponseEntity<List<AppointmentDto>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<AppointmentDto>>() {}
        );
        return response.getBody() != null ? response.getBody() : Collections.emptyList();
    }
}
