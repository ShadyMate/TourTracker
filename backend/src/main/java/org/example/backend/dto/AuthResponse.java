package org.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Returned on successful login or registration.
 * Token is delivered as an HttpOnly cookie — @JsonIgnore keeps it out of the response body.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    @JsonIgnore
    private String token;         // access token — set as HttpOnly cookie, never serialized
    @JsonIgnore
    private String refreshToken;  // only populated on /auth/refresh; never serialized
    private Long id;
    private String username;
    private String email;
}
