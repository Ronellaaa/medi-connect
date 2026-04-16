package com.medi_connect.notification_service.controller;

import com.medi_connect.notification_service.entity.Notification;
import com.medi_connect.notification_service.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notification")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("recipient/{recipientId}")
    public ResponseEntity<List<Notification>> findRecipientById(@PathVariable Long recipientId) {
        return ResponseEntity.ok(notificationService.findRecipientById(recipientId));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @PostMapping("/appointment-confirmation")
    public ResponseEntity<String> sendAppointmentConfirmation(@RequestBody Map<String, String> request){
        notificationService.sendAppointmentConfirmation(
                request.get("appointmentId"),
                request.get("patientName"),
                request.get("doctorName"),
                request.get("patientPhone"),
                request.get("patientEmail"),
                request.get("appointmentDate")

        );
        return ResponseEntity.ok("Notification sent successfully!");
    }
    @PostMapping("/appointment-cancellation")
    public ResponseEntity<String> sendAppointmentCancellation(@RequestBody Map<String, String> request){
        notificationService.sendAppointmentCancellation(
                request.get("appointmentId"),
                request.get("patientName"),
                request.get("doctorName"),
                request.get("patientPhone"),
                request.get("patientEmail"),
                request.get("appointmentDate")

        );
        return ResponseEntity.ok("Cancellation notification sent successfully!");
    }


}
