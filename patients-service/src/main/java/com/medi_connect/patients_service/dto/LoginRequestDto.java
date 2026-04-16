package com.medi_connect.patients_service.dto;


import lombok.Data;

@Data
public class LoginRequestDto {
    private String email;
    private String password;
}