package com.notesbanao.portal.auth.dto;

// accepted_terms must be true, or the request is rejected.
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * Signup request.
 * accepted_terms must be true, or the request is rejected.
 */
public record SignupRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank
        @Size(min = 2, max = 20)
        String lastName,

        @NotBlank
        @Size(min = 2, max = 20)
        String firstName,

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate dateOfBirth,

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
        String referral_email,

        @Size(min = 10, max = 10, message = "Invalid Phone number")
        String phone

) {
}