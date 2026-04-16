package com.medi_connect.payments_service.service;

import com.medi_connect.payments_service.config.PayHereConfig;
import com.medi_connect.payments_service.dto.PayHereCheckoutPayload;
import com.medi_connect.payments_service.dto.PayHereCheckoutRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils; //Provides MD5 hash generation
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode; //Controls how decimals are rounded
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayHereService {

    private static final String CHECKOUT_PATH = "/pay/checkout";

    private final PayHereConfig payHereConfig;

    public PayHereCheckoutPayload createCheckoutPayload(PayHereCheckoutRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("merchant_id", payHereConfig.getMerchantId());
        fields.put("return_url", payHereConfig.getReturnUrl());
        fields.put("cancel_url", payHereConfig.getCancelUrl());
        fields.put("notify_url", payHereConfig.getNotifyUrl());
        fields.put("order_id", request.getOrderId());
        fields.put("items", request.getItems());
        fields.put("currency", request.getCurrency());
        fields.put("amount", formatAmount(request.getAmount()));
        fields.put("first_name", request.getFirstName());
        fields.put("last_name", request.getLastName());
        fields.put("email", request.getEmail());
        fields.put("phone", request.getPhone());
        fields.put("address", request.getAddress());
        fields.put("city", request.getCity());
        fields.put("country", request.getCountry());

        if (request.getCustom1() != null && !request.getCustom1().isBlank()) {
            fields.put("custom_1", request.getCustom1());
        }
        if (request.getCustom2() != null && !request.getCustom2().isBlank()) {
            fields.put("custom_2", request.getCustom2());
        }

        fields.put("hash", generateCheckoutHash(
            fields.get("merchant_id"),
            fields.get("order_id"),
            fields.get("amount"),
            fields.get("currency")
        ));

        log.info("PayHere checkout payload created for payment: {}", request.getOrderId());
        return PayHereCheckoutPayload.builder()
            .actionUrl(payHereConfig.getBaseUrl() + CHECKOUT_PATH)
            .method("POST")
            .fields(fields)
            .build();
    }

    public boolean isValidNotification(Map<String, String> payload) {
        String merchantId = payload.getOrDefault("merchant_id", "");
        String orderId = payload.getOrDefault("order_id", "");
        String amount = payload.getOrDefault("payhere_amount", "");
        String currency = payload.getOrDefault("payhere_currency", "");
        String statusCode = payload.getOrDefault("status_code", "");
        String remoteMd5 = payload.getOrDefault("md5sig", "");

        if (merchantId.isBlank() || orderId.isBlank() || amount.isBlank() || currency.isBlank() || statusCode.isBlank() || remoteMd5.isBlank()) {
            return false;
        }

        String localMd5 = generateNotificationMd5(merchantId, orderId, amount, currency, statusCode);
        return localMd5.equalsIgnoreCase(remoteMd5);
    }

    private String generateCheckoutHash(String merchantId, String orderId, String amount, String currency) {
        String data = merchantId + orderId + amount + currency + hashedMerchantSecret();
        return DigestUtils.md5Hex(data).toUpperCase();
    }

    private String generateNotificationMd5(String merchantId, String orderId, String amount, String currency, String statusCode) {
        String data = merchantId + orderId + amount + currency + statusCode + hashedMerchantSecret();
        return DigestUtils.md5Hex(data).toUpperCase();
    }

    private String hashedMerchantSecret() {
        return DigestUtils.md5Hex(payHereConfig.getMerchantSecret()).toUpperCase();
    }

    private String formatAmount(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }
}
