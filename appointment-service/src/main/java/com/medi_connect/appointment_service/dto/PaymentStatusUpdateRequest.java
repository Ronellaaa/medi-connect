package com.medi_connect.appointment_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentStatusUpdateRequest {
    private String status;
    private String paymentId;
    private BigDecimal amount;
    private LocalDateTime paidAt;
    private String meetingUrl;
}
