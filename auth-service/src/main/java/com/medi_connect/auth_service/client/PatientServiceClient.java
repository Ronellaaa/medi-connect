package com.medi_connect.auth_service.client;

import com.medi_connect.auth_service.dto.PatientProfileDto;
import com.medi_connect.auth_service.dto.RegisterRequest;
import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;

@Component
@RequiredArgsConstructor

public class PatientServiceClient {
    private final RestClient.Builder restClientBuilder;

    @Value("${services.patient.base-url}")
    private String patientServiceBaseUrl;


    public PatientProfileDto createPatientProfile(RegisterRequest request) {
        String[] nameParts = splitName(request.getFullName());

        return restClientBuilder
                .baseUrl(patientServiceBaseUrl)
                .build()
                .post()
                .uri("/api/patients/internal/create")
                .body(PatientProfileDtoRequest.builder()
                        .email(request.getEmail())
                        .password(request.getPassword())
                        .firstName(nameParts[0])
                        .lastName(nameParts[1])
                        .phoneNumber(request.getPhone())
                        .build())
                .retrieve()
                .onStatus(HttpStatusCode::isError, (req, res) -> {
                    throw new ResponseStatusException(res.getStatusCode(), "Could not create patient profile");
                })
                .body(PatientProfileDto.class);
    }

    private String[] splitName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return new String[]{"Patient", "User"};
        }

        String[] parts = Arrays.stream(fullName.trim().split("\\s+"))
                .filter(part -> !part.isBlank())
                .toArray(String[]::new);

        if (parts.length == 1) {
            return new String[]{parts[0], "-"};
        }

        String firstName = parts[0];
        String lastName = String.join(" ", Arrays.copyOfRange(parts, 1, parts.length));
        return new String[]{firstName, lastName};
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    private static class PatientProfileDtoRequest {
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String phoneNumber;
    }




}
