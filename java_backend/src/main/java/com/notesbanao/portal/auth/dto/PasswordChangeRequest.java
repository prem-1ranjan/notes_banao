package com.notesbanao.portal.auth.dto;

public record PasswordChangeRequest(String current_password, String new_password) {
}
