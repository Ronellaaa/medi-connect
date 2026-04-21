package com.medi_connect.patients_service.Service;

import com.medi_connect.patients_service.dto.PatientDto;
import com.medi_connect.patients_service.dto.RegisterRequestDto;
import com.medi_connect.patients_service.Model.Patient;
import com.medi_connect.patients_service.Repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =========================
    // CURRENT USER (FIXED)
    // =========================
    public Patient getCurrentPatient() {

        // ✅ Get logged-in user from Spring Security
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName(); // usually email/username

        System.out.println("🔍 Searching patient for email = " + email);

        return patientRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found for email: " + email));
    }

    // =========================
    // FIND BY EMAIL
    // =========================
    public Patient getPatientByEmail(String email) {
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    // =========================
    // REGISTER PATIENT
    // =========================
    public Patient registerPatient(RegisterRequestDto dto) {

        if (patientRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Patient patient = new Patient();
        patient.setEmail(dto.getEmail());
        patient.setPassword(passwordEncoder.encode(dto.getPassword()));

        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setAddress(dto.getAddress());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setEmergencyContact(dto.getEmergencyContact());

        patient.setRole("ROLE_PATIENT");
        patient.setEnabled(true);

        return patientRepository.save(patient);
    }

    // =========================
    // REGISTER ADMIN
    // =========================
    public Patient registerAdmin(RegisterRequestDto dto) {

        if (patientRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Patient admin = new Patient();
        admin.setEmail(dto.getEmail());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));

        admin.setFirstName(dto.getFirstName());
        admin.setLastName(dto.getLastName());
        admin.setPhoneNumber(dto.getPhoneNumber());
        admin.setDateOfBirth(dto.getDateOfBirth());
        admin.setGender(dto.getGender());
        admin.setAddress(dto.getAddress());
        admin.setBloodGroup(dto.getBloodGroup());
        admin.setEmergencyContact(dto.getEmergencyContact());

        admin.setRole("ROLE_ADMIN");
        admin.setEnabled(true);

        return patientRepository.save(admin);
    }

    // =========================
    // PROFILE
    // =========================
    public PatientDto getPatientProfile() {
        return convertToDto(getCurrentPatient());
    }

    public PatientDto updatePatientProfile(PatientDto patientDto) {

        Patient current = getCurrentPatient();

        current.setFirstName(patientDto.getFirstName());
        current.setLastName(patientDto.getLastName());
        current.setPhoneNumber(patientDto.getPhoneNumber());
        current.setDateOfBirth(patientDto.getDateOfBirth());
        current.setGender(patientDto.getGender());
        current.setAddress(patientDto.getAddress());
        current.setBloodGroup(patientDto.getBloodGroup());
        current.setEmergencyContact(patientDto.getEmergencyContact());

        return convertToDto(patientRepository.save(current));
    }

    // =========================
    // DTO CONVERTER
    // =========================
    public PatientDto convertToDto(Patient patient) {

        PatientDto dto = new PatientDto();

        dto.setId(patient.getId());
        dto.setEmail(patient.getEmail());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setAddress(patient.getAddress());
        dto.setBloodGroup(patient.getBloodGroup());
        dto.setEmergencyContact(patient.getEmergencyContact());
        dto.setRole(patient.getRole());
        dto.setEnabled(patient.isEnabled());

        return dto;
    }
}