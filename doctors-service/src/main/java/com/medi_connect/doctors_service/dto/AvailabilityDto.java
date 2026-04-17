package com.medi_connect.doctors_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityDto {
    private Long id;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String hospitalOrClinic;
    private String consultationType;
    private Boolean available;
    private DoctorSummary doctor;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorSummary {
        private Long id;
        private String fullName;
    }
}
