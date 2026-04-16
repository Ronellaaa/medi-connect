    package com.medi_connect.doctors_service.service;

    import com.medi_connect.doctors_service.entity.Appointment;
    import com.medi_connect.doctors_service.entity.Doctor;
    import com.medi_connect.doctors_service.repository.AppointmentRepository;
    import com.medi_connect.doctors_service.repository.DoctorRepository;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;

    import java.util.List;
    import java.util.Optional;

    @Service
        @RequiredArgsConstructor
        public class AppointmentService {
            private final AppointmentRepository appointmentRepository;
            private final DoctorRepository doctorRepository;


        private String calculateUrgency(String reason) {
            if (reason == null) return "LOW";

            String lower = reason.toLowerCase();

            if (lower.contains("chest") || lower.contains("breathing") || lower.contains("heart")) {
                return "HIGH";
            } else if (lower.contains("fever") || lower.contains("pain") || lower.contains("infection")) {
                return "MEDIUM";
            } else {
                return "LOW";
            }
        }
            public Appointment  createAppointment(Appointment appointment) {
                Long doctorId = appointment.getDoctor().getId();
                Doctor doctor = doctorRepository.findById(doctorId)
                        .orElseThrow(() -> new RuntimeException("Doctor not found"));

                appointment.setDoctor(doctor);
                if (appointment.getStatus() == null || appointment.getStatus().isBlank()) {
                    appointment.setStatus("PENDING");
                }

                // ⭐ NEW LINE (WOW FEATURE)
                appointment.setUrgencyLevel(calculateUrgency(appointment.getReason()));

                return appointmentRepository.save(appointment);
            }


            public List<Appointment> getAllAppointments(){
                return appointmentRepository.findAll();
            }

             public List<Appointment> getAppointmentsByDoctorId(Long doctorId){
                 return appointmentRepository.findByDoctorId(doctorId);

            }
            public Optional<Appointment> getAppointmentById(Long id) {
                return appointmentRepository.findById(id);
            }



        public Optional<Appointment> acceptAppointment(Long id) {
            return appointmentRepository.findById(id).map(appointment -> {
                appointment.setStatus("ACCEPTED");
                return appointmentRepository.save(appointment);
            });
        }


        public Optional<Appointment> rejectAppointment(Long id) {
            return appointmentRepository.findById(id).map(appointment -> {
                appointment.setStatus("REJECTED");
                return appointmentRepository.save(appointment);
            });
        }

        public boolean deleteAppointment(Long id) {
            if (!appointmentRepository.existsById(id)) {
                return false;
            }
            appointmentRepository.deleteById(id);
            return true;
        }




    }
