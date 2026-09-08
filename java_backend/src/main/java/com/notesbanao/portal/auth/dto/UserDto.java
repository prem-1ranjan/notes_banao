package com.notesbanao.portal.auth.dto;

/**
 * The signed-in account, as the front end reads it.
 */
public record UserDto(
        String id,
        String email,
        String first_name,
        String last_name,
        String date_of_birth,
        boolean email_verified,
        boolean has_password,
        String phone_e164,
        boolean phone_verified,
        String status,
        boolean terms_accepted_current) {

}