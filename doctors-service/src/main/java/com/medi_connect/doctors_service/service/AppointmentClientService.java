package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.AppointmentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

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
