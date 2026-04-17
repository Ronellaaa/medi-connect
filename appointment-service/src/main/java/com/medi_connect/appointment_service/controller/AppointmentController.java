package com.medi_connect.appointment_service.controller;


import com.medi_connect.appointment_service.dto.PaymentStatusUpdateRequest;
import com.medi_connect.appointment_service.entity.Appointment;
import com.medi_connect.appointment_service.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/appointments")

public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppoinments(){
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable("id") UUID appintmentId){
    return ResponseEntity.ok(appointmentService.getAppointmentById(appintmentId));
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<List<Appointment>> getDoctorByID(@PathVariable("id") Long id){
        return ResponseEntity.ok(appointmentService.getAllAppointmentsByDoctor(id));
    }


    @GetMapping("/patient/{id}")
    public ResponseEntity<List<Appointment>> getPatientById(@PathVariable("id") Long patientId){
        return ResponseEntity.ok(appointmentService.getAllAppointmentsByPatient(patientId));
    }
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment){
        return ResponseEntity.ok(appointmentService.createAppointment(appointment));
    }
    @PatchMapping("/status/{id}")
    public ResponseEntity <Appointment> updateStatusByID(@PathVariable UUID id,@RequestParam String status){
        return ResponseEntity.ok(appointmentService.updateStatus(id,status));

    }
    @PatchMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointmentById(@PathVariable UUID id,@RequestBody Appointment appointment ){
        return ResponseEntity.ok(appointmentService.updateAppointment(id,appointment));
    }

    @PostMapping("/{id}/payment-status")
    public ResponseEntity<Appointment> updatePaymentStatus(
            @PathVariable UUID id,
            @RequestBody PaymentStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(appointmentService.updatePaymentStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable UUID id){
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();

    }


}
