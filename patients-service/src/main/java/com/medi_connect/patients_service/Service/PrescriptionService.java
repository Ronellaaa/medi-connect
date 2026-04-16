package com.medi_connect.patients_service.Service;

import com.medi_connect.patients_service.dto.PrescriptionDto;
import com.medi_connect.patients_service.Model.Prescription;
import com.medi_connect.patients_service.Repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientService patientService;

    public List<PrescriptionDto> getMyPrescriptions() {
        Long patientId = patientService.getCurrentPatient().getId();
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
        return prescriptions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private PrescriptionDto convertToDto(Prescription prescription) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(prescription.getId());
        dto.setDoctorId(prescription.getDoctorId());
        dto.setDoctorName(prescription.getDoctorName());
        dto.setAppointmentId(prescription.getAppointmentId());
        dto.setDiagnosis(prescription.getDiagnosis());
        dto.setMedications(prescription.getMedications());
        dto.setInstructions(prescription.getInstructions());
        dto.setValidUntil(prescription.getValidUntil());
        dto.setIssuedAt(prescription.getIssuedAt());
        return dto;
    }
}