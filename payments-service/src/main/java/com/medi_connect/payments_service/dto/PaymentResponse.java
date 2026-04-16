package com.medi_connect.payments_service.dto;

import com.medi_connect.payments_service.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor; //required by JSON serialization/deserialization frameworks

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String paymentId;
    private String checkoutUrl;
    private String checkoutMethod;
    private Map<String, String> checkoutFormFields;
    private PaymentStatus status;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private String message;
}
