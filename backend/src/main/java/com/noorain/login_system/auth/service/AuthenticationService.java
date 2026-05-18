package com.noorain.login_system.auth.service;

import com.noorain.login_system.auth.dto.AuthenticationRequest;
import com.noorain.login_system.auth.dto.AuthenticationResponse;
import com.noorain.login_system.auth.dto.RegisterRequest;
import com.noorain.login_system.config.JwtService;
import com.noorain.login_system.entity.Role;
import com.noorain.login_system.model.User;
import com.noorain.login_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        final String email = normalizeEmail(request.getEmail());
        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        var user = User.builder()
                .firstName(safeTrim(request.getFirstName()))
                .lastName(safeTrim(request.getLastName()))
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        final String email = normalizeEmail(request.getEmail());
        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public String forgotPassword(String rawEmail) {
        final String email = normalizeEmail(rawEmail);
        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not registered"));
        
        // Generate secure 6-digit numeric OTP
        int otpNum = 100000 + new java.security.SecureRandom().nextInt(900000);
        String otp = String.valueOf(otpNum);

        user.setResetPasswordToken(otp);
        user.setResetPasswordTokenExpiry(java.time.Instant.now().plus(java.time.Duration.ofMinutes(5)));
        userRepository.save(user);
        
        System.out.println("==================================================");
        System.out.println("PASSWORD RESET OTP GENERATED FOR: " + email);
        System.out.println("OTP CODE: " + otp);
        System.out.println("==================================================");
        return otp;
    }

    public void verifyOtp(String rawEmail, String otp) {
        final String email = normalizeEmail(rawEmail);
        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (otp == null || otp.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP is required");
        }

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not registered"));

        if (user.getResetPasswordToken() == null || !user.getResetPasswordToken().equals(otp.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP code");
        }

        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(java.time.Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP code has expired");
        }
    }

    public void resetPassword(String rawEmail, String otp, String newPassword) {
        final String email = normalizeEmail(rawEmail);
        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        verifyOtp(email, otp);

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not registered"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private static String safeTrim(String value) {
        return value == null ? null : value.trim();
    }
}
