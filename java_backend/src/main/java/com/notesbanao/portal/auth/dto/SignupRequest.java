package com.notesbanao.portal.auth.dto;

// accepted_terms must be true, or the request is rejected.
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Signup request.
 * accepted_terms must be true, or the request is rejected.
 */
public record SignupRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        @Size(
                min = 8,
                max = 64,
                message = "Password must be 8-64 characters"
        )
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
                message = "Password must contain at least one letter and one number"
        )
        String password,

        @AssertTrue(message = "You must accept the terms and conditions")
        Boolean accepted_terms,

        @Email(message = "Invalid referral email format")
        String referral_email

) {
}