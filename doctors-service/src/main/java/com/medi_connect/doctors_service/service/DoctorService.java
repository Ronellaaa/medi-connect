package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.DoctorDto;
import com.medi_connect.doctors_service.entity.Doctor;
import com.medi_connect.doctors_service.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorDto createDoctor(DoctorDto doctorDto) {
        Doctor doctor = toEntity(doctorDto);
        return toDto(doctorRepository.save(doctor));
    }

    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream().map(this::toDto).toList();
    }

    public Optional<DoctorDto> getDoctorById(Long id){
        return doctorRepository.findById(id).map(this::toDto);
    }

    public Optional<DoctorDto> getDoctorByEmail(String email) {
        return doctorRepository.findByEmail(email).map(this::toDto);
    }


    public Optional<DoctorDto> updateDoctorPartially(Long id, DoctorDto updatedDoctor) {
        return doctorRepository.findById(id).map(existingDoctor -> {

            if (updatedDoctor.getFullName() != null) {
                existingDoctor.setFullName(updatedDoctor.getFullName());
            }
            if (updatedDoctor.getEmail() != null) {
                existingDoctor.setEmail(updatedDoctor.getEmail());
            }
            if (updatedDoctor.getPhone() != null) {
                existingDoctor.setPhone(updatedDoctor.getPhone());
            }
            if (updatedDoctor.getMainSpecialization() != null) {
                existingDoctor.setMainSpecialization(updatedDoctor.getMainSpecialization());
            }
            if (updatedDoctor.getAdditionalSpecialization() != null) {
                existingDoctor.setAdditionalSpecialization(updatedDoctor.getAdditionalSpecialization());
            }
            if (updatedDoctor.getQualifications() != null) {
                existingDoctor.setQualifications(updatedDoctor.getQualifications());
            }
            if (updatedDoctor.getExperienceYears() != null) {
                existingDoctor.setExperienceYears(updatedDoctor.getExperienceYears());
            }
            if (updatedDoctor.getLicense() != null) {
                existingDoctor.setLicense(updatedDoctor.getLicense());
            }
            if (updatedDoctor.getClinic() != null) {
                existingDoctor.setClinic(updatedDoctor.getClinic());
            }
            if (updatedDoctor.getConsultationFee() != null) {
                existingDoctor.setConsultationFee(updatedDoctor.getConsultationFee());
            }
            if (updatedDoctor.getAvailability() != null) {
                existingDoctor.setAvailability(updatedDoctor.getAvailability());
            }
            if (updatedDoctor.getLanguages() != null) {
                existingDoctor.setLanguages(updatedDoctor.getLanguages());
            }

            if (updatedDoctor.getBio() != null) {
                existingDoctor.setBio(updatedDoctor.getBio());
            }

            return toDto(doctorRepository.save(existingDoctor));
        });
    }
public  boolean deleteDoctor(Long id) {
        if(!doctorRepository.existsById(id)){
            return false;
        }
         doctorRepository.deleteById(id);
    return true;
}

    private DoctorDto toDto(Doctor doctor) {
        return DoctorDto.builder()
                .id(doctor.getId())
                .fullName(doctor.getFullName())
                .email(doctor.getEmail())
                .phone(doctor.getPhone())
                .mainSpecialization(doctor.getMainSpecialization())
                .additionalSpecialization(doctor.getAdditionalSpecialization())
                .qualifications(doctor.getQualifications())
                .experienceYears(doctor.getExperienceYears())
                .license(doctor.getLicense())
                .clinic(doctor.getClinic())
                .consultationFee(doctor.getConsultationFee())
                .availability(doctor.getAvailability())
                .languages(doctor.getLanguages())
                .bio(doctor.getBio())
                .build();
    }

    private Doctor toEntity(DoctorDto doctorDto) {
        return Doctor.builder()
                .id(doctorDto.getId())
                .fullName(doctorDto.getFullName())
                .email(doctorDto.getEmail())
                .phone(doctorDto.getPhone())
                .mainSpecialization(doctorDto.getMainSpecialization())
                .additionalSpecialization(doctorDto.getAdditionalSpecialization())
                .qualifications(doctorDto.getQualifications())
                .experienceYears(doctorDto.getExperienceYears())
                .license(doctorDto.getLicense())
                .clinic(doctorDto.getClinic())
                .consultationFee(doctorDto.getConsultationFee())
                .availability(doctorDto.getAvailability())
                .languages(doctorDto.getLanguages())
                .bio(doctorDto.getBio())
                .build();
    }

}
