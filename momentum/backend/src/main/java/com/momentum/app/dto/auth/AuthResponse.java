package com.momentum.app.dto.auth;

public class AuthResponse {

    private String message;
    private Long userId;
    private String name;
    private String email;

    public AuthResponse() {
    }

    public AuthResponse(String message, Long userId, String name, String email) {
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public static AuthResponse of(String message, Long userId, String name, String email) {
        return new AuthResponse(message, userId, name, email);
    }

    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}