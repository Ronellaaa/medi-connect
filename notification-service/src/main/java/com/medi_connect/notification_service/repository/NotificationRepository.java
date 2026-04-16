package com.medi_connect.notification_service.repository;

import com.medi_connect.notification_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;


public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    // get all notifications for a specific recipient
    List<Notification>getAllNotificationsByRecipientId(Long recipientId);
    // get all notifications by type
    List<Notification>getAllNotificationsByType(String type);
    // get all notifications by status
    List<Notification>findByNotificationStatus(String notificationStatus);
    // get all notifications for a specific appointment
    List<Notification> findByAppointmentId(UUID appointmentId);


}
