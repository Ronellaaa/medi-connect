package com.medi_connect.appointment_service.service;

import com.medi_connect.appointment_service.entity.Appointment;
import com.medi_connect.appointment_service.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Appointment> getAllAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAllAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }
    public List<Appointment>findAppoinmentByPatientId(UUID appoinmentId,Long patientId ){
        return appointmentRepository.findAppoinmentByPatientId(appoinmentId,patientId);
    }

    public List<Appointment> getAllByStatus(String status) {
        return appointmentRepository.findByStatus(status);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Appointment not found")
                );
    }

    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(UUID appointmentId, Appointment updatedappointment) {
        Appointment existing = getAppointmentById(appointmentId);

        if (updatedappointment.getPatientName() != null) {
            existing.setPatientName(updatedappointment.getPatientName());

        }
        if (updatedappointment.getPatientphoneNumber() != null) {
            existing.setPatientphoneNumber(updatedappointment.getPatientphoneNumber());
        }
        if (updatedappointment.getAppointmentDate() != null) {
            existing.setAppointmentDate(updatedappointment.getAppointmentDate());
        }


        return appointmentRepository.save(existing);

    }

    public Appointment updateStatus(UUID appointmentId, String status) {
        Appointment appointment = getAppointmentById(appointmentId);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(UUID appointmentId) {
        appointmentRepository.deleteById(appointmentId);
    }


}
