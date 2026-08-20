package com.notesbanao.portal.account.dto;

/** eligibleAt is when the account would actually be removed. */
public record DeletionRequestDto(String reason, String requestedAt, String eligibleAt) {
}
