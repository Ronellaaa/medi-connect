package com.medi_connect.notification_service.service;

import com.medi_connect.notification_service.entity.Notification;
import com.medi_connect.notification_service.repository.NotificationRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private JavaMailSender mailSender;

    @Value("${twilio.account.sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    @Value("${spring.mail.username}")
    private String fromMail;

    // Send Emai;
    public boolean sendEmail(String toEmail, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromMail);
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            mailSender.send(mailMessage);
            return true;
        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
            return false;
        }

    }

    //send SMS
    public boolean sendSms(String toPhone, String message) {
        try {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(twilioPhoneNumber),
                    message
            ).create();
            return true;
        } catch (Exception e) {
            System.out.println("SMS sending failed: " + e.getMessage());
            return false;
        }
    }

    public void sendAppointmentConfirmation(
            String appointmentId,
            String patientName,
            String doctorName,
            String patientPhone,
            String patientEmail,
            String doctorEmail,
            String appointmentDate
    ) {


        LocalDateTime dateTime = LocalDateTime.parse(appointmentDate);
        String formattedDate = dateTime.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        String formattedTime = dateTime.format(DateTimeFormatter.ofPattern("hh:mm a"));

        String patientSubject = "Appointment Confirmation on "+formattedDate+" at "+formattedTime+" - MediConnect";
        String doctorSubject = "New Paid Appointment on "+formattedDate+" at "+formattedTime+" - MediConnect";

        String patientMessage = "Dear " + patientName + ",\n\nYour appointment with Dr " + doctorName +" has been confirmed on "+ formattedDate+
                " at " + formattedTime + ".\n\n"+ "Thank you for using MediConnect!\n\n" +
                "Best regards,\nMediConnect Team";
        String doctorMessage =
                "Dear " + doctorName + ",\n\n" +
                        patientName+"'s payment was successful and the appointment is now confirmed.\n\n" +
                        "Patient: " + patientName + "\n" +
                        "Date: " + formattedDate + "\n" +
                        "Time: " + formattedTime + "\n\n" +
                        "Best regards,\nMediConnect Team";



        String smsMessage = "MediConnect: Your appointment with " +
                doctorName + " is confirmed for " + appointmentDate;




        boolean patientEmailSent = patientEmail != null && !patientEmail.isBlank() && sendEmail(patientEmail, patientSubject, patientMessage);
        boolean doctorEmailSent =  doctorEmail != null && !doctorEmail.isBlank() &&  sendEmail(doctorEmail, doctorSubject, doctorMessage);
        boolean smsSent = sendSms(patientPhone, smsMessage);

        String status;
        if (patientEmailSent && doctorEmailSent && smsSent) {
            status = "SENT";
        } else if (doctorEmailSent && patientEmailSent|| smsSent) {
            status = "PARTIAL";
        } else {
            status = "FAILED";
        }
        saveNotification(appointmentId,patientEmail, patientPhone, patientName, "APPOINTMENT_CONFIRMATION", patientSubject, patientMessage,status);
        if (doctorEmail != null && !doctorEmail.isBlank()) {
            saveNotification(appointmentId, doctorEmail, null, doctorName,
                    "APPOINTMENT_CONFIRMATION_DOCTOR", doctorSubject, doctorMessage, status);
        }

    }

    public void sendAppointmentCancellation(
            String appointmentId,
            String patientName,
            String doctorName,
            String patientPhone,
            String patientEmail,
            String doctorEmail,
            String appointmentDate

    ) {


        LocalDateTime dateTime = LocalDateTime.parse(appointmentDate);
        String formattedDate = dateTime.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        String formattedTime = dateTime.format(DateTimeFormatter.ofPattern("hh:mm a"));

        String patientSubject = "Appointment Cancellation on "+formattedDate+" at "+formattedTime+" - MediConnect";
        String doctorSubject = "Appointment Cancellation on "+formattedDate+" at "+formattedTime+" - MediConnect";


        String patientMessage = "Dear " + patientName + ",\n\n" +
                "Your appointment with Dr " + doctorName +
                "has been cancelled on "+ formattedDate+" at " + formattedTime + ".\n\n"+ "Please book a new appointment if needed.\n\n" +
                "Best regards,\nMediConnect Team";

        String smsMessage = "MediConnect: Your appointment with " +
                doctorName + " on " + appointmentDate + " has been cancelled.";

        String doctorMessage =
                "Dear " + doctorName + ",\n\n" +
                        "The appointment with patient " + patientName + " scheduled for " +
                        formattedDate + " at " + formattedTime + " has been cancelled.\n\n" +
                        "Best regards,\nMediConnect Team";



        boolean patientEmailSent = patientEmail != null && !patientEmail.isBlank() && sendEmail(patientEmail, patientSubject, patientMessage);
        boolean doctorEmailSent = doctorEmail != null && !doctorEmail.isBlank() && sendEmail(doctorEmail, doctorSubject, doctorMessage);
        boolean smsSent = sendSms(patientPhone, smsMessage);

        String status;

        if (patientEmailSent && doctorEmailSent && smsSent) {
            status = "SENT";
        } else if ( patientEmailSent && doctorEmailSent || smsSent) {
            status = "PARTIAL";
        } else {
            status = "FAILED";
        }

        saveNotification(appointmentId,patientEmail,patientPhone,patientName,"APPOINTMENT_CANCELLATION",patientSubject,patientMessage,status);
        if (doctorEmail != null && !doctorEmail.isBlank()) {
            saveNotification(appointmentId, doctorEmail, null, doctorName,
                    "APPOINTMENT_CONFIRMATION_DOCTOR", doctorSubject, doctorMessage, status);
        }
    }

    private void saveNotification(
            String appointmentId,
            String email,
            String phoneNum,
            String name,
            String type,
            String subject,
            String message,
            String status
    ) {
        Notification notification = new Notification();
        notification.setAppointmentId(UUID.fromString(appointmentId));
        notification.setRecipientName(name);
        notification.setRecipientEmail(email);
        notification.setRecipientPhoneNumber(phoneNum);
        notification.setType(type);
        notification.setSubject(subject);
        notification.setMessage(message);
        notification.setNotificationStatus(status);

        notificationRepository.save(notification);

    }

    public List<Notification> findRecipientById(Long recipientId) {
        return notificationRepository.getAllNotificationsByRecipientId(recipientId);
    }
    public List<Notification>getAllNotifications(){
        return notificationRepository.findAll();
    }
    public List<Notification>getAllNotificationsByStatus(String status){
        return notificationRepository.findByNotificationStatus(status);
    }




}
