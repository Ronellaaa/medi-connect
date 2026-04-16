package com.medi_connect.payments_service.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class PayHereCheckoutRequest {
    String orderId;
    BigDecimal amount;
    String currency;
    String firstName;
    String lastName;
    String email;
    String phone;
    String address;
    String city;
    String country;
    String items;
    String custom1;
    String custom2;
}
