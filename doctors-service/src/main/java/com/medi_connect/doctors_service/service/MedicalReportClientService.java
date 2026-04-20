package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.MedicalReportDto;
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
public class MedicalReportClientService {

    private final RestTemplate restTemplate;

    @Value("${patients.service.url:http://localhost:8082}")
    private String patientsServiceUrl;

    public List<MedicalReportDto> getReportsByDoctorId(Long doctorId) {
        String url = patientsServiceUrl + "/api/reports/internal/by-doctor/" + doctorId;
        ResponseEntity<List<MedicalReportDto>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<MedicalReportDto>>() {}
        );

        return response.getBody() != null ? response.getBody() : Collections.emptyList();
    }
}
