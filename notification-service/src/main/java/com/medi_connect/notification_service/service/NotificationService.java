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
            String appointmentDate
    ) {
        String subject = "Appointment confirmation - MediConnect";

        LocalDateTime dateTime = LocalDateTime.parse(appointmentDate);
        String formattedDate = dateTime.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        String formattedTime = dateTime.format(DateTimeFormatter.ofPattern("hh:mm a"));

        String message = "Dear " + patientName + ",\n\nYour appointment with " + doctorName +" has been confirmed on "+ formattedDate+
                " at " + formattedTime + ".\n\n"+ "Thank you for using MediConnect!\n\n" +
                "Best regards,\nMediConnect Team";



        String smsMessage = "MediConnect: Your appointment with " +
                doctorName + " is confirmed for " + appointmentDate;




        boolean emailSent = sendEmail(patientEmail, subject, message);
        boolean smsSent = sendSms(patientPhone, smsMessage);

        String status;
        if (emailSent && smsSent) {
            status = "SENT";
        } else if (emailSent || smsSent) {
            status = "PARTIAL";
        } else {
            status = "FAILED";
        }
        saveNotification(appointmentId,patientEmail, patientPhone, patientName, "APPOINTMENT_CONFIRMATION", subject, message,status);

    }

    public void sendAppointmentCancellation(
            String appointmentId,
            String patientName,
            String doctorName,
            String patientPhone,
            String patientEmail,
            String appointmentDate

    ) {
        String subject = "Appointment Cancelled - MediConnect";


        LocalDateTime dateTime = LocalDateTime.parse(appointmentDate);
        String formattedDate = dateTime.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        String formattedTime = dateTime.format(DateTimeFormatter.ofPattern("hh:mm a"));

        String message = "Dear " + patientName + ",\n\n" +
                "Your appointment with " + doctorName +
                "has been cancelled on "+ formattedDate+" at " + formattedTime + ".\n\n"+ "Please book a new appointment if needed.\n\n" +
                "Best regards,\nMediConnect Team";

        String smsMessage = "MediConnect: Your appointment with " +
                doctorName + " on " + appointmentDate + " has been cancelled.";


        boolean emailSent = sendEmail(patientEmail, subject, message);
        boolean smsSent = sendSms(patientPhone, smsMessage);

        String status;

        if (emailSent && smsSent) {
            status = "SENT";
        } else if (emailSent || smsSent) {
            status = "PARTIAL";
        } else {
            status = "FAILED";
        }

        saveNotification(appointmentId,patientEmail,patientPhone,patientName,"APPOINTMENT_CANCELLATION",subject,message,status);

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
