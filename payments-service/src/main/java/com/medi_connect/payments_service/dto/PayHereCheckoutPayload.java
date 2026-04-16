package com.medi_connect.payments_service.dto;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class PayHereCheckoutPayload {
    String actionUrl;
    String method;
    Map<String, String> fields;
}
