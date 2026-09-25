package com.notesbanao.portal.account.dto;

/** eligibleAt is when the account would actually be removed. */
public record DeletionRequestDto(String requestedAt, String eligibleAt) {
}
