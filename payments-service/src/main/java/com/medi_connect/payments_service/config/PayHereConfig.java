package com.medi_connect.payments_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration; 

@Configuration
@ConfigurationProperties(prefix = "payhere")
@Data
public class PayHereConfig {
    private String merchantId;
    private String merchantSecret;
    private String appId;
    private String appSecret;
    private String baseUrl;
    private String returnUrl;
    private String cancelUrl;
    private String notifyUrl;
}