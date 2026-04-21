package com.medi_connect.patients_service.Service;

import com.medi_connect.patients_service.dto.DoctorAdminSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorClientService {

    private final RestTemplate restTemplate;

    @Value("${doctor.service.url:http://localhost:8083}")
    private String doctorServiceUrl;

    public List<DoctorAdminSummaryDto> getAllDoctors() {
        DoctorAdminSummaryDto[] doctors = restTemplate.getForObject(
                doctorServiceUrl + "/api/doctors",
                DoctorAdminSummaryDto[].class
        );

        return doctors == null ? List.of() : Arrays.asList(doctors);
    }
}
