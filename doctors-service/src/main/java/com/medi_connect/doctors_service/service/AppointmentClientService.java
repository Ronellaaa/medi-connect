package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.AppointmentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentClientService {

    private final RestTemplate restTemplate;

    public AppointmentDto getAppointmentById(UUID appointmentId) {
        String url = "http://localhost:8088/api/appointments/" + appointmentId;
        return restTemplate.getForObject(url, AppointmentDto.class);
    }
}