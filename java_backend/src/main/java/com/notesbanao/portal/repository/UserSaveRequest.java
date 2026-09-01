package com.notesbanao.portal.repository;

import java.time.LocalDate;

public record UserSaveRequest(String email, String password, String lastName, String firstName, LocalDate dateOfBirth) {
}
