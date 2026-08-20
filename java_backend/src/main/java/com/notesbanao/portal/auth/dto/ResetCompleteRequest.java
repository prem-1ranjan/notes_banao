package com.notesbanao.portal.auth.dto;

public record ResetCompleteRequest(String token, String new_password) {
}
