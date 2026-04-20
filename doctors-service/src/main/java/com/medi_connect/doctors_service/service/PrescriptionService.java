package com.medi_connect.doctors_service.service;

import com.medi_connect.doctors_service.dto.AppointmentDto;
import com.medi_connect.doctors_service.entity.Doctor;
import com.medi_connect.doctors_service.entity.Prescription;
import com.medi_connect.doctors_service.repository.DoctorRepository;
import com.medi_connect.doctors_service.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentClientService appointmentClientService;

//    public Prescription createPrescription(Prescription prescription) {
//        Long doctorId = prescription.getDoctor().getId();
//                Doctor doctor = doctorRepository.findById(doctorId)
//                        .orElseThrow(()-> new RuntimeException("Doctor not found"));
//                prescription.setDoctor(doctor);
//        if (prescription.getIssuedDate() == null) {
//            prescription.setIssuedDate(LocalDate.now());
//        }
//
//        return prescriptionRepository.save(prescription);
//    }

    public Prescription createPrescription(Prescription prescription) {
        Long doctorId = prescription.getDoctor().getId();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        prescription.setDoctor(doctor);

        if (prescription.getAppointmentId() == null) {
            throw new RuntimeException("Appointment ID is required");
        }

        AppointmentDto appointment = appointmentClientService.getAppointmentById(prescription.getAppointmentId());

        if (appointment == null) {
            throw new RuntimeException("Appointment not found");
        }

        if (!doctorId.equals(appointment.getDoctorId())) {
            throw new RuntimeException("Appointment does not belong to this doctor");
        }

        prescription.setPatientId(appointment.getPatientId());

        if (prescription.getIssuedDate() == null) {
            prescription.setIssuedDate(LocalDate.now());
        }

        return prescriptionRepository.save(prescription);
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Optional<Prescription> getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id);
    }

    public List<Prescription> getPrescriptionsByDoctorId(Long doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }

    public List<Prescription> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    public Optional<Prescription> updatePrescription(Long id, Prescription updatedPrescription) {
        return prescriptionRepository.findById(id).map(existing -> {

            if (updatedPrescription.getPatientId() != null) {
                existing.setPatientId(updatedPrescription.getPatientId());
            }
            if (updatedPrescription.getAppointmentId() != null) {
                existing.setAppointmentId(updatedPrescription.getAppointmentId());
            }
            if (updatedPrescription.getDiagnosis() != null) {
                existing.setDiagnosis(updatedPrescription.getDiagnosis());
            }
            if (updatedPrescription.getMedicines() != null) {
                existing.setMedicines(updatedPrescription.getMedicines());
            }
            if (updatedPrescription.getInstructions() != null) {
                existing.setInstructions(updatedPrescription.getInstructions());
            }
            if (updatedPrescription.getIssuedDate() != null) {
                existing.setIssuedDate(updatedPrescription.getIssuedDate());
            }

            if (updatedPrescription.getDoctor() != null && updatedPrescription.getDoctor().getId() != null) {
                Doctor doctor = doctorRepository.findById(updatedPrescription.getDoctor().getId())
                        .orElseThrow(() -> new RuntimeException("Doctor not found"));
                existing.setDoctor(doctor);
            }

            return prescriptionRepository.save(existing);
        });
    }

    public boolean deletePrescription(Long id) {
        if (!prescriptionRepository.existsById(id)) {
            return false;
        }
        prescriptionRepository.deleteById(id);
        return true;
    }
}
