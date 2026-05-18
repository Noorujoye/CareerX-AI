package com.noorain.login_system.auth.controller;

import com.noorain.login_system.auth.dto.AuthenticationRequest;
import com.noorain.login_system.auth.dto.AuthenticationResponse;
import com.noorain.login_system.auth.dto.RegisterRequest;
import com.noorain.login_system.auth.dto.ForgotPasswordRequest;
import com.noorain.login_system.auth.dto.ResetPasswordRequest;
import com.noorain.login_system.auth.dto.VerifyOtpRequest;
import com.noorain.login_system.auth.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register((request)));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String otp = service.forgotPassword(request.getEmail());
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "OTP sent successfully.");
        response.put("otp", otp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<java.util.Map<String, Object>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        service.verifyOtp(request.getEmail(), request.getOtp());
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "OTP verified successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        service.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Password has been successfully reset.");
        return ResponseEntity.ok(response);
    }
}
