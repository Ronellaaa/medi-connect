package com.medi_connect.auth_service.controller;

import com.medi_connect.auth_service.dto.AuthRequest;
import com.medi_connect.auth_service.dto.AuthResponse;
import com.medi_connect.auth_service.dto.RegisterRequest;
import com.medi_connect.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }
}
