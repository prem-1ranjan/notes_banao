package com.notesbanao.portal.auth.dto;

/**
 * The signed-in account, as the front end reads it.
 *
 * Component names are snake_case on purpose: the API contract is snake_case
 * here, and matching it exactly means Jackson needs no annotations and the two
 * cannot drift apart.
 */
public record UserDto(
        String id,
        String email,
        boolean email_verified,
        boolean has_password,
        String phone_e164,
        boolean phone_verified,
        String status,
        boolean terms_accepted_current) {
}
