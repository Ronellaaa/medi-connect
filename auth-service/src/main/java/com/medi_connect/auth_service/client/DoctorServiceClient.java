package com.medi_connect.auth_service.client;

import com.medi_connect.auth_service.dto.DoctorProfileDto;
import com.medi_connect.auth_service.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Component
@RequiredArgsConstructor
public class DoctorServiceClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${services.doctor.base-url}")
    private String doctorServiceBaseUrl;

    public DoctorProfileDto createDoctorProfile(RegisterRequest request) {
        return restClientBuilder
                .baseUrl(doctorServiceBaseUrl)
                .build()
                .post()
                .uri("/api/doctors")
                .body(DoctorProfileDto.builder()
                        .fullName(request.getFullName())
                        .email(request.getEmail())
                        .phone(request.getPhone())
                        .mainSpecialization(request.getMainSpecialization())
                        .additionalSpecialization(request.getAdditionalSpecialization())
                        .qualifications(request.getQualifications())
                        .experienceYears(request.getExperienceYears())
                        .license(request.getLicense())
                        .clinic(request.getClinic())
                        .consultationFee(request.getConsultationFee())
                        .availability(request.getAvailability())
                        .languages(request.getLanguages())
                        .bio(request.getBio())
                        .build())
                .retrieve()
                .onStatus(HttpStatusCode::isError, (requestSpec, response) -> {
                    throw new ResponseStatusException(response.getStatusCode(), "Could not create doctor profile");
                })
                .body(DoctorProfileDto.class);
    }

    public DoctorProfileDto findDoctorByEmail(String email) {
        return restClientBuilder
                .baseUrl(doctorServiceBaseUrl)
                .build()
                .get()
                .uri(uriBuilder -> uriBuilder.path("/api/doctors/by-email").queryParam("email", email).build())
                .retrieve()
                .onStatus(HttpStatusCode::isError, (requestSpec, response) -> {
                    throw new ResponseStatusException(response.getStatusCode(), "Could not load doctor profile");
                })
                .body(DoctorProfileDto.class);
    }
}
