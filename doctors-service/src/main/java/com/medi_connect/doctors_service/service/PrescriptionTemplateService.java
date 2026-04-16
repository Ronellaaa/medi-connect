package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.entity.Doctor;
import com.medi_connect.doctors_service.entity.PrescriptionTemplate;
import com.medi_connect.doctors_service.repository.DoctorRepository;
import com.medi_connect.doctors_service.repository.PrescriptionTemplateRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionTemplateService {

    private final PrescriptionTemplateRepository prescriptionTemplateRepository;
    private final DoctorRepository doctorRepository;

    public PrescriptionTemplateService(PrescriptionTemplateRepository prescriptionTemplateRepository,
                                       DoctorRepository doctorRepository) {
        this.prescriptionTemplateRepository = prescriptionTemplateRepository;
        this.doctorRepository = doctorRepository;
    }

    public PrescriptionTemplate createTemplate(PrescriptionTemplate template) {
        Long doctorId = template.getDoctor().getId();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        template.setDoctor(doctor);

        return prescriptionTemplateRepository.save(template);
    }

    public List<PrescriptionTemplate> getAllTemplates() {
        return prescriptionTemplateRepository.findAll();
    }

    public Optional<PrescriptionTemplate> getTemplateById(Long id) {
        return prescriptionTemplateRepository.findById(id);
    }

    public List<PrescriptionTemplate> getTemplatesByDoctorId(Long doctorId) {
        return prescriptionTemplateRepository.findByDoctorId(doctorId);
    }

    public Optional<PrescriptionTemplate> updateTemplate(Long id, PrescriptionTemplate updatedTemplate) {
        return prescriptionTemplateRepository.findById(id).map(existing -> {

            if (updatedTemplate.getTemplateName() != null) {
                existing.setTemplateName(updatedTemplate.getTemplateName());
            }
            if (updatedTemplate.getDiagnosis() != null) {
                existing.setDiagnosis(updatedTemplate.getDiagnosis());
            }
            if (updatedTemplate.getMedicines() != null) {
                existing.setMedicines(updatedTemplate.getMedicines());
            }
            if (updatedTemplate.getInstructions() != null) {
                existing.setInstructions(updatedTemplate.getInstructions());
            }

            if (updatedTemplate.getDoctor() != null && updatedTemplate.getDoctor().getId() != null) {
                Doctor doctor = doctorRepository.findById(updatedTemplate.getDoctor().getId())
                        .orElseThrow(() -> new RuntimeException("Doctor not found"));
                existing.setDoctor(doctor);
            }

            return prescriptionTemplateRepository.save(existing);
        });
    }

    public boolean deleteTemplate(Long id) {
        if (!prescriptionTemplateRepository.existsById(id)) {
            return false;
        }
        prescriptionTemplateRepository.deleteById(id);
        return true;
    }
}