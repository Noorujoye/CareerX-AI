package com.noorain.login_system.common.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String reason = ex.getReason();
        return build(status, reason == null || reason.isBlank() ? status.getReasonPhrase() : reason);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String message = fieldError == null ? "Invalid request" : fieldError.getDefaultMessage();
        return build(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(ApiErrorResponse.builder()
                .status(status.value())
                .message(message)
                .timestamp(Instant.now())
                .build());
    }
}
