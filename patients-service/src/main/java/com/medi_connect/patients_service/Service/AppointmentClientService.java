package com.medi_connect.patients_service.Service;

import com.medi_connect.patients_service.dto.AppointmentLookupDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AppointmentClientService {

    private final RestTemplate restTemplate;

    @Value("${appointment.service.url:http://localhost:8088}")
    private String appointmentServiceUrl;

    public AppointmentLookupDto getAppointmentById(String appointmentId) {
        return restTemplate.getForObject(
                appointmentServiceUrl + "/api/appointments/" + appointmentId,
                AppointmentLookupDto.class
        );
    }
}
